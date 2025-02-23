import type { DialogHelper } from "zotero-plugin-toolkit";
import { config } from "../package.json";
import api from "./api";
import hooks from "./hooks";
import { LintRunner } from "./modules/rules-runner";
import { createZToolkit } from "./utils/ztoolkit";

class Addon {
  public data: {
    alive: boolean;
    config: typeof config;
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

  public runner: LintRunner;

  // Lifecycle hooks
  public hooks: typeof hooks;
  // APIs
  public api: typeof api;

  constructor() {
    this.data = {
      alive: true,
      config,
      env: __env__,
      ztoolkit: createZToolkit(),
      dialogs: {},
    };
    this.hooks = hooks;
    this.api = api;
    this.runner = new LintRunner();
  }
}

export default Addon;
