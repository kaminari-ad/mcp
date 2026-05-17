# Migrating from `@kaminari-ad/mcp` 0.1.x to 0.2.0

Two tools changed output shape and one tool changed its element type.
Everything else is wire-compatible.

If your agent calls **only** the unchanged tools, **no action is
required** — drop in v0.2.0 and continue.

## Breaking changes

### 1. `list_custom_rules` — bare array → paginated envelope

Before (≤ 0.1.5):

```jsonc
[
  { "id": "…", "name": "…", "tag_slug": "…", "rule_type": "…", "config": {...},
    "target": "…", "is_active": true, "organization_id": "…", "created_at": "…" },
  /* … */
]
```

After (≥ 0.2.0):

```jsonc
{
  "items": [
    { "id": "…", "name": "…", "tag_slug": "…", "rule_type": "…", "config": {...},
      "target": "…", "is_active": true, "organization_id": "…", "created_at": "…" }
  ],
  "total": 67,
  "page": 1,
  "limit": 50
}
```

**Why:** the API has always returned a `PaginatedResponse[CustomRuleResponse]`
envelope; v0.1.x silently dropped `total` / `page` / `limit`. Orgs with

> 50 rules saw exactly 50 with no signal there was more.

**Migration:** wherever you read `result.length` on a `list_custom_rules`
output, replace with `result.items.length` and check `result.total >
result.items.length` to know if you need to call the tool again with
`page: 2`. New optional inputs:

```jsonc
{ "page": 1, "limit": 50 }

// defaults; both optional
```

### 2. `list_policy_sets` — bare array → paginated envelope

Same shape change as `list_custom_rules`, same migration. The items
themselves are unchanged (slim — no `entries`; call `get_policy_set`
for those).

### 3. `list_run_scans` — `ScanBriefResponse` → `ScanTileResponse` per item

Before (≤ 0.1.5) — crashed in production with `malformed scans page:
items.0.url: Required`:

```jsonc
{ "items": [{ "id": "…", "url": "…", "country_code": "…", "status": "…",
              "offer_url": "…", "screenshot_url": "…", "labels": {…},
              "elapsed_ms": 1234, "campaign_id": "…", "campaign_name": "…",
              "is_ad_tag": false, "created_at": "…" }], … }
```

After (≥ 0.2.0):

```jsonc
{ "items": [{ "id": "…", "country_code": "…", "status": "…",
              "offer_url": "…", "screenshot_url": "…",
              "elapsed_ms": 1234, "error": "" }], … }
```

**Why:** the API endpoint returns `ScanTileResponse` (designed for
the run-detail UI's tile grid) — `url` / `created_at` / `labels` /
`campaign_*` / `is_ad_tag` are intentionally omitted because the
caller already knows the run's campaign and the tiles don't need to
re-render input URLs. `error` (the scan-failure reason) is **added**.

**Migration:** if your agent reads any of the removed fields off
`list_run_scans` items, call `get_scan(id)` per tile to fetch the
full `ScanResponse` (which has them all).

## Additions (non-breaking)

### `list_campaigns_picker` — new tool

Slim per-row campaign list for selection UIs:

```jsonc
{ "id": "…", "name": "…", "group_id": "…", "is_archived": false }
```

Cheaper than `list_campaigns` for orgs with thousands of campaigns —
the API endpoint is non-paginated and intentionally omits heavy
fields. Use `get_campaign(id)` after a selection to fetch full
details.

### `get_tag_definition` — now returns `linked_rules`

The detail endpoint always returned `linked_rules` per OpenAPI; the
v0.1.x parser silently dropped them. v0.2.0 surfaces them:

```jsonc
{
  "slug": "malware",
  "category": "security",
  /* … all existing fields … */
  "linked_rules": [{ "id": "…", "name": "ad-detector", "is_active": true }],
}
```

No input change. Agents that need rules linked to a tag no longer
need to grep `list_custom_rules` by `tag_slug` themselves.

### `resources/list` and `prompts/list` now return `[]`

Most MCP clients (Cursor, Claude Desktop, Cline) probe these methods
at session start. v0.1.x returned the JSON-RPC standard `-32601
Method not found` (spec-compliant), but Cursor's client mistranslated
that into a misleading `"Connection closed"` warning. v0.2.0 declares
empty capabilities + handlers so the probe is silent.

Functional impact for callers: zero. No tool surface changed; the
fix is purely about client-side noise.

## Internal: forward-compat for `policies.in_use`

`invalid-input` MCP errors (HTTP 400 / 422) now preserve the API's
machine-readable `code` field when present. The API does not emit
`code` on `delete_policy_set` today, but `policies.in_use` is a known
candidate. When the API ships it, agents can branch on the code
without waiting for an MCP release.
