import { config } from "../package.json";
import { checkCompat } from "./modules/compat";
import { registerMenu, registerTextTransformMenu } from "./modules/menu";
import { registerMutationObserver, registerNotifier } from "./modules/notifier";
import { registerPrefs, registerPrefsScripts } from "./modules/preference";
import * as Rules from "./modules/rules";
import { getNewItemLintRules, getStdLintRules, setHtmlTag } from "./modules/rules-presets";
import { LintRunner } from "./modules/rules-runner";
import { registerShortcuts } from "./modules/shortcuts";
import * as Views from "./modules/views";
import { getString, initLocale } from "./utils/locale";
import { getPref } from "./utils/prefs";
import { RuleBase } from "./utils/rule-base";
import { createZToolkit } from "./utils/ztoolkit";

async function onStartup() {
    await Promise.all([Zotero.initializationPromise, Zotero.unlockPromise, Zotero.uiReadyPromise]);
    initLocale();
    registerPrefs();
    registerNotifier();
    await onMainWindowLoad(window);
    checkCompat();
}

async function onMainWindowLoad(win: Window): Promise<void> {
    // Create ztoolkit for every window
    addon.data.ztoolkit = createZToolkit();
    registerMutationObserver();
    registerShortcuts();
    registerMenu();
    registerTextTransformMenu();
}

async function onMainWindowUnload(win: Window): Promise<void> {
    ztoolkit.unregisterAll();
    Object.values(addon.data.dialogs).forEach((dialog) => {
        dialog === undefined ? "" : dialog?.window.close();
    });
}

function onShutdown() {
    onMainWindowUnload(window);
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
                (getPref("add.updateOnAddedForGroup")
                    ? true
                    : // @ts-ignore libraryID is got from item, so get() will never return false
                      Zotero.Libraries.get(item.libraryID)._libraryType == "user"),
        );
        if (items.length !== 0) {
            addon.hooks.onUpdateInBatch("newItem", items);
        }
    }
}

function onMutationObserver(record: MutationRecord, observer: MutationObserver) {
    ztoolkit.log("MutationObserver", record, observer);

    if (record.type == "attributes" && record.attributeName == "control") {
        if (getPref("richtext.isEnableToolBar")) {
            // @ts-ignore 存在 attributes
            if (record.target.attributes.control.nodeValue == "itembox-field-textbox-title") {
                Views.richTextToolBar.showToolBar();
            }
            // @ts-ignore 存在 attributes
            if (record.target.attributes.control.nodeValue == "itembox-field-value-title") {
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
                items = ZoteroPane.getSelectedCollection()?.getChildItems() ?? [];
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
        case "test":
            // 该项仅为调试便利，在此添加待调试功能，通过“测试”菜单触发
            Views.getCreatorsExtOptionDialog();
            return;
        case "chem":
        default:
            window.alert(getString("unimplemented"));
            return;
    }

    if (typeof rules == "undefined") return;

    new LintRunner(items, rules).runInBatch();
}

export default {
    onStartup,
    onMainWindowLoad,
    onMainWindowUnload,
    onShutdown,
    onNotify,
    onMutationObserver,
    onPrefsEvent,
    onShortcuts,
    onUpdateInBatch: onLintInBatch,
};
