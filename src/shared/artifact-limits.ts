/**
 * Ceilings for downloaded artifacts, and the helpers that report them.
 *
 * The API caps none of these endpoints, so without a ceiling one VAST
 * MediaFile decides how much memory the hosted server uses. Lives in
 * `shared/` so the gateway can enforce the cap while reading the
 * socket without importing from the application layer.
 */

/**
 * Largest text artifact (creative markup, VAST XML) we will decode.
 * Generous for either while staying well inside a context window.
 */
export const MAX_TEXT_ARTIFACT_BYTES = 256 * 1024;

/**
 * Largest binary artifact — screenshots, invoice PDFs, MP4 creatives —
 * we will base64-encode into a result. Base64 inflates by ~33%, and a
 * truncated file is useless to a model, so this ceiling protects the
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
