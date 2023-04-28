import { config } from "../../package.json";
import { getString } from "./locale";

export function registerPrefs() {
    const prefOptions = {
        pluginID: config.addonID,
        src: rootURI + "chrome/content/preferences.xhtml",
        label: getString("prefs.title"),
        image: `chrome://${config.addonRef}/content/icons/favicon.png`,
        extraDTD: [`chrome://${config.addonRef}/locale/overlay.dtd`],
        defaultXUL: true,
    };
    ztoolkit.PreferencePane.register(prefOptions);
}

// https://github.com/windingwind/zotero-pdf-translate/blob/main/src/utils/prefs.ts

export function getPref(key: string) {
    return Zotero.Prefs.get(`${config.prefsPrefix}.${key}`, true);
}

export function setPref(key: string, value: string | number | boolean) {
    return Zotero.Prefs.set(`${config.prefsPrefix}.${key}`, value, true);
}

export function clearPref(key: string) {
    return Zotero.Prefs.clear(`${config.prefsPrefix}.${key}`, true);
}

export function registerPrefsScripts(_window: Window) {
    // This function is called when the prefs window is opened
    // See addon/chrome/content/preferences.xul onpaneload
    if (!addon.data.prefs) {
        addon.data.prefs = {
            window: _window,
        };
    } else {
        addon.data.prefs.window = _window;
    }

    updatePrefsUI();
    bindPrefEvents();
}

async function updatePrefsUI() {
    // You can initialize some UI elements on prefs window
    // with addon.data.prefs.window.document
    // Or bind some events to the elements
    disablePrefsLang();
}

function bindPrefEvents() {
    addon.data.prefs?.window.document.querySelector(`#${config.addonRef}-lang-only-enable`)?.addEventListener("command", (e) => {
        ztoolkit.log(e);
        disablePrefsLang();
    });
}

function disablePrefsLang() {
    const state = getPref("lang.only.enable");
    addon.data.prefs?.window.document.getElementById(`${config.addonRef}-lang-only-cmn`)?.setAttribute("disabled", String(!state));
    addon.data.prefs?.window.document.getElementById(`${config.addonRef}-lang-only-eng`)?.setAttribute("disabled", String(!state));
    // addon.data
    //     .prefs!.window.document.getElementById(`${config.addonRef}-lang-only-other`)!
    //     .setAttribute("disabled", String(!state));
}
