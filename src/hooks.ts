import { config } from "../package.json";
import { getString, initLocale } from "./modules/locale";
import { registerPrefs, registerPrefsScripts } from "./modules/preference";
import { registerMenu } from "./modules/menu";
import { registerShortcuts } from "./modules/shortcuts";
import { registerPrompt } from "./modules/prompt";
import { progressWindow } from "./modules/untils";
import FormatMetadata from "./modules/formatMetadata";

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

    // BasicExampleFactory.registerNotifier();

    // registerShortcuts();

    await Zotero.Promise.delay(1000);
    popupWin.changeLine({
        progress: 30,
        text: `[30%] ${getString("startup.begin")}`,
    });

    registerMenu();

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
async function onNotify(event: string, type: string, ids: Array<string | number>, extraData: { [key: string]: any }) {
    // You can add your code to the corresponding notify type
    ztoolkit.log("notify", event, type, ids, extraData);
    if (event == "select" && type == "tab" && extraData[ids[0]].type == "reader") {
        // BasicExampleFactory.exampleNotifierCallback();
    } else {
        return;
    }
}

/**
 * This function is just an example of dispatcher for Preference UI events.
 * Any operations should be placed in a function to keep this funcion clear.
 * @param type event type
 * @param data event data
 */
async function onPrefsEvent(type: string, data: { [key: string]: any }) {
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
        case "larger":
            // KeyExampleFactory.exampleShortcutLargerCallback();
            break;
        case "confliction":
            // KeyExampleFactory.exampleShortcutConflictingCallback();
            break;
        default:
            break;
    }
}

// Add your hooks here. For element click, etc.
// Keep in mind hooks only do dispatch. Don't add code that does real jobs in hooks.
// Otherwise the code would be hard to read and maintian.

function onUpdateInBatch(mode: string) {
    const items = Zotero.getActiveZoteroPane().getSelectedItems();
    progressWindow(`Progressing...\nPlease wait.`, "info", 0);
    switch (mode) {
        case "std":
            items.forEach((item) => {
                FormatMetadata.updateStdFlow(item);
            }, FormatMetadata);
            break;
        case "abbr":
            items.forEach((item) => {
                FormatMetadata.updateJournalAbbr(item);
            }, FormatMetadata);
            break;
        case "lang":
            items.forEach((item) => {
                FormatMetadata.updateLanguage(item);
            }, FormatMetadata);
            break;
        case "place":
            items.forEach((item) => {
                FormatMetadata.updateUniversityPlace(item);
            }, FormatMetadata);
            break;
        case "doi":
        case "date":
        case "chem":
        default:
            FormatMetadata.unimplemented();
            break;
    }
    progressWindow(`Done!`, "success", 100);
}

export default {
    onStartup,
    onShutdown,
    onNotify,
    onPrefsEvent,
    onShortcuts,
    onUpdateInBatch,
};
