import { KeyModifier } from "zotero-plugin-toolkit";
import { homepage } from "../../package.json";
import { getString } from "../utils/locale";
import { createLogger } from "../utils/logger";
import { getPref, setPref } from "../utils/prefs";

const logger = createLogger("prefrence");

export function registerPrefs() {
  Zotero.PreferencePanes.register({
    pluginID: addon.data.config.addonID,
    src: `${rootURI}content/preferences.xhtml`,
    label: getString("prefs-title"),
    image: `${rootURI}/content/icons/favicon.png`,
    stylesheets: [`${rootURI}/content/preferences.css`],
    helpURL: homepage,
  });
}

export function registerPrefsScripts(_window: Window) {
  // This function is called when the prefs window is opened
  // See addon/content/preferences.xul onpaneload
  if (!addon.data.prefs) {
    addon.data.prefs = {
      window: _window,
    };
  }
  else {
    addon.data.prefs.window = _window;
  }

  updatePrefsUI();
  bindPrefEvents();
  setupShortcutInputs();
}

async function updatePrefsUI() {
  // You can initialize some UI elements on prefs window
  // with addon.data.prefs.window.document
  // Or bind some events to the elements
  disablePrefsTitleLang();
  disablePrefsLang();

  addon.data.prefs?.window.document
    .querySelector(`#${addon.data.config.addonRef}-abbr-choose-custom-data-button`)
    ?.addEventListener("command", async () => {
      const filename = await new ztoolkit.FilePicker(
        "Select File",
        "open",
        [
          ["CSV File (*.csv)", "*.csv"],
          ["JSON File (*.json)", "*.json"],
          ["Any", "*.*"],
        ],
        "zotero-format-metadata-custom-abbr-data.csv",
      ).open();
      if (filename) {
        setPref("rule.require-journal-abbr.customDataPath", filename);
      }
      else {
        setPref("rule.require-journal-abbr.customDataPath", "");
      }
    });

  addon.data.prefs?.window.document
    .querySelector(`#${addon.data.config.addonRef}-title-choose-custom-data-button`)
    ?.addEventListener("command", async () => {
      const filename = await new ztoolkit.FilePicker(
        "Select File",
        "open",
        [
          ["CSV File (*.csv)", "*.csv"],
          ["Any", "*.*"],
        ],
        "zotero-format-metadata-custom-abbr-data.json",
      ).open();
      if (filename) {
        setPref("rule.correct-title-sentence-case.custom-term-path", filename);
      }
      else {
        setPref("rule.correct-title-sentence-case.custom-term-path", "");
      }
    });
}

function bindPrefEvents() {
  addon.data.prefs?.window.document
    .querySelector(`#${addon.data.config.addonRef}-title-case`)
    ?.addEventListener("command", (e: Event) => {
      logger.debug(e);
      disablePrefsTitleLang();
    });
  addon.data.prefs?.window.document
    .querySelector(`#${addon.data.config.addonRef}-lang-only`)
    ?.addEventListener("command", (e: Event) => {
      logger.debug(e);
      disablePrefsLang();
    });
}

function disablePrefsTitleLang() {
  const titleCaseState = getPref("rule.correct-title-sentence-case");
  const languageElement = addon.data.prefs?.window.document
    .getElementById(`${addon.data.config.addonRef}-title-case-disabled-languages`) as HTMLInputElement;
  if (languageElement)
    languageElement.disabled = !titleCaseState;
}

function disablePrefsLang() {
  const state = getPref("rule.require-language.only");
  const cmnElement = addon.data.prefs?.window.document
    .getElementById(`${addon.data.config.addonRef}-lang-only-cmn`) as HTMLInputElement;
  const engElement = addon.data.prefs?.window.document
    .getElementById(`${addon.data.config.addonRef}-lang-only-eng`) as HTMLInputElement;
  const otherElement = addon.data.prefs?.window.document
    .getElementById(`${addon.data.config.addonRef}-lang-only-other`) as HTMLInputElement;
  if (cmnElement)
    cmnElement.disabled = !state;
  if (engElement)
    engElement.disabled = !state;
  if (otherElement)
    otherElement.disabled = !state;
}

// ---------- Shortcut input recording & preview ----------

function formatShortcutPreview(raw: string): string {
  if (!raw)
    return "";

  const km = new KeyModifier(raw);
  const parts: string[] = [];
  const isMac = Zotero.isMac;

  const mod = (s: string) => `<html:span class="linter-shortcut-mod">${s}</html:span>`;
  const key = (s: string) => `<html:span class="linter-shortcut-key">${s}</html:span>`;

  if (km.accel)
    parts.push(mod(isMac ? "⌘" : "Ctrl"));
  if (km.shift)
    parts.push(mod(isMac ? "⇧" : "Shift"));
  if (km.alt)
    parts.push(mod(isMac ? "⌥" : "Alt"));
    // Dedup: accel already covers control on Win and meta on Mac
  if (km.control && !(!isMac && km.accel))
    parts.push(mod(isMac ? "⌃" : "Ctrl"));
  if (km.meta && !(isMac && km.accel))
    parts.push(mod(isMac ? "⌘" : "Win"));

  if (km.key)
    parts.push(key(km.key.toUpperCase()));

  return parts.join(`<html:span class="linter-shortcut-conn"> + </html:span>`);
}

function setupShortcutInputs() {
  const doc = addon.data.prefs?.window.document;
  if (!doc)
    return;

  const inputs = doc.querySelectorAll<HTMLInputElement>(".linter-shortcut-input");
  if (inputs.length === 0)
    return;

  for (const input of inputs) {
    const previewEl = input.nextElementSibling as HTMLElement;

    const updatePreview = () => {
      if (previewEl) {
        previewEl.innerHTML = input.value ? formatShortcutPreview(input.value) : "";
      }
    };
    // Defer initial preview to ensure pref binding has populated the input value
    setTimeout(updatePreview, 0);

    input.addEventListener("input", updatePreview);

    input.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        input.blur();
        return;
      }

      if (e.key === "Tab") {
        // Allow tab to navigate
        return;
      }

      // Allow paste via Ctrl+V / Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        return;
      }

      e.preventDefault();

      const km = new KeyModifier(e, { useAccel: true });
      if (!km.key)
        return;

      input.value = km.getRaw().replace("control,", "").replace("meta", "");
      updatePreview();
      const Event = Zotero.getMainWindow().Event;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.blur();
    });

    input.addEventListener("blur", () => {
      updatePreview();
    });
  }
}
