import type { Arrayable } from "./utils/types";
import { checkCompat } from "./modules/compat";
import { registerExtraColumns } from "./modules/item-tree";
import { registerMenu, registerTextTransformMenu } from "./modules/menu";
import { registerNotifier } from "./modules/notifier";
import { registerPrefs, registerPrefsScripts } from "./modules/preference";
import { RichTextToolBar, setHtmlTag } from "./modules/rich-text";
import { Rules } from "./modules/rules";
import { registerShortcuts } from "./modules/shortcuts";
import { toArray } from "./utils/general";
import { initLocale } from "./utils/locale";
import { getPref } from "./utils/prefs";
import { createZToolkit } from "./utils/ztoolkit";

async function onStartup() {
  await Promise.all([Zotero.initializationPromise, Zotero.unlockPromise, Zotero.uiReadyPromise]);
  initLocale();
  registerPrefs();
  registerNotifier();
  await Promise.all(Zotero.getMainWindows().map(win => onMainWindowLoad(win)));
  checkCompat();
}

async function onMainWindowLoad(win: Window): Promise<void> {
  // Create ztoolkit for every window
  addon.data.ztoolkit = createZToolkit();
  registerShortcuts();
  registerMenu();
  registerTextTransformMenu(win);
  registerExtraColumns();
  if (getPref("richtext.toolBar"))
    new RichTextToolBar(win).init();
}

async function onMainWindowUnload(_win: Window): Promise<void> {
  ztoolkit.unregisterAll();
}

function onShutdown() {
  ztoolkit.unregisterAll();
  // Remove addon object
  addon.data.alive = false;
  // @ts-expect-error - Plugin instance is not typed
  delete Zotero[addon.data.config.addonInstance];
}

async function onNotify(
  event: string,
  type: string,
  ids: Array<string | number>,
  extraData: { [key: string]: unknown },
) {
  ztoolkit.log("notify", event, type, ids, extraData);

  // Skip if disabled add on lint
  if (!getPref("lint.onAdded"))
    return;

  // We only process the add item event
  if (event !== "add" || type !== "item")
    return;

  // Skip synced item
  if (extraData.skipAutoSync)
    return;

  // Wait 500ms to wait other plugins changes saved
  await Zotero.Promise.delay(500);

  const items = Zotero.Items.get(ids as number[]).filter(
    (item) => {
      // skip attachment
      if (!item.isRegularItem())
        return false;

      // skip feed item
      if (item.isFeedItem)
        return false;

      // skip new empty item
      if (!item.getField("title"))
        return false;

      // skip group item
      // @ts-expect-error libraryID is got from item, so get() will never return false
      if (Zotero.Libraries.get(item.libraryID)._libraryType === "group" && !getPref("lint.onGroup"))
        return false;

      return true;
    },
  );

  if (items.length !== 0) {
    addon.hooks.onLintInBatch("standard", items);
  }
}

async function onPrefsEvent(type: string, data: { [key: string]: never }) {
  switch (type) {
    case "load":
      registerPrefsScripts(data.window);
      break;
    default:
  }
}

function onShortcuts(type: string) {
  switch (type) {
    case "subscript":
      setHtmlTag("sub");
      break;
    case "supscript":
      setHtmlTag("sup");
      break;
    case "bold":
      setHtmlTag("b");
      break;
    case "italic":
      setHtmlTag("i");
      break;
    case "nocase":
      setHtmlTag("span", "class", "nocase");
      break;
    case "small-caps":
      setHtmlTag("span", "style", "font-variant:small-caps;");
      break;
    case "confliction":
      break;
    default:
      break;
  }
}

/**
 * 分发批量执行某函数的任务
 * @param ruleIDs 批量处理任务的类别，决定调用的函数
 * @param items 需要批量处理的 Zotero.Item[]，或通过触发批量任务的位置决定 Zotero Item 的获取方式。 "item" | "collection" | XUL.MenuPopup | "menuFile" | "menuEdit" | "menuView" | "menuGo" | "menuTools" | "menuHelp"
 */
async function onLintInBatch(
  ruleIDs: Arrayable<ID | "standard">,
  items: Zotero.Item[] | "item" | "collection" | string,
) {
  if (typeof items === "string") {
    switch (items) {
      case "item":
        items = Zotero.getActiveZoteroPane().getSelectedItems();
        break;
      case "collection":
        items = Zotero.getActiveZoteroPane().getSelectedCollection()?.getChildItems() ?? [];
        break;
      default:
        items = Zotero.getActiveZoteroPane().getSelectedItems();
        break;
    }
  }

  items = items.filter(item => item.isRegularItem());

  const rules = toArray(ruleIDs).map(id =>
    id === "standard"
      ? Rules.getStandard()
      : Rules.getByID(id)!,
  ).flat();

  if (rules.length === 0 || items.length === 0)
    return;

  const tasks = { items, rules };
  addon.runner.add(tasks);
}

/**
 * @deprecated use onLintInBatch instead.
 */
const onUpdateInBatch = onLintInBatch;

export default {
  onStartup,
  onMainWindowLoad,
  onMainWindowUnload,
  onShutdown,
  onNotify,
  onPrefsEvent,
  onShortcuts,
  onLintInBatch,
  onUpdateInBatch,
};
