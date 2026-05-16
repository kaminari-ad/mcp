/**
 * Composition root for the stdio transport.
 *
 * One process = one tenant. The bearer comes from the
 * `KAMINARI_AD_API_KEY` env var (parsed into `Config.stdioApiKey`).
 * All adapters are constructed once, threaded into a single
 * {@link ToolContext}, and shared across tool calls — safe because
 * there is no cross-tenant boundary in stdio mode.
 *
 * For tenant-isolation rules, see the http bootstrap and
 * CONTRIBUTING.md "Tenant isolation".
 */

import * as process from "node:process";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { BearerToken } from "../../domain/value-objects/bearer-token.js";
import { newRequestId } from "../../domain/value-objects/request-id.js";
import { createHttpApiGateway } from "../../infrastructure/api/http-api-gateway.js";
import { createPinoLogger } from "../../infrastructure/logging/pino-logger.js";
import type { Config } from "../../shared/config.js";
import { NAME, VERSION } from "../../shared/version.js";
import { wireToolsIntoMcpServer } from "../shared/wire-tools.js";

/**
 * Build the stdio MCP server, connect its transport, and resolve when
 * the transport closes. Returns a process exit code.
 */
export async function bootstrapStdio(config: Config): Promise<number> {
  const logger = createPinoLogger(config.logLevel, "pretty");

  if (config.stdioApiKey === undefined) {
    logger.fatal({}, "stdio.missing_api_key");
    process.stderr.write(
      "KAMINARI_AD_API_KEY is required in stdio mode. Generate one in Settings -> API Keys.\n"
    );
    return 2;
  }
  const bearer = BearerToken.fromString(config.stdioApiKey);
  if (bearer === undefined) {
    logger.fatal({}, "stdio.invalid_api_key");
    return 2;
  }

  const requestId = newRequestId();
  const scopedLogger = logger.child({ request_id: requestId, bearer_hash: bearer.hash() });
  const api = createHttpApiGateway({
    baseUrl: config.apiBaseUrl,
    bearer,
    requestId,
    logger: scopedLogger,
  });

  const ctx = { api, logger: scopedLogger, requestId };
  const server = new McpServer({ name: NAME, version: VERSION });
  wireToolsIntoMcpServer(server, () => ctx);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  scopedLogger.info({}, "stdio.ready");

  await new Promise<void>((resolve) => {
    transport.onclose = (): void => {
      resolve();
    };
  });
  scopedLogger.info({}, "stdio.shutdown");
  return 0;
}
