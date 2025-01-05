import { version as currentVersion } from "../../package.json";
import { clearPref, getPref, setPref } from "../utils/prefs";

export function checkCompat() {
  const version = (getPref("version") as string) ?? "0.0.0";

  if (compareVersion(version, currentVersion) === 0) {
    return;
  }

  if (compareVersion(version, "1.20.2") === -1) {
    mvPref("abbr", "abbr.journalArticle", true);
  }

  if (compareVersion(version, "1.8.0") === -1) {
    // 1.8.0 废弃期刊缩写类型
    clearPref("abbr.type");
    clearPref("enable");
  }

  if (compareVersion(version, "1.10.0") === -1) {
    // 1.10.0
    clearPref("richText.toolbarPosition.left");
    clearPref("richText.toolbarPosition.top");
  }

  if (compareVersion(version, "1.11.0") === -1) {
    mvPref("add.update", "lint.onAdded", true);
    mvPref("add.updateOnAddedForGroup", "lint.onGroup", true);
    mvPref("richtext.isEnableToolBar", "richtext.toolBar", true);
    mvPref("richtext.isEnableRichTextHotKey", "richtext.hotkey", true);
    mvPref("isEnableCheckDuplication", "noDuplicationItems", true);
    mvPref("isEnableCheckWebpage", "checkWebpage", true);
    mvPref("isEnableTitleCase", "titleSentenceCase", true);
    mvPref("isEnableCreators", "creatorsCase", true);
    mvPref("isEnableLang", "lang", true);
    mvPref("lang.only.enable", "lang.only", true);
    // mvPref("lang.only.cmn", "lang.only.zh", true)
    // mvPref("lang.only.eng", "lang.only.en", true)
    // mvPref("lang.only.other", "lang.only.other", "")
    mvPref("isEnableDateISO", "dateISO", true);
    mvPref("isEnablePublicationTitle", "publicationTitleCase", true);
    mvPref("isEnableAbbr", "abbr", true);
    // mvPref("abbr.customDataPath")
    mvPref("NoExtraZeros", "noExtraZeros", true);
    mvPref("isEnableDOI", "noDOIPrefix", true);
    mvPref("isEnablePlace", "universityPlace", true);
    mvPref("isEnableCleanFields", "cleanExtra", true);
    clearPref("richtext.isEnableChem");
    clearPref("lintAfterRetriveByDOI");
  }

  setPref("version", currentVersion);
}

function mvPref(source: string, target: string, defaultValue: boolean | string | number) {
  // @ts-expect-error target and source may not exist in prefs.js
  setPref(target, getPref(source) ?? defaultValue);
  clearPref(source);
}

/**
 * Compare two version strings
 * `versionA` < `versionB` => -1
 * `versionA` > `versionB` => 1
 * `versionA` === `versionB` => 0
 * @param versionA Version string
 * @param versionB Another version string
 * @returns -1|1|0
 * @see https://github.com/syt2/zotero-addons/blob/ba9e5fbf66b11a0fe790d5a116744ba3291245ee/src/utils/utils.ts
 */
function compareVersion(versionA: string, versionB: string): 1 | -1 | 0 {
  const partsA = versionA.toLowerCase().replace("v", "").split(".");
  const partsB = versionB.toLowerCase().replace("v", "").split(".");

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const a = i < partsA.length ? partsA[i] : "0";
    const b = i < partsB.length ? partsB[i] : "0";
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
  }
  return 0;
}
