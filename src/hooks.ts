import { disableItemMenu, registerMenu } from "./modules/menu";
import { getPref, registerPrefs, registerPrefsScripts } from "./modules/preference";
import { getString, initLocale } from "./modules/locale";
import { registerMutationObserver, registerNotifier } from "./modules/notifier";
import { config } from "../package.json";
import FormatMetadata from "./modules/formatMetadata";
import { registerShortcuts } from "./modules/shortcuts";
// import { registerPrompt } from "./modules/prompt";
import { richTextToolBar } from "./modules/views/richTextToolBar";

async function onStartup() {
    await Promise.all([Zotero.initializationPromise, Zotero.unlockPromise, Zotero.uiReadyPromise]);
    initLocale();
    ztoolkit.ProgressWindow.setIconURI("default", `chrome://${config.addonRef}/content/icons/favicon.png`);

    const popupWin = new ztoolkit.ProgressWindow(config.addonName, {
        closeOnClick: true,
        closeTime: -1,
    })
        .createLine({
            text: getString("startup.begin"),
            type: "default",
            progress: 0,
        })
        .show();

    registerPrefs();

    registerNotifier();
    registerMutationObserver();

    registerShortcuts();

    // await Zotero.Promise.delay(1000);
    popupWin.changeLine({
        progress: 30,
        text: `[50%] ${getString("startup.begin")}`,
    });

    registerMenu();
    ZoteroPane.itemsView.onSelect.addListener(disableItemMenu); //监听 select 并判断条目类型以判断是否禁用菜单

    // richTextToolBar.creatRichTextDialog();

    await Zotero.Promise.delay(1000);
    popupWin.changeLine({
        progress: 100,
        text: `[100%] ${getString("startup.finish")}`,
    });
    popupWin.startCloseTimer(5000);
}

function onShutdown(): void {
    ztoolkit.unregisterAll();
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
    extraData: { [key: string]: unknown }
) {
    // You can add your code to the corresponding notify type
    ztoolkit.log("notify", event, type, ids, extraData);

    if (event == "add" && type == "item") {
        const regularItems = Zotero.Items.get(ids as number[]).filter(
            // @ts-ignore item has no isFeedItem
            (item) => item.isRegularItem() && !item.isFeedItem
        );
        if (regularItems.length !== 0) {
            FormatMetadata.updateOnItemAdd(regularItems);
            return;
        }
    }

    // 另一种方法
    // ids.forEach((id) => {
    //     const item = Zotero.Items.get(id);
    //     if (event == "add" && type == "item" && item.isRegularItem()) {
    //         FormatMetadata.updateOnItemAdd(item);
    //     }
    // });

    // 弃用的旧版工具条显示 hook，监听 select 条目变换，见 ./module/notify.ts/ZoteroPane.itemsView.onSelect.addListener
    // if (event == "select" && type == "item") {
    //     FormatMetadata.richTextToolbar();
    // }
}

function onMutationObserver(record: MutationRecord, observer: MutationObserver) {
    switch (record.type) {
        case "attributes":
            switch (record.attributeName) {
                case "control":
                    if (getPref("richtext.isEnableToolBar")) {
                        // @ts-ignore
                        if (record.target.attributes.control.nodeValue == "itembox-field-textbox-title") {
                            richTextToolBar.showToolBar();
                        }
                        // @ts-ignore
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
 * @param position 触发批量任务的位置，决定 Zotero Item 的获取方式。 "item" | "collection" | XUL.MenuPopup | "menuFile" | "menuEdit" | "menuView" | "menuGo" | "menuTools" | "menuHelp"
 */
function onUpdateInBatch(mode: string, position: string) {
    let items: Zotero.Item[] = [];
    switch (position) {
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
    if (items.length == 0) return;
    switch (mode) {
        case "std":
            FormatMetadata.updateInBatch(FormatMetadata.updateStdFlow, items);
            break;
        case "abbr":
            FormatMetadata.updateInBatch(FormatMetadata.updateJournalAbbr, items);
            break;
        case "place":
            FormatMetadata.updateInBatch(FormatMetadata.updateUniversityPlace, items);
            break;
        case "lang":
            FormatMetadata.updateInBatch(FormatMetadata.updateLanguage, items);
            break;
        case "lang-manual":
            FormatMetadata.setLanguageManual(items);
            break;
        case "other-field":
            FormatMetadata.updateInBatch(FormatMetadata.updateMetadataByIdentifier, items);
            break;
        case "doi":
            FormatMetadata.updateInBatch(FormatMetadata.updateDOI, items);
            break;
        case "date":
            FormatMetadata.updateInBatch(FormatMetadata.updateDate, items);
            break;
        case "chem":
        default:
            FormatMetadata.unimplemented();
            break;
    }
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
