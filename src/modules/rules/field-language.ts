import { franc } from "franc";
import { progressWindow } from "../../utils/logger";
import { getPref } from "../../utils/prefs";
import { removeHtmlTag } from "../../utils/str";
import { iso6393To6391Data } from "../../data";

/* 条目语言 */

export { updateLanguage, getTextLanguage, toIso639_1 };

async function updateLanguage(item: Zotero.Item) {
    // WIP: 已有合法 ISO 639 - ISO 3166 代码的，不予处理
    if (verifyIso3166(item.getField("language") as string) && getPref("lang.verifyBefore")) {
        ztoolkit.log("[lang] The item has been skipped due to the presence of valid ISO 639 - ISO 3166 code.");
        return;
    }
    const title = item.getField("title") as string;
    const languageISO639_3 = getTextLanguage(title);
    if (languageISO639_3 !== "und") {
        // 根据 ISO 639-1 或 639-3 语言代码匹配 ISO 3166 国家区域代码
        // TODO: 添加更多映射
        let language = getIso3166(languageISO639_3);
        if (!language) {
            language = toIso639_1(languageISO639_3);
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
function getTextLanguage(text: string) {
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
function getIso3166(lang: string) {
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
function toIso639_1(iso639_3: string) {
    return iso6393To6391Data[iso639_3] ?? false;
}

/**
 * Verify that the given locale code is a valid ISO 3166-1 code
 * // WIP
 * @param locale
 * @returns
 */
function verifyIso3166(locale: string) {
    return false;
}
