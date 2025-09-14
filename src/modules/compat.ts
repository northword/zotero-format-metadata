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

  // v2.0.0 refactor the rules id and preference key
  if (compareVersion(version, "2.0.0") === -1) {
    mvPref("noDuplicationItems", "rule.no-item-duplication");
    mvPref("checkWebpage", "rule.no-article-webpage");
    mvPref("noPreprintJournalArticle", "rule.no-journal-preprint");
    mvPref("titleDotEnd", "rule.no-title-trailing-dot");
    mvPref("noDOIPrefix", "rule.no-doi-prefix");
    mvPref("noExtraZeros", "rule.no-issue-extra-zeros", true);
    mvPref("noExtraZeros", "rule.no-pages-extra-zeros", true);
    mvPref("noExtraZeros", "rule.no-volume-extra-zeros", true);

    mvPref("lang", "rule.require-language");
    mvPref("lang.only", "rule.require-language.only");
    mvPref("lang.only.cmn", "rule.require-language.only.cmn");
    mvPref("lang.only.eng", "rule.require-language.only.eng");
    mvPref("lang.only.other", "rule.require-language.only.other", "");
    mvPref("titleSentenceCase", "rule.require-title-sentence-case");
    mvPref("title.shortTitle", "rule.require-shortTitle-sentence-case");
    mvPref("abbr.journalArticle", "rule.require-journal-abbr");
    mvPref("abbr.infer", "rule.require-journal-abbr.infer");
    mvPref("abbr.usefull", "rule.require-journal-abbr.usefull");
    mvPref("abbr.usefullZh", "rule.require-journal-abbr.usefullZh");
    mvPref("abbr.customDataPath", "rule.require-journal-abbr.customDataPath");
    mvPref("universityPlace", "rule.require-university-place");

    mvPref("creatorsCase", "rule.correct-creators-case");
    mvPref("creatorsPinyin", "rule.correct-creators-pinyin");
    mvPref("dateISO", "rule.correct-date-format");
    mvPref("publicationTitleCase", "rule.correct-publication-title");
    mvPref("pagesConnector", "rule.correct-pages-connector");
    mvPref("abbr.conferencePaper", "rule.correct-conference-abbr");
    mvPref("thesisType", "rule.correct-thesis-type");
    mvPref("university", "rule.correct-university");

    mvPref("title.guillement", "rule.tool-title-guillemet");
    mvPref("creatorsExt", "rule.tool-creators-ext");
    mvPref("lang.set", "rule.tool-set-language");
    mvPref("updateMetadate", "rule.tool-update-metadata");
    mvPref("updateMetadate.confirmWhenItemTypeChange", "rule.tool-update-metadata.confirm-when-item-type-change", false);
  }

  setPref("version", currentVersion);
}

function mvPref(source: string, target: string, defaultValue?: boolean | string | number) {
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
