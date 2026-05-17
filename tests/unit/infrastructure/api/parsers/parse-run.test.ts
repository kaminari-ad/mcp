import { describe, expect, it } from "vitest";

import { parseRun } from "../../../../../src/infrastructure/api/parsers/parse-run.js";

const VALID = {
  id: "00000000-0000-0000-0000-000000000222",
  campaign_id: "00000000-0000-0000-0000-000000000ccc",
  label: "run-1",
  total: 10,
  completed: 8,
  failed: 1,
  partial: 1,
  cancelled: 0,
  source: "api",
  created_at: "2026-01-01T00:00:00Z",
};

describe("parseRun", () => {
  it("Ok valid", () => {
    expect(parseRun(VALID).isOk()).toBe(true);
  });
  it("rejects non-object", () => {
    expect(parseRun("s").isErr()).toBe(true);
  });
  it("rejects when id or campaign_id missing", () => {
    const { id: _omitId, ...withoutId } = VALID;
    const { campaign_id: _omitCid, ...withoutCid } = VALID;
    expect(parseRun(withoutId).isErr()).toBe(true);
    expect(parseRun(withoutCid).isErr()).toBe(true);
  });
  it("defaults non-number counters to 0", () => {
    const r = parseRun({ ...VALID, total: "x", completed: null });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().total).toBe(0);
    expect(r._unsafeUnwrap().completed).toBe(0);
  });
  it("normalizes non-`ui` source to `api`", () => {
    expect(parseRun({ ...VALID, source: "ui" })._unsafeUnwrap().source).toBe("ui");
    expect(parseRun({ ...VALID, source: "anything-else" })._unsafeUnwrap().source).toBe("api");
  });
});
