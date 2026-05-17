#!/usr/bin/env tsx
/**
 * Generate TypeScript types for the Kaminari Ad `/api/v1` surface
 * from its OpenAPI document.
 *
 * Output: `src/shared/api/openapi.ts`.
 *
 * Usage:
 *   npm run gen:api-types                                  # uses default URL
 *   API_OPENAPI_URL=http://localhost:8000/openapi.json \
 *     npm run gen:api-types                                # override source
 *
 * The generated file is checked in (NOT in `.gitignore`) and CI drift-
 * checks it: if the API spec changed but the file wasn't regenerated,
 * `git diff` fails. This keeps the typed API surface in lock-step with
 * what the server actually exposes.
 *
 * The generator is intentionally not auto-run on every CI build — that
 * would couple this repo's CI to the API's runtime availability. The
 * MR that updates `/api/v1` is responsible for running this script and
 * committing the regenerated file.
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as process from "node:process";

import openapiTS, { astToString } from "openapi-typescript";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUTPUT = path.join(REPO_ROOT, "src", "shared", "api", "openapi.ts");
const DEFAULT_URL = "https://kaminari.ad/openapi.json";

const HEADER = `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Source : ${process.env["API_OPENAPI_URL"] ?? DEFAULT_URL}
 * Tool   : openapi-typescript
 * Refresh: \`npm run gen:api-types\`
 *
 * CI diffs this file against the committed copy; mismatches fail the
 * build, forcing the API-changing MR to bring this file along.
 */

/* eslint-disable */

`;

async function main(): Promise<number> {
  const source = process.env["API_OPENAPI_URL"] ?? DEFAULT_URL;
  process.stderr.write(`gen-api-types: pulling ${source}\n`);

  let ast: Awaited<ReturnType<typeof openapiTS>>;
  try {
    ast = await openapiTS(new URL(source));
  } catch (cause) {
    process.stderr.write(
      `gen-api-types: failed to fetch / parse openapi schema: ${
        cause instanceof Error ? cause.message : String(cause)
      }\n`
    );
    return 1;
  }

  const body = astToString(ast);
  await fs.writeFile(OUTPUT, HEADER + body, "utf8");
  process.stderr.write(`gen-api-types: wrote ${OUTPUT} (${body.length} bytes)\n`);
  return 0;
}

const code = await main();
process.exit(code);
