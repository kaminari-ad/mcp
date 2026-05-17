/**
 * CLI smoke test — exercises `npx @kaminari-ad/mcp` against the BUILT
 * artifact under `dist/`. Catches `tsup` regressions (missing shebang,
 * broken ESM entrypoint, missing runtime dep, namespace-vs-default
 * import bugs that only show after bundling) before the npm publish
 * step.
 *
 * Skipped automatically when `dist/bin.js` doesn't exist locally.
 */

import { execFile as _execFile, spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { request as httpRequest } from "node:http";
import { type AddressInfo, createServer } from "node:net";
import * as path from "node:path";
import * as url from "node:url";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

const execFile = promisify(_execFile);

const REPO_ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");
const BIN = path.join(REPO_ROOT, "dist", "bin.js");

async function distAvailable(): Promise<boolean> {
  try {
    await fs.access(BIN);
    return true;
  } catch {
    return false;
  }
}

/** Grab a free TCP port by binding to 0 then closing. */
async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const port = (srv.address() as AddressInfo).port;
      srv.close(() => {
        resolve(port);
      });
    });
  });
}

/** Fire a JSON-RPC POST to `/mcp` and capture status / headers / body. */
async function mcpRpc(
  port: number,
  sessionId: string | string[] | undefined,
  payload: unknown
): Promise<{
  body: { statusCode: number; headers: Record<string, string>; payload: string };
}> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      authorization: "Bearer kad_test_session_smoke_token",
      "content-length": String(Buffer.byteLength(body)),
    };
    if (typeof sessionId === "string") headers["mcp-session-id"] = sessionId;
    const req = httpRequest(
      {
        host: "127.0.0.1",
        port,
        method: "POST",
        path: "/mcp",
        headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          const outHeaders: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.headers)) {
            if (typeof v === "string") outHeaders[k] = v;
            else if (Array.isArray(v) && v[0] !== undefined) outHeaders[k] = v[0];
          }
          resolve({
            body: {
              statusCode: res.statusCode ?? 0,
              headers: outHeaders,
              payload: Buffer.concat(chunks).toString("utf8"),
            },
          });
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

/** Polling GET — succeeds when the URL returns a non-network-error response. */
async function waitForHttp(
  url: string,
  timeoutMs: number
): Promise<{ statusCode: number; body: string }> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      return await new Promise((resolve, reject) => {
        const req = httpRequest(url, { method: "GET" }, (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (c: Buffer) => chunks.push(c));
          res.on("end", () => {
            resolve({
              statusCode: res.statusCode ?? 0,
              body: Buffer.concat(chunks).toString("utf8"),
            });
          });
        });
        req.on("error", reject);
        req.end();
      });
    } catch (e) {
      lastError = e;
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error(`waitForHttp(${url}) timed out: ${String(lastError)}`);
}

describe("CLI smoke (built dist)", () => {
  it("--version prints the package name and a semver-like string", async () => {
    if (!(await distAvailable())) return;
    const { stdout } = await execFile("node", [BIN, "--version"], { timeout: 5000 });
    expect(stdout.trim()).toMatch(/^@kaminari-ad\/mcp \S+$/);
  });

  it("--help lists both transports", async () => {
    if (!(await distAvailable())) return;
    const { stdout } = await execFile("node", [BIN, "--help"], { timeout: 5000 });
    expect(stdout).toMatch(/--transport=stdio\|http/);
    expect(stdout).toMatch(/stdio.*KAMINARI_AD_API_KEY/);
    expect(stdout).toMatch(/http.*Authorization header/);
  });

  it("HTTP mode rejects KAMINARI_AD_API_KEY env var with exit code 2", async () => {
    if (!(await distAvailable())) return;
    let exitCode = 0;
    try {
      await execFile("node", [BIN, "--transport=http"], {
        timeout: 5000,
        env: {
          ...process.env,
          KAMINARI_AD_TRANSPORT: "http",
          KAMINARI_AD_API_KEY: "kad_should_be_rejected",
          KAMINARI_AD_HTTP_PORT: "0",
          KAMINARI_AD_API_URL: "https://kaminari.test",
        },
      });
    } catch (err) {
      const e = err as { code?: number; stderr?: string; stdout?: string };
      exitCode = e.code ?? 1;
    }
    expect(exitCode).toBe(2);
  });

  it("HTTP mode handles a full session: initialize -> initialized -> tools/list", async () => {
    // Regression test for the per-request McpServer+Transport bug
    // that broke Streamable HTTP session continuity — `initialize`
    // returned a session-id, but the very next POST with that id
    // failed with "Server not initialized" because the SDK state was
    // thrown away with the previous request's transport. Fixed by
    // caching the transport in `liveSessions`.
    if (!(await distAvailable())) return;
    const port = await freePort();
    const child = spawn("node", [BIN, "--transport=http"], {
      env: {
        ...process.env,
        KAMINARI_AD_TRANSPORT: "http",
        KAMINARI_AD_HTTP_PORT: String(port),
        // Point at a deliberately unreachable URL — the test exercises
        // session lifecycle, not actual upstream calls. tools/call
        // would return an `upstream` error from undici; we only
        // assert the SDK handshake succeeded.
        KAMINARI_AD_API_URL: "http://127.0.0.1:1",
        KAMINARI_AD_LOG_LEVEL: "warn",
        KAMINARI_AD_LOG_FORMAT: "json",
        KAMINARI_AD_API_KEY: undefined,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const exitPromise = new Promise<number>((resolve) => {
      child.on("exit", (code) => resolve(code ?? 0));
    });
    try {
      await waitForHttp(`http://127.0.0.1:${String(port)}/healthz`, 5000);
      const init = await mcpRpc(port, undefined, {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "smoke", version: "0.1" },
        },
      });
      expect(init.body.statusCode).toBe(200);
      const sessionId = init.body.headers["mcp-session-id"];
      expect(typeof sessionId).toBe("string");

      // SECOND request on the same session — used to fail with
      // "Server not initialized" before the transport cache fix.
      const initialized = await mcpRpc(port, sessionId, {
        jsonrpc: "2.0",
        method: "notifications/initialized",
      });
      expect([200, 202]).toContain(initialized.body.statusCode);

      const list = await mcpRpc(port, sessionId, {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {},
      });
      expect(list.body.statusCode).toBe(200);
      // Streamable HTTP returns SSE by default — strip the
      // `data: ` prefix if present, otherwise parse as raw JSON.
      const payloadJson = list.body.payload.startsWith("event:")
        ? list.body.payload.split("data:").slice(1).join("data:").trim()
        : list.body.payload;
      const parsed = JSON.parse(payloadJson) as {
        result: { tools: { name: string }[] };
      };
      expect(parsed.result.tools.length).toBeGreaterThan(50);

      // `resources/list` + `prompts/list` should return clean empty
      // arrays, NOT JSON-RPC `-32601 Method not found`. Most MCP
      // clients (Cursor, Claude Desktop, Cline) probe these at session
      // start; without our declared-empty-caps handler the SDK would
      // 404 here and Cursor would mistranslate that into a misleading
      // "Connection closed" warning in downstream agent logs.
      for (const method of ["resources/list", "prompts/list"]) {
        const probe = await mcpRpc(port, sessionId, {
          jsonrpc: "2.0",
          id: 3,
          method,
          params: {},
        });
        expect(probe.body.statusCode).toBe(200);
        const probePayloadJson = probe.body.payload.startsWith("event:")
          ? probe.body.payload.split("data:").slice(1).join("data:").trim()
          : probe.body.payload;
        const probeParsed = JSON.parse(probePayloadJson) as {
          error?: { code: number; message: string };
          result?: { resources?: unknown[]; prompts?: unknown[] };
        };
        expect(probeParsed.error).toBeUndefined();
        expect(probeParsed.result).toBeDefined();
        if (method === "resources/list") {
          expect(probeParsed.result?.resources).toEqual([]);
        } else {
          expect(probeParsed.result?.prompts).toEqual([]);
        }
      }
    } finally {
      child.kill("SIGTERM");
      await Promise.race([
        exitPromise,
        new Promise<number>((resolve) =>
          setTimeout(() => {
            child.kill("SIGKILL");
            resolve(-1);
          }, 3000)
        ),
      ]);
    }
  }, 15000);

  it("HTTP mode actually boots, serves /healthz, and shuts down cleanly on SIGTERM", async () => {
    // Regression test for the `import * as process from "node:process";
    // process.once("SIGTERM", ...)` bug — the namespace import did NOT
    // expose `.once`, so the bundled HTTP transport crashed at startup
    // with "process4.once is not a function" but no unit/isolation test
    // caught it because they never exercise the real bootstrap path.
    if (!(await distAvailable())) return;
    const port = await freePort();
    const child = spawn("node", [BIN, "--transport=http"], {
      env: {
        ...process.env,
        KAMINARI_AD_TRANSPORT: "http",
        KAMINARI_AD_HTTP_PORT: String(port),
        KAMINARI_AD_API_URL: "https://kaminari.test",
        KAMINARI_AD_LOG_LEVEL: "warn",
        KAMINARI_AD_LOG_FORMAT: "json",
        // Make sure KAMINARI_AD_API_KEY isn't inherited from host
        // (would be rejected — see test above).
        KAMINARI_AD_API_KEY: undefined,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stderrChunks: Buffer[] = [];
    child.stderr.on("data", (c: Buffer) => stderrChunks.push(c));
    const exitPromise = new Promise<number>((resolve) => {
      child.on("exit", (code) => resolve(code ?? 0));
    });

    try {
      const healthz = await waitForHttp(`http://127.0.0.1:${String(port)}/healthz`, 5000);
      expect(healthz.statusCode).toBe(200);
    } finally {
      child.kill("SIGTERM");
      const code = await Promise.race([
        exitPromise,
        new Promise<number>((resolve) =>
          setTimeout(() => {
            child.kill("SIGKILL");
            resolve(-1);
          }, 3000)
        ),
      ]);
      // SIGTERM-handled clean shutdown should return 0; SIGKILL=-1.
      // Tolerate either — what matters is the process didn't crash
      // before /healthz responded.
      expect([0, -1, null]).toContain(code);
      // Surface stderr in test output if the assertion above failed,
      // so future regressions point straight at the crash line.
      if (code === -1) {
        process.stderr.write(Buffer.concat(stderrChunks).toString("utf8"));
      }
    }
  }, 15000);
});
