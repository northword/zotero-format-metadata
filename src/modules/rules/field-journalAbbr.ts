import type { RuleBaseOptions } from "./rule-base";
import csv from "csvtojson";
import { journalAbbrlocalData } from "../../data";
import { getPref } from "../../utils/prefs";
import { getTextLanguage, normalizeKey } from "../../utils/str";
import { RuleBase } from "./rule-base";

class UpdateJournalAbbrOptions implements RuleBaseOptions {}

export class UpdateJournalAbbr extends RuleBase<UpdateJournalAbbrOptions> {
  constructor(options: UpdateJournalAbbrOptions) {
    super(options);
  }

  async apply(item: Zotero.Item): Promise<Zotero.Item> {
    // 非 journalArticle 和 conferencePaper 直接跳过
    if (item.itemType !== "journalArticle" && item.itemType !== "conferencePaper") {
      ztoolkit.log(`[Abbr] Item type ${item.itemType} is not journalArticle or conferencePaper, skip it.`);
      return item;
    }

    // 无期刊全称直接跳过
    const publicationTitle = item.getField("publicationTitle") as string;

    if (publicationTitle === "")
      return item;

    let journalAbbr: string | undefined;

    // 从自定义数据集获取
    const customAbbrDataPath = getPref("abbr.customDataPath") as string;
    if (customAbbrDataPath !== "") {
      journalAbbr = await this.getAbbrFromCustom(publicationTitle, customAbbrDataPath);
    }

    // 从本地数据集获取缩写
    if (!journalAbbr) {
      journalAbbr = this.getAbbrIso4Locally(publicationTitle, journalAbbrlocalData);
    }

    // 从 ISSN LTWA 推断完整期刊缩写
    if (!journalAbbr && getPref("abbr.infer")) {
      journalAbbr = await this.getAbbrFromLTWAOnline(publicationTitle);
      // journalAbbr = await this.getAbbrFromLTWALocally(publicationTitle);
    }

    // if (journalAbbr) {
    //     // 有缩写的，是否处理为 ISO dotless 或 JCR 格式
    //     switch (getPref("abbr.type")) {
    //         case "ISO4dot":
    //             break;
    //         case "ISO4dotless":
    //             journalAbbr = removeDot(journalAbbr);
    //             break;
    //         case "JCR":
    //             journalAbbr = this.toJCR(journalAbbr);
    //             break;
    //         default:
    //             break;
    //     }
    // }

    // 以期刊全称填充
    if (!journalAbbr) {
      // 获取条目语言，若无则根据期刊全称判断语言
      const itemLanguage = (item.getField("language") as string) ?? getTextLanguage(publicationTitle);
      const isChinese = ["zh", "zh-CN"].includes(itemLanguage);
      if (isChinese && getPref("abbr.usefullZh")) {
        // 中文，无缩写的，是否以全称替代
        ztoolkit.log(`[Abbr] The abbr. of ${publicationTitle} is replaced by its full name`);
        journalAbbr = publicationTitle;
      }
      else if (!isChinese && getPref("abbr.usefull")) {
        // 非中文，无缩写的，是否以全称替代
        ztoolkit.log(`[Abbr] The abbr. of ${publicationTitle} is replaced by its full name`);
        journalAbbr = publicationTitle;
      }
    }

    // 无缩写且不以全称替代，返回空值
    if (!journalAbbr) {
      journalAbbr = "";
    }

    item.setField("journalAbbreviation", journalAbbr);
    return item;
    // await item.saveTx();
  }

  /**
   * Get abbreviation from local dataset.
   *
   * @param publicationTitle - The full name of publication
   * @param dataBase - local dataset, default journalAbbrlocalData
   * @returns
   * - String of `ISO 4 with dot abbr` when when it exist in the local dataset
   * - `undefined` when abbr does not exist in local dataset
   */
  getAbbrIso4Locally(publicationTitle: string, dataBase = journalAbbrlocalData): string | undefined {
    const normalizedInputKey = normalizeKey(publicationTitle);

    for (const originalKey of Object.keys(dataBase)) {
      const normalizedOriginalKey = normalizeKey(originalKey);

      if (normalizedInputKey === normalizedOriginalKey) {
        return dataBase[originalKey];
      }
    }

    ztoolkit.log(`[Abbr] The abbr. of "${publicationTitle}" (${normalizedInputKey}) not exist in local dateset.`);
    return undefined;
  }

  /**
   *
   * Get abbreviation from abbreviso API.
   * This API infer journal abbreviation from ISSN List of Title Word Abbreviations.
   * Until March 31, 2023, this API uses the LTWA released in 2017.
   * @param publicationTitle
   * @returns
   * - String of `ISO 4 with dot abbr` when API returns a valid response
   * - `undefined` when API returns an invalid response
   */
  async getAbbrFromLTWAOnline(publicationTitle: string): Promise<string | undefined> {
    publicationTitle = encodeURI(publicationTitle);
    const url = `https://abbreviso.toolforge.org/abbreviso/a/${publicationTitle}`;
    const res = await Zotero.HTTP.request("GET", url);
    const result = res.response as string;
    if (result === "" || result === null || result === undefined) {
      ztoolkit.log("[Abbr] Failed to infer the abbr. from LTWA");
      return undefined;
    }
    return result;
  }

  async getAbbrFromLTWALocally(publicationTitle: string): Promise<string | undefined> {
    const shortwords = await Zotero.File.getContentsAsync(`${rootURI}/lib/abbreviso/shortwords.txt`);
    const ltwa = await Zotero.File.getContentsAsync(`${rootURI}/lib/abbreviso/LTWA_20210702-modified.csv`);
    Services.scriptloader.loadSubScript(`${rootURI}/lib/abbreviso/browserBundle.js`);
    // @ts-expect-error AbbrevIso 来自引入的脚本
    const abbrevIso = new AbbrevIso.AbbrevIso(ltwa, shortwords);
    const abbr = abbrevIso.makeAbbreviation(publicationTitle);
    return abbr;
  }

  async getAbbrFromCustom(publicationTitle: string, customAbbrDataPath: string): Promise<string | undefined> {
    if (!(await IOUtils.exists(customAbbrDataPath))) {
      throw new Error("The custom journalAbbr file not exist.");
    }

    const normalizePublicationTitle = normalizeKey(publicationTitle);

    if (customAbbrDataPath.endsWith(".json")) {
      const customAbbrData = (await Zotero.File.getContentsAsync(customAbbrDataPath)) as string;
      if (typeof customAbbrData !== "string" || customAbbrData === "") {
        throw new Error("The custom journalAbbr data file format error.");
      }

      try {
        const data = JSON.parse(customAbbrData);
        for (const term in data) {
          if (normalizeKey(term) === normalizePublicationTitle && data[term])
            return data[term];
        }
        ztoolkit.log("[Abbr] 自定义缩写未匹配");
        return undefined;
      }
      catch (e) {
        throw new Error(`JSON Syntax Error, ${e}`);
      }
    }
    else if (customAbbrDataPath.endsWith(".csv")) {
      const customAbbrData = (await Zotero.File.getContentsAsync(customAbbrDataPath)) as string;
      const resolvedTerms = await csv({
        delimiter: "auto",
        trim: true,
        noheader: true,
        headers: ["publicationTitle", "abbr"],
      }).fromString(customAbbrData);
      ztoolkit.log(`[Abbr] Custom terms:`, resolvedTerms);

      for (const term of resolvedTerms) {
        if (normalizeKey(term.publicationTitle) === normalizePublicationTitle)
          return term.abbr;
      }
    }
    else {
      throw new Error("The custom journalAbbr data file format error.");
    }
  }
}
