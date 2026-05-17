import { describe, expect, it } from "vitest";

import { parseRun } from "../../../../../src/infrastructure/api/parsers/parse-run.js";

const VALID = {
  id: "00000000-0000-0000-0000-000000000222",
  campaign_id: "00000000-0000-0000-0000-000000000ccc",
  label: "run-1",
  total: 5,
  completed: 4,
  failed: 1,
  partial: 0,
  cancelled: 0,
  source: "api",
  created_at: "2026-05-17T00:00:00Z",
};

describe("parseRun", () => {
  it("Ok valid", () => {
    const r = parseRun(VALID);
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().total).toBe(5);
  });
  it("rejects on missing required (id)", () => {
    const { id: _omit, ...withoutId } = VALID;
    expect(parseRun(withoutId).isErr()).toBe(true);
  });
  it("rejects non-uuid id", () => {
    expect(parseRun({ ...VALID, id: "not-uuid" }).isErr()).toBe(true);
  });
  it("rejects non-object", () => {
    expect(parseRun("x").isErr()).toBe(true);
  });
});
