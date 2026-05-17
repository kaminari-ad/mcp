# Changelog

All notable changes to `@kaminari-ad/mcp` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed (parser-drift phase 1)

Production smoke against a fresh test org found 8 of the 82 tools
broken on 4 distinct root-cause patterns. All fixed; the global
masking bug that hid the real failure mode is fixed too.

- **API returns 204 No Content, parser expected entity.** Four tools
  hit this — `set_campaign_alert_overrides`, `request_policy_set_approval`,
  `update_tag_definition`, `update_user_role` — with errors like
  `malformed user` / `malformed tag detail` / `malformed policy-set`.
  Parsers now use `parseEmpty`; port DTOs return `null`; the tool
  output is `{ updated: true }` / `{ requested: true }` so JSON output
  stays a plain object. Tool descriptions updated to point at the
  follow-up GET when the caller needs the new state echoed.
- **Action endpoint returns `GroupActionResponse` summary, parser
  expected the group entity.** `archive_campaign_group` and
  `unarchive_campaign_group` both POST endpoints return
  `{ group_id, affected_campaigns, cancelled_count, run_ids,
  failures }` like `run_campaign_group` / `cancel_campaign_group`.
  Parsers now use the existing `parseGroupAction`; port DTO is
  `GroupActionResponse`.
- **Paginated envelope vs bare array (inverted from last week).**
  `list_campaign_groups` — OpenAPI documents the response as a bare
  `CampaignGroupResponse[]` but the parser was `parseCampaignGroupPage`
  expecting `{items, total, page, limit}`. New
  `parseCampaignGroupArray` accepts both shapes defensively (same
  `unwrapItems` pattern used in `parsePolicySetList`). Tool DTO becomes
  `readonly CampaignGroupResponse[]` and the bogus `page` / `limit`
  query params (the endpoint only documents `archived?`) are dropped.
- **Missing required request body + ignored response.** `test_webhook`
  sent `undefined` body, but the API requires `{event_type: string}`
  (422 without). The rich `TestWebhookResponse` was dropped via
  `parseEmpty`. The gateway now sends the body; new
  `parseTestWebhookResponse` decodes
  `{ success, response_status, elapsed_ms, error_code, response_body }`
  so the agent can diagnose a receiver failure from one call.
- **`error-mapping.ts::detail()` only handled string `detail`.**
  FastAPI 422 returns `detail: ValidationError[]`. Every 422 across
  every tool degraded to opaque `"Upstream error"` — which masked the
  real `test_webhook` failure mode. The detail extractor now walks
  the array, formats each entry as `"<loc>: <msg>"`, joins with
  `; `, surfaces field-level RCA in the tool error string.

### Added (parser-drift phase 2a — infrastructure for the rest)

- **Generated zod runtime schemas** at `src/shared/api/zod-schemas.ts`.
  `scripts/gen-api-types.ts` now emits both
  `src/shared/api/openapi.ts` (types, via `openapi-typescript`) and
  `src/shared/api/zod-schemas.ts` (runtime schemas + Zodios endpoint
  catalogue, via `openapi-zod-client`) from the SAME live OpenAPI
  document — so the two files cannot drift relative to each other,
  and the existing CI drift-check on the committed copies covers
  both. Source URL changed from `https://kaminari.ad/openapi.json`
  (returns a Next.js 404) to `https://app.kaminari.ad/openapi.json`
  (the actual API host).
- **`parseWithSchema` helper** at
  `src/infrastructure/api/parsers/parse-with-schema.ts` — wraps
  `schema.safeParse()` with typed `ApiError` failure mapping AND
  strips explicit-`undefined` keys from the parsed object so the
  output matches the port DTO's `exactOptionalPropertyTypes` style.
  Foundation for Phase 2b (converting each hand-written
  `parse-*.ts` to a one-liner backed by `schemas.X.pick({...})`).

### Added (parser-drift phase 4 — production observability)

- **`scripts/prod-smoke.ts`** + **`npm run prod:smoke`** + a manual
  `prod:smoke` GitLab CI job. Fires a read-only subset of MCP tools
  at the hosted endpoint using a long-lived sandbox-org bearer
  (`KAMINARI_AD_MCP_PROD_TOKEN` CI variable, Masked + Protected).
  Catches drifts that escape compile-time gates — API shape changes,
  feature-flag-gated routes flipping on/off, parser regressions.
  Manual trigger by default; flip to a daily schedule once the
  sandbox org + token are provisioned.

### Added (parser-drift phase 2b — full conversion)

- **Every `parse-*.ts` rewritten as a `parseWithSchema(schemas.X.pick
  ({...}).strip())` one-liner.** All 17 hand-written parsers now
  delegate to zod schemas generated from the live OpenAPI spec. A
  field rename / removal upstream surfaces as a `tsc` error on the
  `.pick({…})` mask (drift fails at compile time, not at the first
  production request). A wrong-shape runtime payload degrades to a
  typed `upstream` MCP error with the zod issue chain — never to an
  `undefined.x` crash.
- **Test fixtures hardened.** ~30 fixtures across
  `tests/unit/infrastructure/api/**` migrated from the old loose
  hand-parser stubs (`id: "u1"`, `created_at: "t"`,
  `status: "done"`) to schema-valid values
  (`id: "00000000-0000-0000-0000-…"`, ISO datetimes, enum members
  from the OpenAPI source like `"completed"` / `"api"`). Tests now
  assert the same contract the production API enforces.
- **Two exempt files**, both documented in
  `scripts/check-no-handwritten-parsers.ts`:
  - `parse-empty.ts` — `204 No Content`, no body to validate.
  - `parse-count-envelope.ts::parseIntField(raw, "x")` — generic
    one-field-int extractor used by ad-hoc envelopes like
    `{queued_count}` / `{cancelled_count}` that have no dedicated DTO
    in the spec.

### Added (parser-drift phase 3 — typed HTTP client)

- **`src/infrastructure/api/http-api-gateway.ts` ported to
  `openapi-fetch`.** Every endpoint path is now a literal type
  constrained by `paths` from `src/shared/api/openapi.ts`; path /
  query / body shapes are validated by the same generated types,
  with the agent-facing `Pick<S[K], …>` projections in
  `domain/ports/api-gateway.ts` narrowing the surface. Renaming or
  removing an endpoint on the API side fails the gateway at
  `tsc --noEmit` immediately — no runtime drift.
- **Tenant-isolation contract preserved.** Pinned 5-key outbound
  header allowlist (authorization / content-type / accept /
  user-agent / x-request-id) — same shape the existing
  `tests/isolation/header-injection-e2e.test.ts` AST gate already
  enforces. Per-request `Dispatcher` injection (used by tests with
  `MockAgent`; production uses the global agent) is forwarded through
  a thin `fetchImpl` wrapper that splices `input.headers` /
  `input.body` from openapi-fetch's `Request` onto the undici init
  bag — without this the auth header silently vanishes (because
  undici.fetch ignores `Request` and reads only `init`).
- **Removed `buildQuery` and the manual `${enc(id)}` interpolation.**
  Query / path params now go through openapi-fetch's typed
  `params.query` / `params.path` — typed key names per endpoint,
  enforced at compile time (`scan_id` for `/scans/{scan_id}`,
  `endpoint_id` for `/webhooks/{endpoint_id}`, etc.). A key typo
  fails `tsc` rather than producing a silently-wrong URL.

### Added (parser-drift phase 4 — production observability)

- **`scripts/prod-smoke.ts`** + **`npm run prod:smoke`** + a manual
  `prod:smoke` GitLab CI job (description retained from phase 2a).
- **`npm run check:no-handwritten-parsers`** + new
  `check:no-handwritten-parsers` GitLab CI job in `arch_gates`.
  Belt-and-suspenders gate: parses every `src/infrastructure/api/
  parsers/*.ts` and fails if a parser does NOT import `{ schemas }
  from "../../shared/api/zod-schemas"` (or one of the two documented
  exemptions). A future contributor who adds a hand-rolled
  `typeof raw === "object" && "field" in raw` parser hits this gate
  immediately, with a pointer to `parse-org` / `parse-scan` as the
  canonical schema-backed shape.

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

- **Paginated list parsers (custom-rules, policy-sets) accept the
  FastAPI envelope.** Both `parseCustomRuleArray` and
  `parsePolicySetList` expected a bare `T[]`, but the API returns the
  standard `{ items, total, page, limit, pages }` envelope — every
  call to `list_custom_rules` / `list_policy_sets` returned `Upstream
  error: expected array of …`. Parsers now accept both shapes
  (envelope is unwrapped to the inner array; pagination metadata is
  discarded since the tool DTOs return `readonly T[]`). Bug
  surfaced by a real-org smoke run against a fresh
  `/api/v1/custom-rules` instance. Other list parsers
  (`parseScanPage`, `parseCampaignPage`, `parseAlertPage`) were
  already envelope-aware; this brings the remaining two in line.

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
