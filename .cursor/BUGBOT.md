# Bugbot review rules — adverif/mcp

Official Model Context Protocol server for Kaminari Ad (TypeScript, `@modelcontextprotocol/sdk`, zod, neverthrow, undici) that exposes the Kaminari Ad API as agent tools. Prioritise correctness, data loss, and security over style. Flag only lines this diff adds or changes, or code the diff makes reachable. Name the file and line, state the impact, and suggest a fix; stay silent if nothing is worth flagging. When a finding matches a rule below, end the comment with `(rule ID)` using the rule's ID.

## General review rules

- Re-derive every bound (page size, batch, upload size, timeout, retry count) from request-controlled inputs and every caller; validate against the worst accepted value, not a typical test vector.
- In HTTP mode every request carries its own Bearer: flag module-level mutable state, caches keyed by org or token, or a gateway reused across requests.

## TS-MCP-02: Cancel or drain every fetched body and keep failures inside Result

If the diff changes `src/infrastructure/api/http-api-gateway.ts` (`readCapped`, screenshot or invoice PDF downloads) or adds any new undici fetch path, and it adds an early return after a fetch resolved, touches `cancel()`, or edits a shared size-limit error detail, then:

- Flag: an early return that leaves the response body neither cancelled nor drained (leaks the connection); a `cancel()` rejection that is not caught, so the tool throws instead of returning `err`; a shared error detail that carries a tool-specific recovery hint.
- Do not flag: floating promises (eslint `no-floating-promises` owns them); the size cap value itself (General review rule 1).
- Severity: High
- Bad: `if (declared > maxBytes) return tooLarge;` with the body still open
- Good: `if (declared > maxBytes) { await body.cancel().catch(() => undefined); return tooLarge; }`

## TS-MCP-01: Keep tool schemas, `describe()` text and parsers matching the API

If the diff changes `src/application/tools/`, `src/infrastructure/api/parsers/`, the generated `src/shared/api/zod-schemas.ts`, or `EXEMPT_VALUE_SETS` in `scripts/check-tool-enum-drift.ts`, and it regenerates schemas, adds fields via `.pick`, `.extend`, `.strip`, `.optional`, `.uuid()`, or edits an enum exemption, then:

- Flag: a field the API clears with `null` that is not `.nullable()`; a response field added in the same release that is not optional, so an older API fails to parse (deploy order is api first, then mcp); an echoed field dropped from one of the read tools sharing the shape (`create_scan`, `get_scan`, `create_bulk_scans`); `describe()` text that disagrees with validation or ranges narrower than the API's; an enum exemption kept after regeneration yields the enum.
- Do not flag: hand-written parsers and enum-set equality (gated by `scripts/check-no-handwritten-parsers.ts` and `scripts/check-tool-enum-drift.ts`); `.uuid()` where the API types the field as `UUID | None`.
- Severity: Medium
- Bad: `referrer: z.string().url().optional(),` for a field the API clears with null
- Good: `referrer: z.string().url().nullable().optional(),` and "null clears" in `describe()`

## What NOT to flag

- Style and formatting owned by eslint strictTypeChecked, prettier, and dependency-cruiser.
- File size, shared state, tool naming, enum drift, and hand-written parser checks already run by the `scripts/check-*.ts` gates.
- Code this diff does not touch.
