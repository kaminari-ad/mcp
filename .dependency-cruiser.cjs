/**
 * dependency-cruiser configuration — architectural import-boundary gate.
 *
 * Mirrors api/scripts/check_domain_imports.py for the TypeScript stack.
 * Run via `npm run check:imports` or `make check-imports`.
 *
 * The rules below encode DDD layering for the MCP server:
 *
 *   domain/          <- inner core; depends on nothing outward
 *   application/     <- depends on domain/ only (ports)
 *   infrastructure/  <- depends on domain/ (implements ports)
 *   presentation/    <- depends on application/ + infrastructure/ + domain/
 *   shared/          <- pure utilities; depends on nothing
 *   bin.ts           <- composition entrypoint; can import anything
 *
 * Violation = build fails. To intentionally allow a new cross-layer edge,
 * add a `to.path` exception with a justification comment.
 */

module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular dependencies indicate a missing abstraction.",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-orphans",
      severity: "warn",
      comment: "Orphaned files are dead code — remove them.",
      from: {
        orphan: true,
        pathNot: [
          "(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$", // dotfiles config
          "\\.d\\.ts$",
          "(^|/)tsconfig\\.json$",
          "(^|/)package\\.json$",
          // Type-only modules — dependency-cruiser cannot trace
          // `import type` references, so these legitimately look
          // orphaned even though every tool imports them.
          "src/application/tools/_shared/tool-context\\.ts$",
          "src/application/tools/_shared/tool-result\\.ts$",
          "src/domain/ports/.*\\.ts$",
        ],
      },
      to: {},
    },

    // ── DDD: domain must not depend outward ──────────────────────────
    {
      name: "domain-no-application",
      severity: "error",
      comment:
        "domain/ is the inner core and must not import from application/. " +
        "If you need behaviour from an outer layer, define a port and inject it.",
      from: { path: "^src/domain" },
      to: { path: "^src/application" },
    },
    {
      name: "domain-no-infrastructure",
      severity: "error",
      comment:
        "domain/ must not import from infrastructure/. " +
        "Define a port in domain/ports/; let infrastructure/ implement it.",
      from: { path: "^src/domain" },
      to: { path: "^src/infrastructure" },
    },
    {
      name: "domain-no-presentation",
      severity: "error",
      comment: "domain/ must not import from presentation/.",
      from: { path: "^src/domain" },
      to: { path: "^src/presentation" },
    },

    // ── DDD: application must not depend on infrastructure or presentation ─
    {
      name: "application-no-infrastructure",
      severity: "error",
      comment:
        "application/ must not import from infrastructure/. Tools depend on " +
        "ports (domain/ports/) and receive concrete implementations via ToolContext.",
      from: { path: "^src/application" },
      to: { path: "^src/infrastructure" },
    },
    {
      name: "application-no-presentation",
      severity: "error",
      comment: "application/ must not import from presentation/.",
      from: { path: "^src/application" },
      to: { path: "^src/presentation" },
    },

    // ── shared/ stays generic ────────────────────────────────────────
    {
      name: "shared-no-domain",
      severity: "error",
      comment:
        "shared/ is generic utilities. If it depends on domain types, " +
        "the code belongs in domain/, not shared/.",
      from: { path: "^src/shared" },
      to: { path: "^src/(domain|application|infrastructure|presentation)" },
    },

    // ── No test code in src/ ─────────────────────────────────────────
    {
      name: "src-no-test-code",
      severity: "error",
      comment: "src/ must not import test helpers, fakes, or vitest.",
      from: { path: "^src/" },
      to: { path: "(^tests/|^scripts/|/vitest|/@vitest)" },
    },

    // ── Production code must not pull in dev-only deps ──────────────
    {
      name: "no-dev-deps-in-src",
      severity: "error",
      comment: "src/ must not import from devDependencies.",
      from: { path: "^src/", pathNot: "\\.test\\.ts$" },
      to: { dependencyTypes: ["npm-dev"] },
    },
  ],

  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "node-addons"],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
