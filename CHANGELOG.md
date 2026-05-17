# Changelog

All notable changes to `@kaminari-ad/mcp` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_Nothing yet._

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
