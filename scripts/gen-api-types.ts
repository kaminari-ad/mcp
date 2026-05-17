#!/usr/bin/env tsx
/**
 * Generate TypeScript types AND runtime zod schemas for the Kaminari
 * Ad `/api/v1` surface from its OpenAPI document.
 *
 * Outputs:
 *   - `src/shared/api/openapi.ts`     — `openapi-typescript` types
 *   - `src/shared/api/zod-schemas.ts` — `openapi-zod-client` schemas +
 *     a `Zodios` endpoint catalogue (used by `http-api-gateway.ts`
 *     for both response validation and, in a follow-up phase, the
 *     type-safe HTTP client itself).
 *
 * Both files derive from the SAME live OpenAPI document, fetched once,
 * so they cannot drift relative to each other. CI drift-checks both
 * files: if the API spec changed but either file wasn't regenerated,
 * `git diff` fails.
 *
 * Usage:
 *   npm run gen:api-types                                       # default URL
 *   API_OPENAPI_URL=http://localhost:8000/openapi.json \
 *     npm run gen:api-types                                     # override source
 *
 * The generator is intentionally not auto-run on every CI build —
 * that would couple this repo's CI to the API's runtime availability.
 * The MR that updates `/api/v1` is responsible for running this
 * script and committing the regenerated files.
 */

import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import process from "node:process";

import openapiTS, { astToString } from "openapi-typescript";
import { generateZodClientFromOpenAPI } from "openapi-zod-client";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const TS_OUTPUT = path.join(REPO_ROOT, "src", "shared", "api", "openapi.ts");
const ZOD_OUTPUT = path.join(REPO_ROOT, "src", "shared", "api", "zod-schemas.ts");
const DEFAULT_URL = "https://app.kaminari.ad/openapi.json";

function tsHeader(): string {
  return `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Source : ${DEFAULT_URL} (the live URL is the canonical source;
 *          regen happens via \`npm run gen:api-types\`).
 * Tool   : openapi-typescript
 *
 * CI diffs this file against the committed copy; mismatches fail the
 * build, forcing the API-changing MR to bring this file along.
 */

/* eslint-disable */

`;
}

function zodHeader(): string {
  return `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Source : ${DEFAULT_URL} (regen via \`npm run gen:api-types\`).
 * Tool   : openapi-zod-client
 *
 * Exposes runtime zod schemas for every \`#/components/schemas/X\`
 * plus a Zodios \`endpoints\` definition for every \`/api/v1\` route.
 * The MCP HTTP gateway uses \`schemas.X.safeParse(raw)\` at the
 * response boundary so a future API drift surfaces as a typed
 * \`upstream\` MCP error (with the zod issue message), not as a
 * runtime \`undefined.id\` crash.
 *
 * CI drift-checks this file the same way it drift-checks openapi.ts.
 */

/* eslint-disable */

`;
}

async function fetchSpec(url: string): Promise<{ raw: unknown; text: string }> {
  process.stderr.write(`gen-api-types: pulling ${url}\n`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${String(res.status)} fetching ${url}`);
  }
  const text = await res.text();
  const raw = JSON.parse(text) as unknown;
  return { raw, text };
}

async function writeTypes(text: string): Promise<void> {
  // openapi-typescript can read a URL or a string. Hand it the cached
  // text so we don't re-fetch.
  const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), "openapi-"));
  const tmpfile = path.join(tmpdir, "openapi.json");
  try {
    await fs.writeFile(tmpfile, text, "utf8");
    const ast = await openapiTS(new URL(`file://${tmpfile}`));
    const body = astToString(ast);
    await fs.writeFile(TS_OUTPUT, tsHeader() + body, "utf8");
    process.stderr.write(`gen-api-types: wrote ${TS_OUTPUT} (${String(body.length)} bytes)\n`);
  } finally {
    await fs.rm(tmpdir, { recursive: true, force: true });
  }
}

async function writeZodSchemas(spec: unknown): Promise<void> {
  // openapi-zod-client returns a single TS string with:
  //   - every schema as a top-level `const X = z.object({...}).passthrough()`,
  //   - an `export const schemas = { X, Y, ... }` re-export bag,
  //   - a `Zodios` `endpoints` array + `api` client.
  //
  // We use ONLY the `schemas` bag for response validation. The
  // Zodios runtime is dropped (see below) — the MCP gateway uses
  // `openapi-fetch`, so pulling Zodios + transitive axios + form-data
  // would bloat the published bundle by ~100 KB AND break execution
  // (axios's `form-data` uses CJS `require("util")`, which tsup's
  // ESM bundle cannot resolve at runtime → "Dynamic require of util
  // is not supported" crash on first run).
  const raw = await generateZodClientFromOpenAPI({
    openApiDoc: spec as Parameters<typeof generateZodClientFromOpenAPI>[0]["openApiDoc"],
    disableWriteToFile: true,
    options: {
      withImplicitRequiredProps: false,
      withDeprecatedEndpoints: false,
      additionalPropertiesDefaultValue: true,
      shouldExportAllSchemas: true,
      shouldExportAllTypes: false,
    },
  });
  const body = stripZodiosRuntime(raw);
  await fs.writeFile(ZOD_OUTPUT, zodHeader() + body, "utf8");
  process.stderr.write(`gen-api-types: wrote ${ZOD_OUTPUT} (${String(body.length)} bytes)\n`);
}

/**
 * Strip the Zodios runtime surface (`makeApi` import, `endpoints`
 * array, `api` instance, `createApiClient` helper) from the
 * generated body. Leaves all `const X = z.object(...)` declarations
 * and the `schemas` bag intact — that's the only surface the MCP
 * runtime needs. See {@link writeZodSchemas} for the why.
 */
function stripZodiosRuntime(source: string): string {
  // 1. Replace the Zodios import line with a zod-only import.
  let out = source.replace(
    /import\s*\{\s*makeApi,\s*Zodios,\s*type\s+ZodiosOptions\s*\}\s*from\s*"@zodios\/core";\s*\n/,
    ""
  );
  // 2. Drop everything from the `endpoints` declaration onwards
  //    (endpoints array + api instance + createApiClient export).
  //    These are the only references to Zodios in the generated file.
  const endpointsIdx = out.indexOf("const endpoints = makeApi(");
  if (endpointsIdx !== -1) {
    out = out.slice(0, endpointsIdx).replace(/\n+$/, "\n");
  }
  return out;
}

async function main(): Promise<number> {
  const source = process.env["API_OPENAPI_URL"] ?? DEFAULT_URL;
  try {
    const { raw, text } = await fetchSpec(source);
    await writeTypes(text);
    await writeZodSchemas(raw);
    return 0;
  } catch (cause) {
    process.stderr.write(
      `gen-api-types: failed: ${cause instanceof Error ? cause.message : String(cause)}\n`
    );
    return 1;
  }
}

const code = await main();
process.exit(code);
