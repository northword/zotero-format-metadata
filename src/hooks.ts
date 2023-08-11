import { registerPrefs, registerPrefsScripts } from "./modules/preference";
import { getPref } from "./utils/prefs";
import { getString, initLocale } from "./utils/locale";
import { registerMutationObserver, registerNotifier } from "./modules/notifier";
import { config } from "../package.json";
import { FormatMetadata, runInBatch, updateOnItemAdd } from "./modules/formatMetadata";
import { registerMenu, registerTextTransformMenu } from "./modules/menu";
import { registerShortcuts } from "./modules/shortcuts";
// import { registerPrompt } from "./modules/prompt";
import { richTextToolBar } from "./modules/views/richTextToolBar";
import { setLanguageManualDialog } from "./modules/views/setLanguageManualDialog";
import { createZToolkit } from "./utils/ztoolkit";
import { waitUtilAsync } from "./utils/wait";

async function onStartup() {
    await Promise.all([Zotero.initializationPromise, Zotero.unlockPromise, Zotero.uiReadyPromise]);
    initLocale();
    registerPrefs();
    registerNotifier();
    await onMainWindowLoad(window);
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

/**
 * This function is just an example of dispatcher for Notify events.
 * Any operations should be placed in a function to keep this funcion clear.
 */
async function onNotify(
    event: string,
    type: string,
    ids: Array<string | number>,
    extraData: { [key: string]: unknown },
) {
    ztoolkit.log("notify", event, type, ids, extraData);

    if (event == "add" && type == "item") {
        updateOnItemAdd(Zotero.Items.get(ids as number[]));
    }
}

function onMutationObserver(record: MutationRecord, observer: MutationObserver) {
    ztoolkit.log("MutationObserver", record, observer);
    switch (record.type) {
        case "attributes":
            switch (record.attributeName) {
                case "control":
                    if (getPref("richtext.isEnableToolBar")) {
                        // @ts-ignore 存在 attributes
                        if (record.target.attributes.control.nodeValue == "itembox-field-textbox-title") {
                            richTextToolBar.showToolBar();
                        }
                        // @ts-ignore 存在 attributes
                        if (record.target.attributes.control.nodeValue == "itembox-field-value-title") {
                            richTextToolBar.closeToolBar();
                        }
                    }
                    break;

                default:
                    break;
            }
            break;
        case "childList":
            break;
        default:
            break;
    }
}

/**
 * This function is just an example of dispatcher for Preference UI events.
 * Any operations should be placed in a function to keep this funcion clear.
 * @param type event type
 * @param data event data
 */
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
            FormatMetadata.setHtmlTag("sub");
            break;
        case "supscript":
            FormatMetadata.setHtmlTag("sup");
            break;
        case "bold":
            FormatMetadata.setHtmlTag("b");
            break;
        case "italic":
            FormatMetadata.setHtmlTag("i");
            break;
        case "nocase":
            FormatMetadata.setHtmlTag("span", "class", "nocase");
            break;
        case "confliction":
            break;
        default:
            break;
    }
}

// Add your hooks here. For element click, etc.
// Keep in mind hooks only do dispatch. Don't add code that does real jobs in hooks.
// Otherwise the code would be hard to read and maintian.

/**
 * 分发批量执行某函数的任务
 * @param mode 批量处理任务的类别，决定调用的函数
 * @param items 需要批量处理的 Zotero.Item[]，或通过触发批量任务的位置决定 Zotero Item 的获取方式。 "item" | "collection" | XUL.MenuPopup | "menuFile" | "menuEdit" | "menuView" | "menuGo" | "menuTools" | "menuHelp"
 */
async function onUpdateInBatch(mode: string, items: Zotero.Item[] | "item" | "collection" | string) {
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

    let processor: (...args: any[]) => Promise<void> | void,
        args: any[] = [];

    switch (mode) {
        case "std":
            processor = FormatMetadata.updateStdFlow.bind(FormatMetadata);
            break;
        case "checkDuplication":
            processor = FormatMetadata.checkDuplication.bind(FormatMetadata);
            break;
        case "abbr":
            processor = FormatMetadata.updateJournalAbbr.bind(FormatMetadata);
            break;
        case "place":
            processor = FormatMetadata.updateUniversityPlace.bind(FormatMetadata);
            break;
        case "lang":
            processor = FormatMetadata.updateLanguage.bind(FormatMetadata);
            break;
        case "lang-manual":
            args = ["language", await setLanguageManualDialog()];
            processor = FormatMetadata.setFieldValue.bind(FormatMetadata);
            break;
        case "getAllFieldViaDOI":
            processor = FormatMetadata.updateMetadataByIdentifier.bind(FormatMetadata);
            args = ["all"];
            break;
        case "getBlankFieldViaDOI":
            processor = FormatMetadata.updateMetadataByIdentifier.bind(FormatMetadata);
            args = ["blank"];
            break;
        case "doi":
            processor = FormatMetadata.updateDOI.bind(FormatMetadata);
            break;
        case "date":
            processor = FormatMetadata.updateDate.bind(FormatMetadata);
            break;
        case "toSentenceCase":
            processor = FormatMetadata.titleCase2SentenceCase.bind(FormatMetadata);
            break;
        case "capitalizeName":
            processor = FormatMetadata.capitalizeName.bind(FormatMetadata);
            break;
        case "chem":
        default:
            FormatMetadata.unimplemented();
            return;
    }

    if (typeof processor == "undefined") return;

    runInBatch(items, { processor: processor, args: args });
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
    onUpdateInBatch,
};
