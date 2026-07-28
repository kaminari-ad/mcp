/**
 * Structural gate: every `schemas.X.pick({...})` in a parser must select
 * exactly the fields its port DTO exposes.
 *
 * The two lists are written by hand in two different files — the
 * `Pick<S["X"], …>` projection in `domain/ports/api-gateway.ts` and the
 * `.pick({…})` mask in `infrastructure/api/parsers/` — and nothing makes
 * them agree. A field present in the port but missing from the mask is
 * the dangerous direction: `.strip()` drops it silently, so the tool
 * output loses a field with no type error and no runtime error. That is
 * how repeat / retry fields could have shipped invisible.
 *
 * ts-morph resolves the port side through the type checker, so
 * intersections (`Pick<…> & { block_reason }`), `Partial<Pick<…>>` and
 * interfaces that `extends` another port type all collapse to a plain
 * key set. The parser side is read syntactically from the `.pick()` /
 * `.extend()` object literals — the same text a reviewer reads.
 */

import * as path from "node:path";

import { Node, Project, type SourceFile, SyntaxKind } from "ts-morph";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../../../..");

/**
 * Generated-schema name -> port type name, for the parsers whose port
 * type deliberately does not repeat the API's name. Every other parser
 * pairs by identical name; an unpaired one fails the test rather than
 * being skipped, so a new parser cannot slip past this gate.
 */
const PORT_TYPE_ALIASES: Readonly<Record<string, string>> = {
  LinkedRuleResponse: "LinkedRule",
  PolicySetListItem: "PolicySetListItemResponse",
  TagDefinitionWithStatsResponse: "TagDefinitionResponse",
};

interface ParserPick {
  readonly label: string;
  readonly schemaName: string;
  readonly keys: readonly string[];
}

function readPortKeys(portFile: SourceFile): Map<string, readonly string[]> {
  const byName = new Map<string, readonly string[]>();
  for (const decl of [...portFile.getTypeAliases(), ...portFile.getInterfaces()]) {
    if (!decl.isExported()) continue;
    byName.set(
      decl.getName(),
      decl
        .getType()
        .getProperties()
        .map((prop) => prop.getName())
        .sort()
    );
  }
  return byName;
}

/** Property names of every `.pick()` / `.extend()` literal in one expression. */
function maskedKeys(initializer: Node): readonly string[] {
  const keys = new Set<string>();
  for (const call of initializer.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const callee = call.getExpression();
    if (!Node.isPropertyAccessExpression(callee)) continue;
    const method = callee.getName();
    if (method !== "pick" && method !== "extend") continue;
    const [arg] = call.getArguments();
    if (!arg || !Node.isObjectLiteralExpression(arg)) continue;
    for (const prop of arg.getProperties()) {
      if (Node.isPropertyAssignment(prop)) keys.add(prop.getName().replaceAll('"', ""));
    }
  }
  return [...keys].sort();
}

function readParserPicks(parserFiles: readonly SourceFile[]): readonly ParserPick[] {
  const picks: ParserPick[] = [];
  for (const file of parserFiles) {
    for (const decl of file.getVariableDeclarations()) {
      const initializer = decl.getInitializer();
      if (!initializer) continue;
      const schemaName = /schemas\.([A-Za-z0-9_]+)\.pick\(/.exec(initializer.getText())?.[1];
      if (schemaName === undefined) continue;
      picks.push({
        label: `${file.getBaseName()} :: ${decl.getName()}`,
        schemaName,
        keys: maskedKeys(initializer),
      });
    }
  }
  return picks;
}

const project = new Project({
  tsConfigFilePath: path.join(REPO_ROOT, "tsconfig.json"),
});
const portKeysByType = readPortKeys(
  project.getSourceFileOrThrow(path.join(REPO_ROOT, "src/domain/ports/api-gateway.ts"))
);
const parserPicks = readParserPicks(
  project
    .getSourceFiles(path.join(REPO_ROOT, "src/infrastructure/api/parsers/*.ts"))
    .filter((file) => !file.getBaseName().endsWith(".test.ts"))
);

describe("parser .pick() masks vs port Pick<> projections", () => {
  it("discovers every parser schema", () => {
    // Guards the discovery itself: a refactor that stops matching
    // `schemas.X.pick(` would otherwise turn this suite into a no-op.
    expect(parserPicks.length).toBeGreaterThanOrEqual(45);
  });

  it.each(parserPicks.map((pick) => [pick.label, pick] as const))(
    "%s selects exactly the port's fields",
    (_label, pick) => {
      const portTypeName = PORT_TYPE_ALIASES[pick.schemaName] ?? pick.schemaName;
      const portFields = portKeysByType.get(portTypeName);
      if (portFields === undefined) {
        throw new Error(
          `no exported port type '${portTypeName}' for schemas.${pick.schemaName} — ` +
            "add the type or map it in PORT_TYPE_ALIASES"
        );
      }
      expect(pick.keys).toEqual(portFields);
    }
  );
});
