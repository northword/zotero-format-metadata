import { copyFileSync } from "node:fs";
import { env } from "node:process";
import { defineConfig } from "zotero-plugin-scaffold";
import pkg from "./package.json";

export default defineConfig({
  source: ["src", "addon"],
  dist: "build",
  name: pkg.config.addonName,
  id: pkg.config.addonID,
  namespace: pkg.config.addonRef,
  updateURL: `https://raw.githubusercontent.com/northword/zotero-format-metadata/main/${
    pkg.version.includes("-") ? "update-beta.json" : "update.json"
  }`,
  xpiDownloadLink: "https://github.com/{{owner}}/{{repo}}/releases/download/v{{version}}/{{xpiName}}.xpi",

  server: {
    // asProxy: true,
  },

  build: {
    assets: ["addon/**/*.*"],
    define: {
      ...pkg.config,
      author: pkg.author,
      description: pkg.description,
      homepage: pkg.homepage,
      buildVersion: pkg.version,
      buildTime: "{{buildTime}}",
    },
    esbuildOptions: [
      {
        entryPoints: ["src/index.ts"],
        define: {
          __env__: `"${env.NODE_ENV}"`,
        },
        bundle: true,
        target: "firefox115",
        outfile: `build/addon/content/scripts/${pkg.config.addonRef}.js`,
      },
    ],
    makeUpdateJson: {
      hash: false,
      updates: [
        {
          version: "0.4.4",
          update_link:
                        "https://github.com/northword/zotero-format-metadata/releases/download/0.4.4/zotero-format-metadata.xpi",
          applications: {
            gecko: {
              strict_min_version: "60.0",
            },
          },
        },
      ],
    },
    hooks: {
      "build:makeUpdateJSON": () => {
        copyFileSync("build/update.json", "update.json");
        // copyFileSync("build/update-beta.json", "update-beta.json");
      },
    },
  },

  // If you need to see a more detailed build log, uncomment the following line:
  // logLevel: "trace",
});
