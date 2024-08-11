import pkg from "./package.json";
import { copyFileSync } from "fs";
import { defineConfig } from "zotero-plugin-scaffold";

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
        asProxy: true,
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
                    __env__: `"${process.env.NODE_ENV}"`,
                },
                bundle: true,
                target: "firefox115",
                outfile: `build/addon/content/scripts/${pkg.config.addonRef}.js`,
            },
        ],
        // If you want to checkout update.json into the repository, uncomment the following lines:
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
            "build:makeUpdateJSON": (ctx) => {
                copyFileSync("build/update.json", "update.json");
                // copyFileSync("build/update-beta.json", "update-beta.json");
            },
        },
    },
    // release: {
    //   bumpp: {
    //     execute: "npm run build",
    //   },
    // },

    // If you need to see a more detailed build log, uncomment the following line:
    // logLevel: "trace",
});
