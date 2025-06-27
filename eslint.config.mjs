// @ts-check

import antfu from "@antfu/eslint-config";
import { ignores, specialCases, test } from "@zotero-plugin/eslint-config";
import format from "eslint-plugin-format";

// export default zotero();

export default antfu(
  {
    stylistic: {
      semi: true,
      quotes: "double",
    },
    formatters: true,
    javascript: { },
    ignores: [
      "addon/lib/**",
      "data",
    ],
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
  {
    files: ["**/*.spec.ts"],
    rules: {
      "prefer-arrow-callback": "off",
    },

  },
).append(specialCases, test, ignores);
