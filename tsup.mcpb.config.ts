import { builtinModules } from "node:module";

import { defineConfig } from "tsup";

/**
 * tsup bundler config — produces the single-file artefact used inside
 * the Claude Desktop `.mcpb` extension bundle.
 *
 * Why a separate config (and not just reuse `tsup.config.ts`):
 *
 * - **Inline ALL deps.** A `.mcpb` ships as a self-contained ZIP that
 *   double-clicks into Claude Desktop without any `npm install` —
 *   so the bundled JS must carry undici / @modelcontextprotocol/sdk
 *   / zod / pino / etc. directly. `noExternal: [/.*\/]` overrides
 *   tsup's default of externalising every dependency.
 * - **No splitting.** The runtime expects a single `server/index.js`
 *   entry inside the bundle (manifest's `entry_point`), and the
 *   single-file output also keeps the smoke-test in `release.yml`
 *   trivial (`node server/index.js < initialize.json`).
 * - **No DTS / no sourcemap.** Bundle is consumed by Claude Desktop
 *   at runtime — types and source maps would just inflate the ZIP.
 *
 * `external` is limited to Node built-ins (both `fs` and `node:fs`
 * forms) — anything else gets inlined.
 *
 * Output: `dist-mcpb/index.js` (single ESM file with shebang).
 */
export default defineConfig({
  entry: { index: "src/bin.ts" },
  outDir: "dist-mcpb",
  format: ["esm"],
  target: "node22",
  platform: "node",
  bundle: true,
  noExternal: [/.*/],
  external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
  dts: false,
  sourcemap: false,
  minify: false,
  splitting: false,
  treeshake: true,
  clean: true,
  banner: { js: "#!/usr/bin/env node" },
  tsconfig: "./tsconfig.build.json",
});
