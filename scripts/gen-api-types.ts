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
 * so they cannot drift relative to each other. Neither is checked
 * against the live API by CI — see "not auto-run" below.
 *
 * Usage:
 *   npm run gen:api-types                                       # default URL
 *   API_OPENAPI_URL=http://localhost:8000/openapi.json \
 *     npm run gen:api-types                                     # override source
 *
 * The generator is intentionally not auto-run on every CI build —
 * that would couple this repo's CI to the API's runtime availability.
 * There is therefore no drift gate: the MR that updates `/api/v1` is
 * responsible for running this script and committing both regenerated
 * files, and review is the only thing that catches a missed regen.
 */

import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import process from "node:process";

import openapiTS, { astToString } from "openapi-typescript";
import { generateZodClientFromOpenAPI } from "openapi-zod-client";
import * as prettier from "prettier";

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
 * Regen is manual and ungated: no CI job diffs this file against the
 * live spec, so the MR that changes \`/api/v1\` must bring it along.
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
 * Regen is manual and ungated, same as openapi.ts.
 */

/* eslint-disable */

`;
}

/**
 * Write `source` to `target`, Prettier-formatted with the repo config.
 *
 * Both generators emit 4-space TypeScript, while `format:check` covers
 * `src/**` — so writing the raw output makes `make check` fail and
 * produces a ~17k-line indentation diff that buries the real schema
 * change. Formatting here keeps a no-op regen a no-op.
 */
async function writeFormatted(target: string, source: string): Promise<void> {
  const options = await prettier.resolveConfig(target);
  const formatted = await prettier.format(source, { ...options, filepath: target });
  await fs.writeFile(target, formatted, "utf8");
  process.stderr.write(`gen-api-types: wrote ${target} (${String(formatted.length)} bytes)\n`);
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
    await writeFormatted(TS_OUTPUT, tsHeader() + astToString(ast));
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
  await writeFormatted(ZOD_OUTPUT, zodHeader() + stripZodiosRuntime(raw));
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
