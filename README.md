# `@kaminari-ad/mcp`

Official Model Context Protocol (MCP) server for [Kaminari Ad](https://kaminari.ad) — the ad verification platform from the team behind [Kaminari Click](https://kaminari.click).

Lets AI agents (Cursor, Claude Desktop, Cline, and any MCP-compatible client) launch scans, inspect results, manage campaigns and policies, and read alerts directly against your Kaminari Ad workspace via your API key.

[![npm version](https://img.shields.io/npm/v/@kaminari-ad/mcp)](https://www.npmjs.com/package/@kaminari-ad/mcp)
[![npm downloads](https://img.shields.io/npm/dm/@kaminari-ad/mcp)](https://www.npmjs.com/package/@kaminari-ad/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![node](https://img.shields.io/node/v/@kaminari-ad/mcp)](https://nodejs.org)
[![CI](https://github.com/kaminari-ad/mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/kaminari-ad/mcp/actions/workflows/ci.yml)
[![Provenance](https://img.shields.io/npm/v/@kaminari-ad/mcp?label=provenance&logo=github)](https://www.npmjs.com/package/@kaminari-ad/mcp)
[![MCP Registry](https://img.shields.io/badge/MCP_Registry-listed-blue)](https://registry.modelcontextprotocol.io)

## Install (one click)

### Cursor

<a href="https://kaminari.ad/mcp/install"><img alt="Install in Cursor" src="https://cursor.com/deeplink/mcp-install-dark.png" height="32" /></a>

### Claude Desktop

[**Download `kaminari-ad-mcp.mcpb`**](https://github.com/kaminari-ad/mcp/releases/latest/download/kaminari-ad-mcp.mcpb) → double-click to install. Claude Desktop shows a config form for your API key.

### Claude Code (CLI)

```bash
claude mcp add kaminari-ad -- npx -y @kaminari-ad/mcp
export KAMINARI_AD_API_KEY=your-key
```

Full installation docs — see [Quick start](#quick-start) below.

---

## Quick start

### 1. Sign up & get an API key

1. Sign up at [https://app.kaminari.ad/signup](https://app.kaminari.ad/signup) (free tier, no card required).
2. Once signed in, go to **Settings → API Keys** and generate a new key, OR have an existing AI assistant (with a temporary login) call the [`create_api_key`](#tools) tool — both paths produce the same result.
3. The key is shown **once**. Copy it. The full key is hashed server-side immediately.

> Keys are opaque random strings — no required prefix or fixed length. Treat the whole value as a raw secret and paste it verbatim into your client config.

> Tip for evaluators / Anthropic Software Directory reviewers: ask the team at [hello@kaminari.ad](mailto:hello@kaminari.ad) for a sandboxed test account with seeded sample scans, campaigns, and alerts.

### 2a. Local install (stdio transport)

Add to your MCP client config (Cursor: `~/.cursor/mcp.json`; Claude Desktop: `~/Library/Application Support/Claude/claude_desktop_config.json`):

```jsonc
{
  "mcpServers": {
    "kaminari-ad": {
      "command": "npx",
      "args": ["-y", "@kaminari-ad/mcp"],
      "env": {
        "KAMINARI_AD_API_KEY": "<your-kaminari-ad-api-key>",
      },
    },
  },
}
```

Restart your client. You should see `kaminari-ad` in the MCP servers list with 98 tools exposed.

### 2b. Hosted HTTP transport (no install)

For cloud agents or clients without a local Node runtime, point at the hosted endpoint:

```jsonc
{
  "mcpServers": {
    "kaminari-ad": {
      "url": "https://mcp.kaminari.ad/mcp",
      "headers": {
        "Authorization": "Bearer <your-kaminari-ad-api-key>",
      },
    },
  },
}
```

### 2c. OAuth 2.0 (Claude directory, third-party agents)

The hosted server publishes RFC 9728 protected-resource metadata at
[`https://mcp.kaminari.ad/.well-known/oauth-protected-resource`](https://mcp.kaminari.ad/.well-known/oauth-protected-resource)
and points at the Kaminari Ad Authorization Server
(`https://app.kaminari.ad`). Any unauthenticated request to `/mcp`
returns a `WWW-Authenticate: Bearer resource_metadata="…"` header so
spec-compliant MCP clients (Claude.ai, Claude Code, third-party
agents) can complete an OAuth 2.0 authorization-code flow with PKCE
S256 + Dynamic Client Registration (RFC 7591).

```bash
# Discovery — works without any credential
curl -sk https://mcp.kaminari.ad/.well-known/oauth-protected-resource

# Triggering the WWW-Authenticate hint
curl -isk https://mcp.kaminari.ad/mcp -X POST \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

**API keys remain the recommended path for CLIs and one-off
scripting** — OAuth is only for interactive agents that want per-app
consent and per-app revocation. Both Bearer flavours hit the same
`/mcp` endpoint; the server forwards the token verbatim to the API,
which decides which credential type minted it.

---

## Tools

105 tools covering the public `/api/v1` surface of Kaminari Ad. Every tool carries MCP behaviour annotations (`title`, `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`) so MCP clients can warn before destructive actions. The complete list, by domain:

- **Account** (14) — `get_account`, `update_org`, `list_org_users`, `invite_user`, `update_user_role`, `remove_user`, `transfer_ownership`, `list_org_roles`, `create_custom_role`, `list_account_labels`, `update_account_labels`, `list_api_keys`, `create_api_key`, `revoke_api_key`
- **Scans** (13) — `list_scans`, `get_scan`, `list_scan_children`, `create_scan`, `create_bulk_scans`, `recheck_scans`, `cancel_scan`, `get_scan_screenshot`, `get_scan_creative_screenshot`, `get_scan_landing_screenshot`, `get_scan_creative_html`, `get_scan_creative_video`, `get_scan_vast_xml`
- **Campaigns** (10) — `list_campaigns`, `list_campaigns_picker`, `get_campaign`, `create_campaign`, `update_campaign`, `archive_campaign`, `unarchive_campaign`, `cancel_campaign`, `run_campaign`, `list_campaign_runs`
- **Campaign groups** (10) — list/get/create/update/run/cancel/archive/unarchive + `pause_campaign_group_schedule`, `resume_campaign_group_schedule`
- **Runs** (3) — `get_run`, `list_run_scans`, `cancel_run` (use `list_campaign_runs` to enumerate runs of a campaign — the API has no standalone `/runs` index)
- **Tags** (5) — `list_tags`, `get_tag_definition`, `update_tag_definition`, `delete_tag_definition`, `list_scan_tags`
- **Custom rules** (6) — `list_custom_rules`, `get_custom_rule`, `create_custom_rule`, `update_custom_rule`, `delete_custom_rule`, `test_custom_rule`
- **Custom taxonomies** (7) — `list_custom_taxonomies`, `get_custom_taxonomy`, `create_custom_taxonomy`, `update_custom_taxonomy`, `delete_custom_taxonomy`, `restore_custom_taxonomy`, `parse_custom_taxonomy_text`
- **Policy sets** (9) — `list_policy_sets`, `get_policy_set`, `create_policy_set`, `update_policy_set`, `delete_policy_set`, `request_policy_set_approval`, `list_policy_set_campaigns`, `attach_policy_set_campaigns`, `detach_policy_set_campaigns`
- **Alerts** (4) — `list_alerts`, `update_alert_status`, `bulk_update_alert_status`, `get_alert_stats`
- **Webhooks** (11) — `list_webhooks`, `get_webhook`, `create_webhook`, `update_webhook`, `delete_webhook`, `list_webhook_event_types`, `list_webhook_deliveries`, `test_webhook`, `rotate_webhook_secret`, `replay_webhook_delivery`, `bulk_replay_webhook`
- **Billing** (4) — `get_billing_summary`, `list_usage`, `get_usage_summary`, `list_balance_history`
- **Invoicing** (2) — `list_invoices`, `get_invoice_pdf`
- **Alert notifications** (5) — `list_alert_destinations`, `delete_alert_destination`, `set_alert_destination_version`, `get_campaign_alert_overrides`, `set_campaign_alert_overrides`
- **Reference data** (2) — `list_geos`, `list_emulators`

Screenshots (`get_scan_screenshot`, `get_scan_creative_screenshot`, `get_scan_landing_screenshot`) come back as inline MCP `image` blocks; `get_invoice_pdf` and `get_scan_creative_video` as inline resource blocks — no second fetch, no presigned URL. The two text artifacts (`get_scan_creative_html`, `get_scan_vast_xml`) come back as strings the model can read directly. All five artifact tools refuse oversized payloads rather than inlining them.

Not exposed (intentionally): the public marketing forms, which are anonymous intake for kaminari.ad itself rather than an agent capability.

## Example agent prompts

These three prompts each exercise a different cross-section of tools and demonstrate the typical agent workflow:

1. **"Scan https://news.example.com/article-promo across US, UK, DE on mobile profiles, flag anything that redirects to a paywall."** Touches `list_emulators` → `create_bulk_scans` → wait → `list_scans` (status=completed) → `get_scan` → `list_scan_tags`.
2. **"Create a campaign that re-checks the homepage of brand-x.com every hour from JP and US; alert me on Slack if it ever shows a malware tag."** Touches `list_emulators` → `list_policy_sets` (find one with `malware`) → `create_campaign` (schedule_enabled=true) → `attach_policy_set_campaigns` → `list_alert_destinations` → `set_campaign_alert_overrides` (`mode: "override"` with the Slack destination).
3. **"What did I spend on ad verification last month, and which campaigns drove the cost?"** Touches `get_usage_summary` → `list_usage` (with date_from/date_to) → group by `scan_id` → `get_scan` → `get_campaign` for attribution.

Full machine-readable tool listing is exposed by the server itself — connect with any MCP client and call `tools/list`.

---

## Security & tenant isolation

The hosted HTTP endpoint serves many organizations from a single process. We take cross-tenant isolation very seriously:

- The MCP server is a strict, stateless, per-request pass-through. It forwards your `Authorization` header to the Kaminari Ad API verbatim and stores no per-tenant state between requests.
- No caches, no in-memory data indexed by anything tenant-related.
- `KAMINARI_AD_API_KEY` env var is rejected on startup in HTTP mode (stdio only) — no default fallback token exists.
- Session IDs are bound to the SHA-256 of the Bearer that initialized them; reuse with a different Bearer is rejected.
- Bearers are never logged. Only their 8-character hash prefix is recorded for correlation.
- See [`tests/isolation/`](tests/isolation) for the regression suite that enforces every rule above on each CI run.

To report a security issue, see [SECURITY.md](SECURITY.md).

---

## Development

The Docker path (no local Node required for the build, but see [CONTRIBUTING](CONTRIBUTING.md) for the host-side commit hooks):

```bash
make check           # lint + format-check + typecheck + arch-gates + test-cov
make test            # full test suite
make test-unit       # unit only
make test-isolation  # tenant-isolation suite
```

Or directly with `npm` if you have Node `>=22.19.0` on the host (matches `engines.node`; `.nvmrc` pins the minor for dev parity with CI). The package gates strictly at `22.19.0` because `undici@8.x` requires `markAsUncloneable` from `node:worker_threads` (Node 22.19+).

```bash
npm ci --legacy-peer-deps
npm run lint && npm run typecheck && npm test
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow and how to add a tool.

> The maintainers run the full development gate (integration tests, deploy automation, prod smoke) on a private GitLab instance and mirror the repo to GitHub. The public CI on GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs lint + typecheck + unit tests + build + bundle-size check on every community PR, so contributors get fast green/red feedback without needing access to the internal infra. Tag pushes (`v*.*.*`) trigger [`.github/workflows/release.yml`](.github/workflows/release.yml), which publishes the package to npm with OIDC provenance and creates the GitHub Release.

---

## Stability

The **public surface** of this package is:

1. The **CLI binary** `kaminari-ad-mcp` and its `--transport stdio|http` flag, the env vars documented in `.env.example`, and the exit codes (0 / 1 fatal / 2 invalid config).
2. The **MCP wire protocol** as implemented by every registered tool (tool names, input schemas, output shapes, annotations). Tools deprecated in a future major version will keep working for at least one minor version with a console warning.

Everything else — the TypeScript types exported from `dist/bin.d.ts`, deep imports, internal class shapes — is **not** part of the public contract and may change in any release. Treat this package as a CLI, not a library.

We follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) for the two items above. See [`CHANGELOG.md`](CHANGELOG.md) for the per-release record.

---

## Privacy

- **Data collected by the MCP server itself:** none beyond the `Authorization` header it forwards. The HTTP transport is stateless — no sessions are persisted; each request is authenticated independently by its own Bearer. The only in-memory state is the leaky-bucket rate limiter keyed by `sha256(bearer)`.
- **Data forwarded to Kaminari Ad:** every tool call is a thin pass-through to `/api/v1` over HTTPS. The Kaminari Ad privacy policy applies: [https://kaminari.ad/legal/privacy](https://kaminari.ad/legal/privacy).
- **Logs:** structured pino output, JSON in HTTP mode. The full Bearer token is redacted; only `bearer_hash = sha256(token).slice(0,8)` makes it into a log line, alongside `request_id`, `tool_name`, `api_status`, `elapsed_ms`. Tool inputs (which may contain customer scan IDs / URLs) are NOT logged.
- **Telemetry:** none. The OSS build ships a `NoopErrorReporter`. We do not bundle Sentry, OpenTelemetry exporters, or PostHog.

To report a security or privacy issue, see [SECURITY.md](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).
