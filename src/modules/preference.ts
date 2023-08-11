import { config, homepage } from "../../package.json";
import { getString } from "../utils/locale";
import { getPref } from "../utils/prefs";

export function registerPrefs() {
    ztoolkit.PreferencePane.register({
        pluginID: config.addonID,
        src: rootURI + "chrome/content/preferences.xhtml",
        label: getString("prefs-title"),
        image: `chrome://${config.addonRef}/content/icons/favicon.png`,
        helpURL: homepage,
        defaultXUL: true,
    });
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
    addon.data.prefs?.window.document
        .querySelector(`#${config.addonRef}-lang-only-enable`)
        ?.addEventListener("command", (e) => {
            ztoolkit.log(e);
            disablePrefsLang();
        });
}

function disablePrefsLang() {
    const state = getPref("lang.only.enable");
    addon.data.prefs?.window.document
        .getElementById(`${config.addonRef}-lang-only-cmn`)
        ?.setAttribute("disabled", String(!state));
    addon.data.prefs?.window.document
        .getElementById(`${config.addonRef}-lang-only-eng`)
        ?.setAttribute("disabled", String(!state));
    // addon.data
    //     .prefs!.window.document.getElementById(`${config.addonRef}-lang-only-other`)!
    //     .setAttribute("disabled", String(!state));
}
