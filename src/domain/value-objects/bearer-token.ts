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

const REDACTED = "[BearerToken redacted]" as const;

/**
 * SHA-256 hex prefix length used for the {@link BearerToken.hash}
 * correlation field. 8 chars (32 bits) is enough to correlate one
 * customer's activity, not enough to invert the hash.
 */
export const BEARER_HASH_PREFIX_LEN = 8;

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
   */
  static fromAuthorizationHeader(headerValue: string | undefined): BearerToken | undefined {
    if (headerValue === undefined) return undefined;
    const match = /^Bearer\s+(\S+)\s*$/i.exec(headerValue);
    if (!match || match[1] === undefined) return undefined;
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
