#!/usr/bin/env tsx
/**
 * Enforce the "no module-level mutable state" tenant-isolation rule
 * (CONTRIBUTING.md "Tenant isolation" §1).
 *
 * Walks every `.ts` file under `src/` with `ts-morph` and fails on:
 *
 *   1. Module-level `let` or `var` declarations.
 *   2. Mutable `static` fields on classes (must be `static readonly` or
 *      instance state).
 *   3. Module-level `const` arrays / objects / Maps / Sets that are NOT
 *      passed through `Object.freeze` (heuristic: warns; tightened later).
 *
 * Composition roots (allowlisted below) are still required to use `const`
 * for their bindings — the rule is "no MUTABLE state", not "no state".
 * Even composition roots cannot use `let` at module scope.
 *
 * ESLint enforces rules 1 & 2 too via `no-restricted-syntax`. This script
 * exists as a belt-and-suspenders gate: ESLint configs can be relaxed by a
 * future contributor with a one-line override; this script ALSO has to be
 * relaxed, in a separate file, in the same MR, by name. Two locks beats one.
 *
 * Exit code 0 = pass, 1 = violations found.
 */

import * as path from "node:path";
import * as process from "node:process";

import { Node, Project, SyntaxKind } from "ts-morph";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC_DIR = path.join(REPO_ROOT, "src");

interface Violation {
  readonly file: string;
  readonly line: number;
  readonly rule: string;
  readonly message: string;
}

async function main(): Promise<number> {
  const project = new Project({
    tsConfigFilePath: path.join(REPO_ROOT, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  const sourceFiles = project.addSourceFilesAtPaths([
    `${SRC_DIR}/**/*.ts`,
    `!${SRC_DIR}/**/*.d.ts`,
    `!${SRC_DIR}/shared/api/openapi.ts`,
  ]);

  if (sourceFiles.length === 0) {
    console.log("No src/ files yet — nothing to check.");
    return 0;
  }

  const violations: Violation[] = [];

  for (const sf of sourceFiles) {
    const rel = path.relative(REPO_ROOT, sf.getFilePath());

    // Rule 1: module-level `let` / `var`.
    for (const stmt of sf.getVariableStatements()) {
      const kind = stmt.getDeclarationKind();
      if (kind === "let" || kind === "var") {
        violations.push({
          file: rel,
          line: stmt.getStartLineNumber(),
          rule: "no-module-let",
          message: `Module-level \`${kind}\` is forbidden. Use \`const\` at module scope.`,
        });
      }
    }

    // Rule 2: mutable static class fields.
    for (const cls of sf.getClasses()) {
      for (const prop of cls.getStaticProperties()) {
        if (!Node.isPropertyDeclaration(prop)) continue;
        const isReadonly = prop.isReadonly();
        const hasInitializer = prop.getInitializer() !== undefined;
        // `static readonly X = ...` is fine; mutable static is not.
        if (!isReadonly && hasInitializer) {
          violations.push({
            file: rel,
            line: prop.getStartLineNumber(),
            rule: "no-mutable-static-field",
            message:
              `Mutable static field \`${cls.getName() ?? "<anonymous>"}.${prop.getName()}\` ` +
              `is forbidden. Use \`static readonly\` or move to instance state.`,
          });
        }
      }
    }

    // Rule 3 (advisory for now): module-level Map/Set/Array literals
    // that are not Object.freeze()-wrapped and not in composition roots.
    // We log them as warnings via stderr; do not fail the build until
    // Phase 5 hardens this. The mere presence of these is suspicious in
    // multi-tenant code.
    for (const stmt of sf.getVariableStatements()) {
      if (stmt.getDeclarationKind() !== "const") continue;
      for (const decl of stmt.getDeclarations()) {
        const init = decl.getInitializer();
        if (!init) continue;
        if (
          init.getKind() === SyntaxKind.NewExpression &&
          /^new\s+(Map|Set|WeakMap|WeakSet)\b/.test(init.getText())
        ) {
          // Allowlisted in composition roots (they wire long-lived stores).
          if (
            rel.includes("/presentation/") &&
            (rel.endsWith("-bootstrap.ts") || rel.includes("/composition/"))
          ) {
            continue;
          }
          // Advisory only; don't increment violations.
          console.warn(
            `[advisory] ${rel}:${String(stmt.getStartLineNumber())} ` +
              `module-level mutable container (${init.getText().split("(")[0] ?? "?"}). ` +
              `If this holds tenant-scoped data, it MUST live inside a per-request ` +
              `closure, not at module scope.`
          );
        }
      }
    }
  }

  if (violations.length === 0) {
    console.log(`check-no-shared-state: ${sourceFiles.length} files OK.`);
    return 0;
  }

  console.error(`check-no-shared-state: ${violations.length} violation(s):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${String(v.line)}  [${v.rule}]  ${v.message}`);
  }
  console.error(
    "\nSee CONTRIBUTING.md 'Tenant isolation' §1 — no module-level mutable state. " +
      "This is a TENANT ISOLATION gate; failures are not optional."
  );
  return 1;
}

const code = await main();
process.exit(code);
