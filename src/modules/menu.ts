import type { MenuitemOptions } from "zotero-plugin-toolkit";
import { getLocaleID, getString } from "../utils/locale";
import { logger } from "../utils/logger";
import { isRegularItem } from "../utils/zotero";
import { Rules } from "./rules";

type FieldMenu = _ZoteroTypes.MenuManager.MenuData<_ZoteroTypes.MenuManager.ItemPaneMenuContext>;
type ItemMenu = _ZoteroTypes.MenuManager.MenuData<_ZoteroTypes.MenuManager.LibraryMenuContext>;

const icon = `${rootURI}/content/icons/favicon.png`;

function registerFieldMenus() {
  if (!Zotero.version.startsWith("8"))
    return;

  const menus: FieldMenu[] = Rules
    .getByType("field")
    .filter(r => r.fieldMenu)
    .map(rule => ({
      menuType: "menuitem",
      l10nID: getLocaleID(rule.fieldMenu?.l10nID),
      icon: rule.fieldMenu?.icon,
      enableForTabTypes: rule.targetItemTypes,
      onShowing: (_event, context) => {
        // set visible
        const visiable: boolean = rule.targetItemField === context.fieldName;
        context.setVisible(visiable);
        if (!visiable)
          return;

        // set enabled state
        const disabled: boolean = !!rule.fieldMenu?.setDisabled?.(context);
        context.setEnabled(!disabled);
      },
      onShown(event, context) {
        checkL10nString(context.menuElem, rule.id, rule.fieldMenu?.l10nID);
      },
      onCommand: (_event, context) => {
        if (rule.fieldMenu?.onCommand) {
          rule.fieldMenu.onCommand(context);
          return;
        }
        addon.hooks.onLintInBatch(rule.id, context.items);
      },
    }
    ));

  Zotero.MenuManager.registerMenu({
    pluginID: addon.data.config.addonID,
    menuID: "field-menu",
    target: "itemPane/info/row",
    menus,
  });
}

function registerItemMenus() {
  function makeItemMenu(ruleID: ID): ItemMenu {
    const rule = Rules.getByID(ruleID)!;
    const menu = rule?.getItemMenu?.();
    // @ts-expect-error some rules are not defined in the item menu
    const l10nID = getLocaleID(menu?.l10nID || `rule-${ruleID}-menu-item`);

    return {
      menuType: "menuitem",
      l10nID,
      // enableForTabTypes: rule?.targetItemTypes,
      onShowing(event, context) {
        const enabled: boolean = !(menu?.mutiltipleItems === false && context.items!.length > 1);
        context.setEnabled(enabled);
      },
      onShown(event, context) {
        checkL10nString(context.menuElem, rule.id, l10nID);
      },
      onCommand(event, context) {
        addon.hooks.onLintInBatch(ruleID, context.items!);
      },
    };
  }

  function makeSeparator(): ItemMenu {
    return {
      menuType: "separator",
    };
  }

  const menus: ItemMenu[] = [
    {
      menuType: "submenu",
      l10nID: getLocaleID("menuitem-label"),
      icon,
      menus: [
        {
          menuType: "menuitem",
          l10nID: getLocaleID("menuitem-stdFormatFlow"),
          onCommand(event, { items }) {
            if (items)
              addon.hooks.onLintInBatch("standard", items);
          },
        },
        makeSeparator(),
        makeItemMenu("correct-title-sentence-case"),
        makeItemMenu("correct-title-chemical-formula"),
        makeItemMenu("correct-creators-case"),
        makeItemMenu("correct-creators-pinyin"),
        makeSeparator(),
        makeItemMenu("require-language"),
        makeItemMenu("tool-set-language"),
        makeSeparator(),
        makeItemMenu("correct-publication-title-alias"),
        makeItemMenu("correct-publication-title-case"),
        makeItemMenu("require-journal-abbr"),
        makeItemMenu("require-university-place"),
        makeSeparator(),
        {
          menuType: "menuitem",
          l10nID: getLocaleID("rule-tool-update-metadata-menu-item"),
          onCommand(event, { items }) {
            addon.hooks.onLintInBatch(["tool-update-metadata", "standard"], items!);
          },
        },
        makeSeparator(),
        {
          menuType: "submenu",
          l10nID: getLocaleID("menuTools-label"),
          icon,
          menus: [
            makeItemMenu("tool-title-guillemet"),
            makeSeparator(),
            makeItemMenu("no-doi-prefix"),
            makeItemMenu("tool-get-short-doi"),
            makeItemMenu("correct-date-format"),
            makeItemMenu("tool-clean-extra"),
            makeSeparator(),
            makeItemMenu("tool-csl-helper"),
            makeItemMenu("tool-creators-ext"),
          ],
        },
      ],
    },
  ];

  Zotero.MenuManager.registerMenu({
    pluginID: addon.data.config.addonID,
    menuID: "item-menu",
    target: "main/library/item",
    menus,
  });

  Zotero.MenuManager.registerMenu({
    pluginID: addon.data.config.addonID,
    menuID: "collection-menu",
    target: "main/library/collection",
    menus,
  });

  if (__env__ === "development") {
    Zotero.MenuManager.registerMenu({
      pluginID: addon.data.config.addonID,
      menuID: "item-menu-test",
      target: "main/library/item",
      menus: [{
        menuType: "menuitem",
        l10nID: getLocaleID("menuitem-label"),
        onCommand(event, { items }) {
          addon.hooks.onLintInBatch("standard", items!);
        },
      }],
    });
  }
}

function registerItemMenusByZToolkit() {
  function getMenuItem(menuPopup: string) {
    function makeItemMenu(id: ID): MenuitemOptions {
      return {
        tag: "menuitem",
        // @ts-expect-error some rules are not defined in the item menu
        label: getString(`rule-${id}-menu-item`) || id,
        commandListener: () => {
          addon.hooks.onLintInBatch(id, menuPopup);
        },
      };
    }

    const separator: MenuitemOptions = { tag: "menuseparator" };

    const menuItem: MenuitemOptions[] = [
      {
        tag: "menuitem",
        label: getString("menuitem-stdFormatFlow"),
        commandListener: () => {
          addon.hooks.onLintInBatch("standard", menuPopup);
        },
      },
      separator,
      makeItemMenu("correct-title-sentence-case"),
      makeItemMenu("correct-title-chemical-formula"),
      makeItemMenu("correct-creators-case"),
      makeItemMenu("correct-creators-pinyin"),
      separator,
      makeItemMenu("require-language"),
      makeItemMenu("tool-set-language"),
      separator,
      makeItemMenu("correct-publication-title-case"),
      makeItemMenu("correct-publication-title-alias"),
      makeItemMenu("require-journal-abbr"),
      makeItemMenu("require-university-place"),
      separator,
      {
        tag: "menuitem",
        label: getString("rule-tool-update-metadata-menu-item"),
        commandListener: () => {
          addon.hooks.onLintInBatch(["tool-update-metadata", "standard"], menuPopup);
        },
      },
      separator,
      {
        tag: "menu",
        label: getString("menuTools-label"),
        icon,
        children: [
          makeItemMenu("tool-title-guillemet"),
          separator,
          makeItemMenu("no-doi-prefix"),
          makeItemMenu("tool-get-short-doi"),
          makeItemMenu("correct-date-format"),
          separator,
          makeItemMenu("tool-clean-extra"),
          makeItemMenu("tool-csl-helper"),
          makeItemMenu("tool-creators-ext"),
        ],
      },
    ];
    return menuItem;
  }

  ztoolkit.Menu.register("item", {
    tag: "menuseparator",
    getVisibility: (_elem, _ev) => isRegularItem(),
  });
  ztoolkit.Menu.register("item", {
    tag: "menu",
    label: getString("menuitem-label"),
    id: "linter-menu-item",
    icon,
    children: getMenuItem("item"),
    getVisibility: (_elem, _ev) => isRegularItem(),
    styles: {
      fill: "var(--fill-secondary)",
      stroke: "currentColor",
    },
  });

  ztoolkit.Menu.register("collection", {
    tag: "menuseparator",
  });
  ztoolkit.Menu.register("collection", {
    tag: "menu",
    label: getString("menuitem-label"),
    id: "",
    icon,
    children: getMenuItem("collection"),
  });
}

export function registerMenu() {
  if (Zotero.version.startsWith("8")) {
    registerItemMenus();
    registerFieldMenus();
  }
  else {
    registerItemMenusByZToolkit();
  }
}

function checkL10nString(menuElem: XULElement, ruleID: string, l10nID?: string) {
  // Since fluent.js is async, when menu first shown, the l10n string is not ready,
  // so we need to wait for i18n string to be ready
  setTimeout(() => {
    if (menuElem.textContent === "") {
      logger.warn(`Miss l10n string: ${l10nID}`);
      menuElem.textContent = `Miss l10n string (${ruleID})`;
    }
  }, 500);
}
