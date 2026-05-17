/**
 * Unit smoke for `declareEmptyResourcesAndPrompts` — exercises the
 * helper end-to-end against an in-memory transport pair so we catch
 * regressions without depending on the built dist.
 *
 * The integration in `tests/integration/cli-smoke.test.ts` covers the
 * same contract over real HTTP RPC; this one fails faster in CI when
 * the helper drifts (wrong schema name, missing capability).
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";

import { declareEmptyResourcesAndPrompts } from "../../../src/presentation/shared/declare-empty-caps.js";

describe("declareEmptyResourcesAndPrompts", () => {
  it("makes resources/list and prompts/list resolve to empty arrays (no -32601)", async () => {
    const server = new McpServer({ name: "test-server", version: "0.0.0" });
    declareEmptyResourcesAndPrompts(server);

    const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "probe", version: "0.0.0" }, { capabilities: {} });

    await Promise.all([server.server.connect(serverTransport), client.connect(clientTransport)]);

    const resources = await client.listResources();
    expect(resources.resources).toEqual([]);

    const prompts = await client.listPrompts();
    expect(prompts.prompts).toEqual([]);

    await client.close();
    await server.close();
  });
});
