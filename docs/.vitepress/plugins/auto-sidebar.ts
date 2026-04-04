import fs from "node:fs";
import path from "node:path";

export default function generateRulesSidebar() {
  return {
    name: "generate-rules-sidebar",
    buildStart() {
      const rulesDir = path.resolve("docs/rules");
      const files = fs.readdirSync(rulesDir)
        .filter(f => f.endsWith(".md") && !f.startsWith("_") && f !== "index.md")
        .sort();

      const items = files.map((file) => {
        const filePath = path.join(rulesDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const titleMatch = content.match(/^# (.+)$/m);
        const title = titleMatch ? titleMatch[1] : file.replace(".md", "");
        const link = `/rules/${file.replace(".md", "")}`;
        return { text: title, link };
      });

      const itemsStr = JSON.stringify(items, null, 2);
      const existing = fs.readFileSync("./docs/.vitepress/sidebar.json").toString();

      if (existing !== itemsStr)
        fs.writeFileSync("./docs/.vitepress/sidebar.json", itemsStr);
    },
  };
}
