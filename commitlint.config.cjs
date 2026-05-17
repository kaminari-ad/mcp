/**
 * Conventional Commits — enforces `<type>: <imperative summary>` for every
 * commit. Run in pre-commit (lefthook) and CI.
 *
 * Allowed types match CONTRIBUTING.md and `.github/pull_request_template.md`:
 *   feat / fix / refactor / chore / docs / test / perf / build / ci / style /
 *   security (for coordinated-disclosure patches)
 *
 * Scope is OPTIONAL but encouraged for tools/transports:
 *   `feat(scans): add list_scans tool`
 *   `fix(http): reject bearer-swapped session-id`
 *   `security(http): patch bearer-hash timing leak`
 */

module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "refactor",
        "chore",
        "docs",
        "test",
        "perf",
        "build",
        "ci",
        "style",
        "security",
      ],
    ],
    "subject-case": [2, "never", ["pascal-case", "upper-case"]],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [2, "always"],
  },
};
