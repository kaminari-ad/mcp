#!/usr/bin/env tsx
/**
 * Sanity gate for the published bundle size.
 *
 * Runs after `npm run build` in CI. Fails if `dist/bin.js` grows
 * beyond {@link MAX_BUNDLE_KB}. Catches accidental dep bloat (a
 * pulled-in package that secretly bundles every locale of moment.js,
 * etc.) before it ships to npm.
 *
 * The limit is intentionally loose — we'd rather ship a working agent
 * than chase 5% reductions. Adjust if a legitimate feature pushes
 * the bundle past the gate AND the bundle is still reasonable.
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as process from "node:process";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const BUNDLE = path.join(REPO_ROOT, "dist", "bin.js");
// Bumped from 500→850 with the parser-drift Phase 2b+3 work
// (CHANGELOG entry "parser-drift phase 2b/3"). The new payload is:
//   - `src/shared/api/zod-schemas.ts` — generated runtime zod schemas
//     for every OpenAPI component (~150 schemas). Required for the
//     `parseWithSchema(schemas.X.pick({...}))` parser pattern that
//     replaced 17 hand-written `typeof raw === "object"` parsers.
//   - `openapi-fetch` runtime — typed HTTP client over the same
//     `paths` types; tiny (~3 KB minified).
// Net: 500 KB → ~770 KB. Worth it: schema drift is now a compile-time
// failure (the prod regression class that caused 8 tool failures last
// week is structurally eliminated). Tightening below 800 again would
// require either tree-shaking unused schemas (openapi-zod-client does
// not support this cleanly) or moving schema validation server-side
// (defeats the purpose).
const MAX_BUNDLE_KB = 850;

async function main(): Promise<number> {
  let stat;
  try {
    stat = await fs.stat(BUNDLE);
  } catch {
    console.error(`Bundle not found at ${BUNDLE} — did you run \`npm run build\`?`);
    return 1;
  }
  const kb = Math.round(stat.size / 1024);
  if (kb > MAX_BUNDLE_KB) {
    console.error(
      `Bundle size ${String(kb)} KB exceeds the ${String(MAX_BUNDLE_KB)} KB limit. ` +
        "A new dependency is probably pulling in too much. Investigate before merge."
    );
    return 1;
  }
  console.log(`Bundle size: ${String(kb)} KB (limit ${String(MAX_BUNDLE_KB)} KB). OK.`);
  return 0;
}

const code = await main();
process.exit(code);
