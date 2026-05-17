import { defineConfig } from "tsup";

/**
 * tsup bundler config — produces the published artefacts under `dist/`.
 *
 * - ESM bundle with code splitting enabled (since v0.2.1). This is
 *   load-time critical: bin.ts statically imports only zod/config
 *   modules, then does `await import("./presentation/...")` for the
 *   actual transport bootstrap (which pulls undici, MCP SDK, pino,
 *   etc.). With `splitting: false`, esbuild inlines those dynamic
 *   imports into the top-level bundle — every external dep ends up
 *   imported eagerly at process startup, including undici. That
 *   defeats the Node-version preflight check in `bin.ts::main()`:
 *   undici 8.x crashes at import time on Node < 22.19 with
 *   `webidl.util.markAsUncloneable is not a function`, before our
 *   check can print a clean error. With splitting=true the dynamic
 *   imports stay dynamic at runtime, undici only loads inside the
 *   transport chunk after the preflight passes.
 * - Bin entry preserved with a shebang so `npx @kaminari-ad/mcp` Just Works.
 * - Type declarations emitted alongside.
 */
export default defineConfig({
  entry: ["src/bin.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "node22",
  platform: "node",
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: true,
  treeshake: true,
  banner: { js: "#!/usr/bin/env node" },
  tsconfig: "./tsconfig.build.json",
});
