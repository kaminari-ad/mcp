/**
 * CLI entrypoint for `@kaminari-ad/mcp`.
 *
 * Dispatches to a transport-specific composition root (stdio or HTTP)
 * based on the `--transport` flag (or `TRANSPORT` env var, with stdio
 * as the default).
 *
 * Wire-up is intentionally minimal — every dependency is constructed
 * inside the chosen bootstrap, never here. This file just parses argv
 * and config, then hands off.
 *
 * Imports policy: the STATIC imports below MUST stay free of any
 * runtime dependency that requires Node >= 22.19 (undici, MCP SDK,
 * pino). Otherwise the Node-version preflight in `main()` runs too
 * late — those modules crash at import time on older Node. The
 * transport bootstraps pull undici / MCP SDK / pino via dynamic
 * `await import()` so the preflight gets to fire first.
 */

import process from "node:process";

import { loadConfig, type Transport } from "./shared/config.js";
import { NAME, VERSION } from "./shared/version.js";

/**
 * Lowest Node version that satisfies every transitive runtime dep —
 * currently bound by `undici@8.x` which requires `markAsUncloneable`
 * from `node:worker_threads` (only on Node 22.19+; see
 * https://github.com/nodejs/undici/releases/tag/v8.0.3). Keep in sync
 * with `engines.node` in package.json.
 */
const REQUIRED_NODE_MAJOR = 22;
const REQUIRED_NODE_MINOR = 19;

function checkNodeVersionOrExit(): void {
  const [majorStr, minorStr] = process.versions.node.split(".");
  const major = Number(majorStr);
  const minor = Number(minorStr);
  if (
    Number.isNaN(major) ||
    Number.isNaN(minor) ||
    major < REQUIRED_NODE_MAJOR ||
    (major === REQUIRED_NODE_MAJOR && minor < REQUIRED_NODE_MINOR)
  ) {
    const required = `>=${String(REQUIRED_NODE_MAJOR)}.${String(REQUIRED_NODE_MINOR)}.0`;
    process.stderr.write(
      [
        `${NAME} requires Node.js ${required} (you have v${process.versions.node}).`,
        "",
        "The underlying undici 8.x HTTP client uses markAsUncloneable",
        "from node:worker_threads, available only on Node 22.19+.",
        "Older Node crashes at import time with the cryptic message",
        "`webidl.util.markAsUncloneable is not a function`.",
        "",
        "Please upgrade Node and re-run: https://nodejs.org/en/download",
        "",
      ].join("\n")
    );
    process.exit(2);
  }
}

function parseTransportFlag(argv: readonly string[]): Transport | undefined {
  for (const arg of argv) {
    if (arg === "--transport=stdio" || arg === "--transport=http") {
      return arg === "--transport=stdio" ? "stdio" : "http";
    }
    if (arg.startsWith("--transport=")) {
      const value = arg.slice("--transport=".length);
      if (value === "stdio" || value === "http") return value;
    }
  }
  return undefined;
}

async function main(): Promise<number> {
  const argv = process.argv.slice(2);

  if (argv.includes("--version") || argv.includes("-v")) {
    process.stdout.write(`${NAME} ${VERSION}\n`);
    return 0;
  }

  // Preflight: bail with a clear message BEFORE any dynamic import
  // pulls undici / MCP SDK / pino — all three require Node 22.19+
  // and crash at import time on older Node. Skipped for --version /
  // --help (informational; useful for ops to confirm the binary
  // resolves even on stale Node).
  checkNodeVersionOrExit();

  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(
      [
        `${NAME} ${VERSION}`,
        ``,
        `Usage:`,
        `  kaminari-ad-mcp [--transport=stdio|http]`,
        ``,
        `Transports:`,
        `  stdio (default)  Local install — auth via KAMINARI_AD_API_KEY env var.`,
        `  http             Hosted multi-tenant server — auth via incoming Authorization header.`,
        ``,
        `Configuration is documented in .env.example.`,
        ``,
      ].join("\n")
    );
    return 0;
  }

  const cliTransport = parseTransportFlag(argv);
  const env: NodeJS.ProcessEnv = cliTransport
    ? { ...process.env, KAMINARI_AD_TRANSPORT: cliTransport }
    : process.env;

  const configResult = loadConfig(env);
  if (configResult.isErr()) {
    process.stderr.write(`Invalid configuration: ${JSON.stringify(configResult.error.issues)}\n`);
    return 2;
  }
  const config = configResult.value;

  if (config.transport === "stdio") {
    const { bootstrapStdio } = await import("./presentation/stdio/stdio-bootstrap.js");
    return bootstrapStdio(config);
  }
  const { bootstrapHttp } = await import("./presentation/http/http-bootstrap.js");
  return bootstrapHttp(config);
}

main().then(
  (code) => {
    process.exit(code);
  },
  (error: unknown) => {
    process.stderr.write(`Fatal: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
);
