import { getPref } from "../utils/prefs";
import { removeHtmlTag } from "../utils/str";
import Rules from "./rules";

export { getStdLintRules, getNewItemLintRules };

function getStdLintRules() {
    // 作者、期刊、年、期、卷、页 -> 判断语言 -> 作者大小写 -> 匹配缩写 -> 匹配地点 -> 格式化日期 -> 格式化DOI
    const rules = [];
    // getPref("isEnableOtherFields") ? rules.push(new Rules.UpdateMetadata({ mode: "blank" })) : "";
    getPref("isEnableLang") ? rules.push(new Rules.UpdateItemLanguage({})) : "";
    getPref("isEnableCreators") ? rules.push(new Rules.CapitalizeCreators({})) : "";
    getPref("isEnableTitleCase") ? rules.push(new Rules.TitleSentenceCase({})) : "";
    getPref("isEnablePublicationTitle") ? rules.push(new Rules.UpdatePublicationTitle({})) : "";
    getPref("isEnableAbbr") ? rules.push(new Rules.UpdateJournalAbbr({})) : "";
    getPref("isEnablePlace") ? rules.push(new Rules.UpdateUniversityPlace({})) : "";
    getPref("isEnableDateISO") && !getPref("isEnableOtherFields") ? rules.push(new Rules.DateISO({})) : "";
    getPref("isEnableDOI") ? rules.push(new Rules.RemoveDOIPrefix({})) : "";
    getPref("NoExtraZeros") ? rules.push(new Rules.NoExtraZeros({})) : "";
    rules.push(new Rules.ThesisType({}));
    rules.push(new Rules.University({}));
    return rules;
}

function getNewItemLintRules() {
    const rules = [];
    getPref("isEnableCheckWebpage") ? rules.push(new Rules.NoWebPageItem({})) : "skip";
    getPref("isEnableCheckDuplication") ? rules.push(new Rules.NoDuplicatItem({})) : "skip";
    getPref("add.update") ? rules.push(getStdLintRules()) : "";
    return rules.flat();
}

/* 上下标 */
/**
 * Get the selected text and replace it with text with or without HTML tags depending on the operation.
 * @param tag sub | sup | b | i
 * @returns
 *
 * @see https://stackoverflow.com/questions/31036076/how-to-replace-selected-text-in-a-textarea-with-javascript
 */
export function setHtmlTag(tag: string, attribute?: string, value?: string) {
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
