import details from "../package.json" assert { type: "json" };
import { Logger } from "./utils.mjs";
import { clearFolder } from "./utils.mjs";
import cmd from "./zotero-cmd.json" assert { type: "json" };
import { spawn } from "child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { exit } from "process";

const { addonID } = details.config;
const { zoteroBinPath, profilePath, dataDir } = cmd.exec;

const logPath = "logs";
const logFilePath = path.join(logPath, "zotero.log");

if (!existsSync(zoteroBinPath)) {
    throw new Error("Zotero binary does not exist.");
}

if (!existsSync(profilePath)) {
    throw new Error("The given Zotero profile does not exist.");
}

function prepareDevEnv() {
    const addonProxyFilePath = path.join(profilePath, `extensions/${addonID}`);
    const buildPath = path.resolve("build/addon");
    if (!existsSync(addonProxyFilePath) || readFileSync(addonProxyFilePath, "utf-8") !== buildPath) {
        writeFileSync(addonProxyFilePath, buildPath);
        Logger.debug(
            `Addon proxy file has been updated. 
          File path: ${addonProxyFilePath} 
          Addon path: ${buildPath} `,
        );
    }

    const addonXpiFilePath = path.join(profilePath, `extensions/${addonID}.xpi`);
    if (existsSync(addonXpiFilePath)) {
        rmSync(addonXpiFilePath);
    }

    const prefsPath = path.join(profilePath, "prefs.js");
    if (existsSync(prefsPath)) {
        const PrefsLines = readFileSync(prefsPath, "utf-8").split("\n");
        const filteredLines = PrefsLines.map((line) => {
            if (line.includes("extensions.lastAppBuildId") || line.includes("extensions.lastAppVersion")) {
                return;
            }
            if (line.includes("extensions.zotero.dataDir") && dataDir !== "") {
                return `user_pref("extensions.zotero.dataDir", "${dataDir}");`;
            }
            return line;
        });
        const updatedPrefs = filteredLines.join("\n");
        writeFileSync(prefsPath, updatedPrefs, "utf-8");
        Logger.debug("The <profile>/prefs.js has been modified.");
    }
}

function prepareLog() {
    clearFolder(logPath);
    writeFileSync(logFilePath, "");
}

export function main() {
    prepareDevEnv();

    prepareLog();

    const zoteroProcess = spawn(zoteroBinPath, ["--debugger", "--purgecaches", "-profile", profilePath]);

    zoteroProcess.stdout.setEncoding("utf8").on("data", (data) => {
        writeFileSync(logFilePath, data, {
            flag: "a",
        });
    });

    zoteroProcess.stderr.setEncoding("utf8").on("data", (data) => {
        writeFileSync(logFilePath, data, {
            flag: "a",
        });
    });

    zoteroProcess.on("close", (code) => {
        Logger.info(`Zotero terminated with code ${code}.`);
        exit(0);
    });

    process.on("SIGINT", () => {
        // Handle interrupt signal (Ctrl+C) to gracefully terminate Zotero process
        zoteroProcess.kill();
        exit();
    });
}
