// @ts-check

/**
 * ESLint flat config for @kaminari-ad/mcp.
 *
 * Quality bar: stricter than internal Python repos because this code ships
 * to npm and runs as a hosted multi-tenant HTTP server. Every rule choice
 * below is intentional. If you disable a rule, document why in this file.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import jsdoc from "eslint-plugin-jsdoc";
import noSecrets from "eslint-plugin-no-secrets";
import promise from "eslint-plugin-promise";
import security from "eslint-plugin-security";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unicorn from "eslint-plugin-unicorn";
import vitest from "eslint-plugin-vitest";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  // ── 1. Global ignores ──────────────────────────────────────────────
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      ".tsbuildinfo",
      "src/infrastructure/api/openapi.ts", // generated
    ],
  },

  // ── 2. Base recommended ────────────────────────────────────────────
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // ── 3. Plugins + type-checked language options ─────────────────────
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
      promise,
      unicorn,
      security,
      "no-secrets": noSecrets,
      jsdoc,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
        node: true,
      },
    },
  },

  // ── 4. Core rules for ALL TypeScript files ─────────────────────────
  {
    files: ["**/*.ts", "**/*.mts"],
    rules: {
      // === Type strictness ===
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        { allowExpressions: false, allowTypedFunctionExpressions: true },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-non-null-assertion": "error",

      // === Cast / ignore discipline ===
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          "ts-check": false,
          minimumDescriptionLength: 10,
        },
      ],
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/prefer-readonly-parameter-types": "off", // ergonomic burden; we use readonly on types directly

      // === Promise / async discipline ===
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/promise-function-async": "error",
      "promise/no-return-wrap": "error",
      "promise/no-nesting": "warn",
      "promise/no-promise-in-callback": "warn",

      // === Import discipline ===
      "import/no-cycle": ["error", { maxDepth: 10 }],
      "import/no-self-import": "error",
      "import/no-default-export": "error", // named exports only — better grep / refactor
      "import/no-duplicates": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // === No global mutable state — TENANT ISOLATION HARD RULE ===
      "no-restricted-syntax": [
        "error",
        {
          selector: "Program > VariableDeclaration[kind='let']",
          message:
            "Module-level `let` is forbidden (tenant-isolation rule). Use `const` only at module scope; mutate inside functions or closures bound to a request.",
        },
        {
          selector: "Program > VariableDeclaration[kind='var']",
          message: "`var` is forbidden anywhere. Use `const` (or `let` inside a function body).",
        },
        {
          selector: "ClassProperty[static=true]:not([readonly=true])",
          message:
            "Mutable `static` class fields are forbidden (tenant-isolation rule). Use `static readonly` or move to instance state.",
        },
      ],
      "no-var": "error",
      "prefer-const": "error",

      // === Logging discipline ===
      "no-console": "error",

      // === Secrets ===
      "no-secrets/no-secrets": ["error", { tolerance: 4.2 }],

      // === Unicorn (curated) ===
      "unicorn/prefer-node-protocol": "error",
      "unicorn/no-null": "off", // null is meaningful (distinct from undefined)
      "unicorn/prevent-abbreviations": "off", // ctx, args, req, etc. are clearer than full words
      "unicorn/no-array-reduce": "off",
      "unicorn/no-await-expression-member": "off",
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      "unicorn/no-process-exit": "off", // bin.ts is allowed to exit
      "unicorn/prefer-top-level-await": "off",

      // === Security ===
      "security/detect-object-injection": "off", // too noisy on typed code

      // === JSDoc on public surface ===
      "jsdoc/require-jsdoc": [
        "warn",
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
        },
      ],
      "jsdoc/require-description": "warn",
      "jsdoc/no-types": "error", // types live in TS, not JSDoc

      // === General ===
      "no-debugger": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      curly: ["error", "all"],
      "no-throw-literal": "error",
      "@typescript-eslint/only-throw-error": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // ── 5. Architectural boundary: tools MUST NOT import infrastructure ─
  {
    files: ["src/application/tools/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/infrastructure/**", "../infrastructure/**", "../../infrastructure/**"],
              message:
                "Tools belong to the application layer and must depend only on `domain/ports/*`. Take dependencies via ToolContext.",
            },
            {
              group: ["**/presentation/**"],
              message: "Tools must not import from the presentation layer.",
            },
          ],
        },
      ],
    },
  },

  // ── 6. Architectural boundary: domain MUST NOT import outward ──────
  {
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/infrastructure/**",
                "**/application/**",
                "**/presentation/**",
                "../infrastructure/**",
                "../application/**",
                "../presentation/**",
              ],
              message:
                "Domain layer is the inner core — it depends on nothing outward. Define ports here; let infrastructure implement them.",
            },
          ],
        },
      ],
    },
  },

  // ── 7. Composition roots: allowed to wire everything ───────────────
  {
    files: [
      "src/presentation/**/bootstrap*.ts",
      "src/bin.ts",
    ],
    rules: {
      // Composition roots are the ONLY place where module-level state
      // construction is OK (still all `const`). The shared-state CI
      // gate has the allowlist for these files too.
    },
  },

  // ── 8. Test files: looser rules ────────────────────────────────────
  {
    files: ["tests/**/*.ts", "scripts/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/consistent-type-assertions": "off",
      "jsdoc/require-jsdoc": "off",
      "no-console": "off",
      "no-secrets/no-secrets": "off",
      "import/no-default-export": "off",
      "no-restricted-imports": "off",
    },
  },

  // ── 9. Config files: looser (CommonJS / dynamic config) ────────────
  {
    files: ["*.config.js", "*.config.ts", "*.config.mts", "*.config.cjs"],
    rules: {
      "import/no-default-export": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // ── 10. Prettier last — disables stylistic rules Prettier handles ──
  prettier,
);
