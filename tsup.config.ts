import { defineConfig } from "tsup";

/**
 * tsup bundler config — produces the published artefacts under `dist/`.
 *
 * - Single ESM bundle. We are Node-only; CJS users can `import()` if needed.
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
  splitting: false,
  treeshake: true,
  banner: { js: "#!/usr/bin/env node" },
  tsconfig: "./tsconfig.build.json",
});
