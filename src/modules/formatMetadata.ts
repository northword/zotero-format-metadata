import { callingLogger, progressWindow } from "../utils/logger";
import { iso6393To6391Data, journalAbbrlocalData, universityPlaceLocalData } from "../data/helper";
import { config } from "../../package.json";
import { franc } from "franc";
import { getPref } from "../utils/prefs";
import { getString } from "../utils/locale";
import { removeDot, removeHtmlTag, toSentenceCase } from "../utils/str";
// import { getAbbrFromLtwaLocally } from "./abbrevIso";

export default class FormatMetadata {
    @callingLogger
    public static unimplemented() {
        window.alert(getString("unimplemented"));
    }

    /**
     * 标准格式化流程
     * @param item
     */
    @callingLogger
    public static async updateStdFlow(item: Zotero.Item) {
        // 作者、期刊、年、期、卷、页 -> 判断语言 -> 匹配缩写 -> 匹配地点 -> 格式化日期 -> 格式化DOI
        getPref("isEnableOtherFields") ? await this.updateMetadataByIdentifier(item) : "skip";
        getPref("isEnableLang") ? await this.updateLanguage(item) : "skip";
        getPref("isEnableAbbr") ? await this.updateJournalAbbr(item) : "skip";
        getPref("isEnablePlace") ? await this.updateUniversityPlace(item) : "skip";
        getPref("isEnableDateISO") && !getPref("isEnableOtherFields") ? await this.updateDate(item) : "skip";
        getPref("isEnableDOI") ? await this.updateUniversityPlace(item) : "skip";
    }

    @callingLogger
    public static updateOnItemAdd(items: Zotero.Item[]) {
        const regularItems = items.filter(
            (item) =>
                item.isRegularItem() &&
                // @ts-ignore item has no isFeedItem
                !item.isFeedItem &&
                // @ts-ignore libraryID is got from item, so get() will never return false
                (getPref("updateOnAddedForGroup") ? true : Zotero.Libraries.get(item.libraryID)._libraryType == "user"),
        );
        if (regularItems.length !== 0 && getPref("add.update")) {
            // FormatMetadata.updateOnItemAdd(regularItems);
            addon.hooks.onUpdateInBatch("std", regularItems);
            return;
        }
    }

    /* 期刊 */

    /**
     * 更新某个条目的期刊/会议缩写
     *
     * @param item
     */
    @callingLogger
    public static async updateJournalAbbr(item: Zotero.Item) {
        // 非 journalArticle 和 conferencePaper 直接跳过
        if (item.itemType !== "journalArticle" && item.itemType !== "conferencePaper") {
            ztoolkit.log(`[Abbr] Item type ${item.itemType} is not journalArticle or conferencePaper, skip it.`);
            return;
        }
        // 无期刊全称直接跳过
        const publicationTitle = item.getField("publicationTitle") as string;
        if (publicationTitle == "") return;
        let journalAbbr = "";
        // 获取条目语言，若无则根据期刊全称判断语言
        const itemLanguage = item.getField("language") ?? this.getTextLanguage(publicationTitle);
        switch (itemLanguage) {
            case "zh":
            case "zh-CN":
                // 中文期刊，是否以全称填充
                // 无缩写
                if (getPref("abbr.usefullZh")) {
                    // 无缩写的，是否以全称替代
                    ztoolkit.log(`[Abbr] The abbr. of ${publicationTitle} is replaced by its full name`);
                    journalAbbr = publicationTitle;
                } else {
                    // 无缩写且不以全称替代，返回空值
                    journalAbbr = "";
                }
                break;

            default: {
                // 英文期刊，获取缩写
                // 1. 从本地数据集获取缩写
                let journalAbbrISO4 = this.getAbbrIso4Locally(publicationTitle, journalAbbrlocalData);
                // 2. 本地无缩写，是否从 ISSN LTWA 推断完整期刊缩写
                if (!journalAbbrISO4 && getPref("abbr.infer")) {
                    journalAbbrISO4 = await this.getAbbrFromLTWAOnline(publicationTitle);
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
                            journalAbbr = this.toJCR(journalAbbrISO4);
                            break;
                        default:
                            journalAbbr = journalAbbrISO4;
                            break;
                    }
                } else {
                    // 无缩写
                    if (getPref("abbr.usefull")) {
                        // 无缩写的，是否以全称替代
                        ztoolkit.log(`[Abbr] The abbr. of ${publicationTitle} is replaced by its full name`);
                        journalAbbr = publicationTitle;
                    } else {
                        // 无缩写且不以全称替代，返回空值
                        journalAbbr = "";
                    }
                }

                break;
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
    @callingLogger
    private static getAbbrIso4Locally(publicationTitle: string, dataBase = journalAbbrlocalData): string | false {
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
    @callingLogger
    private static async getAbbrFromLTWAOnline(publicationTitle: string) {
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
    @callingLogger
    private static toJCR(text: string) {
        return removeDot(text).toUpperCase();
    }

    /* 学校地点 */

    @callingLogger
    public static async updateUniversityPlace(item: Zotero.Item) {
        if (item.itemType == "thesis") {
            try {
                const university = item.getField("university") as string;
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
    @callingLogger
    private static getUniversityPlace(university: string, dataBase = universityPlaceLocalData) {
        const place = dataBase[university];
        if (place == "" || place == null || place == undefined) {
            ztoolkit.log(`[Place] ${university} do not have place in local data set`);
            return "";
        } else {
            return place;
        }
    }

    /* 条目语言 */

    @callingLogger
    public static async updateLanguage(item: Zotero.Item) {
        // WIP: 已有合法 ISO 639 - ISO 3166 代码的，不予处理
        if (this.verifyIso3166(item.getField("language") as string) && getPref("lang.verifyBefore")) {
            ztoolkit.log("[lang] The item has been skipped due to the presence of valid ISO 639 - ISO 3166 code.");
            return;
        }
        const title = item.getField("title") as string;
        const languageISO639_3 = this.getTextLanguage(title);
        if (languageISO639_3 !== "und") {
            // 根据 ISO 639-1 或 639-3 语言代码匹配 ISO 3166 国家区域代码
            // TODO: 添加更多映射
            let language = this.getIso3166(languageISO639_3);
            if (!language) {
                language = this.toIso639_1(languageISO639_3);
            }
            if (!language) {
                progressWindow(`${title} error, franc return ${languageISO639_3}, to ${language}`, "failed");
            } else {
                item.setField("language", language);
                await item.saveTx();
            }
        } else {
            progressWindow(`Failed to identify the language of text “${title}”`, "failed");
        }
    }

    /**
     * Gets text language
     * @param text
     * @returns  ISO 639-3 code
     */
    @callingLogger
    private static getTextLanguage(text: string) {
        // 替换 title 中的 HTML 标签以降低 franc 识别错误
        text = removeHtmlTag(text);

        const francOption = {
            only: [] as string[],
            minLength: 10,
        };
        // 文本是否少于 10 字符
        if (text.length < 10) {
            francOption.minLength = 2;
            // 对于短字符串内容，如果不全为英文，则替换掉英文字母以提高识别准确度
            const textReplaceEN = text.replace(/[a-z]*[A-Z]*/g, "");
            if (textReplaceEN.length > 1) {
                text = textReplaceEN;
            }
        }
        // 限制常用语言
        if (getPref("lang.only.enable")) {
            getPref("lang.only.cmn") ? francOption.only.push("cmn") : "pass";
            getPref("lang.only.eng") ? francOption.only.push("eng") : "pass";
            const otherLang = getPref("lang.only.other") as string;
            otherLang !== "" && otherLang !== undefined
                ? francOption.only.push.apply(otherLang.replace(/ /g, "").split(","))
                : "pass";
        }
        ztoolkit.log("[lang] Selected ISO 639-3 code is: ", francOption.only);
        return franc(text, francOption);
    }

    /**
     * Convert ISO 639 code to ISO 3166 code.
     * @param lang - ISO 639
     * @returns ISO 3166 code
     */
    @callingLogger
    private static getIso3166(lang: string) {
        switch (lang) {
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
    @callingLogger
    public static toIso639_1(iso639_3: string) {
        return iso6393To6391Data[iso639_3] ?? false;
    }

    /**
     * Verify that the given locale code is a valid ISO 3166-1 code
     * // WIP
     * @param locale
     * @returns
     */
    private static verifyIso3166(locale: string) {
        return false;
    }

    /**
     * 设置某字段的值
     * @param item 待处理的条目
     * @param field 待处理的条目字段
     * @param value 待处理的条目字段值
     */
    public static async setFieldValue(item: Zotero.Item, field: Zotero.Item.ItemField, value: any) {
        if (value == undefined) {
            return;
        } else {
            item.setField(field, value);
            await item.saveTx();
        }
    }

    /* 上下标 */
    /**
     * Get the selected text and replace it with text with or without HTML tags depending on the operation.
     * @param tag sub | sup | b | i
     * @returns
     *
     * @see https://stackoverflow.com/questions/31036076/how-to-replace-selected-text-in-a-textarea-with-javascript
     */
    @callingLogger
    public static setHtmlTag(tag: string, attribute?: string, value?: string) {
        const editpaneItemBox = document.activeElement as HTMLInputElement | null;
        if (
            editpaneItemBox !== null &&
            typeof editpaneItemBox.selectionStart == "number" &&
            typeof editpaneItemBox.selectionEnd == "number"
        ) {
            const start = editpaneItemBox.selectionStart;
            const end = editpaneItemBox.selectionEnd;
            let selectedText = editpaneItemBox.value.slice(start, end);
            const attributeText = attribute !== undefined ? ` ${attribute}="${value}"` : "";
            selectedText = selectedText.startsWith(`<${tag}`)
                ? removeHtmlTag(selectedText)
                : `<${tag}${attributeText}>` + selectedText + `</${tag}>`;
            // const text = editpaneItemBox.value.slice(0, start) + selectedText + editpaneItemBox.value.slice(end);
            // editpaneItemBox.value = text;
            editpaneItemBox.setRangeText(selectedText);
            editpaneItemBox.focus();
        }
    }

    /**
     * Updates metadata by identifier
     * 根据 DOI 更新年期卷页链接等字段
     * @param item
     * @returns
     */
    @callingLogger
    private static async translateByDOI(doi: string) {
        const identifier = {
            itemType: "journalArticle",
            DOI: doi,
        };

        const translate = new Zotero.Translate.Search();
        translate.setIdentifier(identifier);
        const translators = await translate.getTranslators();
        translate.setTranslator(translators);

        // {libraryID: options} 避免条目保存
        // https://github.com/zotero/translate/blob/05755f5051a77737c56458440c79964c7a8874cf/src/translation/translate.js#L1208-L1210
        // 配置这一项后返回的不再是 Zotero.Item[]，而是一个包含字段信息的 Object[]
        const newItems = await translate.translate({ libraryID: false });
        const newItem = newItems[0];
        return newItem;
    }

    public static async updateMetadataByIdentifier(item: Zotero.Item, mode: "selected" | "blank" | "all" = "blank") {
        const doi = item.getField("DOI") as string;
        // 不存在 DOI 直接结束
        // todo: 若有附件，尝试从附件获取?
        // todo: 弹出 DOI 输入对话框?
        if (!doi) {
            progressWindow(getString("info-noDOI"), "fail");
            return;
        }
        const newItem = await this.translateByDOI(doi);
        ztoolkit.log("Item retrieved from DOI: ", newItem);

        const fields: Zotero.Item.ItemField[] = [
            "title",
            "publicationTitle",
            "journalAbbreviation",
            "volume",
            "issue",
            "date",
            "pages",
            "issue",
            "ISSN",
            "url",
            "abstractNote",
        ];

        // mode == all: 强制更新，无论原值是否为空：mode == "all" ||
        // 对于一个字段，若 mode == "all"，更新
        //              若 mode == "blank"，且 旧值为空，更新
        //              若 mode == "blank"，且 旧值非空，保持
        //              若 mode == "blank"，且 新值为空，？？

        // 更改 ItemType
        if (mode === "all") {
            ztoolkit.log("Update ItemType");
            newItem["itemTypeID"] = Zotero.ItemTypes.getID(newItem["itemType"]);
            newItem["itemType"] !== item.itemType ? item.setType(newItem["itemTypeID"]) : "pass";
        }

        // 更新 creators
        if (mode === "all" || item.getCreators().length == 0) {
            ztoolkit.log("Update creators");
            item.setCreators(newItem["creators"]);
        }

        for (const field of fields) {
            const newFieldValue = newItem[field] ?? "",
                oldFieldValue = item.getField(field);

            // 当新条目该字段未空时，结束本次循环
            // 存疑：当新条目该字段为空时，可能是该字段确实为空，用户已有条目字段可能是假值。
            // if (!newFieldValue) continue;

            if (!(mode === "all" || !oldFieldValue)) continue;
            ztoolkit.log("update", field);

            switch (field) {
                // case "publicationTitle":
                //     // 当原条目存在期刊名时，不替换
                //     if (oldFieldValue == "") {
                //         item.setField(field, newFieldValue);
                //     }
                //     break;

                // case "journalAbbreviation":
                //     if (newFieldValue.length == oldFieldValue.toString().length){
                //         //
                //     }

                //     break;
                case "url":
                    // 旧的 url 为空、为 WOS 链接时，更新 url
                    if (
                        oldFieldValue == "" ||
                        (typeof oldFieldValue == "string" && oldFieldValue.includes("webofscience"))
                    ) {
                        item.setField(field, newFieldValue);
                    }
                    break;

                case "date":
                    item.setField(field, Zotero.Date.strToISO(newFieldValue));
                    break;

                default:
                    item.setField(field, newFieldValue);
                    break;
            }
        }

        await item.saveTx();
        await Zotero.Promise.delay(3000);
    }

    @callingLogger
    public static async updateDate(item: Zotero.Item) {
        const oldDate = item.getField("date") as string,
            newDate = Zotero.Date.strToISO(oldDate);
        newDate ? item.setField("date", newDate) : "";
        await item.saveTx();
    }

    @callingLogger
    public static async updateDOI(item: Zotero.Item) {
        const doi = item.getField("DOI");
        if (doi && typeof doi == "string") {
            const doiCleand = Zotero.Utilities.cleanDOI(doi);
            doiCleand ? item.setField("DOI", doiCleand) : "pass";
        }
        await item.saveTx();
    }

    @callingLogger
    public static async titleCase2SentenceCase(item: Zotero.Item) {
        const title = item.getField("title") as string;
        const newTitle = toSentenceCase(title);
        item.setField("title", newTitle);
        await item.saveTx();
    }

    private static async isDuplicate(item: Zotero.Item) {
        // const item = Zotero.getActiveZoteroPane().getSelectedItems()[0];
        const itemID = item.id;

        const duplicates = new Zotero.Duplicates("1");
        // console.log("Zotero.Duplicates", duplicates);

        const search = (await duplicates.getSearchObject()) as Zotero.Search;
        // console.log("d.getSearchObject", search);

        const searchResult = await search.search();
        // console.log(searchResult);

        if (searchResult.includes(itemID)) {
            console.log("有重复条目");
            return true;
        } else {
            console.log("未发现重复条目");
            return false;
        }
    }

    public static async duplication(item: Zotero.Item) {
        const isDuplicate = await this.isDuplicate(item);
        if (isDuplicate) {
            // show duplication dialog
        } else {
            // skip
        }
    }
}
