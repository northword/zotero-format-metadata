import { config } from "../../package.json";

/**
 * Get preference value.
 * Wrapper of `Zotero.Prefs.get`.
 * @param key
 */
export function getPref<K extends keyof _PluginPrefsMap>(key: K) {
  return Zotero.Prefs.get(`${config.prefsPrefix}.${key}` as PluginPrefKey<K>, true);
}

/**
 * Set preference value.
 * Wrapper of `Zotero.Prefs.set`.
 * @param key
 * @param value
 */
export function setPref<K extends keyof _PluginPrefsMap>(key: K, value: PluginPrefsMap[PluginPrefKey<K>]) {
  return Zotero.Prefs.set(`${config.prefsPrefix}.${key}` as PluginPrefKey<K>, value, true);
}

/**
 * Clear preference value.
 * Wrapper of `Zotero.Prefs.clear`.
 * @param key
 */
export function clearPref(key: string) {
  return Zotero.Prefs.clear(`${config.prefsPrefix}.${key}`, true);
}
