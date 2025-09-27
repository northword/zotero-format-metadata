import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: [
        "src/modules/rules/*.ts",
      ],
      exclude: [
        "src/modules/rules/_*.ts",
        "src/modules/rules/index.ts",
        "src/modules/rules/rule-base.ts",
      ],
      reporter: ["json-summary", "text", "html"],
    },
  },
});
