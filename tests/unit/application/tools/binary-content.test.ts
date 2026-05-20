/**
 * Unit tests for the binary-content helpers used by screenshot /
 * invoice-PDF tools. The helpers MUST produce MCP content blocks the
 * `wire-tools` bridge passes through verbatim (no JSON wrapping).
 */
import { describe, expect, it } from "vitest";

import {
  imageBlock,
  resourceBlock,
} from "../../../../src/application/tools/_shared/binary-content.js";

describe("imageBlock", () => {
  it("base64-encodes the bytes and sets the mime type", () => {
    const env = imageBlock(new Uint8Array([0x89, 0x50, 0x4e, 0x47]), "image/png");
    expect(env.content).toHaveLength(1);
    const block = env.content[0];
    expect(block.type).toBe("image");
    if (block.type === "image") {
      expect(block.mimeType).toBe("image/png");
      expect(block.data).toBe("iVBORw==");
    }
  });
});

describe("resourceBlock", () => {
  it("wraps bytes into an MCP resource block with uri + mimeType + base64 blob", () => {
    const env = resourceBlock(
      new Uint8Array([0x25, 0x50, 0x44, 0x46]),
      "application/pdf",
      "kaminari-ad://invoices/inv-001.pdf"
    );
    const block = env.content[0];
    expect(block.type).toBe("resource");
    if (block.type === "resource") {
      expect(block.resource.uri).toBe("kaminari-ad://invoices/inv-001.pdf");
      expect(block.resource.mimeType).toBe("application/pdf");
      expect(block.resource.blob).toBe("JVBERg==");
    }
  });
});
