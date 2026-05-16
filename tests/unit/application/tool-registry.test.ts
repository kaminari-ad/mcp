import { describe, expect, it } from "vitest";

import { registerAllTools } from "../../../src/application/tool-registry.js";

describe("registerAllTools", () => {
  it("invokes the register callback for every tool exactly once", () => {
    const seen: string[] = [];
    registerAllTools((tool) => {
      seen.push(tool.name);
    });
    expect(seen).toContain("get_me");
    // No duplicates.
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("each registered tool has a description and inputSchema", () => {
    registerAllTools((tool) => {
      expect(tool.description.length).toBeGreaterThan(10);
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.shape).toBeDefined();
    });
  });
});
