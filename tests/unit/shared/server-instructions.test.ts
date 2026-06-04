import { describe, expect, it } from "vitest";

import { SERVER_INSTRUCTIONS } from "../../../src/shared/server-instructions.js";

describe("SERVER_INSTRUCTIONS", () => {
  it("is a non-empty guidance string", () => {
    expect(typeof SERVER_INSTRUCTIONS).toBe("string");
    expect(SERVER_INSTRUCTIONS.length).toBeGreaterThan(0);
  });

  it("tells the agent to use the API-returned report URLs, never build them", () => {
    expect(SERVER_INSTRUCTIONS).toContain("report_url");
    expect(SERVER_INSTRUCTIONS).toContain("public_report_url");
    // The whole point: do not hand-build / guess scan links.
    expect(SERVER_INSTRUCTIONS.toLowerCase()).toContain("never");
  });
});
