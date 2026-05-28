/**
 * Unit test for the full ApiError → MCP CallToolResult chain.
 *
 * Proves that when the API returns 422 with
 * ``code: checking.system_slug_reserved`` from `create_custom_rule`
 * (the system-tag-slug-collision bypass), the chain
 *
 *   ApiError -> mapApiError -> ToolError -> wireToolsIntoMcpServer
 *      -> CallToolResult (isError: true, text contains "Invalid input"
 *         AND the API code)
 *
 * survives without dropping the code on the floor.
 *
 * This is the MCP-side counterpart to the api-side
 * ``tests/unit/test_custom_rules_endpoint.py`` boundary test — both
 * sit at the boundary of one repo so the cross-repo contract has
 * coverage on both sides of the wire.
 */

import { describe, expect, it } from "vitest";

import { wireToolsIntoMcpServer } from "../../../src/presentation/shared/wire-tools.js";
import { createFakeApiGateway, err, makeApiError } from "../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../fakes/make-tool-context.js";

interface CallToolResult {
  readonly isError?: boolean;
  readonly content: readonly { readonly type: string; readonly text?: string }[];
}

type ToolHandler = (args: unknown, extra: unknown) => Promise<CallToolResult>;

/**
 * Capture every `server.registerTool(name, _, handler)` so the test
 * can dispatch a synthetic tool call without involving the MCP SDK.
 */
function makeRegistrationCaptureServer(): {
  readonly handlers: Map<string, ToolHandler>;
  readonly server: { readonly registerTool: (...args: unknown[]) => void };
} {
  const handlers = new Map<string, ToolHandler>();
  return {
    handlers,
    server: {
      registerTool: (...args: unknown[]) => {
        const [name, , handler] = args as [string, unknown, ToolHandler];
        handlers.set(name, handler);
      },
    },
  };
}

describe("wire-tools: error mapping survives to CallToolResult", () => {
  it("create_custom_rule with system slug surfaces invalid-input + code in formatted text", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createCustomRule = err(
      makeApiError(
        "invalid-input",
        "Slug 'adblock_detected' is already used by a system tag. Choose a different slug.",
        "checking.system_slug_reserved"
      )
    );
    const captured = makeRegistrationCaptureServer();
    const ctx = makeToolContext({ api });
    wireToolsIntoMcpServer(captured.server as never, () => ctx);

    const handler = captured.handlers.get("create_custom_rule");
    expect(handler).toBeDefined();
    if (handler === undefined) return;

    const result = await handler(
      {
        name: "e2e-marker-rule",
        tag_slug: "adblock_detected",
        rule_type: "stopword_content",
        config: { contains: ["x"] },
      },
      {}
    );

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    const block = result.content[0];
    expect(block?.type).toBe("text");
    expect(block?.text).toContain("Invalid input");
    expect(block?.text).toContain("checking.system_slug_reserved");
    expect(block?.text).toContain("adblock_detected");
  });

  it("update_custom_rule with system slug rename surfaces the same chain", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updateCustomRule = err(
      makeApiError(
        "invalid-input",
        "Slug 'adblock_detected' is already used by a system tag. Choose a different slug.",
        "checking.system_slug_reserved"
      )
    );
    const captured = makeRegistrationCaptureServer();
    const ctx = makeToolContext({ api });
    wireToolsIntoMcpServer(captured.server as never, () => ctx);

    const handler = captured.handlers.get("update_custom_rule");
    expect(handler).toBeDefined();
    if (handler === undefined) return;

    const result = await handler(
      {
        rule_id: "00000000-0000-0000-0000-000000000ccc",
        tag_slug: "adblock_detected",
      },
      {}
    );

    expect(result.isError).toBe(true);
    const block = result.content[0];
    expect(block?.type).toBe("text");
    expect(block?.text).toContain("Invalid input");
    expect(block?.text).toContain("checking.system_slug_reserved");
  });
});
