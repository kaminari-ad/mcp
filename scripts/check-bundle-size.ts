#!/usr/bin/env tsx
/**
 * Sanity gate for the published bundle size.
 *
 * Runs after `npm run build` in CI. Fails if the total size of all
 * runtime `.js` artefacts in `dist/` exceeds {@link MAX_BUNDLE_KB}.
 * Catches accidental dep bloat (a pulled-in package that secretly
 * bundles every locale of moment.js, etc.) before it ships to npm.
 *
 * Since v0.2.1 the bundle is split (see `tsup.config.ts` rationale)
 * into `bin.js` + transport bootstraps + vendor chunks. Measuring
 * only `bin.js` would be misleading (under 5 KB on its own); the
 * shipping cost is the SUM of every chunk an npm consumer downloads
 * via the tarball.
 *
 * The limit is intentionally loose — we'd rather ship a working agent
 * than chase 5% reductions. Adjust if a legitimate feature pushes
 * the bundle past the gate AND the bundle is still reasonable.
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as process from "node:process";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIST = path.join(REPO_ROOT, "dist");
const MAX_BUNDLE_KB = 500;

async function main(): Promise<number> {
  let entries;
  try {
    entries = await fs.readdir(DIST);
  } catch {
    console.error(`dist/ not found at ${DIST} — did you run \`npm run build\`?`);
    return 1;
  }
  // Runtime .js files only — skip .d.ts, .map, anything non-JS.
  const jsFiles = entries.filter((n) => n.endsWith(".js"));
  if (jsFiles.length === 0) {
    console.error(`No .js files found under ${DIST} — did you run \`npm run build\`?`);
    return 1;
  }
  let totalBytes = 0;
  const sizes: { name: string; kb: number }[] = [];
  for (const name of jsFiles) {
    const stat = await fs.stat(path.join(DIST, name));
    totalBytes += stat.size;
    sizes.push({ name, kb: Math.round(stat.size / 1024) });
  }
  const totalKb = Math.round(totalBytes / 1024);
  sizes.sort((a, b) => b.kb - a.kb);
  if (totalKb > MAX_BUNDLE_KB) {
    console.error(
      `Bundle size ${String(totalKb)} KB exceeds the ${String(MAX_BUNDLE_KB)} KB limit. ` +
        "A new dependency is probably pulling in too much. Investigate before merge."
    );
    for (const s of sizes) {
      console.error(`  ${s.name}: ${String(s.kb)} KB`);
    }
    return 1;
  }
  console.log(
    `Bundle size: ${String(totalKb)} KB across ${String(jsFiles.length)} chunks ` +
      `(limit ${String(MAX_BUNDLE_KB)} KB). OK.`
  );
  for (const s of sizes) {
    console.log(`  ${s.name}: ${String(s.kb)} KB`);
  }
  return 0;
}

const code = await main();
process.exit(code);
