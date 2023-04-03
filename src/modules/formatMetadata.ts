import { journalAbbrlocalData, universityPlaceLocalData, iso6393To6391Data } from "../data/helper";
import { franc } from "franc";
import { getPref } from "./preference";
import { descriptor, progressWindow } from "./untils";
// import { getAbbrFromLtwaLocally } from "./abbrevIso";

export default class FormatMetadata {
    constructor() {}

    @descriptor
    public static unimplemented() {
        ztoolkit.log("此功能尚未实现。");
        window.alert("此功能尚未实现。");
    }

    /**
     * 标准格式化流程
     * @param item
     */
    @descriptor
    public static updateStdFlow(item: Zotero.Item) {
        getPref("isEnableLang") ? this.updateLanguage(item) : "skip";
        getPref("isEnableAbbr") ? this.updateJournalAbbr(item) : "skip";
        getPref("isEnablePlace") ? this.updateUniversityPlace(item) : "skip";
    }

    @descriptor
    public static updateOnItemAdd(ids: Array<string | number>) {
        ztoolkit.log("add.update ", getPref("add.update"));
        if (getPref("add.update")) {
            var err = 0;
            ids.forEach((id) => {
                try {
                    const item = Zotero.Items.get(id);
                    this.updateStdFlow(item);
                    // ztoolkit.log("Update on item added.");
                } catch (error) {
                    ztoolkit.log(error);
                    err++;
                }
            });
            progressWindow(`Updated ${ids.length} items, ${ids.length - err} success, ${err} failed.`);
        }
    }

    /* 期刊 */

    /**
     * 更新某个条目的期刊/会议缩写
     *
     * @param item
     */
    @descriptor
    public static async updateJournalAbbr(item: Zotero.Item) {
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
    private static async getJournalAbbr(publicationTitle: string): Promise<string> {
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
    private static getAbbrIso4Locally(publicationTitle: string, dataBase = journalAbbrlocalData): string | false {
        // 处理传入文本
        publicationTitle = publicationTitle.toLowerCase().trim();
        publicationTitle.startsWith("the ") ? publicationTitle.replace("the", "") : "pass";
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
     * This API infer journal abbreviation from ISSN List of Title Word Abbreviations.
     * Until March 31, 2023, this API uses the LTWA released in 2017.
     * @param publicationTitle
     * @returns
     * - String of `ISO 4 with dot abbr` when API returns a valid response
     * - `false` when API returns an invalid response
     */
    @descriptor
    private static async getAbbrFromLTWAOnline(publicationTitle: string) {
        publicationTitle = encodeURI(publicationTitle);
        var url = `https://abbreviso.toolforge.org/abbreviso/a/${publicationTitle}`;
        const res = await Zotero.HTTP.request("GET", url);
        const result = res.response as string;
        if (result == "" || result == null || result == undefined) {
            ztoolkit.log("[Abbr] Failed to infer the abbr. from LTWA");
            return false;
        }
        return result;
    }

    @descriptor
    private static removeDot(text: string) {
        return text.replace(/\./g, "");
    }

    /**
     * Convert ISO 4 with dot format to JCR format.
     * @param text
     * @returns String with dots removed and capitalized
     */
    @descriptor
    private static toJCR(text: string) {
        return this.removeDot(text).toUpperCase();
    }

    /* 学校地点 */

    @descriptor
    public static async updateUniversityPlace(item: Zotero.Item) {
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
    private static getUniversityPlace(university: string, dataBase = universityPlaceLocalData) {
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
    public static async updateLanguage(item: Zotero.Item) {
        // WIP: 已有合法 ISO 3166 代码的，不予处理
        if (this.verifyIso3166(item.getField("language") as string) && getPref("lang.verifyBefore")) {
            ztoolkit.log("[lang] The item has been skipped due to the presence of valid ISO 3166 code.");
            return;
        }
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
    private static getTextLanguage(text: string) {
        // 替换 title 中的 HTML 标签以降低 franc 识别错误
        text = this.removeHtmlTag(text);

        const francOption = {
            only: Array(),
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
     * Removes html tag
     * @param str
     * @returns
     */
    @descriptor
    private static removeHtmlTag(str: string) {
        return str.replace(/<[^>]+>/g, "");
    }

    /**
     * Convert ISO 639 code to ISO 3166 code.
     * @param lang - ISO 639
     * @returns ISO 3166 code
     */
    @descriptor
    private static toIso3166(lang: string) {
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
    private static toIso639_1(iso639_3: string) {
        return iso6393To6391Data[iso639_3];
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

    /* 上下标 */
    /**
     * Get the selected text and replace it with text with or without HTML tags depending on the operation.
     * @param mode sub | sup | bold | italic
     * @returns
     *
     * @see https://stackoverflow.com/questions/31036076/how-to-replace-selected-text-in-a-textarea-with-javascript
     */
    @descriptor
    public static setHtmlTag(mode?: string) {
        const editpaneItemBox = document.activeElement as HTMLInputElement | null;
        if (editpaneItemBox) {
            if (typeof editpaneItemBox.selectionStart == "number" && typeof editpaneItemBox.selectionEnd == "number") {
                var start = editpaneItemBox.selectionStart;
                var end = editpaneItemBox.selectionEnd;
                var selectedText = editpaneItemBox.value.slice(start, end);
                var before = editpaneItemBox.value.slice(0, start);
                var after = editpaneItemBox.value.slice(end);
                // console.log(start, end, selectedText, before, after);
                switch (mode) {
                    case "sub":
                        selectedText = selectedText.startsWith("<sub>")
                            ? this.removeHtmlTag(selectedText)
                            : "<sub>" + selectedText + "</sub>";
                        break;
                    case "sup":
                        selectedText = selectedText.startsWith("<sup>")
                            ? this.removeHtmlTag(selectedText)
                            : "<sup>" + selectedText + "</sup>";
                        break;
                    case "bold":
                        selectedText = selectedText.startsWith("<b>")
                            ? this.removeHtmlTag(selectedText)
                            : "<b>" + selectedText + "</b>";
                        break;
                    case "italic":
                        selectedText = selectedText.startsWith("<i>")
                            ? this.removeHtmlTag(selectedText)
                            : "<i>" + selectedText + "</i>";
                        break;
                    default:
                        break;
                }
                var text = before + selectedText + after;
                editpaneItemBox.value = text;
            }
        }
    }

    @descriptor
    public static richTextToolbar() {
        var richTextToolBarWarper = document.createElement("div");
        richTextToolBarWarper.id = "format-metadata-richTextToolBar-warper";
        // richTextToolBarWarper.innerHTML = "===========";
        richTextToolBarWarper.style.display = "none";
        richTextToolBarWarper.style.textAlign = "center";

        var imgWarp = document.createElement("img");

        const btnList = ["subscript", "supscript", "bold", "italic"];
        btnList.forEach((btn) => {
            var button = document.createElement("button");
            button.id = `format-metadata-richTextToolBar-${btn}`;
            button.setAttribute("title", `${btn}`);
            button.setAttribute("class", "toolbar-button");
            button.innerHTML = `${btn}`;
            button.append(imgWarp);
            button.addEventListener("click", (ev: Event) => {
                addon.hooks.onShortcuts(`${btn}`);
            });
            richTextToolBarWarper.append(button);
        });

        var row = document.getElementById("dynamic-fields")?.getElementsByTagName("row")["1"];
        row?.before(richTextToolBarWarper);
        // ztoolkit.log(row);

        // https://developer.mozilla.org/zh-CN/docs/Web/API/Element/focus_event
        function showToolbarListener() {
            // `itembox-field-value-title` 被点击时，显示 toolbar
            document
                .getElementById("itembox-field-value-title")
                ?.addEventListener("click", showToolbarListenerCallback, true);
        }

        function showToolbarListenerCallback() {
            richTextToolBarWarper.style.display = "";
            hiddenToolbarListener();
            document
                .getElementById("itembox-field-value-title")
                ?.removeEventListener("click", showToolbarListenerCallback, true);
        }

        function hiddenToolbarListener() {
            // `itembox-field-textbox-title` 失焦时，隐藏 toolbar
            document
                .getElementById("itembox-field-textbox-title")
                ?.addEventListener("blur", hiddenToolbarListenerCallback, true);
        }

        async function hiddenToolbarListenerCallback() {
            richTextToolBarWarper.style.display = "none";
            await Zotero.Promise.delay(500);
            document
                .getElementById("itembox-field-textbox-title")
                ?.removeEventListener("blur", hiddenToolbarListenerCallback, true);

            ztoolkit.log("add show again listener");
            if (document.getElementById("itembox-field-value-title")) {
                showToolbarListener();
                // ztoolkit.log(document.getElementById("itembox-field-value-title"));
            } else {
                ztoolkit.log("`itembox-field-value-title` not exist, check `textbox` is exist");
                if (document.getElementById("itembox-field-textbox-title")) {
                    richTextToolBarWarper.style.display = "";
                    hiddenToolbarListener();
                } else {
                    ztoolkit.log("`itembox-field-textbox-title` not exist, add show again listener again");
                    // showToolbarListener();
                }
            }
        }

        showToolbarListener();
    }
}
