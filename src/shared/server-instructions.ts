/**
 * MCP server `instructions` advertised to the client during the
 * initialize handshake. Clients (Claude, Cursor) inject this into the
 * model's system context.
 *
 * The one rule that matters here: scan / app links are returned by the
 * API, never constructed by the agent. Before this, agents hand-built
 * URLs and guessed the host (`kaminari.ad` instead of the SPA host
 * `app.kaminari.ad`), producing broken links. The scan tools now carry
 * ready-made `report_url` / `public_report_url` deep-links and absolute
 * screenshot URLs — use them verbatim.
 */

export const SERVER_INSTRUCTIONS = [
  "Kaminari Ad — ad-verification API (malvertising, scams, policy violations).",
  "",
  "Linking to a scan: use the URL fields the tools return — never build or guess them.",
  "- `report_url`: authenticated dashboard report (requires login).",
  "- `public_report_url`: shareable report (no login).",
  "- `screenshot_url` / `creative_screenshot_url`: absolute, directly followable.",
  "These come from `get_scan`, `list_scans`, `list_run_scans`, and `list_scan_children`.",
  "Do NOT assemble scan/app URLs from a base host yourself — the apex domain does not serve scan pages.",
  "Publisher ad discovery: create a scan with `ad_discovery: true` (url scans only) to detect",
  "ad blocks on a page; `list_scan_children` returns one child scan per detected ad (banner/pop).",
].join("\n");
