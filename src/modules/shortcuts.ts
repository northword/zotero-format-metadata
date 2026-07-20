import { getPref } from "../utils/prefs";

function defaultedGetPref(key: "shortcut.subscript" | "shortcut.supscript" | "shortcut.bold" | "shortcut.italic" | "shortcut.nocase" | "shortcut.lint", fallback: string): string {
  const value = getPref(key);
  return value ?? fallback;
}

export function registerShortcuts() {
  const SHORTCUTS = {
    subscript: defaultedGetPref("shortcut.subscript", "accel,="),
    supscript: defaultedGetPref("shortcut.supscript", "accel,+"),
    bold: defaultedGetPref("shortcut.bold", "accel,B"),
    italic: defaultedGetPref("shortcut.italic", "accel,I"),
    nocase: defaultedGetPref("shortcut.nocase", "accel,N"),
    lint: defaultedGetPref("shortcut.lint", "accel,alt,L"),
  };

  ztoolkit.Keyboard.register((ev, data) => {
    if (data.type !== "keyup" || !data.keyboard) {
      return;
    }

    if (getPref("richtext.hotkey")) {
      if (data.keyboard.equals(SHORTCUTS.subscript)) {
        addon.hooks.onShortcuts("subscript");
      }
      // `accel,shift,=` is for compatibility with macOS
      else if (data.keyboard.equals(SHORTCUTS.supscript) || data.keyboard.equals("accel,shift,=")) {
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

    // `accel,alt,¬` is for compatibility with macOS, because option+L will become `¬`
    if (data.keyboard.equals(SHORTCUTS.lint) || data.keyboard.equals("accel,alt,¬")) {
      addon.hooks.onLintInBatch("standard", "item");
    }
  });
}
