/**
 * Ceilings for scan artifacts, and the helpers that report them.
 *
 * Lives in `shared/` because both layers need them: the gateway
 * enforces the cap while reading the socket, and the tools quote the
 * numbers to the agent. Artifacts are third-party ad payloads and the
 * API caps none of them, so an uncapped read would let one VAST
 * MediaFile decide how much memory the hosted server uses.
 */

/**
 * Largest text artifact (creative markup, VAST XML) we will decode.
 * Generous for either while staying well inside a context window.
 */
export const MAX_TEXT_ARTIFACT_BYTES = 256 * 1024;

/**
 * Largest binary artifact (MP4) we will base64-encode into a result.
 * Base64 inflates by ~33%, and a truncated video is useless to a
 * model, so this ceiling protects the transport rather than the
 * context window.
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
