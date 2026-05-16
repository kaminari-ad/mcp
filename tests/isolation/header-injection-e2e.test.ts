/**
 * Isolation test (E2E): CONTRIBUTING.md "Tenant isolation" §8 / §11.
 *
 * The adapter-level test (`header-injection.test.ts`) proves the
 * outbound `HttpApiGateway` ignores extra headers when constructed
 * by the request handler. This file proves the **architecture** in
 * `http-request-handler.ts` — namely that `req.headers` is never
 * spread into the outbound API call — by inspecting the source
 * code AST for any attempt to forward request headers to the
 * gateway.
 *
 * The end-to-end approach (drive the MCP protocol through
 * `tools/call`) is impractical without implementing the SDK's
 * `initialize` handshake; this AST gate provides equivalent
 * coverage against the specific regression class we care about:
 * "someone copied `req.headers` into the outbound call".
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as url from "node:url";

import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");

describe("isolation E2E: handler must never spread req.headers into outbound calls", () => {
  it("http-request-handler.ts source contains no `req.headers` spread / iteration / mapping", async () => {
    const handlerSrc = await fs.readFile(
      path.join(REPO_ROOT, "src", "presentation", "http", "http-request-handler.ts"),
      "utf8"
    );

    // Forbidden patterns: any code path that takes the inbound
    // header bag as a whole and forwards it. Reading SPECIFIC headers
    // by name (req.headers["authorization"], req.headers["mcp-session-id"])
    // is allowed and how the handler MUST work.
    const FORBIDDEN: readonly (readonly [string, RegExp])[] = [
      ["spread of req.headers", /\.{3}\s*req\.headers/],
      ["spread of request headers", /\.{3}\s*request\.headers/],
      ["Object.entries(req.headers)", /Object\.entries\s*\(\s*req\.headers/],
      ["Object.keys(req.headers)", /Object\.keys\s*\(\s*req\.headers/],
      ["for…of req.headers", /for\s*\(\s*(?:const|let)\s+[^)]+\s+of\s+req\.headers/],
      ["assignment of req.headers", /=\s*req\.headers(?!\[)/],
    ];

    const violations: string[] = [];
    for (const [label, re] of FORBIDDEN) {
      if (re.test(handlerSrc)) {
        violations.push(label);
      }
    }
    expect(violations).toEqual([]);
  });

  it("http-api-gateway.ts source builds an explicit 5-key header allowlist", async () => {
    const gatewaySrc = await fs.readFile(
      path.join(REPO_ROOT, "src", "infrastructure", "api", "http-api-gateway.ts"),
      "utf8"
    );

    // The outbound request must carry EXACTLY these headers — nothing
    // less, nothing more. Pinned literal block, not a spread.
    for (const required of [
      /authorization:\s*bearer\.toAuthorizationHeader\(\)/,
      /"content-type":\s*"application\/json"/,
      /accept:\s*"application\/json"/,
      /"user-agent":\s*"kaminari-ad-mcp"/,
      /"x-request-id":\s*requestId/,
    ]) {
      expect(gatewaySrc).toMatch(required);
    }

    // And nothing else: no spread, no copy of incoming headers.
    expect(gatewaySrc).not.toMatch(/\.{3}\s*(?:req|request)\.headers/);
    expect(gatewaySrc).not.toMatch(/headers:\s*\.{3}\s*\w+\.headers/);
  });
});
