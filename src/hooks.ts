import type { Task } from "./modules/rules-runner";
import type { RuleBase } from "./modules/rules/rule-base";
import { checkCompat } from "./modules/compat";
import { registerExtraColumns } from "./modules/item-tree";
import { registerMenu, registerTextTransformMenu } from "./modules/menu";
import { registerNotifier } from "./modules/notifier";
import { registerPrefs, registerPrefsScripts } from "./modules/preference";
import { RichTextToolBar, setHtmlTag } from "./modules/rich-text";
import * as Rules from "./modules/rules";
import { getNewItemLintRules, getStdLintRules } from "./modules/rules-presets";
import { registerShortcuts } from "./modules/shortcuts";
import * as Views from "./modules/views";
import { getString, initLocale } from "./utils/locale";
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
  new RichTextToolBar(win).init();
}

async function onMainWindowUnload(_win: Window): Promise<void> {
  ztoolkit.unregisterAll();
  Object.values(addon.data.dialogs).forEach((dialog) => {
    if (dialog !== undefined)
      dialog.window.close();
  });
}

function onShutdown() {
  ztoolkit.unregisterAll();
  Object.values(addon.data.dialogs).forEach((dialog) => {
    if (dialog !== undefined)
      dialog.window.close();
  });
  // addon.data.dialogs = {};
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

  // skip synced item
  if (extraData.skipAutoSync)
    return;

  // wait 500ms to wait other plugins changes saved
  await Zotero.Promise.delay(500);

  if (event === "add" && type === "item") {
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
      addon.hooks.onLintInBatch("newItem", items);
    }
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
 * @param mode 批量处理任务的类别，决定调用的函数
 * @param items 需要批量处理的 Zotero.Item[]，或通过触发批量任务的位置决定 Zotero Item 的获取方式。 "item" | "collection" | XUL.MenuPopup | "menuFile" | "menuEdit" | "menuView" | "menuGo" | "menuTools" | "menuHelp"
 */
async function onLintInBatch(mode: string, items: Zotero.Item[] | "item" | "collection" | string) {
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

  let rules: RuleBase<any> | RuleBase<any>[] | undefined;

  switch (mode) {
    case "std":
      rules = getStdLintRules();
      break;
    case "newItem":
      rules = getNewItemLintRules();
      break;
    case "publicationTitle":
      rules = new Rules.UpdatePublicationTitle({});
      break;
    case "abbr":
      rules = new Rules.UpdateAbbr({});
      break;
    case "place":
      rules = new Rules.UpdateUniversityPlace({});
      break;
    case "lang":
      rules = new Rules.UpdateItemLanguage({});
      break;
    case "lang-manual":
      rules = new Rules.SetFieldValue({
        field: "language",
        value: await Views.setLanguageManualDialog(),
      });
      break;
    case "getAllFieldViaDOI":
      rules = new Rules.UpdateMetadata({ mode: "all" });
      break;
    case "getBlankFieldViaDOI":
      rules = new Rules.UpdateMetadata({ mode: "blank" });
      break;
    case "getAllFieldViaDOIAndLint":
      rules = [new Rules.UpdateMetadata({ mode: "all" }), ...getStdLintRules()];
      break;
    case "getBlankFieldViaDOIAndLint":
      rules = [new Rules.UpdateMetadata({ mode: "blank" }), ...getStdLintRules()];
      break;
    case "doi":
      rules = new Rules.RemoveDOIPrefix({});
      break;
    case "date":
      rules = new Rules.DateISO({});
      break;
    case "removeZeros":
      rules = new Rules.NoExtraZeros({});
      break;
    case "toSentenceCase":
      rules = new Rules.TitleSentenceCase({});
      break;
    case "capitalizeName":
      rules = new Rules.CapitalizeCreators({});
      break;
    case "titleBracketsToGuillemet":
      rules = new Rules.TitleGuillemet({ target: "double" });
      break;
    case "titleGuillemetToBrackets":
      rules = new Rules.TitleGuillemet({ target: "single" });
      break;
    case "creatorExt":
      rules = new Rules.UseCreatorsExt(await Views.getCreatorsExtOptionDialog());
      break;
    case "creatorsPinyin":
      rules = new Rules.CreatorsPinyin({});
      break;
    case "test":
      // 该项仅为调试便利，在此添加待调试功能，通过“测试”菜单触发
      rules = new Rules.CreatorsPinyin({});
      break;
    case "chem":
    default:
      Zotero.getMainWindow().alert(getString("unimplemented"));
      return;
  }

  if (rules === undefined)
    return;
  const tasks = items.filter(item => item.isRegularItem()).map(item => ({ item, rules })) as Task[];
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
