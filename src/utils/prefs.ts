import { config } from "../../package.json";

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
