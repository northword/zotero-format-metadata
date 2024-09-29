import type { DialogHelper } from "zotero-plugin-toolkit";
import api from "./api";
import hooks from "./hooks";
import { createZToolkit } from "./utils/ztoolkit";

class Addon {
  public data: {
    alive: boolean;
    // Env type, see build.js
    env: "development" | "production";
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
      duplicationDialog?: DialogHelper | undefined;
    };
  };

  // Lifecycle hooks
  public hooks: typeof hooks;
  // APIs
  public api: typeof api;

  constructor() {
    this.data = {
      alive: true,
      env: __env__,
      ztoolkit: createZToolkit(),
      dialogs: {},
    };
    this.hooks = hooks;
    this.api = api;
  }
}

export default Addon;
