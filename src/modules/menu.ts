import type { MenuitemOptions } from "zotero-plugin-toolkit";
import { getLocaleID, getString } from "../utils/locale";
import { isRegularItem } from "../utils/zotero";
import { Rules } from "./rules";

type FieldMenu = _ZoteroTypes.MenuManager.MenuData<_ZoteroTypes.MenuManager.ItemPaneMenuContext>;

export function registerFieldMenu() {
  if (!Zotero.version.startsWith("8"))
    return;

  const menus: FieldMenu[] = Rules.getByType("field").map((rule) => {
    return {
      menuType: "menuitem",
      // @ts-expect-error some rules are not defined in the field menu
      l10nID: getLocaleID(`rule-${rule.id}-menu-field`),
      enableForTabTypes: rule.targetItemTypes,
      onShowing: (_event, context) => {
        if (rule.targetItemField !== context.fieldName) {
          context.setVisible(false);
        }
      },
      onShown: (_event, context) => {
        if (context.menuElem.textContent === "") {
          context.setVisible(false);
        }
      },
      onCommand: (_event, context) => {
        addon.hooks.onLintInBatch(rule.id, context.items);
      },
    };
  });

  Zotero.MenuManager.registerMenu({
    pluginID: addon.data.config.addonID,
    menuID: "field-menu",
    target: "itemPane/info/row",
    menus,
  });
}

export function registerMenu() {
  const menuIcon = `${rootURI}/content/icons/favicon.png`;
  function getMenuItem(menuPopup: string) {
    const menuItem: MenuitemOptions[] = [
      {
        tag: "menuitem",
        label: getString("menuitem-stdFormatFlow"),
        commandListener: () => {
          addon.hooks.onLintInBatch("standard", menuPopup);
        },
      },
      {
        tag: "menuseparator",
      },
      {
        tag: "menuitem",
        label: getString("rule-correct-title-sentence-case-menu-item"),
        commandListener: () => {
          addon.hooks.onLintInBatch("correct-title-sentence-case", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("rule-correct-creators-case-menu-item"),
        commandListener: () => {
          addon.hooks.onLintInBatch("correct-creators-case", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("rule-correct-creators-pinyin-menu-item"),
        commandListener: () => {
          addon.hooks.onLintInBatch("correct-creators-pinyin", menuPopup);
        },
      },
      {
        tag: "menuseparator",
      },
      {
        tag: "menuitem",
        label: getString("rule-require-language-menu-item"),
        commandListener: () => {
          addon.hooks.onLintInBatch("require-language", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("rule-tool-set-language-menu-item"),
        commandListener: () => {
          addon.hooks.onLintInBatch("tool-set-language", menuPopup);
        },
      },
      {
        tag: "menuseparator",
      },
      {
        tag: "menuitem",
        label: getString("rule-correct-publication-title-menu-item"),
        commandListener: () => {
          addon.hooks.onLintInBatch("correct-publication-title", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("rule-require-journal-abbr-menu-item"),
        commandListener: () => {
          addon.hooks.onLintInBatch("require-journal-abbr", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("rule-require-university-place-menu-item"),
        commandListener: () => {
          addon.hooks.onLintInBatch("require-university-place", menuPopup);
        },
      },
      {
        tag: "menuseparator",
      },
      {
        tag: "menuitem",
        label: getString("tool-update-metadata-menu-item"),
        commandListener: () => {
          addon.hooks.onLintInBatch(["tool-update-metadata", "standard"], menuPopup);
        },
      },
      {
        tag: "menuseparator",
      },
      {
        tag: "menu",
        label: getString("menuTools-label"),
        icon: menuIcon,
        children: [
          {
            tag: "menuitem",
            label: getString("rule-tool-title-guillemet-menu-item"),
            commandListener: () => {
              addon.hooks.onLintInBatch("tool-title-guillemet", "item");
            },
          },
          {
            tag: "menuseparator",
          },
          {
            tag: "menuitem",
            label: getString("rule-no-doi-prefix-menu-item"),
            commandListener: () => {
              addon.hooks.onLintInBatch("no-doi-prefix", menuPopup);
            },
            disabled: true,
          },
          {
            tag: "menuitem",
            label: getString("rule-correct-date-format-menu-item"),
            commandListener: () => {
              addon.hooks.onLintInBatch("correct-date-format", menuPopup);
            },
          },
          {
            tag: "menuseparator",
          },
          {
            tag: "menuitem",
            label: getString("rule-tool-creators-ext-menu-item"),
            commandListener: () => {
              addon.hooks.onLintInBatch("tool-creators-ext", menuPopup);
            },
          },
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
    label: getString("menuitem-label"), // 格式化条目元数据
    id: "linter-menu-item",
    icon: menuIcon,
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
    icon: menuIcon,
    children: getMenuItem("collection"),
  });

  // 为开发环境编译的插件增加 测试 菜单，以便调试
  if (addon.data.env === "development") {
    ztoolkit.Menu.register("item", {
      tag: "menuitem",
      label: "测试",
      icon: menuIcon,
      commandListener: () => {
        addon.hooks.onLintInBatch("standard", "item");
      },
    });
  }
}
