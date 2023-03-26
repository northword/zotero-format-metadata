import { config } from "../../package.json";
import Addon from "../addon";
import journalAbbrlocalData from "../data/journal-abbr/journal-abbr-iso4";
import universityPlace from "../data/university-list/university-place";
import iso6393To6391 from "../data/iso-693-3-to-1";
import { HelperExampleFactory, descriptor } from "./examples";
import { franc } from "franc";
import { getPref } from "./untils";
// import { getAbbrFromLtwaLocally } from "./abbrevIso";

interface dict {
    [key: string]: string;
}

export default class FormatMetadata {
    constructor() {}

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

    @descriptor
    static unimplemented() {
        ztoolkit.log("此功能尚未实现。");
        window.alert("此功能尚未实现。");
    }

    @descriptor
    getItems() {
        return Zotero.getActiveZoteroPane().getSelectedItems();
    }

    // // 旧的批量更新通用函数，保留备用
    // // 会导致 callback 里的 this 为 undifined ，弃用。
    // @descriptor
    // static updateBatch(callback: (item: Zotero.Item) => void) {
    //     const items = Zotero.getActiveZoteroPane().getSelectedItems();
    //     var num = 0;
    //     HelperExampleFactory.progressWindow(`Progressing...\nPlease wait.`, "info", (num / items.length) * 100);
    //     for (const item of items) {
    //         callback(item);
    //         num++;
    //         // HelperExampleFactory.progressWindow(`${num}/${items.length}`, 'success', num/items.length*100 );
    //     }
    //     HelperExampleFactory.progressWindow(`Done!`, "success", 100);
    // }

    @descriptor
    static updateBatch(mode: string) {
        const items = Zotero.getActiveZoteroPane().getSelectedItems();
        HelperExampleFactory.progressWindow(`Progressing...\nPlease wait.`, "info", 0);
        switch (mode) {
            case "std":
                items.forEach((item) => {
                    this.updateStdFlow(item);
                }, this);
                break;
            case "abbr":
                items.forEach((item) => {
                    this.updateJournalAbbr(item);
                }, this);
                break;
            case "lang":
                items.forEach((item) => {
                    this.updateLanguage(item);
                }, this);
                break;
            case "place":
                items.forEach((item) => {
                    this.updateUniversityPlace(item);
                }, this);
                break;
            case "doi":
            case "date":
            case "chem":
            default:
                this.unimplemented;
                break;
        }
        HelperExampleFactory.progressWindow(`Done!`, "success", 100);
    }

    static updateStdFlow(item: Zotero.Item) {
        if (getPref("isEnableLang")) {
            this.updateLanguage(item);
        }
        this.updateJournalAbbr(item);
        this.updateUniversityPlace(item);
    }

    /* 期刊 */

    // // 旧的批量更新函数，保留备用
    // @descriptor
    // static async updateJournalAbbrBatch() {
    //     const items = Zotero.getActiveZoteroPane().getSelectedItems();
    //     var num = 0;
    //     HelperExampleFactory.progressWindow(`Progressing...\nPlease wait.`, "info", (num / items.length) * 100);
    //     for (const item of items) {
    //         await this.updateJournalAbbr(item);
    //         num++;
    //         // HelperExampleFactory.progressWindow(`${num}/${items.length}`, 'success', num/items.length*100 );
    //     }
    //     HelperExampleFactory.progressWindow(`Done!`, "success", 100);
    // }

    @descriptor
    static async updateJournalAbbr(item: Zotero.Item) {
        if (item.itemType == "journalArticle" || item.itemType == "conferencePaper") {
            if (item.getField("language") !== "zh") {
                // 英文期刊，获取缩写
                try {
                    var publicationTitle = item.getField("publicationTitle") as string;
                    var journalAbbr = await this.getJournalAbbr(publicationTitle);
                    ztoolkit.log(publicationTitle, journalAbbr);
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

    @descriptor
    static async getJournalAbbr(publicationTitle: string) {
        // 1. 从本地数据集获取缩写
        var journalAbbrISO4 = this.getAbbrIso4Locally(publicationTitle, journalAbbrlocalData);
        // 2. 本地无缩写，是否从 ISSN LTWA 推断完整期刊缩写
        if (!journalAbbrISO4) {
            if (getPref("abbr.infer")) {
                ztoolkit.log(`[Abbr] The abbr. of ${publicationTitle} inferring from LTWA`);
                journalAbbrISO4 = await this.getAbbrFromLTWA(publicationTitle);
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

    @descriptor
    static getAbbrIso4Locally(publicationTitle: string, dataBase: dict = journalAbbrlocalData) {
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

    @descriptor
    static async getAbbrFromLTWA(publicationTitle: string) {
        publicationTitle = encodeURI(publicationTitle);
        var url = `https://abbreviso.toolforge.org/abbreviso/a/${publicationTitle}`;
        const res = await Zotero.HTTP.request("GET", url)
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

    @descriptor
    static toJCR(text: string) {
        return this.removeDot(text).toUpperCase();
    }

    /* 学校地点 */

    @descriptor
    static async updateUniversityPlace(item: Zotero.Item, dataBase: dict = universityPlace) {
        if (item.itemType == "thesis") {
            try {
                var university = item.getField("university") as string;
                const place = this.getUniversityPlace(university, dataBase);
                item.setField("place", place);
                await item.saveTx();
            } catch (error) {
                ztoolkit.log("失败", error);
            }
        } else {
            ztoolkit.log(`[Abbr] Item type ${item.itemType} is not thesis, skip it.`);
        }
    }

    @descriptor
    static getUniversityPlace(university: string, dataBase: dict) {
        var place = dataBase[university];
        if (place == "" || place == null || place == undefined) {
            ztoolkit.log(`${university} do not have place in ${dataBase}`);
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
            const languageISO639_1 = iso6393To6391[languageISO639_3];
            item.setField("language", languageISO639_1);
            // TODO: ISO 639-1 或 639-3 语言代码 转 ISO 3166 国家区域代码
            await item.saveTx();
        } else {
            HelperExampleFactory.progressWindow(`“${title}” 过短，无法判断`, "error");
        }
    }

    @descriptor
    static getTextLanguage(text: string) {
        // 替换 title 中的 HTML 标签以降低 franc 识别错误
        text = this.delHtmlTag(text);

        // 文本是否少于 10 字符

        // 获取限制识别语言的首选项
        const allowLanguage = Array();
        const francOption = {
            only: allowLanguage,
        };
        if (getPref("lang.only.enable")) {
            getPref("lang.cmn") ?? allowLanguage.push("cmn");
            getPref("lang.eng") ?? allowLanguage.push("eng");
            const otherLang = getPref("lang.other") as string;
            otherLang !== "" ?? allowLanguage.push.apply(otherLang.split(","));
        }
        ztoolkit.log("Selected ISO 639-3 code is: ", allowLanguage);
        return franc(text, francOption);
    }

    @descriptor
    static delHtmlTag(str: string) {
        return str.replace(/<[^>]+>/g, "");
    }
}
