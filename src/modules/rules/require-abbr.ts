import type { Data } from "../../utils/data-loader";
import { AbbrevIso } from "../../lib/abbrev-iso";
import { DataLoader } from "../../utils/data-loader";
import { getPref } from "../../utils/prefs";
import { getTextLanguage, normalizeKey } from "../../utils/str";
import { defineRule } from "./rule-base";

interface Options {
  customDataPath: string;
  infer: boolean;
  usefull: boolean;
  usefullZh: boolean;
}

function prepare(): Options {
  return {
    customDataPath: getPref("rule.require-journal-abbr.customDataPath"),
    infer: getPref("rule.require-journal-abbr.infer"),
    usefull: getPref("rule.require-journal-abbr.usefull"),
    usefullZh: getPref("rule.require-journal-abbr.usefullZh"),
  };
}

export const RequireJournalAbbr = defineRule<Options>({
  id: "require-journal-abbr",
  scope: "field",
  targetItemTypes: ["journalArticle"],
  targetItemField: "journalAbbreviation",
  async apply({ item, options, debug }) {
    const publicationTitle = item.getField("publicationTitle") as string;

    // 无期刊全称直接跳过
    if (publicationTitle === "")
      return;

    let journalAbbr: string | undefined;

    // 从自定义数据集获取
    if (options.customDataPath !== "") {
      journalAbbr = await getAbbrFromCustom(publicationTitle, options.customDataPath);
    }

    // 从本地数据集获取缩写
    if (!journalAbbr) {
      const data = await DataLoader.load("journalAbbr");
      journalAbbr = await getAbbrLocally(publicationTitle, data);
    }

    // 从 ISSN LTWA 推断完整期刊缩写
    if (!journalAbbr && options.infer) {
      debug("try to infer abbreviation from the local LTWA data via abbrevIso");
      journalAbbr = await getAbbrFromLTWA(publicationTitle);
    }

    // 以期刊全称填充
    if (!journalAbbr) {
      debug("try to fill the abbreviation with its full name");
      // 获取条目语言，若无则根据期刊全称判断语言
      const itemLanguage = (item.getField("language") as string) ?? getTextLanguage(publicationTitle);
      const isChinese = ["zh", "zh-CN"].includes(itemLanguage);
      if (isChinese && options.usefullZh) {
      // 中文，无缩写的，是否以全称替代
        debug(`[Abbr] The abbr. of ${publicationTitle} is replaced by its full name`);
        journalAbbr = publicationTitle;
      }
      else if (!isChinese && options.usefull) {
      // 非中文，无缩写的，是否以全称替代
        debug(`[Abbr] The abbr. of ${publicationTitle} is replaced by its full name`);
        journalAbbr = publicationTitle;
      }
    }

    // 无缩写且不以全称替代，返回空值
    if (!journalAbbr) {
      journalAbbr = "";
    }

    item.setField("journalAbbreviation", journalAbbr);
  },

  prepare,

  fieldMenu: {
    l10nID: "rule-require-journal-abbr-menu-field",
  },
});

export const CorrectConferenceAbbr = defineRule<Options>({
  id: "correct-conference-abbr",
  nameKey: "abbr-conference",
  scope: "field",
  targetItemTypes: ["conferencePaper"],
  targetItemField: "conferenceName",
  fieldMenu: {
    l10nID: "rule-require-journal-abbr-menu-field",
  },
  async apply({ item, options }) {
    const conferenceNames = [
      item.getField("conferenceName") as string,
      item.getField("proceedingsTitle") as string,
    ].filter(Boolean);

    // 无全称直接跳过
    if (conferenceNames.length === 0)
      return;

    let shortConferenceName: string | undefined;

    for (const conferenceName of conferenceNames) {
      // 先精确匹配，再移除会议届次序数（如 32nd）后匹配
      const conferenceNameWithoutOrdinal = conferenceName.replace(/\b\d+(?:st|nd|rd|th)\b/gi, "");
      const conferenceNameVariants = conferenceNameWithoutOrdinal === conferenceName
        ? [conferenceName]
        : [conferenceName, conferenceNameWithoutOrdinal];

      for (const conferenceNameVariant of conferenceNameVariants) {
        // 从自定义数据集获取
        if (options.customDataPath !== "") {
          shortConferenceName = await getAbbrFromCustom(conferenceNameVariant, options.customDataPath);
        }

        // 从本地数据集获取缩写
        if (!shortConferenceName) {
          const data = await DataLoader.load("conferencesAbbr");
          shortConferenceName = await getAbbrLocally(conferenceNameVariant, data);
        }

        if (shortConferenceName)
          break;
      }

      if (shortConferenceName)
        break;
    }

    if (!shortConferenceName)
      shortConferenceName = "";

    await ztoolkit.ExtraField.setExtraField(item, "shortConferenceName", shortConferenceName, { save: false });
  },

  prepare,

});

async function getAbbrLocally(publicationTitle: string, data: Data): Promise<string | undefined> {
  const normalizedPublicationTitle = normalizeKey(publicationTitle);

  for (const term in data) {
    if (normalizedPublicationTitle === normalizeKey(term) && data[term]) {
      return data[term];
    }
  }

  return undefined;
}

let abbrevIso: AbbrevIso | undefined;

/**
 * Infer a journal abbreviation from the ISSN List of Title Word Abbreviations
 * (LTWA) with abbrevIso, which implements the ISO 4 rules locally.
 * @see https://github.com/marcinwrochna/abbrevIso
 * @param publicationTitle
 * @returns
 * - String of `ISO 4 with dot abbr` when a pattern matches
 * - `undefined` when the title can not be abbreviated
 */
async function getAbbrFromLTWA(publicationTitle: string): Promise<string | undefined> {
  // Building the prefix tree index of the LTWA is slow (hundreds of ms),
  // so instantiate abbrevIso only once.
  if (!abbrevIso) {
    const [ltwa, shortwords] = await Promise.all([
      DataLoader.load("txt", `${rootURI}data/journal-abbr/issn-ltwa/ltwa_2024-modified.csv`),
      DataLoader.load("txt", `${rootURI}data/journal-abbr/issn-ltwa/shortwords.txt`),
    ]);
    abbrevIso = new AbbrevIso(ltwa, shortwords);
  }

  const abbreviation = abbrevIso.makeAbbreviation(publicationTitle).trim();
  // abbrevIso returns the title itself when no pattern matches.
  if (abbreviation === publicationTitle.trim())
    return undefined;

  return abbreviation || undefined;
}

async function getAbbrFromCustom(publicationTitle: string, customAbbrDataPath: string): Promise<string | undefined> {
  const normalizePublicationTitle = normalizeKey(publicationTitle);

  if (customAbbrDataPath.endsWith(".json")) {
    const data = await DataLoader.load("json", customAbbrDataPath);

    for (const term in data) {
      if (normalizeKey(term) === normalizePublicationTitle && data[term])
        return data[term];
    }
    return undefined;
  }
  else if (customAbbrDataPath.endsWith(".csv")) {
    const resolvedTerms = await DataLoader.load("csv", customAbbrDataPath, {
      headers: ["publicationTitle", "abbr"],
    });
    for (const term of resolvedTerms) {
      if (normalizeKey(term.publicationTitle) === normalizePublicationTitle)
        return term.abbr;
    }
  }
  else {
    throw new Error("The custom journalAbbr data file format error.");
  }
}
