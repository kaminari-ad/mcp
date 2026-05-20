/**
 * Opaque value object wrapping a Bearer API token.
 *
 * The raw token is stored in a private field that is **never** exposed
 * via `toString` / `toJSON` / structured-clone. The only ways to use it
 * are:
 *
 *   - {@link BearerToken.hash} — short hex prefix for log correlation.
 *   - {@link BearerToken.toAuthorizationHeader} — the literal header
 *     value, used only by the HTTP API adapter when building an
 *     outbound request.
 *
 * This deliberately makes accidental token leakage hard: a logger or
 * structured-clone of a `BearerToken` instance yields a placeholder, not
 * the secret.
 */

import { createHash } from "node:crypto";

const REDACTED = "[BearerToken redacted]";

/**
 * SHA-256 hex prefix length used for the {@link BearerToken.hash}
 * correlation field. 8 chars (32 bits) is enough to correlate one
 * customer's activity, not enough to invert the hash.
 */
export const BEARER_HASH_PREFIX_LEN = 8;

/**
 * Hard cap on the inbound `Authorization` header length. Real Kaminari
 * Ad API keys are ~40 chars; padding generously for JWT-style tokens
 * (which the API doesn't issue today but may in the future) and the
 * `Bearer ` prefix. Anything beyond this is rejected as malformed —
 * stops a pathological client from forcing the server to hash multi-MB
 * blobs.
 */
const MAX_HEADER_LEN = 4096;

/**
 * Opaque, self-redacting wrapper around a Kaminari.Ad API key. Use
 * {@link BearerToken.fromAuthorizationHeader} on the wire-side and
 * {@link BearerToken.fromString} for stdio (`KAMINARI_AD_API_KEY`).
 */
export class BearerToken {
  readonly #raw: string;

  private constructor(raw: string) {
    this.#raw = raw;
  }

  /**
   * Construct from a raw string. Trims surrounding whitespace; rejects
   * empty input. Does NOT validate format — the API is the single
   * source of truth for token validity.
   */
  static fromString(raw: string): BearerToken | undefined {
    const trimmed = raw.trim();
    if (trimmed.length === 0) return undefined;
    return new BearerToken(trimmed);
  }

  /**
   * Parse from a raw `Authorization` header value. Returns `undefined`
   * for missing / malformed input (anything not `Bearer <token>`).
   *
   * **Normalization policy.** The regex is case-insensitive on the
   * `Bearer` scheme (per RFC 6750 §2.1, the scheme name is
   * case-insensitive) but the outbound header is always re-emitted
   * with the canonical capitalization (`Bearer <token>`) by
   * {@link toAuthorizationHeader}. We intentionally do NOT preserve
   * the inbound casing byte-for-byte:
   *
   *   - The Kaminari.Ad API accepts the canonical form.
   *   - Outbound canonicalization simplifies any future signature /
   *     proxy that re-hashes the header.
   *   - The TOKEN value itself is preserved exactly (the capture
   *     group's `\S+` keeps the secret intact); only the SCHEME word
   *     is normalized.
   *
   * Token length is capped at {@link MAX_TOKEN_LEN} bytes to keep a
   * pathological client from blowing the heap; longer headers are
   * rejected as malformed.
   */
  static fromAuthorizationHeader(headerValue: string | undefined): BearerToken | undefined {
    if (headerValue === undefined) return undefined;
    if (headerValue.length > MAX_HEADER_LEN) return undefined;
    const match = /^Bearer\s+(\S+)\s*$/i.exec(headerValue);
    if (match?.[1] === undefined) return undefined;
    return BearerToken.fromString(match[1]);
  }

  /**
   * Returns the first {@link BEARER_HASH_PREFIX_LEN} hex chars of
   * `sha256(token)`. Used as the `bearer_hash` log field.
   */
  hash(): string {
    return createHash("sha256").update(this.#raw).digest("hex").slice(0, BEARER_HASH_PREFIX_LEN);
  }

  /**
   * Returns the full SHA-256 hex digest. Used as the session-binding
   * key in {@link SessionStore}. Not for logs.
   */
  fullHash(): string {
    return createHash("sha256").update(this.#raw).digest("hex");
  }

  /**
   * Returns the literal `Authorization` header value. Use ONLY when
   * constructing an outbound HTTP request to the API.
   */
  toAuthorizationHeader(): string {
    return `Bearer ${this.#raw}`;
  }

  /**
   * Redaction. Logger / JSON serialisation / template strings see the
   * placeholder, not the token.
   */
  toString(): string {
    return REDACTED;
  }

  /**
   * `JSON.stringify(bearer)` -> `"[BearerToken redacted]"`. Same
   * intent as {@link toString}: any path that serializes the VO never
   * sees the secret.
   */
  toJSON(): string {
    return REDACTED;
  }

  /**
   * Node's `util.inspect` hook — keeps `console.log(token)` /
   * structured logs from accidentally revealing the secret.
   */
  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return REDACTED;
  }
}
