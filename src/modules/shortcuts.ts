import { getPref } from "../utils/prefs";

export function registerShortcuts() {
  ztoolkit.Keyboard.register((ev, data) => {
    if (data.type !== "keyup" || !data.keyboard) {
      return;
    }

    if (getPref("richtext.hotkey")) {
      if (data.keyboard.equals("accel,=")) {
        addon.hooks.onShortcuts("subscript");
      }
      // `accel,shift,=` is for compatibility with macOS
      else if (data.keyboard.equals("accel,+") || data.keyboard.equals("accel,shift,+") || data.keyboard.equals("accel,shift,=")) {
        addon.hooks.onShortcuts("supscript");
      }
      else if (data.keyboard.equals("accel,B")) {
        addon.hooks.onShortcuts("bold");
      }
      else if (data.keyboard.equals("accel,I")) {
        addon.hooks.onShortcuts("italic");
      }
      else if (data.keyboard.equals("accel,N")) {
        addon.hooks.onShortcuts("nocase");
      }
    }

    // `accel,alt,¬` is for compatibility with macOS, because option+L will become `¬`
    if (data.keyboard.equals("accel,alt,L") || data.keyboard.equals("accel,alt,¬")) {
      addon.hooks.onLintInBatch("standard", "item");
    }
  });
}
