import { journalAbbrlocalData } from "../../data";
import { isFullUpperCase, normalizeKey } from "../../utils/str";

export { updatePublicationTitle };

async function updatePublicationTitle(item: Zotero.Item) {
    const publicationTitle = item.getField("publicationTitle") as string;
    let newPublicationTitle = "";
    const publicationTitleDisambiguation = getPublicationTitleDisambiguation(publicationTitle);
    if (publicationTitleDisambiguation) {
        newPublicationTitle = publicationTitleDisambiguation;
    } else {
        newPublicationTitle = publicationTitle;
        // 大写的，小写化
    }
    item.setField("publicationTitle", newPublicationTitle);
    await item.saveTx();
}

const skipWordsForPublicationTitle = [];

// 期刊名应词首大写
function capitalizePublicationTitle(item: Zotero.Item) {
    const publicationTitle = item.getField("publicationTitle") as string;
    // 仅当其为全大写时处理，以减少误伤
    if (isFullUpperCase(publicationTitle)) {
        //
    }
}

// 期刊全称消岐
function getPublicationTitleDisambiguation(publicationTitle: string, dataBase = journalAbbrlocalData) {
    const normalizedInputKey = normalizeKey(publicationTitle);

    for (const originalKey of Object.keys(dataBase)) {
        const normalizedOriginalKey = normalizeKey(originalKey);

        if (normalizedInputKey === normalizedOriginalKey) {
            return originalKey;
        }
    }
    return false;
}
