import { config } from "../../package.json";
import Addon from "../addon";
import journalAbbrISO4 from "../data/journal-abbr-iso4";
import universityPlace from "../data/university-place";
import { HelperExampleFactory } from "./examples";
import { franc } from "franc";
import iso6393To6391 from "../data/iso-693-3-to-1"

interface dict {
    [key: string]: string;
}

export default class FormatMetadata {
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

    static unimplemented() {
        ztoolkit.log("此功能尚未实现。");
        window.alert("此功能尚未实现。");
    }

    getItems() {
        return Zotero.getActiveZoteroPane().getSelectedItems();
    }

    // static async updateBatch( callback ) {
    //     const items = Zotero.getActiveZoteroPane().getSelectedItems();
    //     var num = 0;
    //     HelperExampleFactory.progressWindow(`Progressing...\nPlease wait.`, 'info', num/items.length*100 );
    //     for (const item of items) {
    //         callback();
    //         num++;
    //         // HelperExampleFactory.progressWindow(`${num}/${items.length}`, 'success', num/items.length*100 );
    //     }
    //     HelperExampleFactory.progressWindow(`Done!`, 'success', 100 );
    // }

    /* 期刊 */

    static async updateJournalAbbrBatch() {
        const items = Zotero.getActiveZoteroPane().getSelectedItems();
        var num = 0;
        HelperExampleFactory.progressWindow(`Progressing...\nPlease wait.`, "info", (num / items.length) * 100);
        for (const item of items) {
            this.updateJournalAbbr(item, journalAbbrISO4);
            num++;
            // HelperExampleFactory.progressWindow(`${num}/${items.length}`, 'success', num/items.length*100 );
        }
        HelperExampleFactory.progressWindow(`Done!`, "success", 100);
    }

    static async updateJournalAbbr(item: Zotero.Item, dataBase: dict = journalAbbrISO4) {
        try {
            var publicationTitle = item.getField("publicationTitle") as string;
            publicationTitle = publicationTitle.toLowerCase().trim();
            const journalAbbr = this.getJournalAbbr(publicationTitle, dataBase);
            item.setField("journalAbbreviation", journalAbbr);
            await item.saveTx();
        } catch (error) {
            ztoolkit.log("失败", error);
        }
    }

    static getJournalAbbr(publicationTitle: string, dataBase: dict = journalAbbrISO4) {
        var journalAbbr = dataBase[publicationTitle];
        if (journalAbbr == "" || journalAbbr == null || journalAbbr == undefined) {
            ztoolkit.log(`${publicationTitle} do not have a abbr. in ${dataBase}`);
            // TODO：无期刊缩写的，获取首选项，判断是否以全称替代
            return "";
        } else {
            // TODO：有缩写的，获取首选项，是否处理为 ISO dotless 或 JCR 格式
            return journalAbbr;
        }
    }

    /* 学校地点 */

    static async updateUniversityPlaceBatch() {
        const items = Zotero.getActiveZoteroPane().getSelectedItems();
        var num = 0;
        const popupwin = HelperExampleFactory.progressWindow(`Progressing...\nPlease wait.`, "info", (num / items.length) * 100);
        for (const item of items) {
            this.updateUniversityPlace(item, universityPlace);
            num++;
            // HelperExampleFactory.progressWindowChange(`${num}/${items.length}`, 'success', num/items.length*100 );
        }
        HelperExampleFactory.progressWindow(`Done!`, "success", 100);
    }

    static async updateUniversityPlace(item: Zotero.Item, dataBase: dict = universityPlace) {
        try {
            var university = item.getField("university") as string;
            const place = this.getUniversityPlace(university, dataBase);
            item.setField("place", place);
            await item.saveTx();
        } catch (error) {
            ztoolkit.log("失败", error);
        }
    }

    static getUniversityPlace(university: string, dataBase: dict) {
        var place = dataBase[university];
        if (place == "" || place == null || place == undefined) {
            ztoolkit.log(`${university} do not have place in ${dataBase}`);
            return "";
        } else {
            return place;
        }
    }

    static async updateLanguageBatch() {
        const items = Zotero.getActiveZoteroPane().getSelectedItems();
        var num = 0;
        HelperExampleFactory.progressWindow(`Progressing...\nPlease wait.`, "info", (num / items.length) * 100);
        for (const item of items) {
            this.updateLanguage(item);
            num++;
            // HelperExampleFactory.progressWindow(`${num}/${items.length}`, 'success', num/items.length*100 );
        }
        HelperExampleFactory.progressWindow(`Done!`, "success", 100);
    }

    static async updateLanguage(item: Zotero.Item) {
        const title = item.getField('title') as string
        const languageISO639_3 = franc( title );
        if (languageISO639_3 !== 'und') {
            const languageISO639_1 = iso6393To6391[languageISO639_3];
            item.setField('language', languageISO639_1);
            // TODO: ISO 639-1 或 639-3 语言代码 转 ISO 3166 国家区域代码
            await item.saveTx();
        } else {
            HelperExampleFactory.progressWindow(`“${title}” 过短，无法判断`, "error");
        }

    }

}
