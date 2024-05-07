import pluginJs from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        name: "client",
        files: ["**/*.ts"],
        languageOptions: { globals: globals.browser },
    },

    {
        name: "node",
        files: [
            "scripts/**/*.mjs",
            "scripts/**/*.cjs",
            "scripts/**/*.js",
            "scripts/**/*.mts",
            "scripts/**/*.cts",
            "scripts/**/*.ts",
        ],
        languageOptions: { globals: globals.node },
    },

    {
        name: "all",
        // files: ["**/*.ts", "scripts/**/*.mjs"],
        ignores: ["addon/**", "**/build/**", "*/dist/**", "**/node_modules/**", "*.cjs"],
        extends: [pluginJs.configs.recommended, ...tseslint.configs.recommended, prettier],
        rules: {
            "sort-imports": [
                "off",
                {
                    ignoreCase: true,
                },
            ],
            "@typescript-eslint/ban-ts-comment": [
                "warn",
                {
                    "ts-expect-error": "allow-with-description",
                    "ts-ignore": "allow-with-description",
                    "ts-nocheck": "allow-with-description",
                    "ts-check": "allow-with-description",
                },
            ],
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
        },
    },
);
