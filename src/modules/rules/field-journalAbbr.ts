import { journalAbbrlocalData } from "../../data";
import { progressWindow } from "../../utils/logger";
import { getPref } from "../../utils/prefs";
import { removeDot } from "../../utils/str";
import { getTextLanguage } from "./field-language";

/* 期刊 */

export { updateJournalAbbr };

/**
 * 更新某个条目的期刊/会议缩写
 *
 * @param item
 */
async function updateJournalAbbr(item: Zotero.Item) {
    // 非 journalArticle 和 conferencePaper 直接跳过
    if (item.itemType !== "journalArticle" && item.itemType !== "conferencePaper") {
        ztoolkit.log(`[Abbr] Item type ${item.itemType} is not journalArticle or conferencePaper, skip it.`);
        return;
    }
    // 无期刊全称直接跳过
    const publicationTitle = item.getField("publicationTitle") as string;
    if (publicationTitle == "") return;
    let journalAbbr = "";

    // 从自定义数据集获取
    const journalAbbrCustom = await getAbbrFromCustom(publicationTitle);
    if (journalAbbrCustom) {
        journalAbbr = journalAbbrCustom;
    } else {
        // 从本地数据集获取缩写
        let journalAbbrISO4 = getAbbrIso4Locally(publicationTitle, journalAbbrlocalData);

        // 从 ISSN LTWA 推断完整期刊缩写
        if (!journalAbbrISO4 && getPref("abbr.infer")) {
            journalAbbrISO4 = await getAbbrFromLTWAOnline(publicationTitle);
            // journalAbbrISO4 = getAbbrFromLtwaLocally(publicationTitle);
        }

        if (journalAbbrISO4) {
            // 有缩写的，是否处理为 ISO dotless 或 JCR 格式
            switch (getPref("abbr.type")) {
                case "ISO4dot":
                    journalAbbr = journalAbbrISO4;
                    break;
                case "ISO4dotless":
                    journalAbbr = removeDot(journalAbbrISO4);
                    break;
                case "JCR":
                    journalAbbr = toJCR(journalAbbrISO4);
                    break;
                default:
                    journalAbbr = journalAbbrISO4;
                    break;
            }
        }
    }

    // 以期刊全称填充
    if (journalAbbr == "") {
        // 获取条目语言，若无则根据期刊全称判断语言
        const itemLanguage = (item.getField("language") as string) ?? getTextLanguage(publicationTitle);
        const isChinese = ["zh", "zh-CN"].includes(itemLanguage);
        if (isChinese && getPref("abbr.usefullZh")) {
            // 中文，无缩写的，是否以全称替代
            ztoolkit.log(`[Abbr] The abbr. of ${publicationTitle} is replaced by its full name`);
            journalAbbr = publicationTitle;
        } else if (!isChinese && getPref("abbr.usefull")) {
            // 非中文，无缩写的，是否以全称替代
            ztoolkit.log(`[Abbr] The abbr. of ${publicationTitle} is replaced by its full name`);
            journalAbbr = publicationTitle;
        } else {
            // 无缩写且不以全称替代，返回空值
            journalAbbr = "";
        }
    }

    item.setField("journalAbbreviation", journalAbbr);
    await item.saveTx();
}

/**
 * Get abbreviation from local dataset.
 *
 * @param publicationTitle - The full name of publication
 * @param dataBase - local dataset, default journalAbbrlocalData
 * @returns
 * - String of `ISO 4 with dot abbr` when when it exist in the local dataset
 * - `false` when abbr does not exist in local dataset
 */
function getAbbrIso4Locally(publicationTitle: string, dataBase = journalAbbrlocalData): string | false {
    // 处理传入文本
    publicationTitle = publicationTitle.toLowerCase().trim();
    publicationTitle.startsWith("the ") ? publicationTitle.replace("the ", "").trim() : "pass";
    // 在本地数据里查找
    const journalAbbr = dataBase[publicationTitle];
    if (journalAbbr == "" || journalAbbr == null || journalAbbr == undefined) {
        ztoolkit.log(`[Abbr] The abbr. of "${publicationTitle}" not exist in local dateset.`);
        return false;
    }
    return journalAbbr;
}

/**
 *
 * Get abbreviation from abbreviso API.
 * This API infer journal abbreviation from ISSN List of Title Word Abbreviations.
 * Until March 31, 2023, this API uses the LTWA released in 2017.
 * @param publicationTitle
 * @returns
 * - String of `ISO 4 with dot abbr` when API returns a valid response
 * - `false` when API returns an invalid response
 */
async function getAbbrFromLTWAOnline(publicationTitle: string) {
    // 防止 API 被滥用，先延迟一手
    await Zotero.Promise.delay(3000);
    publicationTitle = encodeURI(publicationTitle);
    const url = `https://abbreviso.toolforge.org/abbreviso/a/${publicationTitle}`;
    const res = await Zotero.HTTP.request("GET", url);
    const result = res.response as string;
    if (result == "" || result == null || result == undefined) {
        ztoolkit.log("[Abbr] Failed to infer the abbr. from LTWA");
        return false;
    }
    return result;
}

/**
 * Convert ISO 4 with dot format to JCR format.
 * @param text
 * @returns String with dots removed and capitalized
 */
function toJCR(text: string) {
    return removeDot(text).toUpperCase();
}

async function getAbbrFromCustom(publicationTitle: string) {
    const customAbbrDataPath = getPref("abbr.customDataPath") as string;
    if (customAbbrDataPath !== "" && (await IOUtils.exists(customAbbrDataPath))) {
        const customAbbrData = await Zotero.File.getContentsAsync(customAbbrDataPath);
        if (typeof customAbbrData == "string") {
            try {
                const data = JSON.parse(customAbbrData);
                const abbr = (data[publicationTitle] as string) ?? false;
                if (!abbr) ztoolkit.log("[Abbr] 自定义缩写未匹配");
                return abbr;
            } catch (e) {
                progressWindow(`JSON Syntax Error, ${e}`, "fail");
                throw new Error(`JSON Syntax Error, ${e}`);
            }
        }
    }
    ztoolkit.log("[Abbr] 自定义缩写数据文件不存在");
    return false;
}
