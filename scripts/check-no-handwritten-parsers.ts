#!/usr/bin/env tsx
/**
 * Enforce that every parser under `src/infrastructure/api/parsers/` is
 * backed by a generated zod schema from `src/shared/api/zod-schemas.ts`
 * (via `parseWithSchema` / `parsePagedWithItemSchema` /
 * `parseArrayOrItemsWithSchema`).
 *
 * Rationale: hand-written parsers drifted from the API in production
 * and caused 8 tool failures (see `CHANGELOG.md` Phase 1). Generated
 * schemas + tsc are now the single source of truth — this gate
 * prevents a future contributor from re-introducing manual `typeof
 * raw === "object" && "field" in raw` parsing.
 *
 * Exempted modules:
 *   - `parse-empty.ts`         — 204 No Content, no body to parse
 *   - `parse-count-envelope.ts` — `parseIntField(raw, "x")` is a
 *     generic single-field-int extractor that does not have a
 *     dedicated DTO in the spec (used for `{queued_count}`,
 *     `{cancelled_count}`); keeping it hand-written avoids defining
 *     a one-field zod schema per call site.
 *   - `parse-with-schema.ts`   — the schema-based parser helper
 *   - `parse-generic.ts`       — defines `parsePageOf` / `parseArrayOf`
 *     combinator helpers (item-parser is itself schema-based)
 *
 * Heuristic: any other parser file must either (a) `import { schemas }
 * from "../../shared/api/zod-schemas"`, or (b) re-export from one that
 * does. Files that do neither are flagged as "drifted".
 *
 * Exit code 0 = pass, 1 = violations found.
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as process from "node:process";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PARSERS_DIR = path.join(REPO_ROOT, "src", "infrastructure", "api", "parsers");

const EXEMPT = new Set([
  "parse-empty.ts",
  "parse-count-envelope.ts",
  "parse-with-schema.ts",
  "parse-generic.ts",
  // `shared.ts` exports `isStringRecord`, the single hand-written
  // primitive still consumed by `parse-count-envelope.ts` (the only
  // parser that does not project a DTO and therefore can't use a
  // generated schema). Both files are exempt as a pair.
  "shared.ts",
]);

interface Violation {
  readonly file: string;
  readonly reason: string;
}

async function main(): Promise<void> {
  const files = await fs.readdir(PARSERS_DIR);
  const violations: Violation[] = [];

  for (const file of files) {
    if (!file.endsWith(".ts") || file.endsWith(".test.ts")) continue;
    if (EXEMPT.has(file)) continue;

    const src = await fs.readFile(path.join(PARSERS_DIR, file), "utf8");
    if (!/from\s+"[./]*shared\/api\/zod-schemas/.test(src)) {
      violations.push({
        file,
        reason: "does not import { schemas } from '../../shared/api/zod-schemas'",
      });
      continue;
    }
    if (!/parseWithSchema|parsePagedWithItemSchema|parseArrayOrItemsWithSchema/.test(src)) {
      violations.push({
        file,
        reason: "imports schemas but does not call parseWithSchema(...) family",
      });
    }
  }

  if (violations.length === 0) {
    console.log(
      `OK — ${files.filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts")).length} parser files all schema-backed (or explicitly exempt)`
    );
    return;
  }

  console.error("\nHand-written parser drift detected:\n");
  for (const v of violations) {
    console.error(`  ${v.file}: ${v.reason}`);
  }
  console.error(
    "\nFix: rewrite the parser as `parseWithSchema(schemas.X.pick({...}).strip(), raw, label)`.\n" +
      "See parse-org / parse-scan for canonical examples, or add a justified entry to\n" +
      "the EXEMPT list in this script (with a docstring explaining why).\n"
  );
  process.exit(1);
}

main().catch((cause: unknown) => {
  console.error(cause);
  process.exit(2);
});
