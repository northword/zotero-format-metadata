import { config } from "../package.json";
import Addon from "./addon";
import { BasicTool } from "zotero-plugin-toolkit";

const basicTool = new BasicTool();

if (!basicTool.getGlobal("Zotero")[config.addonInstance]) {
    // Set global variables
    _globalThis.Zotero = basicTool.getGlobal("Zotero");
    _globalThis.console = basicTool.getGlobal("window").console;
    _globalThis.addon = new Addon();
    defineGlobal("ztoolkit", () => {
        return _globalThis.addon.data.ztoolkit;
    });
    Zotero[config.addonInstance] = addon;
}

function defineGlobal(name: Parameters<BasicTool["getGlobal"]>[0]): void;
function defineGlobal(name: string, getter: () => any): void;
function defineGlobal(name: string, getter?: () => any) {
    Object.defineProperty(_globalThis, name, {
        get() {
            return getter ? getter() : basicTool.getGlobal(name);
        },
    });
}
