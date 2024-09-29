import antfu from "@antfu/eslint-config";
import format from "eslint-plugin-format";

export default antfu(
  {
    stylistic: {
      semi: true,
      quotes: "double",
    },
    formatters: true,
    javascript: {
      overrides: {
        "no-restricted-globals": ["error", "window", "document"],
      },
    },
    ignores: [
      "addon/lib/**",
      "src/data/**/*.json",
      "src/data/**/*.html",
      "src/data/journal-abbr/jabref-abbr/**",
    ],
  },
  {
    files: ["**/bootstrap.js", "**/prefs.js"],
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "unused-imports/no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.xhtml"],
    languageOptions: {
      parser: format.parserPlain,
    },
    plugins: {
      format,
    },
    rules: {
      "format/prettier": ["error", {
        parser: "html",
        languageOptions: {
          htmlWhitespaceSensitivity: "css",
          singleAttributePerLine: true,
        },
      }],
    },
  },
);
