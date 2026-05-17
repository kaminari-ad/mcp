# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in `@kaminari-ad/mcp` — particularly anything related to **cross-tenant data leakage** in the hosted HTTP endpoint — please report it privately.

**Do NOT** open a public GitHub or GitLab issue, and do not discuss it in chat channels.

### How to report

Email **security@kaminari.ad** with:

- A clear description of the issue.
- Steps to reproduce (minimal repro preferred).
- Affected version(s) (`npm view @kaminari-ad/mcp version` and/or the `mcp.kaminari.ad` deployment time, if known).
- Your assessment of impact (data leak, auth bypass, DoS, etc.).
- Whether you would like to be credited in the security advisory.

You should receive an acknowledgement within 2 business days.

### Disclosure timeline

We follow a coordinated 90-day disclosure window:

- **Day 0**: report received and acknowledged.
- **Day 0-14**: triage and reproduction; severity assessment.
- **Day 14-60**: fix developed, reviewed, tested, including a regression test in `tests/isolation/`.
- **Day 60-90**: patched release published to npm; deployed to `mcp.kaminari.ad`; coordinated public disclosure with the reporter.
- After **Day 90**, we will publish a security advisory regardless of whether a fix has shipped, so users can take their own mitigations.

If the issue is being actively exploited in the wild, the timeline is compressed and we coordinate the disclosure with the reporter directly.

## Scope

Vulnerabilities of particular interest:

- **Tenant isolation breaches** in the HTTP transport: any way for one client's request to receive data from another client's session, log, cache, or in-flight request.
- **Token leakage**: any way a Bearer token can be reconstructed from logs, error responses, telemetry, or process memory exposed to operators.
- **Auth bypass**: any way to call a tool without a valid `Authorization` header or with a header that has been mutated by the MCP server.
- **Header injection**: any way to influence the outbound request to the Kaminari Ad API by injecting `X-*` headers, cookies, or other channels.
- **Supply-chain compromise**: any anomaly in the published npm package, the Docker image, or the GitLab/GitHub release pipeline.

Out of scope:

- Issues in the Kaminari Ad API itself (`/api/v1`). The API enforces its own authorization. Report API issues to the same `security@kaminari.ad` address, but note they live in the `api/` repository, not here.
- Issues in third-party MCP clients (Cursor, Claude Desktop, etc.).
- Theoretical issues with no demonstrable exploit path.

## Recognition

With your permission, we will acknowledge your contribution in the [`CHANGELOG.md`](CHANGELOG.md) and in the GitHub security advisory.
