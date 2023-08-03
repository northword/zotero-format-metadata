import { DialogHelper } from "zotero-plugin-toolkit/dist/helpers/dialog";
import hooks from "./hooks";
import { createZToolkit } from "./utils/ztoolkit";

class Addon {
    public data: {
        alive: boolean;
        // Env type, see build.js
        env: "development" | "production";
        // ztoolkit: MyToolkit;
        ztoolkit: ZToolkit;
        locale?: {
            current: any;
        };
        prefs?: {
            window: Window;
        };
        dialogs: {
            richTextToolBar?: DialogHelper | undefined;
            selectLang?: DialogHelper | undefined;
        };
    };
    // Lifecycle hooks
    public hooks: typeof hooks;
    // APIs
    public api: object = {};

    constructor() {
        this.data = {
            alive: true,
            env: __env__,
            // ztoolkit: new MyToolkit(),
            ztoolkit: createZToolkit(),
            dialogs: {},
        };
        this.hooks = hooks;
        this.api = {};
    }
}

/**
 * Alternatively, import toolkit modules you use to minify the plugin size.
 *
 * Steps to replace the default `ztoolkit: ZoteroToolkit` with your `ztoolkit: MyToolkit`:
 *
 * 1. Uncomment this file's line 30:            `ztoolkit: new MyToolkit(),`
 *    and comment line 31:                      `ztoolkit: new ZoteroToolkit(),`.
 * 2. Uncomment this file's line 10:            `ztoolkit: MyToolkit;` in this file
 *    and comment line 11:                      `ztoolkit: ZoteroToolkit;`.
 * 3. Uncomment `../typings/global.d.ts` line 12: `declare const ztoolkit: import("../src/addon").MyToolkit;`
 *    and comment line 13:                      `declare const ztoolkit: import("zotero-plugin-toolkit").ZoteroToolkit;`.
 *
 * You can now add the modules under the `MyToolkit` class.
 */

// import { BasicTool, unregister } from "zotero-plugin-toolkit/dist/basic";
// import { UITool } from "zotero-plugin-toolkit/dist/tools/ui";
// import { PreferencePaneManager } from "zotero-plugin-toolkit/dist/managers/preferencePane";
// import { ShortcutManager } from "zotero-plugin-toolkit/dist/managers/shortcut";
// import { MenuManager } from "zotero-plugin-toolkit/dist/managers/menu";
// import { FieldHookManager } from "zotero-plugin-toolkit/dist/managers/fieldHook";
// import { ProgressWindowHelper } from "zotero-plugin-toolkit/dist/helpers/progressWindow";

// export class MyToolkit extends BasicTool {
//   UI: UITool;
//   PreferencePane: PreferencePaneManager;
//   Shoutcut: ShortcutManager;
//   Menu: MenuManager;
//   FieldHooks: FieldHookManager;
//   // ProgressWindow: typeof ProgressWindowHelper;

//   constructor() {
//     super();
//     this.UI = new UITool(this);
//     this.PreferencePane = new PreferencePaneManager(this);
//     this.Shoutcut = new ShortcutManager(this);
//     this.Menu = new MenuManager(this);
//     this.FieldHooks = new FieldHookManager(this);
//     // this.ProgressWindow = new ProgressWindowHelper(this);
//   }

//   unregisterAll() {
//     unregister(this);
//   }
// }

export default Addon;
