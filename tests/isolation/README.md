# Tenant Isolation Suite

This directory contains the regression tests that protect against **cross-tenant data leakage** in the hosted HTTP endpoint. Per the "Tenant isolation" section of [`CONTRIBUTING.md`](../../CONTRIBUTING.md), passing all tests here is a **non-negotiable merge gate**.

The tests live in their own directory (not under `tests/integration/`) so the CI job can run them independently and so their failure cannot be hidden inside a flaky integration suite.

## Tests (Phase 5)

| Test                            | Verifies                                                                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `concurrent_bearers.test.ts`    | 500 concurrent tool calls with 50 distinct Bearers return responses scoped to the calling Bearer. Zero cross-talk.                           |
| `bearer_swap_session.test.ts`   | Reusing an existing `Mcp-Session-Id` with a different Bearer is rejected (401) and the session is destroyed.                                 |
| `missing_auth.test.ts`          | A request without `Authorization` is rejected (401) BEFORE any outbound call to the API is made.                                             |
| `env_fallback_disabled.test.ts` | Starting in HTTP mode with `KAMINARI_AD_API_KEY` set in env causes the process to exit non-zero on startup.                                  |
| `header_injection.test.ts`      | `X-Org-Id`, `X-User-Id`, `X-Forwarded-User`, `Cookie` and similar headers in the incoming request are stripped before forwarding to the API. |
| `token_in_logs.test.ts`         | A unique Bearer marker never appears in pino output; only its 8-char hash prefix does.                                                       |
| `no_shared_state.test.ts`       | Doubles `scripts/check-no-shared-state.ts` as a unit-level guard so local `make test` catches regressions.                                   |
| `error_path_isolation.test.ts`  | An exception in tool handler for Bearer A does not leak into the response of a concurrent Bearer B request.                                  |

Plus one performance smoke that asserts the same isolation invariants under 1000 concurrent requests across 50 Bearers.

These tests are scaffolded in Phase 1 (config + folder + this README) and implemented end-to-end in Phase 5 after the HTTP transport lands.
