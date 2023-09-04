import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { callingLoggerForMethod, logError, progressWindow } from "../utils/logger";
import { getPref } from "../utils/prefs";
import { waitUtilAsync } from "../utils/wait";
import { capitalizeName } from "./rules/field-creators";
import { updateDate } from "./rules/field-date";
import { updateJournalAbbr } from "./rules/field-journalAbbr";
import { updateLanguage } from "./rules/field-language";
import { updateDOI } from "./rules/field-misc";
import { updateUniversityPlace } from "./rules/field-place";
import { updatePublicationTitle } from "./rules/field-publication";
import { updateMetadataByIdentifier } from "./rules/field-retrive";
import { setHtmlTag, titleCase2SentenceCase } from "./rules/field-title";
import { isDuplicate } from "./rules/item-no-duplicate";
import { checkWebpage } from "./rules/item-webpage";

export { FormatMetadata, updateOnItemAdd, runInBatch };

export default class FormatMetadata {
    @callingLoggerForMethod
    static unimplemented() {
        window.alert(getString("unimplemented"));
    }

    static updateMetadataByIdentifier = updateMetadataByIdentifier;
    static updateLanguage = updateLanguage;
    static capitalizeName = capitalizeName;
    static updatePublicationTitle = updatePublicationTitle;
    static updateJournalAbbr = updateJournalAbbr;
    static updateUniversityPlace = updateUniversityPlace;
    static updateDate = updateDate;
    static updateDOI = updateDOI;
    static titleCase2SentenceCase = titleCase2SentenceCase;
    static setHtmlTag = setHtmlTag;

    static checkDuplication = isDuplicate;
    static checkWebpage = checkWebpage;

    /**
     * 标准格式化流程
     * @param item
     */
    @callingLoggerForMethod
    static async updateStdFlow(item: Zotero.Item) {
        // 作者、期刊、年、期、卷、页 -> 判断语言 -> 作者大小写 -> 匹配缩写 -> 匹配地点 -> 格式化日期 -> 格式化DOI
        getPref("isEnableOtherFields") ? await this.updateMetadataByIdentifier(item) : "skip";
        getPref("isEnableLang") ? await this.updateLanguage(item) : "skip";
        getPref("isEnableCreators") ? await this.capitalizeName(item) : "skip";
        await this.updatePublicationTitle(item);
        getPref("isEnableAbbr") ? await this.updateJournalAbbr(item) : "skip";
        getPref("isEnablePlace") ? await this.updateUniversityPlace(item) : "skip";
        getPref("isEnableDateISO") && !getPref("isEnableOtherFields") ? await this.updateDate(item) : "skip";
        getPref("isEnableDOI") ? await this.updateDOI(item) : "skip";
    }

    @callingLoggerForMethod
    static async updateNewItem(item: Zotero.Item) {
        this.checkWebpage(item);
        this.checkDuplication(item);
        getPref("add.update") ? await this.updateStdFlow(item) : "";
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
}

function updateOnItemAdd(items: Zotero.Item[]) {
    const regularItems = items.filter(
        (item) =>
            item.isRegularItem() &&
            // @ts-ignore item has no isFeedItem
            !item.isFeedItem &&
            // @ts-ignore libraryID is got from item, so get() will never return false
            (getPref("updateOnAddedForGroup") ? true : Zotero.Libraries.get(item.libraryID)._libraryType == "user"),
    );
    if (regularItems.length !== 0) {
        addon.hooks.onUpdateInBatch("newItem", regularItems);
        return;
    }
}

async function run(
    item: Zotero.Item,
    task: {
        processor: (...args: any[]) => Promise<void> | void;
        args: any[];
        // this?: any;)
    },
) {
    // todo: 将所有格式化字段函数都返回 item，统一保存一次，避免多次 SQL，提高效率。
    const args = [item, ...task.args];
    // await task.processor.apply(task.this, args);
    await task.processor(...args);
}

async function runInBatch(
    items: Zotero.Item[],
    task: {
        processor: (...args: any[]) => Promise<void> | void;
        args: any[];
    },
) {
    ztoolkit.log("batch task begin");
    const progress = new ztoolkit.ProgressWindow(config.addonName, {
        closeOnClick: false,
        closeTime: -1,
    })
        .createLine({
            type: "default",
            text: getString("info-batch-init"),
            progress: 0,
            idx: 0,
        })
        .createLine({ text: getString("info-batch-break"), idx: 1 })
        .show();

    await waitUtilAsync(() =>
        // @ts-ignore lines可以被访问到
        Boolean(progress.lines && progress.lines[1]._itemText),
    );
    // @ts-ignore lines可以被访问到
    progress.lines[1]._hbox.addEventListener("click", async (ev: MouseEvent) => {
        ev.stopPropagation();
        ev.preventDefault();
        state = false;
        progress.changeLine({ text: getString("info-batch-stop-next"), idx: 1 });
    });

    if (items.length == 0) {
        progress.createLine({
            type: "fail",
            text: getString("info-batch-no-selected"),
        });
        return;
    }

    const total = items.length;
    let current = 0,
        errNum = 0,
        state = true;
    progress.changeLine({
        type: "default",
        text: `[${current}/${total}] ${getString("info-batch-running")}`,
        progress: 0,
        idx: 0,
    });

    for (const item of items) {
        if (!state) break;
        try {
            // await Zotero.Promise.delay(3000);
            await run(item, task);
            current++;
            progress.changeLine({
                text: `[${current}/${total}] ${getString("info-batch-running")}`,
                progress: (current / total) * 100,
                idx: 0,
            });
        } catch (err) {
            progress.createLine({
                type: "fail",
                text: `${getString("info-batch-has-error")}, ${err}`,
            });
            logError(err, item);
            // ztoolkit.log(err, item);
            errNum++;
        }
    }

    progress.changeLine({
        // type: "default",
        text: `[✔️${current} ${errNum ? ", ❌" + errNum : ""}] ${getString("info-batch-finish")}`,
        progress: 100,
        idx: 0,
    });
    progress.startCloseTimer(5000);
    ztoolkit.log("batch tasks done");
}
