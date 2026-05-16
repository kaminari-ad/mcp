import { describe, expect, it } from "vitest";

import {
  parseToolName,
  toolNameOrThrow,
} from "../../../../src/domain/value-objects/tool-name.js";

describe("ToolName", () => {
  it("accepts snake_case lowercase names", () => {
    expect(parseToolName("list_scans")).toBe("list_scans");
    expect(parseToolName("get_me")).toBe("get_me");
    expect(parseToolName("a1")).toBe("a1");
  });

  it("rejects empty, leading digit, kebab-case, uppercase, spaces", () => {
    expect(parseToolName("")).toBeUndefined();
    expect(parseToolName("a")).toBeUndefined(); // too short — needs >=2
    expect(parseToolName("1leading")).toBeUndefined();
    expect(parseToolName("kebab-case")).toBeUndefined();
    expect(parseToolName("Mixed_Case")).toBeUndefined();
    expect(parseToolName("with space")).toBeUndefined();
  });

  it("toolNameOrThrow throws on invalid input", () => {
    expect(() => toolNameOrThrow("Bad-Name")).toThrow(/Invalid tool name/);
  });

  it("toolNameOrThrow returns the branded value on success", () => {
    expect(toolNameOrThrow("list_scans")).toBe("list_scans");
  });
});
