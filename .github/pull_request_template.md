# Summary

<!-- 1-3 bullets describing what changes and why. -->

# Type

- [ ] feat (new functionality)
- [ ] fix (bug fix)
- [ ] refactor (no behaviour change)
- [ ] test (test-only)
- [ ] docs (docs-only)
- [ ] chore (deps, CI, tooling)
- [ ] security

# Checklist

- [ ] `make check` is green locally.
- [ ] Added or updated unit tests for any logic change.
- [ ] Added an integration test if a tool was added/changed.
- [ ] Updated `tests/isolation/` if the HTTP transport, session store, or rate limiter changed.
- [ ] Updated [`CHANGELOG.md`](../CHANGELOG.md) under `## [Unreleased]` (`Added` / `Changed` / `Fixed` / `Removed` / `Security`).
- [ ] If a public symbol was added/removed, updated [`CONTRIBUTING.md`](../CONTRIBUTING.md) or [`README.md`](../README.md).

# Tenant isolation (HTTP touchpoints)

If this PR touches `src/presentation/http/`, `src/infrastructure/session/`, `src/infrastructure/rate-limit/`, or `src/infrastructure/api/http-api-gateway.ts`:

- [ ] I have re-read the "Tenant isolation" section of [`CONTRIBUTING.md`](../CONTRIBUTING.md).
- [ ] A second reviewer is requested.
- [ ] The change preserves every isolation invariant.
- [ ] `tests/isolation/` covers the change; if a new attack surface was introduced, a new isolation test was added.
