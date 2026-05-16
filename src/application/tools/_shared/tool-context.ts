/**
 * The only channel a tool handler has to the outside world.
 *
 * Built by the transport (one per request in HTTP mode, one per
 * process in stdio mode) and threaded down to the handler. Tools MUST
 * NOT read globals (`process.env`, `console`, module-level singletons,
 * etc.) — all dependencies flow through this object.
 */

import type { ApiGateway } from "../../../domain/ports/api-gateway.js";
import type { Logger } from "../../../domain/ports/logger.js";
import type { RequestId } from "../../../domain/value-objects/request-id.js";

export interface ToolContext {
  /**
   * Bound to the caller's `Authorization` header in HTTP mode, to the
   * `KAMINARI_AD_API_KEY` env var in stdio mode. Never a singleton in
   * HTTP — fresh per request.
   */
  readonly api: ApiGateway;

  /**
   * Already scoped with `request_id` (and, in HTTP mode, `bearer_hash`
   * + `tool_name`). Tools just call `.info({...}, "...")` — no need
   * to add correlation fields manually.
   */
  readonly logger: Logger;

  /**
   * Per-request UUID. The transport also forwards this as
   * `X-Request-Id` to the API, so an MCP tool call can be traced into
   * the API logs.
   */
  readonly requestId: RequestId;
}
