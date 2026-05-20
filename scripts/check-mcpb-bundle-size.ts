#!/usr/bin/env tsx
/**
 * Sanity gate for the Claude Desktop .mcpb bundle size.
 *
 * Distinct from `check-bundle-size.ts` (which guards the npm-published
 * `dist/`). This script measures the **single-file** ESM bundle that
 * gets packed inside the .mcpb archive — see `tsup.mcpb.config.ts`
 * for why we ship one inlined file (no `npm install` step on the
 * client side).
 *
 * The release.yml workflow has its own ceiling on the packed .mcpb
 * (20 MB — must stay below the GitHub Release asset CDN limit). This
 * script gates the *uncompressed* single-file output before pack;
 * 5 MB is a comfortable headroom — anything past it usually means an
 * accidental dev dep got inlined or a sourcemap leaked.
 *
 * Run after `npm run build:mcpb-bundle`.
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as process from "node:process";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIST_MCPB = path.join(REPO_ROOT, "dist-mcpb");
const ENTRY = path.join(DIST_MCPB, "index.js");
const MAX_MB = 5;

async function main(): Promise<number> {
  let stat;
  try {
    stat = await fs.stat(ENTRY);
  } catch {
    console.error(`${ENTRY} not found — did you run \`npm run build:mcpb-bundle\`?`);
    return 1;
  }
  const sizeBytes = stat.size;
  const sizeMb = sizeBytes / 1024 / 1024;
  if (sizeMb > MAX_MB) {
    console.error(
      `mcpb single-file bundle is ${sizeMb.toFixed(2)} MB ` +
        `(${String(sizeBytes)} bytes) — exceeds the ${String(MAX_MB)} MB ` +
        `pre-pack limit. Audit recently-added deps in tsup.mcpb.config.ts.`
    );
    return 1;
  }
  console.log(
    `mcpb bundle: ${sizeMb.toFixed(2)} MB (${String(sizeBytes)} bytes, ` +
      `limit ${String(MAX_MB)} MB). OK.`
  );
  return 0;
}

const code = await main();
process.exit(code);
