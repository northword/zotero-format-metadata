import type { MenuitemOptions } from "zotero-plugin-toolkit";
import { getString } from "../utils/locale";
import { isRegularItem } from "../utils/zotero";

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
        label: getString("rule-require-title-sentence-case-menu-item"),
        commandListener: () => {
          addon.hooks.onLintInBatch("require-title-sentence-case", menuPopup);
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

export function registerTextTransformMenu(window: Window) {
  const zoteroFieldTransformMenu = Zotero.getMainWindow().document.getElementById("zotero-field-transform-menu");
  const toSentenceCaseExtMenu = ztoolkit.UI.createElement(window.document, "menuitem", {
    id: "creator-transform-sentence-case-ext",
    skipIfExists: true,
    classList: ["menuitem-non-iconic"],
    attributes: {
      label: getString("rule-require-title-sentence-case-menu-field"),
    },
    listeners: [{ type: "click", listener: _e => addon.hooks.onLintInBatch("require-title-sentence-case", "item") }],
  });
  zoteroFieldTransformMenu?.append(toSentenceCaseExtMenu);
  // todo: 支持与 Zotero 本身菜单一样的禁用
  // @see https://github.com/zotero/zotero/blob/2639981ddab4c353c7c864fc8b979dae9926f967/chrome/content/zotero/elements/itemBox.js#L2103-L2123
}
