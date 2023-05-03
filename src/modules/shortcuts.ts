import { config } from "../../package.json";

export function registerShortcuts() {
    // `Ctrl` + `=` -> apply subscript
    ztoolkit.Shortcut.register("event", {
        id: `${config.addonRef}-key-sub`,
        key: "=",
        modifiers: "control",
        callback: (keyOptions) => {
            addon.hooks.onShortcuts("subscript");
        },
    });

    // `Ctrl` + `+` -> apply subscript
    ztoolkit.Shortcut.register("event", {
        id: `${config.addonRef}-key-sup`,
        key: "+",
        modifiers: "control,shift",
        callback: (keyOptions) => {
            addon.hooks.onShortcuts("supscript");
        },
    });

    // `Ctrl` + `B` -> apply bold
    ztoolkit.Shortcut.register("event", {
        id: `${config.addonRef}-key-bold`,
        key: "B",
        modifiers: "control",
        callback: (keyOptions) => {
            addon.hooks.onShortcuts("bold");
        },
    });

    // `Ctrl` + `I` -> apply italic
    ztoolkit.Shortcut.register("event", {
        id: `${config.addonRef}-key-italic`,
        key: "I",
        modifiers: "control",
        callback: (keyOptions) => {
            addon.hooks.onShortcuts("italic");
        },
    });

    // `Ctrl` + `I` -> apply italic
    ztoolkit.Shortcut.register("event", {
        id: `${config.addonRef}-key-nocase`,
        key: "n",
        modifiers: "control",
        callback: (keyOptions) => {
            addon.hooks.onShortcuts("nocase");
        },
    });

    // // Register an event key to check confliction
    // ztoolkit.Shortcut.register("event", {
    //     id: `${config.addonRef}-key-check-conflict`,
    //     key: "C",
    //     modifiers: "alt",
    //     callback: (keyOptions) => {
    //         addon.hooks.onShortcuts("confliction");
    //     },
    // });
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
