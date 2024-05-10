import { iso6393To6391Data } from "../../data";
import { getPref } from "../../utils/prefs";
import { getTextLanguage } from "../../utils/str";
import { RuleBase, RuleBaseOptions } from "./rule-base";

class UpdateItemLanguageOptions implements RuleBaseOptions {}

export default class UpdateItemLanguage extends RuleBase<UpdateItemLanguageOptions> {
    constructor(options: UpdateItemLanguageOptions) {
        super(options);
    }

    apply(item: Zotero.Item): Zotero.Item {
        // computerProgram do not have field language
        // https://github.com/northword/zotero-format-metadata/issues/185
        // https://www.zotero.org/support/kb/item_types_and_fields#fields_for_software
        if (item.itemType == "computerProgram") return item;
        // WIP: 已有合法 ISO 639 - ISO 3166 代码的，不予处理
        if (verifyIso3166(item.getField("language") as string) && getPref("lang.verifyBefore")) {
            ztoolkit.log("[lang] The item has been skipped due to the presence of valid ISO 639 - ISO 3166 code.");
            return item;
        }
        const title = item.getField("title") as string;
        const language = getTextLanguage(title) ?? "en";
        item.setField("language", language);

        // const languageISO639_3 = getTextLanguage(title);
        // if (languageISO639_3 !== "und") {
        //     // 根据 ISO 639-1 或 639-3 语言代码匹配 ISO 3166 国家区域代码
        //     // TODO: 添加更多映射
        //     let language = getIso3166(languageISO639_3);
        //     if (!language) {
        //         language = toIso639_1(languageISO639_3);
        //     }
        //     if (!language) {
        //         progressWindow(`${title} error, franc return ${languageISO639_3}, to ${language}`, "failed");
        //     } else {
        //         item.setField("language", language);
        //         // await item.saveTx();
        //     }
        // } else {
        //     progressWindow(`Failed to identify the language of text “${title}”`, "failed");
        // }
        return item;
    }
}

/* 条目语言 */

// export { updateLanguage, toIso639_1 };

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
