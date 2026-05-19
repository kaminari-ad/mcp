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
 * ## createRequire banner — required for CJS deps
 *
 * Some bundled deps (pino-pretty, undici, parts of the MCP SDK) use
 * CommonJS-style `require()` internally. esbuild's ESM output handles
 * static requires fine, but a few do `require(varName)` or
 * `require()` calls inside CJS code paths that get inlined verbatim.
 * Without a top-level `require` symbol in ESM, those paths throw
 * `Fatal: Dynamic require of "X" is not supported` at runtime.
 *
 * The banner injects `createRequire(import.meta.url)` so any leftover
 * `require()` call inside the bundle resolves against the bundle file
 * itself — which is enough because all the actually-required modules
 * are already inlined into the same file. Verified empirically:
 * without the banner the `initialize` smoke test crashes on first
 * load; with it, the bundle starts and answers JSON-RPC.
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
  banner: {
    js: [
      "#!/usr/bin/env node",
      'import { createRequire as __mcpbCreateRequire } from "node:module";',
      "const require = __mcpbCreateRequire(import.meta.url);",
    ].join("\n"),
  },
  tsconfig: "./tsconfig.build.json",
});
