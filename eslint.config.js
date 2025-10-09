import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import stylistic from "@stylistic/eslint-plugin";

// Common rule sets for reuse
const commonUnicornRules = {
  "unicorn/prevent-abbreviations": "off",
  "unicorn/no-null": "off", // Allow null in some cases
  "unicorn/no-array-for-each": "off", // Allow forEach in some contexts
  "unicorn/no-negated-condition": "warn", // Allow negated conditions
  "unicorn/filename-case": "off", // Allow different filename cases
  "unicorn/prefer-ternary": ["error", "only-single-line"],
  "unicorn/no-nested-ternary": "off",
  "no-nested-ternary": "error",
};

const commonTypeScriptRules = {
  "@typescript-eslint/no-unused-vars": "error",
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/explicit-function-return-type": "off",
  "@typescript-eslint/explicit-module-boundary-types": "off",
  "@typescript-eslint/no-non-null-assertion": "warn",
};

const commonStylisticRules = {
  "@stylistic/brace-style": ["error", "1tbs"],
  "@stylistic/operator-linebreak": ["error", "after", { "overrides": { "?": "before", ":": "before" } }],
};

const testTypeScriptOverrides = {
  // Disable rules that require type information
  "@typescript-eslint/no-unnecessary-type-assertion": "off",
  "@typescript-eslint/consistent-type-assertions": "off",
};

const sourceTypeScriptRules = {
  // Discourage type assertions and encourage better typing
  "@typescript-eslint/consistent-type-assertions": [
    "error",
    {
      "assertionStyle": "as",
      "objectLiteralTypeAssertions": "never"
    }
  ],
  "@typescript-eslint/no-unnecessary-type-assertion": "error",
  "@typescript-eslint/prefer-as-const": "error",
};

const testRelaxedRules = {
  // TypeScript rules - more lenient for tests
  "@typescript-eslint/no-explicit-any": "off", // Allow any in tests for mocking
  "@typescript-eslint/no-unused-vars": "off", // Allow unused imports in tests (vi, beforeEach, etc.)
  "@typescript-eslint/no-non-null-assertion": "off", // Allow ! in tests

  // Unicorn rules - more lenient for tests
  "unicorn/prefer-bigint-literals": "off", // Allow BigInt() in tests
  "unicorn/numeric-separators-style": "off", // Allow different number formats in tests
  "unicorn/no-new-array": "off", // Allow new Array() in tests
  "unicorn/prefer-number-properties": "off", // Allow NaN, parseInt, etc. in tests
  "unicorn/no-useless-undefined": "off", // Allow explicit undefined in tests
  "unicorn/consistent-function-scoping": "off", // Allow nested functions in tests
  "unicorn/prefer-optional-catch-binding": "off", // Allow unused catch bindings in tests
  "unicorn/error-message": "off", // Allow errors without messages in tests
  "unicorn/prefer-global-this": "off", // Allow global over globalThis in tests
  "unicorn/switch-case-braces": "off", // Allow switch cases without braces in tests
  "unicorn/empty-brace-spaces": "off", // Allow spaces in empty braces in tests
  "unicorn/prefer-string-raw": "off", // Allow regular strings with escapes in tests
  "unicorn/prefer-node-protocol": "off", // Allow old import style in tests
  "unicorn/new-for-builtins": "off", // Allow new String(), new Number(), etc. in tests

  // Core ESLint rules - more lenient for tests
  "@typescript-eslint/no-unused-expressions": "off", // Allow unused expressions in tests
  "prefer-const": "off", // Allow let instead of const in tests
};

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  stylistic.configs.customize({
    quotes: "single",
    semi: true,
    jsx: false,
  }),
  {
    files: ["src/**/*.ts"],
    ignores: ["**/__tests__/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...commonUnicornRules,
      ...commonTypeScriptRules,
      ...sourceTypeScriptRules,
      ...commonStylisticRules,
    },
  },
  // Configuration for test files
  {
    files: ["**/__tests__/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    rules: {
      ...commonUnicornRules,
      ...commonTypeScriptRules,
      ...testTypeScriptOverrides,
      ...commonStylisticRules,
      ...testRelaxedRules,
    },
  },
  {
    ignores: [
      "eslint.config.js",
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "docs/.vitepress/dist/**",
      "examples/**",
      "scripts/**",
    ],
  },
];
