import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for @kaminari-ad/mcp.
 *
 * Coverage thresholds are the SINGLE SOURCE OF TRUTH for the project's
 * coverage gate. CI fails on regression. NEVER lower these — only ratchet
 * up after adding tests (see CONTRIBUTING.md → "Coverage ratchet").
 *
 * Three test suites are kept separate so each can run as its own CI job
 * and so `make test-isolation` can run independently as a merge gate:
 *
 *   tests/unit/        — fast, no I/O, FakeApiGateway-style fakes
 *   tests/integration/ — real MCP server, undici MockAgent for the API
 *   tests/isolation/   — tenant isolation regression suite (mandatory)
 */
export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules/**", "dist/**", "coverage/**"],

    setupFiles: ["tests/_setup/global-setup.ts"],

    pool: "forks",
    isolate: true,
    // Tests run sequentially within a file. Some isolation suites
    // share an undici MockAgent (closure-level) and would race under
    // concurrent mode. Performance is fine at this size.
    sequence: { concurrent: false },

    reporters: process.env["CI"] ? ["default", "junit"] : ["default"],
    outputFile: { junit: "./coverage/junit.xml" },

    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        "src/shared/api/openapi.ts",
        "src/bin.ts",
        // Pure re-export barrel — nothing to execute, v8 reports 0%
        // when measured against `tests/unit/` only.
        "src/shared/result.ts",
        // Pure type-only files (interfaces / type aliases): they
        // compile to empty .js, so v8 reports them as 0% covered.
        // No runtime code to test.
        "src/domain/ports/**",
        "src/application/tools/_shared/tool.ts",
        "src/application/tools/_shared/tool-context.ts",
        "src/application/tools/_shared/tool-result.ts",
        // Composition roots — exercised by tests/integration/ and
        // tests/isolation/. The bootstraps ship without unit coverage;
        // ESLint, dependency-cruiser, and the architecture gates
        // protect their structural correctness. http-request-handler
        // + the session-resolver / mcp-session-factory it delegates
        // to are exercised end-to-end by tests/isolation/ (bearer
        // swap, missing auth, header injection, env-fallback) AND by
        // tests/integration/cli-smoke.test.ts (real `dist/bin.js`
        // boot + full initialize → initialized → tools/list flow).
        "src/presentation/stdio/stdio-bootstrap.ts",
        "src/presentation/http/http-bootstrap.ts",
        "src/presentation/http/http-request-handler.ts",
        "src/presentation/http/session-resolver.ts",
        "src/presentation/http/mcp-session-factory.ts",
        "src/presentation/shared/wire-tools.ts",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        statements: 100,
        branches: 95,
        autoUpdate: false,
      },
    },
  },
});
