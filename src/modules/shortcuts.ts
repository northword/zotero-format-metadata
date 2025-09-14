export function registerShortcuts() {
  ztoolkit.Keyboard.register((ev, data) => {
    if (data.type === "keyup" && data.keyboard) {
      if (data.keyboard.equals("accel,=")) {
        addon.hooks.onShortcuts("subscript");
      }
      if (data.keyboard.equals("accel,+") || data.keyboard.equals("accel,shift,+")) {
        addon.hooks.onShortcuts("supscript");
      }
      if (data.keyboard.equals("accel,B")) {
        addon.hooks.onShortcuts("bold");
      }
      if (data.keyboard.equals("accel,I")) {
        addon.hooks.onShortcuts("italic");
      }
      if (data.keyboard.equals("accel,N")) {
        addon.hooks.onShortcuts("nocase");
      }
      // `accel,alt,¬` is for compatibility with macOS, because option+L will become `¬`
      if (data.keyboard.equals("accel,alt,L") || data.keyboard.equals("accel,alt,¬")) {
        addon.hooks.onLintInBatch("standard", "item");
      }
    }
  });
}
