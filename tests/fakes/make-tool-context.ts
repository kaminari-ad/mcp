/**
 * Builds a `ToolContext` from fake adapters so unit tests can call a
 * tool's handler directly without spinning up a transport.
 */

import type { ApiGateway } from "../../src/domain/ports/api-gateway.js";
import type { Logger } from "../../src/domain/ports/logger.js";
import { newRequestId } from "../../src/domain/value-objects/request-id.js";
import type { ToolContext } from "../../src/application/tools/_shared/tool-context.js";

import { createFakeApiGateway } from "./fake-api-gateway.js";
import { createFakeLogger } from "./fake-logger.js";

export function makeToolContext(overrides: Partial<ToolContext> = {}): ToolContext {
  const api: ApiGateway = overrides.api ?? createFakeApiGateway();
  const logger: Logger = overrides.logger ?? createFakeLogger();
  return {
    api,
    logger,
    requestId: overrides.requestId ?? newRequestId(),
  };
}
