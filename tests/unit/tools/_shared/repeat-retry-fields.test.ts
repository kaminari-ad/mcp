import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  pickRepeatRetryBody,
  repeatRetryFields,
} from "../../../../src/application/tools/_shared/repeat-retry-fields.js";

const Schema = z.object(repeatRetryFields);

describe("repeatRetryFields", () => {
  it("accepts the full documented ranges", () => {
    expect(Schema.parse({ repeat_count: 1, retry_max_attempts: 0 })).toEqual({
      repeat_count: 1,
      retry_max_attempts: 0,
    });
    expect(Schema.parse({ repeat_count: 20, retry_max_attempts: 5 })).toEqual({
      repeat_count: 20,
      retry_max_attempts: 5,
    });
  });

  it("rejects values outside the operator ceilings before the API is called", () => {
    expect(() => Schema.parse({ repeat_count: 0 })).toThrow();
    expect(() => Schema.parse({ repeat_count: 21 })).toThrow();
    expect(() => Schema.parse({ repeat_count: 1.5 })).toThrow();
    expect(() => Schema.parse({ retry_max_attempts: -1 })).toThrow();
    expect(() => Schema.parse({ retry_max_attempts: 6 })).toThrow();
  });

  it("accepts only the two repeat modes", () => {
    expect(Schema.parse({ repeat_mode: "isolated" }).repeat_mode).toBe("isolated");
    expect(Schema.parse({ repeat_mode: "shared" }).repeat_mode).toBe("shared");
    expect(() => Schema.parse({ repeat_mode: "session" })).toThrow();
  });

  it("leaves every field undefined when nothing is supplied", () => {
    expect(Schema.parse({})).toEqual({});
  });

  it("tells the agent that repeats multiply the bill", () => {
    const described = repeatRetryFields.repeat_count.description ?? "";
    expect(described).toMatch(/multiplier/i);
    expect(described).toMatch(/billing/i);
  });

  it("tells the agent that shared is refused together with ad discovery", () => {
    const described = repeatRetryFields.repeat_mode.description ?? "";
    expect(described).toMatch(/422/);
    expect(described).toMatch(/ad_discovery/);
    expect(described).toMatch(/campaign_type/);
  });

  it("tells the agent that a retry is not billed twice", () => {
    const described = repeatRetryFields.retry_max_attempts.description ?? "";
    expect(described).toMatch(/technical/i);
    expect(described).toMatch(/double-charges/i);
  });
});

describe("pickRepeatRetryBody", () => {
  it("returns all three keys when all are supplied", () => {
    expect(
      pickRepeatRetryBody({ repeat_count: 5, repeat_mode: "shared", retry_max_attempts: 2 })
    ).toEqual({ repeat_count: 5, repeat_mode: "shared", retry_max_attempts: 2 });
  });

  it("returns an empty object when nothing is supplied", () => {
    expect(pickRepeatRetryBody({})).toEqual({});
  });

  it("drops the keys that were left undefined", () => {
    expect(Object.keys(pickRepeatRetryBody({ repeat_count: 3 }))).toEqual(["repeat_count"]);
    expect(Object.keys(pickRepeatRetryBody({ retry_max_attempts: 0 }))).toEqual([
      "retry_max_attempts",
    ]);
    expect(Object.keys(pickRepeatRetryBody({ repeat_mode: "isolated" }))).toEqual(["repeat_mode"]);
  });
});
