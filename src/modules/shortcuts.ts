import { logger } from "../utils/logger";
import { getPref } from "../utils/prefs";

const DEFAULTS = {
  subscript: "accel,=",
  supscript: "accel,shift,+",
  bold: "accel,B",
  italic: "accel,I",
  nocase: "accel,N",
  lint: "accel,alt,L",
} as const;

function resolveShortcut(key: keyof typeof DEFAULTS): string {
  let raw = (getPref(`shortcut.${key}`)) ?? DEFAULTS[key] ?? "";
  if (Zotero.isMac) {
    if (key === "lint" && raw === "accel,alt,L")
      raw = "accel,alt,¬";
  }
  return raw;
}

export function registerShortcuts() {
  ztoolkit.Keyboard.register((ev, data) => {
    if (data.type !== "keyup" || !data.keyboard) {
      return;
    }

    logger.debug(data.type, data.keyboard);

    if (data.keyboard.equals(resolveShortcut("lint"))) {
      addon.hooks.onLintInBatch("standard", "item");
      return;
    }

    if (!getPref("richtext.hotkey")) {
      return;
    }

    if (data.keyboard.equals(resolveShortcut("subscript"))) {
      addon.hooks.onShortcuts("subscript");
    }
    else if (data.keyboard.equals(resolveShortcut("supscript"))) {
      addon.hooks.onShortcuts("supscript");
    }
    else if (data.keyboard.equals(resolveShortcut("bold"))) {
      addon.hooks.onShortcuts("bold");
    }
    else if (data.keyboard.equals(resolveShortcut("italic"))) {
      addon.hooks.onShortcuts("italic");
    }
    else if (data.keyboard.equals(resolveShortcut("nocase"))) {
      addon.hooks.onShortcuts("nocase");
    }
  });
}
