/**
 * Helpers for artifact tools that return text rather than binary.
 *
 * `creative-html` and `vast-xml` arrive as bytes from the same
 * `binaryGet` path as the screenshots, but an agent can only reason
 * about them as text. Decoding here (instead of returning a base64
 * `resource` block) means the markup lands directly in the model's
 * context, which is the whole point of exposing it.
 *
 * Both are third-party ad payloads of unbounded size, so every text
 * artifact is size-checked before it is decoded.
 */

/**
 * Largest artifact we will pull into a tool result.
 *
 * The API applies no cap of its own. 256 KiB is generous for ad markup
 * or a VAST document while staying well inside a model's context.
 */
export const MAX_TEXT_ARTIFACT_BYTES = 256 * 1024;

/**
 * Largest binary artifact we will base64-encode into a tool result.
 *
 * Base64 inflates by ~33%, and unlike text there is nothing the model
 * can do with a truncated MP4, so the ceiling is about protecting the
 * transport rather than the context window.
 */
export const MAX_BINARY_ARTIFACT_BYTES = 8 * 1024 * 1024;

/** Human-readable size for an over-limit error message. */
export function formatBytes(bytes: number): string {
  const kib = 1024;
  if (bytes < kib) return `${String(bytes)} B`;
  const mib = kib * kib;
  if (bytes < mib) return `${(bytes / kib).toFixed(1)} KiB`;
  return `${(bytes / mib).toFixed(1)} MiB`;
}

/** Decode artifact bytes as UTF-8. */
export function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder("utf-8").decode(bytes);
}
