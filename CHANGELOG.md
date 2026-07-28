# Changelog

All notable changes to `@kaminari-ad/mcp` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Combo-rule match scope.** `create_custom_rule`, `update_custom_rule`, and
  `test_custom_rule` now document the rule-level `config.match_scope` key used
  by `rule_type='combo'`: `"scan"` (the default, and the behaviour when the key
  is absent) counts conditions across the union of all tags on the scan, while
  `"url"` requires every condition to be satisfied by tags on the same link and
  assigns the output tag to that link. The description warns about the traps a
  per-link rule falls into: a combo built only from link-less tags (AI verdicts,
  crawler behaviour) has no link to attach to and never matches, AI verdicts and
  per-link detections are not evaluated together today, and a per-link rule needs
  at least one positive condition. Any other `match_scope` value is rejected
  before the request is sent, so a misspelled scope surfaces as a tool-input
  error instead of a round trip; the API validates `match_scope` on create,
  update, and the rule-test preview as well, so this is early feedback rather
  than the durable guarantee. The rest of a combo config is still validated only
  for admin-authored system rules, which is why the per-link traps are documented
  rather than enforced. `get_custom_rule` and `list_custom_rules` now flag that
  the returned `config` may carry `match_scope` and that it must be resent
  verbatim, since `update_custom_rule` replaces `config` wholesale.
- **`referrer` on scan and campaign creation.** `create_scan`,
  `create_bulk_scans`, `create_campaign`, and `update_campaign` accept an
  optional http(s) page URL the check is performed from. With `ad_tag` or
  `vast_tag` it is the publisher page the tag is embedded in: the browser
  commits the page document on that URL without fetching the publisher, so the
  creative renders as if embedded there. With `url` or `ad_discovery` it is
  where the visitor came from, sent as the `Referer` of the page request.
  `update_campaign` also accepts `referrer: null` to clear a stored one.
  Scan and campaign responses surface `referrer` too, so an agent can confirm
  what a scan actually ran with.

  **Release ordering — this depends on an unreleased API.** The snapshots were
  generated from api `feat/scan-referrer`
  ([api!341](https://gitlab.sdev.pw/adverif/api/-/merge_requests/341)). API
  request DTOs are `extra="ignore"`, so an API without the field drops
  `referrer` silently: no 422, the scan runs with no referrer, and the response
  carries no `referrer` key — the agent gets a green result for a check it
  believes ran from a publisher page. **Do not cut the npm tag or the
  `kaminariad-mcp` image until api!341 is merged and deployed to
  `kaminariadprod1`.** Nothing automated enforces this.

### Changed

- Regenerated the OpenAPI type + zod-schema snapshots so the `/api/v1` surface
  they describe carries `referrer`. That field is their only delta versus the
  0.10.0 snapshots.

## [0.10.0] - 2026-07-28

### Added

- **Repeats and retries.** `create_scan`, `create_bulk_scans`,
  `create_campaign`, and `update_campaign` accept `repeat_count` (1-20),
  `repeat_mode` (`isolated` | `shared`), and `retry_max_attempts` (0-5).
  `repeat_count` multiplies the scans created — and billed — per
  `url x country x device` combination; `shared` runs a combination's repeats
  in one browser behind one IP with cookies carried over (rejected with 422
  together with ad discovery); `retry_max_attempts` re-crawls the same scan
  after a transient failure without billing twice.
- **Repeat / retry fields on the read side.** Scan detail surfaces
  `repeat_index`, `repeat_total`, `repeat_session_id`, `repeat_scan_ids`,
  `retry_attempt`, and `retry_max_attempts`; the scan-list brief carries all of
  those except `repeat_scan_ids`; campaign responses echo `repeat_count`,
  `repeat_mode`, and `retry_max_attempts`.

### Fixed

- **`list_balance_history` can filter on `card_top_up`.** The API has emitted
  that transaction type for a while — an unfiltered call already returned the
  rows — but the tool's own enum stopped at `crypto_top_up`, so
  `type: ["card_top_up"]` was rejected locally and never reached the API. The
  filter's length cap was one short for the same reason.
  `BalanceTransactionType` is now aliased off the generated schema instead of
  hand-mirrored, so the next regen turns a new value into a compile error.

### Changed

- Regenerated the OpenAPI type + zod-schema snapshots against `/api/v1`
  v1.27.0. Besides the repeat / retry fields this picks up the
  `creative-html` / `creative-video` / `vast-xml` artifact endpoints,
  `video.click_through`, `creative_kind` as an enum, `tag_visibility` on custom
  rules, the `card_top_up` balance-transaction type, and the `tag_match` scan
  filter.
- `creative_kind` is surfaced as an open string rather than the regenerated
  `banner | video` enum, following the same forward-compat policy as
  `block_reason`. A creative kind added on the API side now degrades that one
  field instead of failing the entire `get_scan` / `create_scan` /
  `create_bulk_scans` response until an MCP release ships.
- `get_scan_screenshot` and `get_scan_landing_screenshot` warn that a resized
  capture is top-cropped past 2.5x its width, and to omit `width` when the
  whole page matters. `get_scan_creative_screenshot` never crops and is
  unchanged.
- `get_campaign` and `list_campaigns` describe the repeat / retry settings they
  echo, `list_scan_children` explains why those fields are always neutral on a
  discovered-ad child, and `get_scan` documents the creative's `click_through`
  destination.

## [0.8.0] - 2026-07-10

### Added

- **VAST video-ad support.** `create_scan`, `create_bulk_scans`,
  `create_campaign` (new `vast` campaign type), and `update_campaign` now
  accept a `vast_tag` — an http(s) URL of a VAST endpoint or raw VAST XML —
  mutually exclusive with `url` / `ad_tag`. Scan responses surface
  `creative_kind` (`banner` | `video`) plus a `video` block (duration,
  media-file URL, VAST version, ad system, VPAID flag, wrapper depth), and the
  scan-list brief carries `is_vast`. Regenerated the OpenAPI type + zod-schema
  snapshots against the updated `/api/v1` surface.

## [0.6.0] - 2026-06-30

### Changed

- **HTTP transport is now stateless** (`StreamableHTTPServerTransport` with
  `sessionIdGenerator: undefined`). The server no longer issues an
  `Mcp-Session-Id`; it builds a fresh, single-use MCP server + transport per
  request and authenticates each request independently by its own Bearer. This
  lets `mcp.kaminari.ad` run multiple replicas behind a round-robin load
  balancer with no sticky sessions and no shared session store — fixing the
  mid-session failures that appeared after the Traefik edge cutover. It aligns
  with the MCP stateless direction (SEP-2575 / SEP-2567) and improves
  ChatGPT-connector compatibility (the connector opens a new session per tool
  call, which a stateful server handles poorly).

### Removed

- In-memory session store, the session-id <-> bearer binding, and the
  `KAMINARI_AD_SESSION_TTL_SEC` env var — all obsolete in stateless mode. The
  only remaining mutable store is the per-bearer rate limiter.

## [0.5.2] - 2026-06-20

### Security

- **Bump `undici` 8.3.0 to 8.5.0** to clear the npm-audit gate after the
  upstream disclosure of seven high-severity advisories (TLS validation
  bypass, shared-cache disclosure, Set-Cookie SameSite downgrade, header
  injection, WebSocket DoS). `undici` is a direct dependency.

### Added

- **Security response headers on the HTTP transport.** Every HTTP
  response now carries `Strict-Transport-Security`,
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: no-referrer`, and `Permissions-Policy`. These moved
  off the upstream edge proxy so `mcp.kaminari.ad` is self-contained. No
  CORS and no org-identifying headers are added (tenant-isolation rules).

> `0.5.1` was tagged prematurely (before the version bump) and is
> superseded by `0.5.2`; it was never published to npm.

## [0.5.0] - 2026-06-17

### Added

- **Ready-made scan report links.** `get_scan`, `list_scans`, and
  `list_run_scans` now surface `report_url` (authenticated dashboard
  report) and `public_report_url` (shareable, no-login) for every scan,
  and `screenshot_url` / `creative_screenshot_url` are absolute URLs.
  The agent links to a scan using these fields verbatim instead of
  hand-building URLs (it previously guessed the apex host instead of the
  `app.kaminari.ad` SPA host). A new MCP server `instructions` string
  (advertised on both transports during `initialize`) reinforces the
  rule: never construct scan/app URLs — use the ones the API returns.
- **OAuth 2.0 Protected Resource discovery.** The HTTP transport now
  serves `GET /.well-known/oauth-protected-resource` (RFC 9728) and
  returns `WWW-Authenticate: Bearer resource_metadata="…", scope="…"`
  on unauthenticated `/mcp` requests (the 401s produced by the
  Bearer-extraction layer). The metadata document points at the
  Kaminari Ad Authorization Server (`https://app.kaminari.ad` by
  default) and advertises the `mcp:*` scope catalogue. This is the
  discovery path Anthropic's Claude clients use when adding the
  server as a directory connector. API-key authentication remains
  fully supported — OAuth Bearer tokens are an additive, parallel
  flavour for agents that prefer per-app consent + revocation.
- **Operator config:** `KAMINARI_AD_OAUTH_PROTECTED_RESOURCE`,
  `KAMINARI_AD_OAUTH_PROTECTED_RESOURCE_METADATA_URL`,
  `KAMINARI_AD_OAUTH_AUTHORIZATION_SERVER_URL`, and
  `KAMINARI_AD_OAUTH_SCOPES` (space-separated) for staging/local
  overrides. Defaults match the production deployment.
- **Campaign emulator/proxy/schedule parity.** `create_campaign` and
  `update_campaign` now expose the full device + proxy + schedule
  surface the API has always supported: `emulator_specific_ids`
  (pin exact device slugs, e.g.
  `samsung_galaxy_s23_ultra_android16`), `emulator_mode`
  (`random` = 1 device per category, `all` = every device),
  `proxy_type`/`proxy_region`/`proxy_city`/`proxy_isp`, and a real
  schedule definition (`schedule_type` `weekly`/`interval`,
  `schedule_weekly`, `schedule_interval_seconds`,
  `schedule_timezone`). `update_campaign` additionally accepts `url`,
  `ad_tag`, and `group_id`. Campaign read responses
  (`get_campaign` / `list_campaigns`) now include `emulator_selection`,
  the proxy fields, and the detailed schedule.
- **Scan proxy targeting.** `create_scan` and `create_bulk_scans`
  accept an optional `proxy` object (`proxy_type` + `region` / `city`
  / `isp`).
- **`update_webhook`** now accepts `description`, `campaign_ids`, and
  `clear_campaign_ids` (relabel an endpoint or change its
  campaign-restriction after creation).
- **`get_billing_summary`** now surfaces `credit_limit_micros`,
  `effective_minimum_balance_micros`, `current_plan_is_custom`, and
  the scheduled-plan-change fields (`scheduled_next_plan_id`,
  `scheduled_next_plan_name`, `scheduled_effective_at`).
- **`invite_user`** accepts an optional `timezone`; `list_org_users`
  now returns each member's `role_id` (so `update_user_role` no
  longer needs a guessed UUID).

### Removed

- **Phantom tool inputs that the API silently ignored.**
  `update_campaign_group` no longer advertises `schedule_paused`
  (use `pause_campaign_group_schedule` /
  `resume_campaign_group_schedule` instead), and `update_org` no
  longer advertises `settings` (the API accepts only `name`). Both
  were no-ops; removing them is non-breaking (unknown keys were
  already stripped by input validation).

### Security

- **Cleared the `audit:deps` gate (5 advisories).** `npm audit fix`
  resolved form-data (high), vite (high), and `@babel/core`; `js-yaml`
  is forced to `4.2.0` via `overrides` (transitive through the dev-only
  `@redocly/openapi-core`). Runtime dependencies are unchanged.

## [0.3.0] - 2026-05-20

Major-feature release — full parity with the API surface added in
COOP-13940 Phase 3 (custom taxonomies + 5-kind policy rules + binary
downloads). **Contains breaking changes for existing agents** —
review the migration notes below before upgrading.

### Breaking

- **`update_tag_definition`**: input field `show_in_public_report`
  (boolean) was removed; replaced by `visibility` (enum:
  `hidden | internal | public`). Old payloads now fail zod
  validation locally with a typed `invalid-input` error before
  hitting the API. Migration: replace `show_in_public_report: true`
  → `visibility: "public"`, and `show_in_public_report: false` →
  `visibility: "internal"` (or `"hidden"` if you want the tag
  fully suppressed).
- **`list_alerts`**: `status` filter no longer accepts the legacy
  values `"ack"` / `"ignored"`. The canonical four are
  `"open"`, `"acknowledged"`, `"resolved"`, `"dismissed"`. Mapping:
  `"ack"` → `"acknowledged"`, `"ignored"` → `"dismissed"`.
- **`create_policy_set` / `update_policy_set`**: `entries[]` is now
  a discriminated union over **five rule kinds**. Existing tag-only
  callers MUST add `rule_type: "tag"` to every entry. Other kinds:
  `"iab_v3"` (with `iab_v3: { tier1, tier2?, tier3?, tier4? }`),
  `"brand"` (with `brand: string`), `"ai_category"` (with
  `ai_category: { tier1, tier2?, tier3?, tier4? }`),
  `"custom_taxonomy"` (with `custom_taxonomy: { taxonomy_id, tier1,
  tier2?, tier3?, tier4? }`).
  `country_codes` now accepts both ISO alpha-2 and alpha-3 (the
  API normalises).

### Added

- **`custom_taxonomies` tool suite (7 tools).** Per-org
  classification trees with an `is_default` fallback node:
  `list_custom_taxonomies`, `get_custom_taxonomy`,
  `create_custom_taxonomy`, `update_custom_taxonomy`,
  `delete_custom_taxonomy` (soft-delete), `restore_custom_taxonomy`,
  `parse_custom_taxonomy_text` (no-persistence preview).
- **Account labels.** `list_account_labels` + `update_account_labels`
  for the per-org metadata schema that backs `list_scans.labels`
  filters. `update_account_labels` is hinted destructive — passing
  `labels: []` wipes the catalogue.
- **`create_custom_role`** for `/api/v1/account/roles` POST.
- **Binary downloads** — `get_invoice_pdf` (MCP `resource` block),
  `get_scan_screenshot`, `get_scan_creative_screenshot`,
  `get_scan_landing_screenshot` (MCP `image` blocks). All four
  return inline base64 with the API-supplied `mimeType` so agents
  can save / forward without a second call.
- **`list_alerts` rule_type + matched_value.** Each alert row now
  carries `rule_type` (one of the five kinds) and `matched_value`
  (the canonical text the scan matched against). Lets agents
  branch on rule kind without re-fetching the scan.
- **`list_policy_sets.visibility` filter.** Narrow to
  `private` (org-owned) or `public` (Kaminari Ad-curated). Omit
  the filter to see both combined.
- **`list_scans` filters.** Added `run_id`, `campaign_id`,
  `group_id`, `timezone`, `ai_category`, `iab_v3_category`,
  `iab_category`, `brand`, plus a typed `labels` record that
  expands to `label_<key>=<value>` query params (snake_case keys
  enforced by zod).
- **Misc query filters.** `list_campaigns` + `list_campaigns_picker`
  gained `archived` / `q`; `list_invoices` gained `type` / `status`
  enums; `list_balance_history` gained multi-select `type`;
  `list_webhook_deliveries` gained `success` / `from_ts` / `to_ts`;
  `list_usage` switched to ISO 8601 datetime bounds; `list_tags`
  gained `category`.

### Changed

- **OpenAPI types regenerated.** `src/shared/api/openapi.ts` and
  `src/shared/api/zod-schemas.ts` are rebuilt from the prod API and
  capture every Phase 3 schema (custom-taxonomies, 5-kind
  PolicyEntry, AlertResponse `rule_type` / `matched_value`, tag
  visibility rename).
- **Tool descriptions.** Policy-sets, alerts, and tag tools updated
  to mention the new fields. `get_alert_stats` description uses the
  canonical AlertStatus names.
- **Branding.** All user-visible tool descriptions and JSDoc use the
  canonical `Kaminari Ad` (with space) per the updated branding
  rule. The dotted form `Kaminari.Ad` is deprecated.

### Quality gates

- 705 unit tests (was 623). Coverage 100% statements / 100% lines /
  100% functions / 97.89% branches (gate is 95% branches). Every
  new tool has at least 3 cases (success / api-error /
  zod-rejection); policy-set tools cover all five rule kinds with
  per-kind missing-block rejection tests.
- All existing gates pass: lint, format, typecheck, tool-naming,
  file-sizes (8 grandfathered, every new file <200 effective
  lines), check-imports, check-shared-state,
  check-no-handwritten-parsers.

## [0.2.2] - 2026-05-20

Minor release — adds one-click install paths for Cursor and Claude
Desktop. No tool surface change, no breaking API behaviour change.

### Added

- **Claude Desktop `.mcpb` extension bundle.** Each tag release now
  builds a single-file `kaminari-ad-mcp.mcpb` (via the new
  `tsup.mcpb.config.ts` + `mcpb pack`) and uploads it to the GitHub
  Release. Stable download URL:
  <https://github.com/kaminari-ad/mcp/releases/latest/download/kaminari-ad-mcp.mcpb>.
  Double-click installs into Claude Desktop with a config form for
  the API key and a ToS-acceptance checkbox.
- **Cursor one-click install badge.** README and the Kaminari Ad
  marketing site link the official Cursor "Install in Cursor" badge
  to a trampoline page (`https://kaminari.ad/mcp/install`) that
  redirects to the `cursor://anysphere.cursor-deeplink/mcp/install`
  URL with the npx-based stdio config pre-encoded.
- **`server.json`** for [registry.modelcontextprotocol.io][mcp-reg]
  listing. Surface (npm stdio package, env vars) mirrors what the
  README documents.

[mcp-reg]: https://registry.modelcontextprotocol.io

## [0.2.1] - 2026-05-18

Patch release — clear Node-version error message, correct `engines`
declaration, and the default API URL is now the real API host. No
tool surface change.

### Fixed

- **Default `KAMINARI_AD_API_URL` pointed at the wrong host.**
  v0.2.0 defaulted to `https://kaminari.ad`, which is the marketing
  landing page — `kaminari.ad` does NOT serve `/api/v1/*` routes
  (returns HTTP 404 for every tool call). The actual API host is
  `https://app.kaminari.ad` (note the `app.` subdomain).
  Users who set `KAMINARI_AD_API_URL` explicitly were unaffected;
  users who relied on the default got 404 on every tool call. The
  internal `gen-api-types` script already used the correct host
  (`app.kaminari.ad`) for OpenAPI generation — only the runtime
  default drifted. Now corrected here, in `.env.example`, and pinned
  by a unit test against future regressions.
- **Cryptic `webidl.util.markAsUncloneable is not a function`
  startup crash on Node < 22.19.** The underlying `undici@8.x`
  removed feature probes in v8.0.3 and now imports `markAsUncloneable`
  unconditionally — that symbol only exists on Node 22.19+. v0.2.0
  declared `engines.node = ">=22.13.0"`, so npm warned but did not
  block install on Node 22.13–22.18 or Node 20; users hit the
  cryptic webidl error at first invocation.
  - `engines.node` bumped to `>=22.19.0` to match the real floor.
    Consumers with `engine-strict=true` (or `npm install
    --engine-strict`) are now blocked at install time with a clear
    `EBADENGINE` message.
  - New runtime preflight in `bin.ts::main()` catches the case where
    install slipped through (npx pulls fresh on every run; npx does
    not honour `engine-strict` by default). Prints a clean message
    and exits with code 2, BEFORE any dynamic import pulls undici:

    ```
    @kaminari-ad/mcp requires Node.js >=22.19.0 (you have v20.x.x).
    The underlying undici 8.x HTTP client uses markAsUncloneable
    from node:worker_threads, available only on Node 22.19+.
    Older Node crashes at import time with the cryptic message
    `webidl.util.markAsUncloneable is not a function`.

    Please upgrade Node and re-run: https://nodejs.org/en/download
    ```

### Internal

- `tsup.config.ts` flipped to `splitting: true`. Required for the
  preflight to actually run before undici loads: without splitting
  esbuild inlines every dynamic `await import("./presentation/...")`
  call into the top-level bundle, eagerly importing undici/MCP SDK/
  pino at startup. With splitting on, transport bootstraps stay as
  separate chunks loaded only after `main()` runs the Node check.
- `scripts/check-bundle-size.ts` rewritten to aggregate every
  runtime `.js` chunk under `dist/` instead of just `dist/bin.js`.
  With splitting on, `bin.js` is a thin ~5 KB preflight + dispatch
  shim and the actual shipping cost lives in the transport / vendor
  chunks. Total artifact: 173 KB across 5 chunks (smaller than
  v0.2.0's 218 KB monolithic bundle thanks to tree-shaking now seeing
  each chunk in isolation). Limit unchanged at 500 KB.
- `src/shared/check-node-version.ts` — pure function extracted from
  `bin.ts` so the version preflight can be unit-tested without
  `process.exit` side effects. Test pins all boundary cases (22.18 /
  22.19 / 22.20 / 23.x / 20.x / prerelease tags / garbage input).

## [0.2.0] - 2026-05-17

Comprehensive parser-drift sweep across all `/api/v1/*` list
endpoints, a new tool for slim campaign selection, an MCP-client
interop fix, and small docs polish. Semver-minor because three list
tools changed output shape (breaking) and one new tool was added.

The MCP audit covered every `/api/v1/*` list endpoint. The MCP
already wrapped 21 of them — 18 were correctly wired, 3 had drift
(now fixed: `list_run_scans`, `list_custom_rules`, `list_policy_sets`).
One additional list endpoint (`/campaigns/picker`) had no MCP wrapper
and was added as the new `list_campaigns_picker` tool. The detail
endpoint `get_tag_definition` was also fixed to surface
`linked_rules`. See [MIGRATION_0_2.md](https://github.com/kaminari-ad/mcp/blob/main/MIGRATION_0_2.md)
for the agent-side migration notes.

### Breaking

- **`list_run_scans` output element type:** `ScanBriefResponse` →
  `ScanTileResponse`. The slim DTO drops `url` / `created_at` /
  `labels` / `campaign_id` / `campaign_name` / `is_ad_tag` and adds
  `error`. The tool no longer fails on prod data with `malformed
  scans page: items.0.url: Required`; agents needing full scan
  details should call `get_scan` per tile.
- **`list_custom_rules` output shape:** `readonly CustomRuleResponse[]`
  → `PaginatedResponse<CustomRuleResponse>`. New optional
  `page` / `limit` inputs (defaults `1` / `50`). Previously the tool
  silently dropped pagination metadata; orgs with > 50 rules
  appeared to have exactly 50.
- **`list_policy_sets` output shape:** `readonly PolicySetListItemResponse[]`
  → `PaginatedResponse<PolicySetListItemResponse>`. New optional
  `page` / `limit` inputs (defaults `1` / `50`). Same pagination
  drop as `list_custom_rules`.

### Fixed

- **`list_run_scans` failed with `malformed scans page:
  items.0.url: Required`.** Parser wired the wrong DTO
  (`ScanBriefResponse`) for an endpoint that returns
  `ScanTileResponse`. Same drift class as `list_policy_sets` v0.1.1.
- **`list_custom_rules` / `list_policy_sets` silently dropped
  pagination metadata.** Now expose `total` / `page` / `limit` so
  agents iterate correctly past the default page size.
- **`get_tag_definition` now returns `linked_rules`** (the custom
  rules currently producing this tag — `id` / `name` / `is_active`).
  Previously silently dropped because the parser reused the list-row
  schema. Agents no longer need to grep `list_custom_rules` by
  `tag_slug` themselves.
- **`invalid-input` (HTTP 400 / 422) error responses now preserve
  the API's machine-readable `code` field.** Forward-compat for
  `delete_policy_set` growing `code: "policies.in_use"` — agents
  can branch programmatically as soon as the API ships the code,
  no MCP release required.

### Added

- **`list_campaigns_picker`** (83rd tool — was 82, now 83) — slim
  per-row campaign list for selection UIs (id, name, group_id,
  is_archived). Cheaper than `list_campaigns` for orgs with thousands
  of campaigns. Use `get_campaign(id)` after a selection.
- **Server now declares empty `resources` and `prompts` capabilities
  with handlers returning `[]`.** Cursor / Claude Desktop / Cline
  probe these at session start; previously the SDK responded with
  `-32601 Method not found`, which Cursor's client mistranslated
  as a misleading `"MCP error -32000: Connection closed"` warning.
  Functional impact was zero (all tools remained callable) but
  downstream agent logs filled with false positives once per session
  per server. Now clean.

### Docs

- **README:** replaced the fictional `kad_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  API-key placeholder with `<your-kaminari-ad-api-key>` + a note
  that keys are opaque (no required prefix or fixed length).
- **`create_custom_rule` / `update_custom_rule` / `test_custom_rule`:**
  the `target` parameter description no longer claims a stale
  `page | offer_url | html` enum (OpenAPI declares it as a freeform
  string; `html` may not be currently valid). Defers to API docs.
- **`delete_policy_set`:** description now explicitly mentions the
  API returns `HTTP 400` if campaigns are bound, and suggests the
  unbind-via-`update_campaign` workflow before retry.

### Internal

- Comprehensive parser-drift audit across all `/api/v1/*` list
  endpoints (run via parallel `explore` subagents covering API + MCP
  sides). 21 endpoints already had MCP wrappers — 18 clean, 3 with
  drift (now fixed); 1 additional list endpoint had no wrapper and
  was added as a new tool. No remaining drift.
- New parser modules: `parse-run-scan-page.ts`, `parse-custom-rule-page.ts`,
  `parse-policy-set-page.ts`, `parse-campaign-picker.ts`. The old
  defensive bare-or-envelope helpers (`parseCustomRuleArray`,
  `parsePolicySetList`) are gone; their files now expose only the
  per-entity parsers. `parseTagDetail` moved out of `parse-generic.ts`
  into `parse-tag.ts` because it now needs the detail schema's
  `linked_rules` field which the list schema doesn't have.
- New shared helper `presentation/shared/declare-empty-caps.ts`
  used by both stdio and HTTP bootstraps. Unit test against an
  in-memory `Client` + `InMemoryTransport.createLinkedPair()` pair,
  plus an end-to-end probe in the CLI smoke that hits a real HTTP
  RPC after the `initialize` handshake.

## [0.1.5] - 2026-05-17

Re-release of v0.1.4 — the Corepack-based npm upgrade in v0.1.4
reported `Preparing npm@^11 for immediate activation...` but the
shell still showed bundled `npm 10.9.7`, because Corepack shims
were not in PATH priority. Publish failed at the same point (404).

### Fixed

- **Release workflow pinned to Node 24** (instead of .nvmrc Node 22)
  so the bundled npm is 11.x, which has built-in Trusted Publisher
  OIDC publish support. CI and local dev keep .nvmrc Node 22 — only
  the release job overrides. Added an explicit `npm --version` gate
  that fails the build if npm < 11.5.1 (defense against future Node
  releases bundling older npm).

## [0.1.4] - 2026-05-17

Re-release of v0.1.3 — that release's `npm install -g npm@^11`
step broke mid-upgrade with `Cannot find module 'promise-retry'`
(npm 10 → 11 in-place self-upgrade leaves a broken state because
newer arborist references modules the old bundled tree never had).

### Fixed

- **Upgrade npm via Corepack instead of in-place self-upgrade.**
  Corepack (bundled with Node 22+) manages the npm install via a
  separate symlink layer and avoids the self-upgrade race. The
  publish step now reliably runs against npm 11.x with full OIDC
  Trusted Publisher support.

## [0.1.3] - 2026-05-17

Re-release of 0.1.1 / 0.1.2 (both failed at the npm publish step).
The 0.1.2 OIDC debug step revealed every JWT claim matches the
Trusted Publisher config perfectly — the failure was elsewhere.

### Fixed

- **npm CLI version too old for OIDC publishing.** GitHub Actions
  Node 22 LTS runner ships with **npm 10.x bundled**, but npm
  Trusted Publisher OIDC publish was introduced in **npm 11.5.1**
  (Aug 2025). Without it, `npm publish --provenance` signs the
  sigstore attestation BUT sends the actual PUT to the registry
  unauthenticated → npm replies HTTP 404 "not found" (security
  obscurity for "no auth"). Workflow now runs
  `npm install -g npm@^11` before `npm ci` / publish, pinning the
  latest npm 11.x line.

## [0.1.2] - 2026-05-17

Re-release of v0.1.1 — that tag's release pipeline failed at the
npm publish step (HTTP 404 — npm Trusted Publisher OIDC subject
mismatch we couldn't pre-diagnose). No 0.1.1 tarball ever landed
on the registry; users skip straight from 0.1.0 to 0.1.2. Bin
alias fix and OIDC switch from 0.1.1 carry forward; this release
adds a diagnostic step that prints the GitHub OIDC subject claim
before the publish attempt, so any future Trusted Publisher
mismatch is visible in workflow logs (not silently 404'd).

### Added

- `release.yml` "Debug OIDC subject claim" step — fetches the
  `npm:registry.npmjs.org`-audience OIDC token, decodes the JWT
  payload, prints the `sub` / `repository` / `workflow` /
  `environment` claims. Sensitive data is the signed token itself
  (logged claims are public metadata).

## [0.1.1] - 2026-05-17

### Fixed

- **`npx -y @kaminari-ad/mcp` failed with `command not found`.** npx
  defaults the bin name to the **basename of the package** (`mcp` for
  a scoped `@kaminari-ad/mcp`), but v0.1.0 declared bin
  `kaminari-ad-mcp` only — so the documented Cursor / Claude Desktop
  config in README literally did not start the server. Added `"mcp":
  "./dist/bin.js"` as a second bin entry; both names now work
  (`npx -y @kaminari-ad/mcp` and `npx -y -p @kaminari-ad/mcp
  kaminari-ad-mcp`). No other changes — pure ergonomics.

### Changed

- **npm publish now uses GitHub Actions OIDC + provenance** instead
  of a static `NPM_TOKEN`. Restored `publishConfig.provenance: true`
  and `--provenance` flag in `release.yml`; the `npm-publish`
  GitHub Environment + the Trusted Publisher registered on the npm
  package settings page produce signed sigstore attestations
  reachable from the npm package page.

## [0.1.0] - 2026-05-17

First public release of `@kaminari-ad/mcp`.

Bundles the full pre-release development arc that lived on a private
GitLab instance: HTTP + stdio transports, 82 MCP tools spanning scans /
campaigns / policies / alerts / webhooks / billing / accounts, tenant-
isolation suite, schema-backed parsers, openapi-fetch gateway, the
`prod:smoke` CI job, and the OSS bootstrap (LICENSE, SECURITY,
CONTRIBUTING, CODE_OF_CONDUCT, issue / PR templates).

See the GitHub release notes for the auto-generated commit summary;
the per-area changelog entries below capture the substantive engineering
work since the project was scaffolded.

### Fixed (parser-drift phase 5 — post-review hardening)

- **`list_policy_sets` regression introduced by phase 2b.** The
  schema-strict parser required `entries`, but `GET /api/v1/policy-sets`
  returns `PolicySetListItem` (a slim per-item shape WITHOUT entries —
  entries are loaded on demand via `get_policy_set(id)`). Every real
  list call after the phase 2b roll-out returned
  `"malformed policy-sets: 0.entries: Required"`. Now:
  - New port DTO `PolicySetListItemResponse` (no `entries`).
  - New `PolicySetListItemSchema` in `parse-policy-set.ts` backed by
    the generated `schemas.PolicySetListItem`.
  - `list_policy_sets` tool now exposes the slim shape and its
    description tells the agent to follow up with `get_policy_set`
    when it needs the entries.
  - HTTP gateway test stub + fake fixture updated to the slim shape.
  - Verified against prod API via end-to-end smoke against a sandbox
    org: parser now accepts the real response.
- **`set_alert_destination_version` was parsing a 204 No Content as
  JSON.** Pre-existing on `main` but surfaced more loudly under strict
  zod. Now uses `parseEmpty`; port returns `Result<null>`; tool emits
  `{ updated: true }` like the other 204 mutators. HTTP gateway test
  updated to a 204 stub (the previous 200-with-body fixture masked
  the real contract).
- **`create_api_key` rejected `expires_at: null`.** Common JSON-client
  convention is to send `null` explicitly for "no expiry". Input
  schema now accepts both `null` and omit; the gateway sees them as
  equivalent (no `expires_at` field on the request body).
- **Dist bundle ~770 KB → ~210 KB.** The `openapi-zod-client`
  generator emits a Zodios endpoints catalogue + `axios` client at
  the tail of `zod-schemas.ts`. We use only the `schemas` bag for
  runtime validation; the MCP gateway is `openapi-fetch`-based, not
  Zodios. `scripts/gen-api-types.ts` now post-processes the generated
  output to strip the Zodios runtime (imports, `endpoints` array,
  `api` instance, `createApiClient` helper). Axios + `form-data` (which
  use CJS `require("util")`) no longer reach the bundle — this also
  fixes a `"Dynamic require of util is not supported"` crash on
  `node dist/bin.js` startup that the integration smoke test caught.
  `check:bundle-size` reverted to the original 500 KB ceiling.
- **`{set_id}` path templates corrected to `{policy_set_id}`** in
  `http-api-gateway.ts` to match the OpenAPI spec. Runtime URLs are
  identical (openapi-fetch substitutes by key name), but the literal
  now lines up with the spec for future-readers.
- **CONTRIBUTING.md "Tenant isolation" §9** added — the pinned 5-key
  outbound header allowlist (authorization / content-type / accept /
  user-agent / x-request-id) is now an explicit numbered rule, not
  an implicit one referenced from inline comments. Stale §8/§11
  references in `http-api-gateway.ts`, `pino-logger.ts`, and the
  isolation test headers updated to point at the correct sections.
- **Empty-body JSDocs filled in.** `parse-empty.ts::parseEmpty` and
  `parse-count-envelope.ts::parseIntField` now document the contract
  (204 No Content vs single-int envelope) instead of shipping
  placeholder `/** * */` stubs.
- **Tool-test success-payload assertions.** Several 204-mutator tool
  tests (`set_alert_destination_version`, `set_campaign_alert_overrides`,
  `request_policy_set_approval`, `update_user_role`) only asserted
  `isOk()` and never checked the synthetic `{ updated: true }` /
  `{ requested: true }` payload — a regression that silently changed
  the success shape would have slipped through. Each now asserts
  both the call body AND the success payload.
- **Per-DTO parser error coverage gaps closed.** `parseScanTag`,
  `parseUsage`, `parseUsageSummary`, `parseBalanceTx`, `parseInvoice`,
  `parseAlertDestination`, `parseBulkReplay` were happy-path only.
  Added missing-required + wrong-type cases to each. Coverage stays
  100% lines + 100% statements + 98.48% branches.

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

[Unreleased]: https://github.com/kaminari-ad/mcp/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/kaminari-ad/mcp/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/kaminari-ad/mcp/compare/v0.1.5...v0.2.0
[0.1.5]: https://github.com/kaminari-ad/mcp/compare/v0.1.0...v0.1.5
[0.1.4]: https://github.com/kaminari-ad/mcp/compare/v0.1.0...v0.1.4
[0.1.3]: https://github.com/kaminari-ad/mcp/compare/v0.1.0...v0.1.3
[0.1.2]: https://github.com/kaminari-ad/mcp/compare/v0.1.0...v0.1.2
[0.1.1]: https://github.com/kaminari-ad/mcp/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/kaminari-ad/mcp/releases/tag/v0.1.0
