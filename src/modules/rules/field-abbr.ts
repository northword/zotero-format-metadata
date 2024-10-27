import type { Data } from "../data-loader";
import type { RuleBaseOptions } from "./rule-base";
import { getPref } from "../../utils/prefs";
import { getTextLanguage, normalizeKey } from "../../utils/str";
import { useData } from "../data-loader";
import { RuleBase } from "./rule-base";

class UpdateAbbrOptions implements RuleBaseOptions {}

export class UpdateAbbr extends RuleBase<UpdateAbbrOptions> {
  constructor(options: UpdateAbbrOptions) {
    super(options);
  }

  async apply(item: Zotero.Item): Promise<Zotero.Item> {
    if (item.itemType === "journalArticle") {
      return await this.getJournalAbbr(item);
    }
    return item;
  }

  async getJournalAbbr(item: Zotero.Item): Promise<Zotero.Item> {
    const publicationTitle = item.getField("publicationTitle") as string;

    // 无期刊全称直接跳过
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
      const data = await useData("journalAbbr");
      journalAbbr = await this.getAbbrLocally(publicationTitle, data);
    }

    // 从 ISSN LTWA 推断完整期刊缩写
    if (!journalAbbr && getPref("abbr.infer")) {
      journalAbbr = await this.getAbbrFromLTWAOnline(publicationTitle);
      // journalAbbr = await this.getAbbrFromLTWALocally(publicationTitle);
    }

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
  }

  async getAbbrLocally(publicationTitle: string, data: Data): Promise<string | undefined> {
    const normalizedPublicationTitle = normalizeKey(publicationTitle);

    for (const term in data) {
      if (normalizedPublicationTitle === normalizeKey(term) && data[term]) {
        return data[term];
      }
    }

    ztoolkit.log(`[Abbr] The abbr. of "${publicationTitle}" (${normalizedPublicationTitle}) not exist in local dateset.`);
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
    const normalizePublicationTitle = normalizeKey(publicationTitle);

    if (customAbbrDataPath.endsWith(".json")) {
      const data = await useData("json", customAbbrDataPath);

      for (const term in data) {
        if (normalizeKey(term) === normalizePublicationTitle && data[term])
          return data[term];
      }
      ztoolkit.log("[Abbr] 自定义缩写未匹配");
      return undefined;
    }
    else if (customAbbrDataPath.endsWith(".csv")) {
      const resolvedTerms = await useData("csv", customAbbrDataPath, {
        headers: ["publicationTitle", "abbr"],
      });
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
