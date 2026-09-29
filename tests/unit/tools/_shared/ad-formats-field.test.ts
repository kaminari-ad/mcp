import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  adFormatsField,
  adFormatsUpdateField,
} from "../../../../src/application/tools/_shared/ad-formats-field.js";

const Schema = z.object({ ad_formats: adFormatsField });
const UpdateSchema = z.object({ ad_formats: adFormatsUpdateField });

describe("adFormatsField", () => {
  it("accepts any non-empty subset of the three formats", () => {
    expect(Schema.parse({ ad_formats: ["pop"] }).ad_formats).toEqual(["pop"]);
    expect(Schema.parse({ ad_formats: ["banner", "video", "pop"] }).ad_formats).toHaveLength(3);
  });

  it("rejects an empty list and an unknown format the API would 422", () => {
    expect(() => Schema.parse({ ad_formats: [] })).toThrow();
    expect(() => Schema.parse({ ad_formats: ["popunder"] })).toThrow();
  });

  it("rejects null on create, where it has no meaning", () => {
    expect(() => Schema.parse({ ad_formats: null })).toThrow();
  });

  it("stays undefined when omitted so every format is checked", () => {
    expect(Schema.parse({})).toEqual({});
  });

  it("tells the agent a left-out format is not billed and the field is discovery-only", () => {
    const described = adFormatsField.description ?? "";
    expect(described).toMatch(/neither captured\s+nor billed/);
    expect(described).toMatch(/ad_discovery/);
    expect(described).toMatch(/422/);
  });
});

describe("adFormatsUpdateField", () => {
  it("accepts null as the reset to every format", () => {
    expect(UpdateSchema.parse({ ad_formats: null }).ad_formats).toBeNull();
  });

  it("tells the agent how to reset rather than to omit", () => {
    expect(adFormatsUpdateField.description ?? "").toMatch(/pass null/);
  });
});
