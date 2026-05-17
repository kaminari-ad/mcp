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
 */

import process from "node:process";

import { loadConfig, type Transport } from "./shared/config.js";
import { NAME, VERSION } from "./shared/version.js";

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
