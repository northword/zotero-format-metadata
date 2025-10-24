import {
  BasicTool,
  DialogHelper,
  ExtraFieldTool,
  FilePickerHelper,
  KeyboardManager,
  makeHelperTool,
  MenuManager,
  ProgressWindowHelper,
  SettingsDialogHelper,
  UITool,
  unregister,
  VirtualizedTableHelper,
} from "zotero-plugin-toolkit";
import { config } from "../../package.json";

export function createZToolkit() {
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
  _ztoolkit.basicOptions.log.prefix = `[Linter]`;
  _ztoolkit.basicOptions.log.disableConsole = env === "production";
  _ztoolkit.UI.basicOptions.ui.enableElementJSONLog = false;
  _ztoolkit.UI.basicOptions.ui.enableElementDOMLog = __env__ === "development";
  _ztoolkit.basicOptions.debug.disableDebugBridgePassword = __env__ === "development";
  _ztoolkit.basicOptions.api.pluginID = config.addonID;
  _ztoolkit.ProgressWindow.setIconURI("default", `${rootURI}/content/icons/favicon.png`);
}

class MyToolkit extends BasicTool {
  UI: UITool;
  Menu: MenuManager;
  Keyboard: KeyboardManager;
  ProgressWindow: typeof ProgressWindowHelper;
  VirtualizedTable: typeof VirtualizedTableHelper;
  Dialog: typeof DialogHelper;
  SettingsDialog: typeof SettingsDialogHelper;
  FilePicker: typeof FilePickerHelper;
  ExtraField: ExtraFieldTool;

  constructor() {
    super();
    this.UI = new UITool(this);
    this.Menu = new MenuManager(this);
    this.Keyboard = new KeyboardManager(this);
    this.ExtraField = new ExtraFieldTool(this);
    this.Dialog = makeHelperTool(DialogHelper, this);
    this.SettingsDialog = makeHelperTool(SettingsDialogHelper, this);
    this.FilePicker = makeHelperTool(FilePickerHelper, this);
    this.ProgressWindow = makeHelperTool(ProgressWindowHelper, this);
    this.VirtualizedTable = makeHelperTool(VirtualizedTableHelper, this);
  }

  unregisterAll() {
    unregister(this);
  }
}
