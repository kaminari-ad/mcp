/**
 * CLI smoke test — exercises `npx @kaminari-ad/mcp` in `--help` and
 * `--version` modes against the BUILT artifact under `dist/`. Catches
 * `tsup` regressions (missing shebang, broken ESM entrypoint, missing
 * runtime dep) before the npm publish step.
 *
 * Skipped automatically when `dist/bin.js` doesn't exist locally.
 */

import { execFile as _execFile } from "node:child_process";
import { promises as fs } from "node:fs";
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
          TRANSPORT: "http",
          KAMINARI_AD_API_KEY: "kad_should_be_rejected",
          HTTP_PORT: "0",
          API_BASE_URL: "https://kaminari.test",
        },
      });
    } catch (err) {
      const e = err as { code?: number; stderr?: string; stdout?: string };
      exitCode = e.code ?? 1;
    }
    expect(exitCode).toBe(2);
  });
});
