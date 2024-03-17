// import ZoteroToolkit from "../../../zotero-plugin-toolkit/dist/index";
import { config } from "../../package.json";
// import ZoteroToolkit from "zotero-plugin-toolkit";
import { BasicTool, makeHelperTool, unregister } from "zotero-plugin-toolkit/dist/basic";
import { DialogHelper } from "zotero-plugin-toolkit/dist/helpers/dialog";
import { FilePickerHelper } from "zotero-plugin-toolkit/dist/helpers/filePicker";
import { ProgressWindowHelper } from "zotero-plugin-toolkit/dist/helpers/progressWindow";
import { VirtualizedTableHelper } from "zotero-plugin-toolkit/dist/helpers/virtualizedTable";
import { KeyboardManager } from "zotero-plugin-toolkit/dist/managers/keyboard";
import { MenuManager } from "zotero-plugin-toolkit/dist/managers/menu";
import { ExtraFieldTool } from "zotero-plugin-toolkit/dist/tools/extraField";
import { UITool } from "zotero-plugin-toolkit/dist/tools/ui";

export { createZToolkit };

function createZToolkit() {
    // const _ztoolkit = new ZoteroToolkit();
    /**
     * Alternatively, import toolkit modules you use to minify the plugin size.
     * You can add the modules under the `MyToolkit` class below and uncomment the following line.
     */
    const _ztoolkit = new MyToolkit();
    initZToolkit(_ztoolkit);
    return _ztoolkit;
}

function initZToolkit(_ztoolkit: ReturnType<typeof createZToolkit>) {
    const env = __env__;
    _ztoolkit.basicOptions.log.prefix = `[${config.addonName}]`;
    _ztoolkit.basicOptions.log.disableConsole = env === "production";
    _ztoolkit.UI.basicOptions.ui.enableElementJSONLog = __env__ === "development";
    _ztoolkit.UI.basicOptions.ui.enableElementDOMLog = __env__ === "development";
    _ztoolkit.UI.basicOptions.ui.enableElementRecord = __env__ === "development";
    _ztoolkit.basicOptions.debug.disableDebugBridgePassword = __env__ === "development";
    _ztoolkit.basicOptions.api.pluginID = config.addonID;
    _ztoolkit.ProgressWindow.setIconURI("default", `chrome://${config.addonRef}/content/icons/favicon.png`);
}

class MyToolkit extends BasicTool {
    UI: UITool;
    Menu: MenuManager;
    Keyboard: KeyboardManager;
    ProgressWindow: typeof ProgressWindowHelper;
    VirtualizedTable: typeof VirtualizedTableHelper;
    Dialog: typeof DialogHelper;
    FilePicker: typeof FilePickerHelper;
    ExtraField: ExtraFieldTool;

    constructor() {
        super();
        this.UI = new UITool(this);
        this.Menu = new MenuManager(this);
        this.Keyboard = new KeyboardManager(this);
        this.ExtraField = new ExtraFieldTool(this);
        this.Dialog = makeHelperTool(DialogHelper, this);
        this.FilePicker = makeHelperTool(FilePickerHelper, this);
        this.ProgressWindow = makeHelperTool(ProgressWindowHelper, this);
        this.VirtualizedTable = makeHelperTool(VirtualizedTableHelper, this);
    }

    unregisterAll() {
        unregister(this);
    }
}
