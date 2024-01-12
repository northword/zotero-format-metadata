import hooks from "./hooks";
import { createZToolkit } from "./utils/ztoolkit";
import { DialogHelper } from "zotero-plugin-toolkit/dist/helpers/dialog";

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
    public api: object = {};

    constructor() {
        this.data = {
            alive: true,
            env: __env__,
            ztoolkit: createZToolkit(),
            dialogs: {},
        };
        this.hooks = hooks;
        this.api = {};
    }
}

export default Addon;
