/**
 * Tool-level errors and content shapes.
 *
 * Tools return `Result<ToolOutput, ToolError>`. The transport maps
 * `Err` to an MCP error envelope; `Ok` becomes the `content` array of
 * the tool result that the MCP client receives.
 */

/**
 * Discriminated-union of tool failure modes. Variants line up with
 * {@link ApiError} kinds, plus `internal` for unexpected adapter
 * failures. Each carries a human-readable `message`.
 */
export type ToolError =
  | { readonly kind: "unauthorized"; readonly message: string }
  | { readonly kind: "forbidden"; readonly message: string; readonly code?: string }
  | { readonly kind: "not-found"; readonly message: string }
  | {
      readonly kind: "rate-limited";
      readonly message: string;
      readonly retryAfterMs?: number;
    }
  | {
      readonly kind: "invalid-input";
      readonly message: string;
      readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
      /**
       * Optional machine-readable code propagated from the API
       * (e.g. `policies.in_use`). Agents can branch on this when the
       * API exposes it; mapper passes it through unmodified.
       */
      readonly code?: string;
    }
  | { readonly kind: "upstream"; readonly message: string; readonly status?: number }
  | { readonly kind: "internal"; readonly message: string };

/**
 * MCP content block variants used by Kaminari Ad tools. The SDK
 * accepts more types (resource_link, audio, ...); we expose the subset
 * we actually use so reviewers see what's allowed.
 */
export type ToolContent =
  | { readonly type: "text"; readonly text: string }
  | { readonly type: "image"; readonly data: string; readonly mimeType: string };
