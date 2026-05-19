import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import onlyWarn from "eslint-plugin-only-warn";
import react from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

export default defineConfig([
  globalIgnores([
    "node_modules/",
    "build/",
    "dist/",
    "server/",
    "docs/.astro/",
    "docs/dist/",
    "scripts/",
    "cypress/screenshots/",
    "src/service-worker.js",
  ]),

  js.configs.recommended,

  {
    files: ["src/**/*.{ts,tsx}", "cypress/**/*.{ts,tsx}", "*.config.{ts,js,mjs}"],

    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      "only-warn": onlyWarn,
      react,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
      "@typescript-eslint": tsPlugin,
    },

    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: true,
      },
    },

    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...jsxA11y.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,

      "@typescript-eslint/no-duplicate-enum-values": "off", // temp
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ]
    },
  },

  {
    files: ["src/**/*.{test,spec}.{ts,tsx}", "src/**/__tests__/**/*.{ts,tsx}", "src/setupTests.ts"],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
  },

  {
    files: ["*.config.{ts,js,mjs}", "vite-env*.d.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  prettier,
]);
