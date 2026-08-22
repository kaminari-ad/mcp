#!/usr/bin/env tsx
/**
 * Every `z.enum([...])` literal in a tool's input schema must be a
 * value-subset of some enum in the generated
 * `src/shared/api/zod-schemas.ts`, or carry a justified exemption.
 *
 * Subset rather than equality: a tool may deliberately offer a
 * narrower choice than the API accepts. What it may not do is invent
 * values the API has never heard of.
 *
 * What this catches. KAMIAD-158 shipped
 * `mode: z.enum(["inherit", "include", "exclude"])` against a field
 * whose API values are `inherit | override | silence`, so the agent
 * inside the cabinet could not set campaign alert routing at all.
 * Reintroducing that today fails this gate: exemptions are keyed on
 * the exact sorted value set, so the wrong values are a different key
 * from the correct ones and do not inherit their exemption.
 *
 * What it cannot do is tell a *correct* hand-written enum from a wrong
 * one when the API types the field as a bare `string` — there is
 * nothing to compare against, so the author gets a failure and must
 * either fix the values or write a justification. Typing the field on
 * the api side is what turns that into a real check, which is why the
 * enum work there is the load-bearing half of the fix.
 *
 * Exit code 0 = pass, 1 = violations found.
 */

import * as path from "node:path";
import * as process from "node:process";

import { Node, Project, SyntaxKind } from "ts-morph";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const TOOLS_DIR = path.join(REPO_ROOT, "src", "application", "tools");
const ZOD_SCHEMAS_FILE = path.join(REPO_ROOT, "src", "shared", "api", "zod-schemas.ts");

/**
 * Hand-written enums with no generated counterpart, keyed by their
 * sorted value list. Each entry means "the API validates these values
 * but does not type the field", so codegen cannot carry them and the
 * tool has to restate them. Every entry is a candidate for deletion
 * once the api side types the field.
 */
const EXEMPT_VALUE_SETS: Readonly<Record<string, string>> = {
  // Campaign notification routing. The API validates the three values
  // in `SetCampaignDestinationOverrides._parse_mode` but the DTO field
  // is a plain `str`, so no generated enum exists yet. The api MR
  // `fix/type-override-mode-and-unlist-forms` introduces
  // `CampaignOverrideMode`; drop this entry and switch the tool to
  // `schemas.CampaignOverrideMode` on the first regen after it ships.
  "inherit|override|silence": "API validates in the use case, DTO field is still a plain str",
  // Campaign shape fields validated by Pydantic field validators
  // rather than typed enums, so the OpenAPI document describes each as
  // a bare string. Typing them on the api side would let this gate
  // enforce them; until then the tool is the only place the agent can
  // learn the allowed values.
  "ad_discovery|ad_tag|url|vast": "campaign_type — API validator, not a typed enum",
  "all|random": "emulator_mode — API validator, not a typed enum",
  "mobile|residential": "proxy_type — API validator, not a typed enum",
  "interval|weekly": "schedule_type — API validator, not a typed enum",
  // Regex rule config lives in a free-form `config` dict, so the flags
  // are validated by hand in `rule_config_validation.py`.
  "|i": "regexp flags — validated inside the free-form config dict",
};

interface Violation {
  readonly file: string;
  readonly values: readonly string[];
}

/** Value sets of every `z.enum([...])` in the generated schemas. */
function generatedEnumValueSets(project: Project): ReadonlySet<string> {
  const sourceFile = project.addSourceFileAtPath(ZOD_SCHEMAS_FILE);
  const sets = new Set<string>();
  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const values = enumValuesOf(call);
    if (values !== undefined) sets.add(key(values));
  }
  return sets;
}

/**
 * String literals of a `z.enum([...])` call, or undefined.
 *
 * The callee text is whitespace-stripped because Prettier wraps a long
 * chain as `z\n  .enum([...])`; matching the raw text saw only the two
 * single-line cases and turned this gate into a near no-op.
 */
function enumValuesOf(call: Node): readonly string[] | undefined {
  if (!Node.isCallExpression(call)) return undefined;
  if (call.getExpression().getText().replace(/\s+/g, "") !== "z.enum") return undefined;
  const [arg] = call.getArguments();
  if (arg === undefined || !Node.isArrayLiteralExpression(arg)) return undefined;
  const values: string[] = [];
  for (const element of arg.getElements()) {
    if (!Node.isStringLiteral(element)) return undefined;
    values.push(element.getLiteralText());
  }
  return values.length === 0 ? undefined : values;
}

function key(values: readonly string[]): string {
  return [...values].sort().join("|");
}

/** True when `values` is a subset of any generated enum's values. */
function isSubsetOfAnyGenerated(
  values: readonly string[],
  generated: ReadonlySet<string>
): boolean {
  const wanted = new Set(values);
  for (const generatedKey of generated) {
    const candidate = new Set(generatedKey.split("|"));
    if ([...wanted].every((v) => candidate.has(v))) return true;
  }
  return false;
}

async function main(): Promise<number> {
  const project = new Project({
    tsConfigFilePath: path.join(REPO_ROOT, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  const generated = generatedEnumValueSets(project);
  if (generated.size === 0) {
    console.error("check-tool-enum-drift: found 0 enums in zod-schemas.ts — the generated");
    console.error("shape changed and this gate degraded to a no-op. Fix the walk.");
    return 1;
  }

  const toolFiles = project.addSourceFilesAtPaths(`${TOOLS_DIR}/**/*.ts`);
  const violations: Violation[] = [];
  let checked = 0;

  for (const sourceFile of toolFiles) {
    const rel = path.relative(REPO_ROOT, sourceFile.getFilePath());
    for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
      const values = enumValuesOf(call);
      if (values === undefined) continue;
      checked += 1;
      if (key(values) in EXEMPT_VALUE_SETS) continue;
      if (isSubsetOfAnyGenerated(values, generated)) continue;
      violations.push({ file: rel, values });
    }
  }

  if (violations.length === 0) {
    console.log(
      `check-tool-enum-drift: ${String(checked)} tool enum(s) OK ` +
        `(${String(Object.keys(EXEMPT_VALUE_SETS).length)} exempt value set(s)).`
    );
    return 0;
  }

  console.error(`\nTool enums with no generated counterpart (${String(violations.length)}):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}\n    [${v.values.map((s) => `"${s}"`).join(", ")}]`);
  }
  console.error(
    "\nEither the values are wrong (the bug this gate exists for — check the API),\n" +
      "or the API does not type the field. If it does type it, use\n" +
      "`schemas.<EnumName>` instead of restating the values. If it does not,\n" +
      "add the sorted value set to EXEMPT_VALUE_SETS with the reason.\n"
  );
  return 1;
}

const code = await main();
process.exit(code);
