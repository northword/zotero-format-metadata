import { env } from "node:process";
import { defineConfig } from "zotero-plugin-scaffold";
import { fse } from "zotero-plugin-scaffold/vendor";
import pkg from "./package.json";

export default defineConfig({
  source: ["src", "addon"],
  dist: ".scaffold/build",
  name: pkg.config.addonName,
  id: pkg.config.addonID,
  namespace: pkg.config.addonRef,
  updateURL: `https://github.com/{{owner}}/{{repo}}/releases/download/releaser/{{updateJson}}`,
  xpiDownloadLink: "https://github.com/{{owner}}/{{repo}}/releases/download/v{{version}}/{{xpiName}}.xpi",

  build: {
    assets: [
      "addon/**/*.*",
      "data/journal-abbr/journal-abbr.json",
      "data/conference-abbr.json",
      "data/university-list/university-place.json",
    ],
    define: {
      ...pkg.config,
      author: pkg.author,
      description: pkg.description,
      homepage: pkg.homepage,
      buildVersion: pkg.version,
      buildTime: "{{buildTime}}",
    },
    prefs: {
      prefix: pkg.config.prefsPrefix,
    },
    esbuildOptions: [
      {
        entryPoints: [
          { in: "src/index.ts", out: pkg.config.addonRef },
        ],
        define: {
          __env__: `"${env.NODE_ENV}"`,
        },
        bundle: true,
        format: "esm",
        target: "firefox115",
        outdir: `.scaffold/build/addon/content/scripts/`,
        external: ["Zotero"],
      },
    ],
    makeUpdateJson: {
      hash: false,
      updates: [
        {
          version: "0.4.5",
          update_link: "https://github.com/northword/zotero-format-metadata/releases/download/0.4.4/zotero-format-metadata-0.4.5.xpi",
          applications: {
            gecko: {
              strict_min_version: "60.0",
            },
          },
        },
      ],
    },
    hooks: {
      "build:bundle": async () => {
        // resolve esbuild "ReferenceError: Zotero is not defined" error
        globalThis.Zotero = {
          Prefs: {
            get: () => 1,
          },
        };
        // Generate declaration file for rule ids
        const { Rules } = await import("./src/modules/rules/index.ts");

        const dts = `// Auto generated file. Do not modify.
        /* eslint-disable */
        type ID =
          | ${Rules.getAll().map(r => `"${r.id}"`).join("\n  | ")}
        `.replaceAll(" ".repeat(8), "");

        fse.outputFileSync("typings/rules.d.ts", dts);
      },
    },
  },

  release: {
    bumpp: {
      execute: "pnpm build",
      all: true,
    },
    github: {
      enable: "ci",
      updater: "releaser",
      releaseNote(ctx: any) {
        let notes = `${ctx.release.changelog}  \n\n`;
        notes += `![GitHub release (by tag)](https://img.shields.io/github/downloads/${ctx.release.github.repository}/${ctx.release.bumpp.tag}/total)  \n\n`;
        return notes;
      },
    },
  },
  test: {
    entries: ["test/tests"],
  },

  // If you need to see a more detailed build log, uncomment the following line:
  // logLevel: "TRACE",
});
