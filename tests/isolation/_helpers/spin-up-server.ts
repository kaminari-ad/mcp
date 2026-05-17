/**
 * Test harness for the isolation suite. Spins up a real `http.Server`
 * bound to a random port, wired with the same request handler the
 * production HTTP transport uses, and returns helpers to fire requests
 * at it via undici.
 *
 * Tests assert on:
 *   - Outbound calls to the (mocked) Kaminari Ad API.
 *   - Pino log lines (captured via an in-memory sink).
 *   - HTTP response status / body of the MCP endpoint.
 */

import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { Writable } from "node:stream";

import {
  type Dispatcher,
  getGlobalDispatcher,
  MockAgent,
  request as undiciRequest,
  setGlobalDispatcher,
} from "undici";

import { createSystemClock } from "../../../src/infrastructure/clock/system-clock.js";
import { createPinoLogger } from "../../../src/infrastructure/logging/pino-logger.js";
import { createLeakyBucketRateLimiter } from "../../../src/infrastructure/rate-limit/leaky-bucket-rate-limiter.js";
import { createInMemorySessionStore } from "../../../src/infrastructure/session/in-memory-session-store.js";
import { createHttpRequestHandler } from "../../../src/presentation/http/http-request-handler.js";
import { loadConfig } from "../../../src/shared/config.js";

export interface IsolationHarness {
  readonly origin: string;
  readonly mockApi: MockAgent;
  readonly logs: () => string;
  readonly close: () => Promise<void>;
}

class MemorySink extends Writable {
  readonly chunks: string[] = [];
  override _write(
    chunk: string | Buffer,
    _encoding: BufferEncoding,
    callback: (err?: Error | null) => void
  ): void {
    this.chunks.push(typeof chunk === "string" ? chunk : chunk.toString("utf8"));
    callback();
  }
  override toString(): string {
    return this.chunks.join("");
  }
}

/**
 * Build a real HTTP server with the production request handler.
 *
 * @param overrides - Per-test config overrides (rate limit, session TTL).
 */
export async function spinUpServer(
  overrides: { readonly RATE_LIMIT_RPM?: number; readonly SESSION_TTL_SEC?: number } = {}
): Promise<IsolationHarness> {
  const sink = new MemorySink();
  const logger = createPinoLogger("debug", "json", sink);

  const configResult = loadConfig({
    TRANSPORT: "http",
    API_BASE_URL: "https://kaminari.test",
    LOG_LEVEL: "debug",
    HTTP_PORT: "0",
    SESSION_TTL_SEC: String(overrides.SESSION_TTL_SEC ?? 1800),
    RATE_LIMIT_RPM: String(overrides.RATE_LIMIT_RPM ?? 1000),
  });
  if (configResult.isErr()) throw new Error("test config invalid");
  const config = configResult.value;

  const clock = createSystemClock();
  const sessions = createInMemorySessionStore(clock, config.sessionTtlSec * 1000);
  const rateLimiter = createLeakyBucketRateLimiter(clock, config.rateLimitRpm);

  // Intercept Kaminari API requests via undici MockAgent globally.
  // Save the previous dispatcher so `close()` can restore it — leaving
  // a `MockAgent` installed globally would leak into any later test
  // that runs in the same Vitest worker.
  const previousDispatcher: Dispatcher = getGlobalDispatcher();
  const mockApi = new MockAgent();
  mockApi.disableNetConnect();
  // Allow localhost so our tests can hit the spun-up server.
  mockApi.enableNetConnect((host) => host.startsWith("127.0.0.1") || host.startsWith("localhost"));
  setGlobalDispatcher(mockApi);

  const handle = createHttpRequestHandler({ config, logger, sessions, rateLimiter });
  const server: Server = createServer((req, res) => {
    handle(req, res).catch((cause: unknown) => {
      logger.error(
        { error_message: cause instanceof Error ? cause.message : String(cause) },
        "test.unhandled"
      );
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Internal" }));
      }
    });
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const addr = server.address() as AddressInfo;
  const origin = `http://127.0.0.1:${String(addr.port)}`;

  return {
    origin,
    mockApi,
    logs: () => sink.toString(),
    close: async () => {
      await mockApi.close();
      setGlobalDispatcher(previousDispatcher);
      await new Promise<void>((resolve) =>
        server.close(() => {
          resolve();
        })
      );
    },
  };
}

/**
 * Convenience: fire a JSON-RPC `tools/list` request to the MCP endpoint.
 * Returns the parsed body.
 */
export async function jsonRpc(
  origin: string,
  headers: Readonly<Record<string, string>>,
  body: Readonly<Record<string, unknown>>
): Promise<{ statusCode: number; body: unknown; headers: Record<string, string | string[]> }> {
  const res = await undiciRequest(`${origin}/mcp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...headers,
    },
    body: JSON.stringify(body),
  });
  let parsed: unknown;
  try {
    parsed = await res.body.json();
  } catch {
    parsed = await res.body.text().catch(() => "");
  }
  const headersOut: Record<string, string | string[]> = {};
  for (const [k, v] of Object.entries(res.headers)) {
    if (v !== undefined) headersOut[k] = v;
  }
  return { statusCode: res.statusCode, body: parsed, headers: headersOut };
}

export { undiciRequest };
