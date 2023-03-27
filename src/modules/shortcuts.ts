import { config } from "../../package.json";

export function registerShortcuts() {
    // `Ctrl` + `=` -> apply subsrcipt
    ztoolkit.Shortcut.register("event", {
        id: `${config.addonRef}-key-larger`,
        key: "=",
        modifiers: "control",
        callback: (keyOptions) => {
            addon.hooks.onShortcuts("sub");
        },
    });

    // `Ctrl` + `+` -> apply supsrcipt
    ztoolkit.Shortcut.register("event", {
        id: `${config.addonRef}-key-larger`,
        key: "+",
        modifiers: "control",
        callback: (keyOptions) => {
            addon.hooks.onShortcuts("sup");
        },
    });

    // `Ctrl` + `B` -> apply supsrcipt
    ztoolkit.Shortcut.register("event", {
        id: `${config.addonRef}-key-larger`,
        key: "B",
        modifiers: "control",
        callback: (keyOptions) => {
            addon.hooks.onShortcuts("bold");
        },
    });

    // `Ctrl` + `I` -> apply supsrcipt
    ztoolkit.Shortcut.register("event", {
        id: `${config.addonRef}-key-larger`,
        key: "I",
        modifiers: "control",
        callback: (keyOptions) => {
            addon.hooks.onShortcuts("italic");
        },
    });

    // Register an event key to check confliction
    ztoolkit.Shortcut.register("event", {
        id: `${config.addonRef}-key-check-conflict`,
        key: "C",
        modifiers: "alt",
        callback: (keyOptions) => {
            addon.hooks.onShortcuts("confliction");
        },
    });
}

function checkShortcutConflictingCallback() {
    const conflictingGroups = ztoolkit.Shortcut.checkAllKeyConflicting();
    new ztoolkit.ProgressWindow("Check Key Conflicting")
        .createLine({
            text: `${conflictingGroups.length} groups of conflicting keys found. Details are in the debug output/console.`,
        })
        .show(-1);
    ztoolkit.log("Conflicting:", conflictingGroups, "All keys:", ztoolkit.Shortcut.getAll());
}
