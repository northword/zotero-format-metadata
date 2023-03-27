import { journalAbbrlocalData, universityPlaceLocalData, iso6393To6391Data } from "../data/helper";
import { franc } from "franc";
import { getPref } from "./preference";
import { descriptor, progressWindow } from "./untils";
// import { getAbbrFromLtwaLocally } from "./abbrevIso";

export default class FormatMetadata {
    constructor() {}

    @descriptor
    static unimplemented() {
        ztoolkit.log("此功能尚未实现。");
        window.alert("此功能尚未实现。");
    }

    /**
     * 标准格式化流程
     * @param item
     */
    static updateStdFlow(item: Zotero.Item) {
        if (getPref("isEnableLang")) {
            this.updateLanguage(item);
        }
        this.updateJournalAbbr(item);
        this.updateUniversityPlace(item);
    }

    /* 期刊 */

    /**
     * 更新某个条目的期刊/会议缩写
     *
     * @param item
     */
    @descriptor
    static async updateJournalAbbr(item: Zotero.Item) {
        if (item.itemType == "journalArticle" || item.itemType == "conferencePaper") {
            if (item.getField("language") !== "zh") {
                // 英文期刊，获取缩写
                try {
                    var publicationTitle = item.getField("publicationTitle") as string;
                    var journalAbbr = await this.getJournalAbbr(publicationTitle);
                    item.setField("journalAbbreviation", journalAbbr);
                    await item.saveTx();
                } catch (error) {
                    ztoolkit.log("[Abbr] Failed to update abbr, error is: ", error);
                }
            } else {
                // 中文期刊，是否以全称填充
            }
        } else {
            ztoolkit.log(`[Abbr] Item type ${item.itemType} is not journalArticle or conferencePaper, skip it.`);
        }
    }

    /**
     * 获取指定期刊的缩写
     *
     * @param publicationTitle -  期刊全称
     * @returns
     * - String of Abbr. in `ISO 4 dot`, `ISO 4 dotless`, or `JCR` format when exist abbr
     * - String of its `full name` when no abbr and allow to use its full name
     * - `""` when no abbr and do not use its full name
     */
    @descriptor
    static async getJournalAbbr(publicationTitle: string): Promise<string> {
        // 1. 从本地数据集获取缩写
        var journalAbbrISO4 = this.getAbbrIso4Locally(publicationTitle, journalAbbrlocalData);
        // 2. 本地无缩写，是否从 ISSN LTWA 推断完整期刊缩写
        if (!journalAbbrISO4) {
            if (getPref("abbr.infer")) {
                ztoolkit.log(`[Abbr] The abbr. of ${publicationTitle} inferring from LTWA`);
                journalAbbrISO4 = await this.getAbbrFromLTWAOnline(publicationTitle);
                // journalAbbrISO4 = getAbbrFromLtwaLocally(publicationTitle);
            }
        }
        // 有缩写的，是否处理为 ISO dotless 或 JCR 格式
        if (journalAbbrISO4) {
            switch (getPref("abbr.type")) {
                case "ISO4dot":
                    return journalAbbrISO4;
                case "ISO4dotless":
                    return this.removeDot(journalAbbrISO4);
                case "JCR":
                    return this.toJCR(journalAbbrISO4);
                default:
                    return journalAbbrISO4;
            }
        } else {
            // 无缩写的，是否以全称替代
            if (getPref("abbr.usefull")) {
                ztoolkit.log(`[Abbr] The abbr. of ${publicationTitle} is replaced by its full name`);
                return publicationTitle;
            }
            // 无缩写且不以全称替代，返回空值
            return "";
        }
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
    @descriptor
    static getAbbrIso4Locally(publicationTitle: string, dataBase = journalAbbrlocalData): string | false {
        // 处理传入文本
        publicationTitle = publicationTitle.toLowerCase().trim();
        publicationTitle.startsWith("the ") ?? publicationTitle.replace("the", "");
        // 在本地数据里查找
        var journalAbbr = dataBase[publicationTitle];
        if (journalAbbr == "" || journalAbbr == null || journalAbbr == undefined) {
            ztoolkit.log(`[Abbr] The abbr. of ${publicationTitle} do not exist in local dataset`);
            return false;
        } else {
            return journalAbbr;
        }
    }

    /**
     *
     * Get abbreviation from abbreviso API.
     * 该 API 根据 ISSN List of Title Word Abbreviations 推断期刊的 ISO 4 with dot 缩写
     * @param publicationTitle
     * @returns
     * - String of `ISO 4 with dot abbr` when API returns a valid response
     * - `false` when API returns an invalid response
     */
    @descriptor
    static async getAbbrFromLTWAOnline(publicationTitle: string) {
        publicationTitle = encodeURI(publicationTitle);
        var url = `https://abbreviso.toolforge.org/abbreviso/a/${publicationTitle}`;
        const res = await Zotero.HTTP.request("GET", url);
        const result = res.response as string;
        if (result == "" || result == null || result == undefined) {
            ztoolkit.log("[Abbr] Failed to infer the abbr. inferring from LTWA");
            return false;
        }
        return result;
    }

    @descriptor
    static removeDot(text: string) {
        return text.replace(/\./g, "");
    }

    /**
     * Convert ISO 4 with dot format to JCR format.
     * @param text
     * @returns String with dots removed and capitalized
     */
    @descriptor
    static toJCR(text: string) {
        return this.removeDot(text).toUpperCase();
    }

    /* 学校地点 */

    @descriptor
    static async updateUniversityPlace(item: Zotero.Item) {
        if (item.itemType == "thesis") {
            try {
                var university = item.getField("university") as string;
                const place = this.getUniversityPlace(university);
                item.setField("place", place);
                await item.saveTx();
            } catch (error) {
                ztoolkit.log("失败", error);
            }
        } else {
            ztoolkit.log(`[Place] Item type ${item.itemType} is not thesis, skip it.`);
        }
    }

    /**
     * Get place of university from local dataset.
     *
     * @param university - The full name of university
     * @param dataBase - local dataset
     * @returns
     * - String of `place` when when this university exist in the local dataset
     * - `false` when this university does not exist in local dataset
     */
    @descriptor
    static getUniversityPlace(university: string, dataBase = universityPlaceLocalData) {
        var place = dataBase[university];
        if (place == "" || place == null || place == undefined) {
            ztoolkit.log(`[Place] ${university} do not have place in local data set`);
            return "";
        } else {
            return place;
        }
    }

    /* 条目语言 */

    @descriptor
    static async updateLanguage(item: Zotero.Item) {
        const title = item.getField("title") as string;
        const languageISO639_3 = this.getTextLanguage(title);
        if (languageISO639_3 !== "und") {
            // ISO 639-1 或 639-3 语言代码 转 ISO 3166 国家区域代码
            // TODO: 添加更多映射
            var language = this.toIso3166(languageISO639_3);
            if (!language) {
                language = this.toIso639_1(languageISO639_3);
            }
            item.setField("language", language);
            await item.saveTx();
        } else {
            progressWindow(`Failed to identify the language of text “${title}”`, "failed");
        }
    }

    /**
     * Gets text language
     * @param text
     * @returns  ISO 639-3 code
     */
    @descriptor
    static getTextLanguage(text: string) {
        // 替换 title 中的 HTML 标签以降低 franc 识别错误
        text = this.removeHtmlTag(text);

        const francOption = {
            only: Array(),
            minLength: 10,
        };
        // 文本是否少于 10 字符
        if (text.length < 10) {
            francOption.minLength = 3;
        }
        // 限制常用语言
        if (getPref("lang.only.enable")) {
            getPref("lang.cmn") ?? francOption.only.push("cmn");
            getPref("lang.eng") ?? francOption.only.push("eng");
            const otherLang = getPref("lang.other") as string;
            otherLang !== "" ?? francOption.only.push.apply(otherLang.split(","));
        }
        ztoolkit.log("[lang] Selected ISO 639-3 code is: ", francOption.only);
        return franc(text, francOption);
    }

    /**
     * Removes html tag
     * @param str
     * @returns
     */
    @descriptor
    static removeHtmlTag(str: string) {
        return str.replace(/<[^>]+>/g, "");
    }

    /**
     * Convert ISO 639 code to ISO 3166 code.
     * @param lang - ISO 639
     * @returns ISO 3166 code
     */
    @descriptor
    static toIso3166(lang: string) {
        switch (lang) {
            case "zh":
            case "cmn":
                return "zh-CN";
            case "en":
            case "eng":
                return "en-US";
            default:
                return false;
        }
    }

    /**
     * Convert ISO 639-3 code to ISO 639-1 code.
     * @param iso639_3  - ISO 639-3 code
     * @returns  ISO 639-1 code
     */
    @descriptor
    static toIso639_1(iso639_3: string) {
        return iso6393To6391Data[iso639_3];
    }

    /* 上下标 */

    @descriptor
    static getSelection() {
        const editpaneItemBox = document.activeElement;
        if (editpaneItemBox?.id == "zotero-editpane-item-box" && editpaneItemBox.shadowRoot) {
            const textAreaElement = editpaneItemBox.shadowRoot.activeElement as HTMLInputElement | null;
            if (textAreaElement) {
                const text = textAreaElement.value.substring(
                    textAreaElement.selectionStart!,
                    textAreaElement.selectionEnd!
                );
                if (text) {
                    //console.log(textAreaElement, text, textAreaElement.selectionStart, textAreaElement.selectionEnd);
                    return text;
                } else {
                    ztoolkit.log("[MetaFormat] 未选择待替换文本");
                }
            } else {
                ztoolkit.log("[MetaFormat] 焦点未在文本输入元素");
            }
        } else {
            ztoolkit.log("[MetaFormat] 焦点未在可编辑区");
        }
    }

    static sub() {
        const text = getSelection();
    }
}
