import { registerPrefs, registerPrefsScripts } from "./modules/preference";
import { getPref } from "./utils/prefs";
import { getString, initLocale } from "./utils/locale";
import { registerMutationObserver, registerNotifier } from "./modules/notifier";
import { config } from "../package.json";
import FormatMetadata from "./modules/formatMetadata";
import { registerMenu, registerTextTransformMenu } from "./modules/menu";
import { registerShortcuts } from "./modules/shortcuts";
// import { registerPrompt } from "./modules/prompt";
import { richTextToolBar } from "./modules/views/richTextToolBar";
import { setLanguageManualDialog } from "./modules/views/setLanguageManualDialog";

async function onStartup() {
    await Promise.all([Zotero.initializationPromise, Zotero.unlockPromise, Zotero.uiReadyPromise]);
    initLocale();
    ztoolkit.ProgressWindow.setIconURI("default", `chrome://${config.addonRef}/content/icons/favicon.png`);

    registerPrefs();

    registerNotifier();
    registerMutationObserver();

    registerShortcuts();

    registerMenu();
    registerTextTransformMenu();
}

function onShutdown() {
    ztoolkit.unregisterAll();
    Object.values(addon.data.dialogs).forEach((dialog) => {
        dialog === undefined ? "" : dialog?.window.close();
    });
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
        FormatMetadata.updateOnItemAdd(Zotero.Items.get(ids as number[]));
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
    if (items.length == 0) return;

    const task: {
        processor?: (...args: any[]) => Promise<void> | void;
        args: any[];
        // this?: any;
    } = {
        args: [],
        // this: FormatMetadata,
    };

    switch (mode) {
        case "std":
            task.processor = FormatMetadata.updateStdFlow.bind(FormatMetadata);
            break;
        case "abbr":
            task.processor = FormatMetadata.updateJournalAbbr.bind(FormatMetadata);
            break;
        case "place":
            task.processor = FormatMetadata.updateUniversityPlace.bind(FormatMetadata);
            break;
        case "lang":
            task.processor = FormatMetadata.updateLanguage.bind(FormatMetadata);
            break;
        case "lang-manual":
            task.args = ["language", await setLanguageManualDialog()];
            task.processor = FormatMetadata.setFieldValue.bind(FormatMetadata);
            break;
        case "getAllFieldViaDOI":
            task.processor = FormatMetadata.updateMetadataByIdentifier.bind(FormatMetadata);
            break;
        case "doi":
            task.processor = FormatMetadata.updateDOI.bind(FormatMetadata);
            break;
        case "date":
            task.processor = FormatMetadata.updateDate.bind(FormatMetadata);
            break;
        case "toSentenceCase":
            task.processor = FormatMetadata.titleCase2SentenceCase.bind(FormatMetadata);
            break;
        case "chem":
        default:
            FormatMetadata.unimplemented();
            return;
    }

    if (typeof task.processor == "undefined") return;

    const total = items.length;
    let current = 0,
        errNum = 0;
    const popupWin = new ztoolkit.ProgressWindow(config.addonName, {
        closeOnClick: true,
        closeTime: -1,
    })
        .createLine({
            type: "default",
            text: `[${current}/${total}] ${getString("info-batchBegin")}`,
            progress: 0,
        })
        .show();

    for (const item of items) {
        try {
            const args = [item, ...task.args];
            // await task.processor.apply(task.this, args);
            await task.processor(...args);
            current++;
            popupWin.changeLine({
                text: `[${current}/${total}] ${getString("info-batchBegin")}`,
                progress: (current / total) * 100,
            });
        } catch (err) {
            ztoolkit.log(err);
            errNum++;
        }
    }
    popupWin.changeLine({
        // type: "default",
        text: `[✔️${current} ${errNum ? ", ❌" + errNum : ""}] ${getString("info-batchFinish")}`,
        progress: 100,
    });
    popupWin.startCloseTimer(5000);
    ztoolkit.log("batch tasks done");
}

export default {
    onStartup,
    onShutdown,
    onNotify,
    onMutationObserver,
    onPrefsEvent,
    onShortcuts,
    onUpdateInBatch,
};
