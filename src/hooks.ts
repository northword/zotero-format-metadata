import { config } from "../package.json";
import { checkCompat } from "./modules/compat";
import { registerMenu, registerTextTransformMenu } from "./modules/menu";
import { registerMutationObserver, registerNotifier } from "./modules/notifier";
import { registerPrefs, registerPrefsScripts } from "./modules/preference";
import Rules from "./modules/rules";
import { getNewItemLintRules, getStdLintRules, setHtmlTag } from "./modules/rules-presets";
import { LintRunner, Task } from "./modules/rules-runner";
import { RuleBase } from "./modules/rules/rule-base";
import { registerShortcuts } from "./modules/shortcuts";
import * as Views from "./modules/views";
import { getString, initLocale } from "./utils/locale";
import { getPref } from "./utils/prefs";
import { createZToolkit } from "./utils/ztoolkit";

async function onStartup() {
    await Promise.all([Zotero.initializationPromise, Zotero.unlockPromise, Zotero.uiReadyPromise]);
    initLocale();
    registerPrefs();
    registerNotifier();
    await Promise.all(Zotero.getMainWindows().map((win) => onMainWindowLoad(win)));
    checkCompat();
}

async function onMainWindowLoad(win: Window): Promise<void> {
    // Create ztoolkit for every window
    addon.data.ztoolkit = createZToolkit();
    registerMutationObserver(win);
    // Views.richTextToolBar.init();
    registerShortcuts();
    registerMenu();
    registerTextTransformMenu(win);
}

async function onMainWindowUnload(win: Window): Promise<void> {
    ztoolkit.unregisterAll();
    Object.values(addon.data.dialogs).forEach((dialog) => {
        if (dialog !== undefined) dialog.window.close();
    });
}

function onShutdown() {
    ztoolkit.unregisterAll();
    Object.values(addon.data.dialogs).forEach((dialog) => {
        if (dialog !== undefined) dialog.window.close();
    });
    // addon.data.dialogs = {};
    // Remove addon object
    addon.data.alive = false;
    delete Zotero[config.addonInstance];
}

async function onNotify(
    event: string,
    type: string,
    ids: Array<string | number>,
    extraData: { [key: string]: unknown },
) {
    ztoolkit.log("notify", event, type, ids, extraData);

    if (event == "add" && type == "item") {
        const items = Zotero.Items.get(ids as number[]).filter(
            (item) =>
                item.isRegularItem() &&
                // @ts-ignore item has no isFeedItem
                !item.isFeedItem &&
                (getPref("lint.onGroup")
                    ? true
                    : // @ts-ignore libraryID is got from item, so get() will never return false
                      Zotero.Libraries.get(item.libraryID)._libraryType == "user") &&
                !extraData.skipAutoSync,
            // Zotero.Date.sqlToDate(item.dateAdded, true) &&
            // @ts-ignore 前已验证Zotero.Date.sqlToDate不为false
            // new Date().getMilliseconds() - Zotero.Date.sqlToDate(item.dateAdded, true).getMilliseconds() < 500,
        );
        if (items.length !== 0) {
            addon.hooks.onLintInBatch("newItem", items);
        }
    }
}

function onMutationObserver(record: MutationRecord, observer: MutationObserver) {
    ztoolkit.log("MutationObserver", record, observer);

    if (record.type == "attributes" && record.attributeName == "class") {
        if (getPref("richtext.toolBar")) {
            // @ts-ignore 存在 attributes
            if (record.target.className == "focused") {
                Views.richTextToolBar.showToolBar();
            }
            // @ts-ignore 存在 attributes
            if (record.target.className == "") {
                Views.richTextToolBar.closeToolBar();
            }
        }
    }
}

async function onPrefsEvent(type: string, data: { [key: string]: never }) {
    switch (type) {
        case "load":
            registerPrefsScripts(data.window);
            break;
        default:
            return;
    }
}

function onShortcuts(type: string) {
    switch (type) {
        case "subscript":
            setHtmlTag("sub");
            break;
        case "supscript":
            setHtmlTag("sup");
            break;
        case "bold":
            setHtmlTag("b");
            break;
        case "italic":
            setHtmlTag("i");
            break;
        case "nocase":
            setHtmlTag("span", "class", "nocase");
            break;
        case "small-caps":
            setHtmlTag("span", "style", "font-variant:small-caps;");
            break;
        case "confliction":
            break;
        default:
            break;
    }
}

/**
 * 分发批量执行某函数的任务
 * @param mode 批量处理任务的类别，决定调用的函数
 * @param items 需要批量处理的 Zotero.Item[]，或通过触发批量任务的位置决定 Zotero Item 的获取方式。 "item" | "collection" | XUL.MenuPopup | "menuFile" | "menuEdit" | "menuView" | "menuGo" | "menuTools" | "menuHelp"
 */
async function onLintInBatch(mode: string, items: Zotero.Item[] | "item" | "collection" | string) {
    if (typeof items == "string") {
        switch (items) {
            case "item":
                items = Zotero.getActiveZoteroPane().getSelectedItems();
                break;
            case "collection":
                items = Zotero.getActiveZoteroPane().getSelectedCollection()?.getChildItems() ?? [];
                break;
            default:
                items = Zotero.getActiveZoteroPane().getSelectedItems();
                break;
        }
    }

    let rules: RuleBase<any> | RuleBase<any>[] | undefined = undefined;

    switch (mode) {
        case "std":
            rules = getStdLintRules();
            break;
        case "newItem":
            rules = getNewItemLintRules();
            break;
        case "publicationTitle":
            rules = new Rules.UpdatePublicationTitle({});
            break;
        case "abbr":
            rules = new Rules.UpdateJournalAbbr({});
            break;
        case "place":
            rules = new Rules.UpdateUniversityPlace({});
            break;
        case "lang":
            rules = new Rules.UpdateItemLanguage({});
            break;
        case "lang-manual":
            rules = new Rules.SetFieldValue({
                field: "language",
                value: await Views.setLanguageManualDialog(),
            });
            break;
        case "getAllFieldViaDOI":
            rules = new Rules.UpdateMetadata({ mode: "all" });
            break;
        case "getBlankFieldViaDOI":
            rules = new Rules.UpdateMetadata({ mode: "blank" });
            break;
        case "getAllFieldViaDOIAndLint":
            rules = [new Rules.UpdateMetadata({ mode: "all" }), ...getStdLintRules()];
            break;
        case "getBlankFieldViaDOIAndLint":
            rules = [new Rules.UpdateMetadata({ mode: "blank" }), ...getStdLintRules()];
            break;
        case "doi":
            rules = new Rules.RemoveDOIPrefix({});
            break;
        case "date":
            rules = new Rules.DateISO({});
            break;
        case "removeZeros":
            rules = new Rules.NoExtraZeros({});
            break;
        case "toSentenceCase":
            rules = new Rules.TitleSentenceCase({});
            break;
        case "capitalizeName":
            rules = new Rules.CapitalizeCreators({});
            break;
        case "titleBracketsToGuillemet":
            rules = new Rules.TitleGuillemet({ target: "double" });
            break;
        case "titleGuillemetToBrackets":
            rules = new Rules.TitleGuillemet({ target: "single" });
            break;
        case "creatorExt":
            rules = new Rules.UseCreatorsExt(await Views.getCreatorsExtOptionDialog());
            break;
        case "creatorsPinyin":
            rules = new Rules.CreatorsPinyin({});
            break;
        case "test":
            // 该项仅为调试便利，在此添加待调试功能，通过“测试”菜单触发
            rules = new Rules.CreatorsPinyin({});
            break;
        case "chem":
        default:
            Zotero.getMainWindow().alert(getString("unimplemented"));
            return;
    }

    if (rules === undefined) return;
    const tasks = items.filter((item) => item.isRegularItem()).map((item) => ({ item: item, rules })) as Task[];
    new LintRunner(tasks).runInBatch();
}

/**
 * @deprecated use onLintInBatch instead.
 */
const onUpdateInBatch = onLintInBatch;

export default {
    onStartup,
    onMainWindowLoad,
    onMainWindowUnload,
    onShutdown,
    onNotify,
    onMutationObserver,
    onPrefsEvent,
    onShortcuts,
    onLintInBatch,
    onUpdateInBatch,
};
