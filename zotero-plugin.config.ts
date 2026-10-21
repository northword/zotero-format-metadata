import { existsSync } from "node:fs";
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

  server: {
    prefs: {
      "extensions.zotero.httpServer.port": 23119,
    },
  },

  build: {
    assets: [
      "LICENSE",
      "NOTICE",
      "addon/**/*.*",
      "data/journal-abbr/journal-abbr.json",
      "data/journal-abbr/issn-ltwa/ltwa_2024-modified.csv",
      "data/journal-abbr/issn-ltwa/shortwords.txt",
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
        banner: {
          js: [
            "/*!",
            ` * ${pkg.config.addonName} (${pkg.name}) v${pkg.version}`,
            " * Copyright (C) 2023-2026 northword and contributors",
            " * SPDX-License-Identifier: AGPL-3.0-or-later",
            " *",
            " * This program is free software: you can redistribute it and/or modify it",
            " * under the terms of the GNU Affero General Public License as published by",
            " * the Free Software Foundation, either version 3 of the License, or (at your",
            " * option) any later version. See the LICENSE file distributed with this",
            " * package, or <https://www.gnu.org/licenses/agpl-3.0.txt>.",
            " *",
            ` * Source code: ${pkg.homepage.replace("#readme", "")}`,
            " * Third-party notices: see the NOTICE file distributed with this package.",
            " * Copies of this code, whether hand-written, paraphrased or AI-generated,",
            " * must keep this header, the LICENSE and the NOTICE files.",
            " */",
          ].join("\n"),
        },
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
        {
          version: "2.3.0",
          update_link: "https://github.com/northword/zotero-format-metadata/releases/download/v2.3.0/linter-for-zotero.xpi",
          applications: {
            zotero: {
              strict_min_version: "6.999",
              strict_max_version: "8.*",
            },
          },
        },
      ],
    },
    hooks: {
      "build:bundle": async () => {
        // @ts-expect-error resolve esbuild "ReferenceError: Zotero is not defined" error
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
      "build:done": ({ dist }) => {
        // The license must be shipped in the .xpi, not only in the repository
        for (const file of ["LICENSE", "NOTICE"]) {
          if (!existsSync(`${dist}/addon/${file}`)) {
            throw new Error(`${file} is missing from the built plugin. It must be shipped in the .xpi.`);
          }
        }
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
