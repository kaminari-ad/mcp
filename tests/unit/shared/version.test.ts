import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { NAME, VERSION } from "../../../src/shared/version.js";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(resolve(here, "..", "..", "..", "package.json"), "utf8")
) as { name: string; version: string };

describe("version.ts constants", () => {
  it("NAME matches package.json", () => {
    expect(NAME).toBe(pkg.name);
  });

  it("VERSION matches package.json", () => {
    expect(VERSION).toBe(pkg.version);
  });
});
