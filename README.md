# `@kaminari-ad/mcp`

Official Model Context Protocol (MCP) server for [Kaminari Ad](https://kaminari.ad) — the ad verification platform from the team behind [Kaminari.Click](https://kaminari.click).

Lets AI agents (Cursor, Claude Desktop, Cline, and any MCP-compatible client) launch scans, inspect results, manage campaigns and policies, and read alerts directly against your Kaminari Ad workspace via your API key.

> Status: **pre-release** (`0.0.0-dev`). Not yet published on npm. First public release will be tagged `v0.1.0`.

---

## Quick start

### 1. Sign up & get an API key

1. Sign up at [https://app.kaminari.ad/signup](https://app.kaminari.ad/signup) (free tier, no card required).
2. Once signed in, go to **Settings → API Keys** and generate a new key, OR have an existing AI assistant (with a temporary login) call the [`create_api_key`](#tools) tool — both paths produce the same result.
3. The key is shown **once**. Copy it. The full key is hashed server-side immediately.

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
        "KAMINARI_AD_API_KEY": "kad_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      },
    },
  },
}
```

Restart your client. You should see `kaminari-ad` in the MCP servers list with 82 tools exposed.

### 2b. Hosted HTTP transport (no install)

For cloud agents or clients without a local Node runtime, point at the hosted endpoint:

```jsonc
{
  "mcpServers": {
    "kaminari-ad": {
      "url": "https://mcp.kaminari.ad/mcp",
      "headers": {
        "Authorization": "Bearer kad_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      },
    },
  },
}
```

---

## Tools

82 tools mirroring most of the public `/api/v1` surface of Kaminari Ad. Every tool carries MCP behaviour annotations (`title`, `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`) so MCP clients can warn before destructive actions. Highlights:

- **Account** (11) — `get_account`, `update_org`, `list_org_users`, `invite_user`, `update_user_role`, `remove_user`, `transfer_ownership`, `list_org_roles`, `list_api_keys`, `create_api_key`, `revoke_api_key`
- **Scans** (7) — `list_scans`, `get_scan`, `create_scan`, `create_bulk_scans`, `recheck_scans`, `cancel_scan`, `list_scan_tags`
- **Campaigns** (9) — `list_campaigns`, `get_campaign`, `create_campaign`, `update_campaign`, `archive_campaign`, `unarchive_campaign`, `cancel_campaign`, `run_campaign`, `list_campaign_runs`
- **Campaign groups** (10) — list/get/create/update/run/cancel/archive/unarchive + `pause_campaign_group_schedule`, `resume_campaign_group_schedule`
- **Runs** (3) — `get_run`, `list_run_scans`, `cancel_run` (use `list_campaign_runs` to enumerate runs of a campaign — the API has no standalone `/runs` index)
- **Tags** (4) — `list_tags`, `get_tag_definition`, `update_tag_definition`, `delete_tag_definition`
- **Custom rules** (6) — `list_custom_rules`, `get_custom_rule`, `create_custom_rule`, `update_custom_rule`, `delete_custom_rule`, `test_custom_rule`
- **Policy sets** (6) — `list_policy_sets`, `get_policy_set`, `create_policy_set`, `update_policy_set`, `delete_policy_set`, `request_policy_set_approval`
- **Alerts** (3) — `list_alerts`, `update_alert_status`, `get_alert_stats`
- **Webhooks** (11) — `list_webhooks`, `get_webhook`, `create_webhook`, `update_webhook`, `delete_webhook`, `list_webhook_event_types`, `list_webhook_deliveries`, `test_webhook`, `rotate_webhook_secret`, `replay_webhook_delivery`, `bulk_replay_webhook`
- **Billing** (4) — `get_billing_summary`, `list_usage`, `get_usage_summary`, `list_balance_history`
- **Invoicing** (1) — `list_invoices`
- **Alert notifications** (5) — `list_alert_destinations`, `delete_alert_destination`, `set_alert_destination_version`, `get_campaign_alert_overrides`, `set_campaign_alert_overrides`
- **Reference data** (2) — `list_geos`, `list_emulators`

Not exposed (intentionally): binary scan-screenshot fetchers, invoice PDF, the UI-only campaign picker, and the public marketing forms (`/contact`, `/demo-inquiries`). Open an issue if you need one of those.

## Example agent prompts

These three prompts each exercise a different cross-section of tools and demonstrate the typical agent workflow:

1. **"Scan https://news.example.com/article-promo across US, UK, DE on mobile profiles, flag anything that redirects to a paywall."** Touches `list_emulators` → `create_bulk_scans` → wait → `list_scans` (status=completed) → `get_scan` → `list_scan_tags`.
2. **"Create a campaign that re-checks the homepage of brand-x.com every hour from JP and US; alert me on Slack if it ever shows a malware tag."** Touches `list_emulators` → `list_policy_sets` (find one with `malware`) → `create_campaign` (schedule_enabled=true) → `list_alert_destinations` → `set_campaign_alert_overrides`.
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

Requires Docker. All commands run in a pinned `node:22-alpine` container so your host Node version does not matter (Node 22 LTS is required by the dep tree — see `.nvmrc` / `engines.node`):

```bash
make check           # lint + format-check + typecheck + arch-gates + test-cov
make test            # full test suite
make test-unit       # unit only
make test-isolation  # tenant-isolation suite
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow and how to add a tool.

CI runs on GitLab at <https://gitlab.sdev.pw/adverif/mcp/-/pipelines>. The `.github/` directory only carries issue/PR templates — there are no GitHub Actions; pull requests opened on the GitHub mirror need to be re-applied to the GitLab repo for the pipeline to run.

---

## Privacy

- **Data collected by the MCP server itself:** none beyond the `Authorization` header it forwards. In HTTP mode, only ephemeral per-request scoped state (session id ↔ Bearer hash, leaky-bucket rate limit by Bearer hash) is held in memory.
- **Data forwarded to Kaminari Ad:** every tool call is a thin pass-through to `/api/v1` over HTTPS. The Kaminari Ad privacy policy applies: [https://kaminari.ad/legal/privacy](https://kaminari.ad/legal/privacy).
- **Logs:** structured pino output, JSON in HTTP mode. The full Bearer token is redacted; only `bearer_hash = sha256(token).slice(0,8)` makes it into a log line, alongside `request_id`, `tool_name`, `api_status`, `elapsed_ms`. Tool inputs (which may contain customer scan IDs / URLs) are NOT logged.
- **Telemetry:** none. The OSS build ships a `NoopErrorReporter`. We do not bundle Sentry, OpenTelemetry exporters, or PostHog.

To report a security or privacy issue, see [SECURITY.md](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).
