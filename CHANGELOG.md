# Changelog

All notable changes to `@kaminari-ad/mcp` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed (breaking — pre-release, no API consumers yet)

- **Env vars now carry the `KAMINARI_AD_` namespace prefix.** Generic
  names (`API_BASE_URL`, `LOG_LEVEL`, `HTTP_PORT`, `SESSION_TTL_SEC`,
  `RATE_LIMIT_RPM`, `TRANSPORT`) were trivially poisonable by any
  other tool in the same shell or container that set the same name.
  All env vars are now `KAMINARI_AD_*`:
  - `API_BASE_URL` → `KAMINARI_AD_API_URL`
  - `LOG_LEVEL` → `KAMINARI_AD_LOG_LEVEL`
  - `HTTP_PORT` → `KAMINARI_AD_HTTP_PORT`
  - `SESSION_TTL_SEC` → `KAMINARI_AD_SESSION_TTL_SEC`
  - `RATE_LIMIT_RPM` → `KAMINARI_AD_RATE_LIMIT_RPM`
  - `TRANSPORT` → `KAMINARI_AD_TRANSPORT`
  - `KAMINARI_AD_API_KEY` — unchanged.
  Old unprefixed names are no longer read. `env | grep KAMINARI_AD_`
  now enumerates every config input.

### Added

- **`KAMINARI_AD_LOG_FORMAT`** env var (`pretty` | `json`) — was
  previously hard-coded per transport (stdio = pretty, http = json).
  Now operator-controllable. Default remains transport-dependent.
  MCP hosts that capture stderr (Cursor, Claude Desktop) should set
  this to `json` for parseable structured logs.
- **`pino-pretty`** moved to runtime `dependencies` so the default
  `stdio + pretty` path no longer crashes on `npx -y @kaminari-ad/mcp`
  with "unable to determine transport target".
- **Pino sink hardening**: `pretty` format now uses a sync
  `pino-pretty` write stream wired to `process.stderr` directly,
  instead of the `transport` worker option. The worker silently
  ignores any `destination` argument and defaults to stdout, which
  would corrupt the MCP JSON-RPC channel in stdio mode.

### Fixed

- **HTTP transport: Streamable HTTP session continuity.** The
  per-request handler used to spin up a fresh `McpServer` +
  `StreamableHTTPServerTransport` on every POST, so the SDK state
  built by `initialize` evaporated before `initialized` arrived and
  every subsequent request returned 400 "Server not initialized".
  The handler now caches the SDK transport keyed by session id and
  swaps a per-request `ApiGateway` into a `ctxRef` indirection so the
  bearer stays request-scoped (tenant-isolation rule #9 enforced via
  the existing `SessionStore` bearer-hash equality check). Refactored
  into three files (`http-request-handler.ts`,
  `session-resolver.ts`, `mcp-session-factory.ts`) to stay under the
  200-effective-line cap.
- **HTTP transport: SIGTERM/SIGINT crash on startup.** Both
  bootstraps used `import * as process from "node:process"`; the
  namespace import does not expose `process.once` (it's on the
  default export only), so the HTTP transport crashed immediately
  with "process.once is not a function" — and no unit/isolation test
  caught it because none of them spawned the real bootstrap.
  Switched all three entrypoints (`bin.ts`, `stdio-bootstrap.ts`,
  `http-bootstrap.ts`) to default `import process from "node:process"`
  and added a CLI-smoke integration test that boots the built
  `dist/bin.js` and probes `/healthz` + the full
  `initialize → initialized → tools/list` session flow.
- **stdio transport: pretty logs polluted the JSON-RPC stdout channel.**
  Pino's `transport: { target: "pino-pretty" }` option spawns a worker
  that defaults to `process.stdout` and ignores the destination
  argument we passed to `pino()`. In stdio mode (MCP host reads
  JSON-RPC from stdout) this corrupted every response. The pretty
  format now uses a synchronous `pino-pretty` write stream wired to
  `process.stderr` directly.
- `pino-pretty` moved from `devDependencies` to `dependencies` so a
  fresh `npx -y @kaminari-ad/mcp` install no longer crashes with
  "unable to determine transport target".
- `zod` pinned to `3.25.76` (was `3.24.1`). MCP SDK 1.29 ships a
  transitive `zod-to-json-schema` that imports `zod/v3`, an export
  introduced in zod 3.25 — the old pin would crash any consumer on
  first import with `ERR_PACKAGE_PATH_NOT_EXPORTED`.

## [0.1.0] - TBD

Initial public release. The first version that ships to npm under
`@kaminari-ad/mcp`.

### Added

- **MCP server** with two transports:
  - **stdio** for local clients (Cursor, Claude Desktop, Cline, ...).
    API key from `KAMINARI_AD_API_KEY` env var.
  - **Streamable HTTP** for the hosted endpoint at
    `https://mcp.kaminari.ad/mcp`. Per-request Bearer, per-request
    `ApiGateway` closure, in-memory session store keyed by `SessionId`
    (value: `sha256(bearer)`), leaky-bucket rate limit keyed by
    `sha256(bearer)`.
- **82 tools** spanning most of the `/api/v1` surface — account,
  scans, campaigns, runs, campaign-groups, tag-definitions,
  custom-rules, policy-sets, alerts, alert-notifications, webhooks,
  billing, invoicing, geos, emulators. Every tool carries the
  Anthropic Software Directory annotations (`title`, `readOnlyHint`,
  `destructiveHint`, `idempotentHint`, `openWorldHint`).
- **Tenant-isolation discipline** for the hosted HTTP mode, codified
  as 16 rules in `CONTRIBUTING.md` and enforced by `tests/isolation/`
  (bearer-swap, header-injection, env-fallback disabled, missing
  auth, concurrent bearers, no-shared-state AST gate, token-not-in-
  logs, error-path isolation).
- **Type-safety**: every port DTO is a `Pick<components["schemas"][X],
  ...>` projection over the generated `src/shared/api/openapi.ts`. A
  future API field rename surfaces as a compile error in the parser.
- **Quality gates** (all enforced by CI):
  - TypeScript strict + 8 ESLint plugins.
  - 4 custom architecture gates: file size (200 LOC), import
    boundaries (dependency-cruiser with `tsPreCompilationDeps`),
    no-shared-state (ts-morph AST walk), tool-naming.
  - 100% lines / 100% functions / 100% statements coverage,
    97% branches.
  - Bundle size cap (500 KB on `dist/bin.js`, currently ~180 KB).
  - `npm audit` with 0 vulnerabilities.
- **Packaging**: ESM dist with shebang for `npx`, sourcemaps, type
  declarations, npm provenance on release.

### Security

- `KAMINARI_AD_API_KEY` env var is **rejected on startup** in HTTP
  mode (stdio only) — no fallback token can exist on a hosted server.
- Bearer tokens are **never logged**. The `BearerToken` value object
  overrides `toString` / `toJSON` /
  `Symbol.for("nodejs.util.inspect.custom")` to return
  `[BearerToken redacted]`.
- pino is configured with redaction paths covering
  `authorization` / `bearer` / `*.token` etc.
- Outbound API calls carry an **explicit 5-key header allowlist**
  (`authorization`, `content-type`, `accept`, `user-agent`,
  `x-request-id`). No spread of inbound request headers.

### Not yet (tracked as follow-ups)

- **OAuth 2.1 + Dynamic Client Registration + PKCE** on the hosted
  `mcp.kaminari.ad` endpoint, required by the Anthropic Software
  Directory (§5.D) for remote MCP servers. v0.1.0 ships with raw
  Bearer; OAuth lands in a follow-up MR.
- Binary scan-screenshot fetchers (`/api/v1/scans/{id}/screenshot`
  etc.) — agents rarely consume images directly. Reach out if you
  need them.
- Invoice PDF fetcher — same reason.
