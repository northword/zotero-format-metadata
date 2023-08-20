import { isFullUpperCase } from "../../utils/str";

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
