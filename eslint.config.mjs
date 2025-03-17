import antfu from "@antfu/eslint-config";
import { specialCases } from "@zotero-plugin/eslint-config";
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
      "data",
      // 暂时忽略，待 @zotero-chinese/eslint-config 适配完成
      "tests",
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
).append(specialCases);
