/**
 * Helpers for binary tools (screenshots, invoice PDFs).
 *
 * MCP wraps binary payloads in either:
 *   - ``image`` content blocks (WebP screenshots),
 *   - ``resource`` content blocks (PDFs, generic blobs) — the
 *     ``resource.blob`` field carries base64 bytes plus mimeType.
 *
 * The ``wire-tools`` bridge detects an output value with a top-level
 * ``content: [...]`` array of binary blocks and passes it through
 * verbatim instead of JSON-serialising it. Tools that produce binary
 * data return one of the envelopes below from their handler.
 */

/**
 * Single MCP `image` content block. Used by the three screenshot
 * tools.
 */
export interface McpImageContent {
  readonly type: "image";
  readonly data: string;
  readonly mimeType: string;
}

/**
 * Single MCP `resource` content block (used for PDFs etc.). The
 * inline `blob` carries base64 bytes plus mimeType — agents render
 * it from memory without calling back to the API.
 */
export interface McpResourceContent {
  readonly type: "resource";
  readonly resource: {
    readonly uri: string;
    readonly mimeType: string;
    readonly blob: string;
  };
}

/**
 * Tool output envelope expected by the wire-tools bridge for binary
 * tools. Always wraps a single content block (one image / one PDF
 * per call — the rule is "if a tool returns >5 images, split it",
 * already split here).
 */
export interface BinaryContentEnvelope {
  readonly content: readonly [McpImageContent | McpResourceContent];
}

/**
 * Convert raw bytes from a binary download into an MCP image block.
 *
 * `mimeType` is whatever the API responded with — in practice always
 * ``image/webp``, which every screenshot route hardcodes. The bytes are
 * passed through untouched: this server does no image decoding, so a
 * client that cannot handle WebP has to transcode on its own side.
 */
export function imageBlock(bytes: Uint8Array, mimeType: string): BinaryContentEnvelope {
  return {
    content: [
      {
        type: "image",
        data: Buffer.from(bytes).toString("base64"),
        mimeType,
      },
    ],
  };
}

/**
 * Wrap raw bytes in an MCP resource block. ``uri`` is shown to the
 * agent as the source — pass the canonical API path so the agent can
 * cite where the bytes came from.
 */
export function resourceBlock(
  bytes: Uint8Array,
  mimeType: string,
  uri: string
): BinaryContentEnvelope {
  return {
    content: [
      {
        type: "resource",
        resource: {
          uri,
          mimeType,
          blob: Buffer.from(bytes).toString("base64"),
        },
      },
    ],
  };
}
