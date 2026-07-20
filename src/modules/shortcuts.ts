import { getPref } from "../utils/prefs";

export function registerShortcuts() {
  const SHORTCUTS = {
    subscript: getPref("shortcut.subscript") ?? "accel,=",
    supscript: getPref("shortcut.supscript") ?? "accel,shift,+",
    bold: getPref("shortcut.bold") ?? "accel,B",
    italic: getPref("shortcut.italic") ?? "accel,I",
    nocase: getPref("shortcut.nocase") ?? "accel,N",
    lint: getPref("shortcut.lint") ?? "accel,alt,L",
  };

  if (Zotero.isMac) {
    // `accel,shift,=` is for compatibility with macOS
    if (SHORTCUTS.supscript === "accel,shift,+")
      SHORTCUTS.supscript = "accel,shift,=";

    // `accel,alt,¬` is for compatibility with macOS, because option+L will become `¬`
    if (SHORTCUTS.lint === "accel,alt,L")
      SHORTCUTS.lint = "accel,alt,¬";
  }

  ztoolkit.Keyboard.register((ev, data) => {
    if (data.type !== "keyup" || !data.keyboard) {
      return;
    }

    if (getPref("richtext.hotkey")) {
      if (data.keyboard.equals(SHORTCUTS.subscript)) {
        addon.hooks.onShortcuts("subscript");
      }
      else if (data.keyboard.equals(SHORTCUTS.supscript)) {
        addon.hooks.onShortcuts("supscript");
      }
      else if (data.keyboard.equals(SHORTCUTS.bold)) {
        addon.hooks.onShortcuts("bold");
      }
      else if (data.keyboard.equals(SHORTCUTS.italic)) {
        addon.hooks.onShortcuts("italic");
      }
      else if (data.keyboard.equals(SHORTCUTS.nocase)) {
        addon.hooks.onShortcuts("nocase");
      }
    }

    if (data.keyboard.equals(SHORTCUTS.lint)) {
      addon.hooks.onLintInBatch("standard", "item");
    }
  });
}
