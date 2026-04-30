import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import onlyWarn from "eslint-plugin-only-warn";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
    "node_modules/**/*",
    "build/**/*",
    "server/**/*",
    "**/__tests__/*",
    "scripts/**/*",
    "**/service-worker.js",
]), {
    extends: fixupConfigRules(compat.extends(
        "airbnb",
        "airbnb-typescript",
        "airbnb/hooks",
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
    )),

    plugins: {
        "only-warn": onlyWarn,
        react,
        "react-hooks": fixupPluginRules(reactHooks),
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        import: fixupPluginRules(_import),
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: 12,
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },

            project: "./tsconfig.json",
        },
    },

    settings: {
        "import/resolver": {
            typescript: {},
        },

        react: {
            version: "detect",
        },
    },

    rules: {
        "no-use-before-define": "off",
        "@typescript-eslint/no-use-before-define": ["error"],

        "react/jsx-filename-extension": ["warn", {
            extensions: [".tsx"],
        }],

        "import/extensions": ["error", "ignorePackages", {
            ts: "never",
            tsx: "never",
        }],

        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "react/prop-types": "off",

        "import/no-extraneous-dependencies": ["error", {
            devDependencies: true,
        }],

        "max-len": ["warn", {
            code: 180,
        }],

        "@typescript-eslint/explicit-module-boundary-types": "off",
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",

        "import/newline-after-import": ["error", {
            count: 1,
        }],

        "import/prefer-default-export": "off",
        "import/no-cycle": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "react/jsx-props-no-spreading": "off",
        "react/destructuring-assignment": "off",
        "react/button-has-type": "off",

        "react/function-component-definition": ["warn", {
            namedComponents: "arrow-function",
            unnamedComponents: "arrow-function",
        }],

        "react/jsx-no-bind": "off",
        "react/require-default-props": "off",
        "jsx-a11y/label-has-associated-control": "off",
        "jsx-a11y/click-events-have-key-events": "off",
        "jsx-a11y/no-noninteractive-element-interactions": "off",
        "no-plusplus": "off",
        "no-param-reassign": "off",
        "jsx-a11y/anchor-is-valid": "off",
    },
}]);