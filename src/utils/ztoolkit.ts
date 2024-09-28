import { config } from "../../package.json";
import {
    BasicTool,
    DialogHelper,
    ExtraFieldTool,
    FilePickerHelper,
    KeyboardManager,
    MenuManager,
    ProgressWindowHelper,
    UITool,
    VirtualizedTableHelper,
    makeHelperTool,
    unregister,
} from "zotero-plugin-toolkit";

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
    _ztoolkit.UI.basicOptions.ui.enableElementRecord = true;
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
