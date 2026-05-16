# Contributing to `@kaminari-ad/mcp`

Thanks for considering a contribution! This document walks you through the development workflow.

> **Quality bar.** This is OSS infrastructure that other people's data flows through. We hold it to a higher standard than internal services. Please read the "Coding standards" and "Tenant isolation" sections below carefully before opening a PR.

## Prerequisites

- Docker (24+). All build/test/lint commands run inside a pinned `node:20-alpine` container — your host Node version does not matter.
- `make` (BSD make on macOS / GNU make on Linux both work).

You do NOT need a local Node install to develop. If you want one for editor integration, install Node 20 LTS (matches `.nvmrc`).

## Get the code

```bash
git clone <repo-url> mcp
cd mcp
make install-hooks      # set up lefthook pre-commit hooks (one-time)
make check              # full quality gate; ~3 min on first run
```

## Add a new tool

The most common contribution is a new tool that wraps an existing `/api/v1` endpoint. The pattern:

1. Pick the endpoint. Look at the API's OpenAPI spec or [`api/src/app/<domain>/presentation/api/v1_*.py`](https://github.com/kaminari-ad/api/tree/main/src/app) in the API repo.
2. Create `src/application/tools/<domain>/<tool_name>.tool.ts`. **One file per tool.** File name matches the tool's snake_case name in kebab-case (`list_scans` -> `list-scans.tool.ts`).
3. Export a single `const <camelName>Tool: Tool<Input, Output> = { ... }`:
   - `name`: snake_case, unique across all tools.
   - `description`: 1-2 sentences, written **for the agent** (clear, action-oriented).
   - `inputSchema`: a `zod` schema. Every field must have `.describe()` text.
   - `handler`: receives `(input, ctx)`. Calls **exactly one** `ctx.api.<method>(...)`. Returns `Result<Output, ToolError>`. Does NOT `throw`. Does NOT access globals.
4. Register it in `src/application/tool-registry.ts`.
5. Add a unit test at `tests/unit/tools/<domain>/<name>.tool.test.ts`. Cover the success path and at least one error path with a `FakeApiGateway`.
6. Run `make check`. If you touched architecture, also `make test-isolation` (the cross-tenant safety suite).

If the tool needs to call two endpoints or do any decision-making between calls, it is no longer a thin pass-through — extract a domain service in `src/domain/services/` first.

## Coding standards

These are enforced by ESLint and the custom CI gates; the gist:

- **No `any`, no bare `as`, no `// @ts-ignore`.** Use `unknown`, type guards, or fix the types.
- **No module-level mutable state.** No `let` or `var` at module scope. No singletons with mutable fields. This is a hard tenant-isolation rule (see "Tenant isolation" below).
- **No `console.*`.** Use the injected `Logger`. The pino logger redacts Bearer tokens; `console.log` does not.
- **200 LOC max per file.** If you exceed it, split into smaller pieces.
- **One class / interface / tool per file.**
- **JSDoc required on every public symbol.** ESLint enforces this.
- **Immutable types.** Use `readonly` interfaces and `ReadonlyArray<T>`. Return `Result<T, E>` instead of throwing for expected errors.

## Commit style

Conventional Commits. The first line is `<type>: <imperative summary>`:

- `feat: add list_runs tool`
- `fix: handle 401 from get_scan gracefully`
- `refactor: extract pagination helper`
- `test: cover bearer-swap rejection`
- `chore: bump @modelcontextprotocol/sdk`
- `docs: clarify HTTP-mode config`

`commitlint` runs in pre-commit and CI. Squash multiple commits into one focused message when opening the PR.

## Pull requests

- Open against `main`.
- Fill in the PR template (tests added, docs updated, changelog entry).
- All CI jobs must be green. The `test-isolation` job is a non-negotiable merge gate.
- A maintainer reviews. Tenant-isolation-touching changes require two reviewers.

## Tenant isolation (HTTP mode)

The hosted `mcp.kaminari.ad` endpoint serves many organizations from one process. The HTTP transport, session store, and rate limiter must preserve these invariants:

1. **No module-level mutable state.** No `let`/`var` at module scope, no mutating `static` fields. ESLint and `scripts/check-no-shared-state.ts` enforce this; both have to be edited to bypass.
2. **No caches indexed by tenant data.** Zero. The only mutable stores allowed are session and rate-limit, in `src/infrastructure/{session,rate-limit}/`. The session store is `Map<SessionId, {bearerHash, expiresAtMs}>` (keyed by MCP session id, values hold `sha256(bearer)` for binding); the rate limiter is `Map<bearerHash, LeakyBucket>`. Neither stores user ids, org ids, scan ids, or any tenant business data.
3. **`ApiGateway` is constructed per request** from that request's `Authorization`. There is no `globalApiGateway`.
4. **Missing `Authorization` returns 401 without calling the API.** Test: `tests/isolation/missing_auth.test.ts`.
5. **`KAMINARI_AD_API_KEY` is forbidden in HTTP mode** — the bootstrap asserts on startup. Test: `tests/isolation/env_fallback_disabled.test.ts`.
6. **Only `Authorization` is forwarded** — all other headers (`X-Org-Id`, `X-User-Id`, `Cookie`, etc.) are stripped. Test: `tests/isolation/header_injection.test.ts`.
7. **Session-id is bound to `sha256(bearer)`.** Reuse with a different Bearer is rejected and destroys the session. Test: `tests/isolation/bearer_swap_session.test.ts`.
8. **Bearers never log.** Only `bearer_hash = sha256(token).slice(0,8)`. Test: `tests/isolation/token_in_logs.test.ts`.

Any change to `src/presentation/http/`, `src/infrastructure/session/`, `src/infrastructure/rate-limit/`, or `src/infrastructure/api/http-api-gateway.ts` requires a second reviewer.

## Reporting security issues

**Do not open a public issue for security bugs.** See [SECURITY.md](SECURITY.md).
