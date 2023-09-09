import { removeHtmlTag, toSentenceCase } from "../../utils/str";

export { setHtmlTag, titleCase2SentenceCase, replaceGuillemetToBrackets, replaceBracketsToGuillemet };

/* 上下标 */
/**
 * Get the selected text and replace it with text with or without HTML tags depending on the operation.
 * @param tag sub | sup | b | i
 * @returns
 *
 * @see https://stackoverflow.com/questions/31036076/how-to-replace-selected-text-in-a-textarea-with-javascript
 */
function setHtmlTag(tag: string, attribute?: string, value?: string) {
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

async function titleCase2SentenceCase(item: Zotero.Item) {
    const title = item.getField("title") as string;
    const newTitle = toSentenceCase(title);
    item.setField("title", newTitle);
    await item.saveTx();
}

/**
 * Replaces `《》` to `〈〉`
 * @see https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl/issues/204
 */
async function replaceGuillemetToBrackets(item: Zotero.Item) {
    const title = item.getField("title") as string;
    const newTitle = title.replace(/《/g, "〈").replace(/》/g, "〉");
    item.setField("title", newTitle);
    await item.saveTx();
}

/**
 * Replaces `〈〉` to `《》`
 * @see https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl/issues/204
 */
async function replaceBracketsToGuillemet(item: Zotero.Item) {
    const title = item.getField("title") as string;
    // const newTitle = title.replace(/<(?!\/|sub|sup|b|i)/g, "《").replace(/(?<!\/|sub|sup|b|i)>/g, "》");
    const newTitle = title.replace(/〈/g, "《").replace(/〉/g, "》");
    item.setField("title", newTitle);
    await item.saveTx();
}

/**
 * Replaces `"` to `'`, `“ ”` to `‘ ’`
 * 废弃
 * @see https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl/issues/204
 */
async function replaceDoubleQuoteToSingleQuote(item: Zotero.Item) {
    const title = item.getField("title") as string;
    const newTitle = title.replace(/"/g, "'").replace(/“/g, "‘").replace(/”/g, "’");
    item.setField("title", newTitle);
    await item.saveTx();
}

/**
 * Replaces `'` to `"`, `‘ ’` to `“ ”`
 * 废弃
 * @see https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl/issues/204
 */
async function replaceSingleQuoteToDoubleQuote(item: Zotero.Item) {
    const title = item.getField("title") as string;
    const newTitle = title.replace(/'/g, '"').replace(/‘/g, "“").replace(/’/g, "”");
    item.setField("title", newTitle);
    await item.saveTx();
}
