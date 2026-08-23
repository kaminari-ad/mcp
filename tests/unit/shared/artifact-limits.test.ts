import { describe, expect, it } from "vitest";

import {
  decodeUtf8,
  formatBytes,
  MAX_BINARY_ARTIFACT_BYTES,
  MAX_TEXT_ARTIFACT_BYTES,
} from "../../../src/shared/artifact-limits.js";

describe("formatBytes", () => {
  // The size shows up in the message an agent reads when an artifact is
  // refused, so each unit needs to render.
  it.each([
    [0, "0 B"],
    [512, "512 B"],
    [1023, "1023 B"],
    [1024, "1.0 KiB"],
    [256 * 1024, "256.0 KiB"],
    [1024 * 1024, "1.0 MiB"],
    [8 * 1024 * 1024, "8.0 MiB"],
  ])("renders %i as %s", (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});

describe("decodeUtf8", () => {
  it("round-trips multi-byte text", () => {
    expect(decodeUtf8(new TextEncoder().encode("<p>Скидка 90% — 特価</p>"))).toBe(
      "<p>Скидка 90% — 特価</p>"
    );
  });
  it("returns an empty string for empty bytes", () => {
    expect(decodeUtf8(new Uint8Array(0))).toBe("");
  });
});

describe("artifact ceilings", () => {
  it("renders in the units the refusal message uses", () => {
    // The gateway quotes these back to the agent when it refuses a
    // download, so a ceiling that formats as "262144 B" would be a
    // regression in the message even though the number is right.
    expect(formatBytes(MAX_TEXT_ARTIFACT_BYTES)).toBe("256.0 KiB");
    expect(formatBytes(MAX_BINARY_ARTIFACT_BYTES)).toBe("8.0 MiB");
    expect(MAX_BINARY_ARTIFACT_BYTES).toBeGreaterThan(MAX_TEXT_ARTIFACT_BYTES);
  });
});
