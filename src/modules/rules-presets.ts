import { getPref } from "../utils/prefs";
import { removeHtmlTag } from "../utils/str";
import Rules from "./rules";

export { getStdLintRules, getNewItemLintRules };

function getStdLintRules() {
    // 作者、期刊、年、期、卷、页 -> 判断语言 -> 作者大小写 -> 匹配缩写 -> 匹配地点 -> 格式化日期 -> 格式化DOI
    const rules = [];
    // getPref("isEnableOtherFields") ? rules.push(new Rules.UpdateMetadata({ mode: "blank" })) : "";
    getPref("noDuplicationItems") ? rules.push(new Rules.NoDuplicatItem({})) : "skip";
    getPref("checkWebpage") ? rules.push(new Rules.NoWebPageItem({})) : "skip";
    getPref("noPreprintJournalArticle") ? rules.push(new Rules.NoPreprintJournalArticle({})) : "skip";
    getPref("lang") ? rules.push(new Rules.UpdateItemLanguage({})) : "";
    getPref("creatorsCase") ? rules.push(new Rules.CapitalizeCreators({})) : "";
    getPref("titleSentenceCase") ? rules.push(new Rules.TitleSentenceCase({})) : "";
    getPref("publicationTitleCase") ? rules.push(new Rules.UpdatePublicationTitle({})) : "";
    getPref("abbr") ? rules.push(new Rules.UpdateJournalAbbr({})) : "";
    getPref("universityPlace") ? rules.push(new Rules.UpdateUniversityPlace({})) : "";
    getPref("dateISO") && !getPref("isEnableOtherFields") ? rules.push(new Rules.DateISO({})) : "";
    getPref("noDOIPrefix") ? rules.push(new Rules.RemoveDOIPrefix({})) : "";
    getPref("noExtraZeros") ? rules.push(new Rules.NoExtraZeros({})) : "";
    getPref("pagesConnector") ? rules.push(new Rules.PagesConnector({})) : "";
    getPref("thesisType") ? rules.push(new Rules.ThesisType({})) : "";
    getPref("university") ? rules.push(new Rules.University({})) : "";
    return rules;
}

function getNewItemLintRules() {
    const rules = [];
    getPref("lint.onAdded") ? rules.push(getStdLintRules()) : "";
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
