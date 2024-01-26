import { version as currentVersion } from "../../package.json";
import { clearPref, getPref, setPref } from "../utils/prefs";

export function checkCompat() {
    const version = (getPref("version") as string) ?? "0.0.0";

    if (compareVersion(version, currentVersion) == 0) {
        return;
    }

    if (compareVersion(version, "1.10.0") == -1) {
        // 1.10.0
        clearPref("richText.toolbarPosition.left");
        clearPref("richText.toolbarPosition.top");
    }

    if (compareVersion(version, "1.8.0") == -1) {
        // 1.8.0 废弃期刊缩写类型
        clearPref("abbr.type");
        clearPref("enable");
    }

    setPref("version", currentVersion);
}

/**
 * Compare two version strings
 * `versionA` < `versionB` => -1
 * `versionA` > `versionB` => 1
 * `versionA` == `versionB` => 0
 * @param versionA Version string
 * @param versionB Another version string
 * @returns -1|1|0
 * @see https://github.com/syt2/zotero-addons/blob/ba9e5fbf66b11a0fe790d5a116744ba3291245ee/src/utils/utils.ts
 */
function compareVersion(versionA: string, versionB: string): 1 | -1 | 0 {
    const partsA = versionA.toLowerCase().replace("v", "").split(".");
    const partsB = versionB.toLowerCase().replace("v", "").split(".");

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const a = i < partsA.length ? partsA[i] : "0",
            b = i < partsB.length ? partsB[i] : "0";
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
    }
    return 0;
}
