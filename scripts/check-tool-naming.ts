#!/usr/bin/env tsx
/**
 * Enforce the tool authoring conventions (CONTRIBUTING.md "Add a new tool").
 *
 * For every file under `src/application/tools/<domain>/*.tool.ts`:
 *
 *   1. The filename must be kebab-case and end in `.tool.ts`.
 *   2. The file must export exactly one `const <camelName>Tool` that
 *      matches the kebab filename (e.g. `list-scans.tool.ts` exports
 *      `listScansTool`).
 *   3. The exported tool's `name` literal must equal the snake_case form
 *      of the filename (e.g. `list-scans` -> `"list_scans"`).
 *   4. The export must have `name`, `description`, `inputSchema`, and
 *      `handler` properties.
 *
 * Files under `_shared/` are exempt (the Tool/ToolContext contracts live
 * there).
 *
 * The naming convention exists because:
 *
 *   - MCP clients display the tool list to humans, and consistent naming
 *     (snake_case verb_noun) makes the agent's job easier.
 *   - Grepping a tool by name across the repo MUST find exactly one file.
 *   - `1 file = 1 tool` mirrors the api `1 class = 1 file` rule.
 *
 * Exit code 0 = pass, 1 = violations found.
 */

import * as path from "node:path";
import * as process from "node:process";

import { Node, Project, SyntaxKind, type ExportedDeclarations } from "ts-morph";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const TOOLS_DIR = path.join(REPO_ROOT, "src", "application", "tools");

const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const REQUIRED_FIELDS = [
  "name",
  "description",
  "annotations",
  "inputSchema",
  "handler",
] as const;

interface Violation {
  readonly file: string;
  readonly rule: string;
  readonly message: string;
}

function kebabToCamel(kebab: string): string {
  return kebab.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function kebabToSnake(kebab: string): string {
  return kebab.replace(/-/g, "_");
}

async function main(): Promise<number> {
  const project = new Project({
    tsConfigFilePath: path.join(REPO_ROOT, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  const toolFiles = project.addSourceFilesAtPaths([
    `${TOOLS_DIR}/**/*.tool.ts`,
    `!${TOOLS_DIR}/_shared/**`,
  ]);

  if (toolFiles.length === 0) {
    console.log("No tool files yet — nothing to check.");
    return 0;
  }

  const violations: Violation[] = [];

  for (const sf of toolFiles) {
    const filePath = sf.getFilePath();
    const rel = path.relative(REPO_ROOT, filePath);
    const basename = path.basename(filePath, ".tool.ts");

    // Rule 1: kebab-case filename.
    if (!KEBAB.test(basename)) {
      violations.push({
        file: rel,
        rule: "filename-kebab",
        message: `Filename "${basename}.tool.ts" must be kebab-case, e.g. list-scans.tool.ts.`,
      });
      continue;
    }

    const expectedCamel = `${kebabToCamel(basename)}Tool`;
    const expectedSnake = kebabToSnake(basename);

    // Rule 2: file exports exactly one `const <expectedCamel>` named export.
    const exportedDecls = sf.getExportedDeclarations();
    const toolExport = exportedDecls.get(expectedCamel);
    if (!toolExport || toolExport.length === 0) {
      violations.push({
        file: rel,
        rule: "missing-export",
        message: `File must export a const named \`${expectedCamel}\` (camelCase of filename + "Tool").`,
      });
      continue;
    }

    // Type-only exports (TypeAlias / Interface) are fine — consumers
    // need them to import the input/output types. Only EXTRA RUNTIME
    // exports (const, function, class) are forbidden, because they'd
    // make the file do "more than one thing".
    const isRuntimeExport = (decls: readonly ExportedDeclarations[]): boolean =>
      decls.some(
        (d) =>
          Node.isVariableDeclaration(d) ||
          Node.isFunctionDeclaration(d) ||
          Node.isClassDeclaration(d) ||
          Node.isEnumDeclaration(d)
      );
    const extraRuntimeExports = Array.from(exportedDecls.entries())
      .filter(([name, decls]) => name !== expectedCamel && isRuntimeExport(decls))
      .map(([name]) => name);
    if (extraRuntimeExports.length > 0) {
      violations.push({
        file: rel,
        rule: "extra-exports",
        message:
          `Only \`${expectedCamel}\` may be a RUNTIME export. Found extra: ` +
          extraRuntimeExports.join(", ") +
          ` (type/interface exports are fine).`,
      });
    }

    // Rule 3+4: name literal matches expectedSnake; object has required fields.
    const decl = toolExport[0];
    if (!decl) continue;
    const initializer = Node.isVariableDeclaration(decl) ? decl.getInitializer() : undefined;
    if (!initializer || initializer.getKind() !== SyntaxKind.ObjectLiteralExpression) {
      violations.push({
        file: rel,
        rule: "shape",
        message: `\`${expectedCamel}\` must be initialised to an object literal.`,
      });
      continue;
    }

    const objLit = initializer.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
    const props = new Map<string, string>();
    for (const prop of objLit.getProperties()) {
      if (!Node.isPropertyAssignment(prop)) continue;
      const propName = prop.getName();
      props.set(propName, prop.getInitializerOrThrow().getText());
    }

    for (const required of REQUIRED_FIELDS) {
      if (!props.has(required)) {
        violations.push({
          file: rel,
          rule: "missing-field",
          message: `Tool object is missing required field: \`${required}\`.`,
        });
      }
    }

    const nameLiteral = props.get("name");
    if (nameLiteral !== undefined && nameLiteral !== `"${expectedSnake}"`) {
      violations.push({
        file: rel,
        rule: "name-mismatch",
        message:
          `Tool \`name\` must be "${expectedSnake}" (snake_case of filename), ` +
          `but file declares ${nameLiteral}.`,
      });
    }
  }

  if (violations.length === 0) {
    console.log(`check-tool-naming: ${toolFiles.length} tool file(s) OK.`);
    return 0;
  }

  console.error(`check-tool-naming: ${violations.length} violation(s):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}  [${v.rule}]  ${v.message}`);
  }
  console.error("\nSee CONTRIBUTING.md 'Add a new tool' for the full contract.");
  return 1;
}

const code = await main();
process.exit(code);
