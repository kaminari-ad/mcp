#!/usr/bin/env tsx
/**
 * Enforce that the hand-written gateway keeps up with the generated
 * `/api/v1` surface, at two levels:
 *
 *   1. **Paths** — every `/api/v1` path + method in
 *      `src/shared/api/openapi.ts` is reachable from a call expression
 *      in `src/infrastructure/api/http-api-gateway.ts`.
 *   2. **Query parameters** — for each of those operations, every
 *      declared query parameter is representable by the gateway
 *      method: either a parameter of that name, or a property of one
 *      of its parameter types (the `List*Filters` interfaces in
 *      `domain/ports/api-gateway.ts`, `extends` chains included).
 *
 * Why both. The generated types were fully current when KAMIAD-158 was
 * filed, yet four endpoints had no gateway method and six tools were
 * missing filters the API had grown — a path-only gate would have
 * passed on that state. Level 2 is the half that catches the filters.
 *
 * Known limitation: this checks the GATEWAY, so an endpoint with a
 * gateway method but no registered tool still passes. Requiring a
 * `tool-registry.ts` entry per gateway method would close that; it is
 * a reasonable follow-up, not a reason to skip the two levels here.
 *
 * Exit code 0 = pass, 1 = violations found.
 */

import * as path from "node:path";
import * as process from "node:process";

import { Node, Project, type PropertySignature, SyntaxKind, type Type } from "ts-morph";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OPENAPI_FILE = path.join(REPO_ROOT, "src", "shared", "api", "openapi.ts");
const GATEWAY_FILE = path.join(REPO_ROOT, "src", "infrastructure", "api", "http-api-gateway.ts");
const PORT_FILE = path.join(REPO_ROOT, "src", "domain", "ports", "api-gateway.ts");

const HTTP_METHODS = ["get", "put", "post", "delete", "patch"] as const;
const V1_PREFIX = "/api/v1";

/**
 * Operations intentionally absent from the gateway, keyed
 * `METHOD path`. Each entry needs a reason — an unexplained entry is
 * indistinguishable from the drift this gate exists to catch.
 */
const EXEMPT_OPERATIONS: Readonly<Record<string, string>> = {
  // Anonymous marketing-form intake for our own public site, not a
  // product API. The api moved them to `/api/forms/*` with
  // `include_in_schema=False`; these two entries drop out of the spec
  // (and out of this list) on the next regen after that deploys.
  "POST /api/v1/contact": "anonymous marketing form, not an agent capability",
  "POST /api/v1/demo-inquiries": "anonymous marketing form, not an agent capability",
};

/**
 * Query parameters an operation declares but the gateway deliberately
 * does not forward, keyed `METHOD path#param` — e.g.
 * `"GET /api/v1/scans#some_param": "reason"`. Empty today: every v1
 * query parameter is reachable.
 */
const EXEMPT_QUERY_PARAMS: Readonly<Record<string, string>> = {
  // `InvoiceFilters` is shared with the admin listing, which is where
  // `organization_id` is honoured. On the org-scoped v1 route the use
  // case always derives the org from the AuthContext and ignores the
  // field, so forwarding it would suggest a cross-org read that
  // cannot happen. See `api/src/app/invoicing/application/dto/
  // invoice_filters.py`.
  "GET /api/v1/invoices#organization_id": "no-op on v1; admin-only filter on a shared DTO",
};

interface Operation {
  readonly method: string;
  readonly path: string;
  readonly queryParams: readonly string[];
}

interface Violation {
  readonly key: string;
  readonly reason: string;
}

/** `paths` entries whose method is a real operation, not `?: never`. */
function collectOperations(project: Project): readonly Operation[] {
  const sourceFile = project.addSourceFileAtPath(OPENAPI_FILE);
  const pathsInterface = sourceFile.getInterfaceOrThrow("paths");
  const operations: Operation[] = [];

  for (const member of pathsInterface.getProperties()) {
    const apiPath = unquote(member.getName());
    if (!apiPath.startsWith(V1_PREFIX)) continue;
    const literal = member.getTypeNodeOrThrow();
    if (!Node.isTypeLiteral(literal)) continue;

    for (const methodProp of literal.getProperties()) {
      const method = methodProp.getName();
      if (!isHttpMethod(method)) continue;
      // `get?: never` means the API does not implement it.
      if (methodProp.hasQuestionToken()) continue;
      operations.push({
        method: method.toUpperCase(),
        path: apiPath,
        queryParams: queryParamsOf(methodProp),
      });
    }
  }
  return operations;
}

function isHttpMethod(name: string): boolean {
  return (HTTP_METHODS as readonly string[]).includes(name);
}

/**
 * Query parameter names for one `paths[path][method]` member.
 *
 * The member's type is an `operations["…"]` indexed access, so it has
 * to be resolved through the checker: the path entry's own
 * `parameters.query` is `never` on every route openapi-typescript
 * emits, and reading that instead silently turns level 2 into a no-op.
 */
function queryParamsOf(methodProp: PropertySignature): readonly string[] {
  const parameters = methodProp.getType().getProperty("parameters");
  if (parameters === undefined) return [];
  const query = parameters.getTypeAtLocation(methodProp).getProperty("query");
  if (query === undefined) return [];
  return query
    .getTypeAtLocation(methodProp)
    .getNonNullableType()
    .getProperties()
    .map((p) => p.getName());
}

/**
 * Path templates the gateway reaches, per HTTP method.
 *
 * Two call styles exist and both are read from the call expression
 * itself, never as a bare substring — a path mentioned only in a
 * comment must not satisfy this gate:
 *   - `call("GET", "/api/v1/scans", …)` — method + literal path;
 *   - `binaryGet(\`/api/v1/scans/${id}/screenshot\`)` — implicit GET,
 *     interpolations normalised to the `{param}` placeholder form.
 */
function collectGatewayRoutes(project: Project): ReadonlyMap<string, string> {
  const sourceFile = project.addSourceFileAtPath(GATEWAY_FILE);
  const routes = new Map<string, string>();

  for (const callExpr of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const callee = callExpr.getExpression().getText();
    const args = callExpr.getArguments();
    const enclosing = enclosingMethodName(callExpr);

    if (callee === "call" && args.length >= 2) {
      const method = literalText(args[0]);
      const apiPath = literalText(args[1]);
      if (method !== undefined && apiPath !== undefined) {
        routes.set(`${method.toUpperCase()} ${apiPath}`, enclosing);
      }
      continue;
    }
    if (callee === "binaryGet" && args.length >= 1) {
      const apiPath = pathFromTemplate(args[0]);
      if (apiPath !== undefined) {
        routes.set(`GET ${apiPath}`, enclosing);
      }
    }
  }
  return routes;
}

function enclosingMethodName(node: Node): string {
  const method = node.getFirstAncestor(
    (a) => Node.isMethodDeclaration(a) || Node.isPropertyAssignment(a)
  );
  return method === undefined ? "<unknown>" : (method.getSymbol()?.getName() ?? "<unknown>");
}

function literalText(node: Node | undefined): string | undefined {
  if (node === undefined) return undefined;
  return Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)
    ? node.getLiteralText()
    : undefined;
}

/**
 * Normalise a template-literal path to the spec's placeholder shape:
 * `` `/api/v1/scans/${scanId}/screenshot` `` -> `/api/v1/scans/{scan_id}/screenshot`.
 *
 * The placeholder NAME is not recoverable from the interpolation (the
 * gateway uses camelCase locals), so every segment becomes `{}` and
 * the spec side is normalised the same way before comparison.
 */
function pathFromTemplate(node: Node | undefined): string | undefined {
  if (node === undefined) return undefined;
  const literal = literalText(node);
  if (literal !== undefined) return literal;
  if (!Node.isTemplateExpression(node)) return undefined;
  let out = node.getHead().getLiteralText();
  for (const span of node.getTemplateSpans()) {
    out += `{}${span.getLiteral().getLiteralText()}`;
  }
  return out;
}

/** Replace `{anything}` with `{}` so both sides compare equal. */
function normalisePath(apiPath: string): string {
  return apiPath.replace(/\{[^}]*\}/g, "{}");
}

/**
 * Names the gateway method can carry for one operation: its own
 * parameter names plus every property of each parameter's type, with
 * `extends` chains resolved by the type checker.
 */
function gatewayParamNames(project: Project, methodName: string): ReadonlySet<string> {
  const names = new Set<string>();
  const gateway = project.addSourceFileAtPath(GATEWAY_FILE);
  const port = project.addSourceFileAtPath(PORT_FILE);

  for (const sourceFile of [gateway, port]) {
    for (const declaration of sourceFile.getDescendants()) {
      const isCandidate =
        (Node.isPropertyAssignment(declaration) ||
          Node.isMethodDeclaration(declaration) ||
          Node.isMethodSignature(declaration)) &&
        declaration.getSymbol()?.getName() === methodName;
      if (!isCandidate) continue;
      for (const param of parametersOf(declaration)) {
        names.add(param.name);
        for (const prop of param.type.getNonNullableType().getProperties()) {
          names.add(prop.getName());
        }
      }
    }
  }
  return names;
}

function parametersOf(node: Node): readonly { name: string; type: Type }[] {
  const fn = Node.isPropertyAssignment(node) ? node.getInitializer() : node;
  if (fn === undefined) return [];
  if (
    !Node.isMethodDeclaration(fn) &&
    !Node.isMethodSignature(fn) &&
    !Node.isFunctionExpression(fn) &&
    !Node.isArrowFunction(fn)
  ) {
    return [];
  }
  return fn.getParameters().map((p) => ({ name: p.getName(), type: p.getType() }));
}

function unquote(name: string): string {
  return name.replace(/^["']|["']$/g, "");
}

async function main(): Promise<number> {
  const project = new Project({
    tsConfigFilePath: path.join(REPO_ROOT, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  const operations = collectOperations(project);
  if (operations.length === 0) {
    console.error("check-api-coverage: parsed 0 operations from openapi.ts — the generated");
    console.error("shape changed and this gate degraded to a no-op. Fix the walk.");
    return 1;
  }

  const routes = collectGatewayRoutes(project);
  const normalisedRoutes = new Map(
    [...routes.entries()].map(([key, methodName]) => {
      const [httpMethod, ...rest] = key.split(" ");
      return [`${String(httpMethod)} ${normalisePath(rest.join(" "))}`, methodName];
    })
  );

  const missingPaths: Violation[] = [];
  const missingParams: Violation[] = [];

  for (const operation of operations) {
    const key = `${operation.method} ${operation.path}`;
    if (key in EXEMPT_OPERATIONS) continue;

    const gatewayMethod = normalisedRoutes.get(
      `${operation.method} ${normalisePath(operation.path)}`
    );
    if (gatewayMethod === undefined) {
      missingPaths.push({ key, reason: "no gateway call expression reaches this path" });
      continue;
    }
    if (operation.queryParams.length === 0) continue;

    const available = gatewayParamNames(project, gatewayMethod);
    for (const param of operation.queryParams) {
      if (`${key}#${param}` in EXEMPT_QUERY_PARAMS) continue;
      if (available.has(param)) continue;
      missingParams.push({
        key: `${key}#${param}`,
        reason: `\`${gatewayMethod}\` cannot forward it`,
      });
    }
  }

  if (missingPaths.length === 0 && missingParams.length === 0) {
    console.log(
      `check-api-coverage: ${String(operations.length)} v1 operation(s) covered ` +
        `(${String(Object.keys(EXEMPT_OPERATIONS).length)} exempt).`
    );
    return 0;
  }

  if (missingPaths.length > 0) {
    console.error(`\nUnreachable /api/v1 operations (${String(missingPaths.length)}):\n`);
    for (const v of missingPaths) console.error(`  ${v.key}  — ${v.reason}`);
    console.error(
      "\nFix: add the method to `ApiGateway` + `http-api-gateway.ts` (plus a parser,\n" +
        "a fake, and a tool), or add a justified entry to EXEMPT_OPERATIONS.\n"
    );
  }
  if (missingParams.length > 0) {
    console.error(`\nUnforwardable query parameters (${String(missingParams.length)}):\n`);
    for (const v of missingParams) console.error(`  ${v.key}  — ${v.reason}`);
    console.error(
      "\nFix: add the field to the gateway method's `*Filters` type in\n" +
        "`domain/ports/api-gateway.ts` and surface it on the tool, or add a\n" +
        "justified entry to EXEMPT_QUERY_PARAMS.\n"
    );
  }
  return 1;
}

const code = await main();
process.exit(code);
