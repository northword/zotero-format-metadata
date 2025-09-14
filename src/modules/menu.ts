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
        label: getString("menuitem-toSentenceCase"),
        commandListener: () => {
          addon.hooks.onLintInBatch("require-title-sentence-case", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("menuitem-capitalizeName"),
        commandListener: () => {
          addon.hooks.onLintInBatch("correct-creators-case", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("menuitem-capitalizePinyin"),
        commandListener: () => {
          addon.hooks.onLintInBatch("correct-creators-pinyin", menuPopup);
        },
      },
      {
        tag: "menuseparator",
      },
      {
        tag: "menuitem",
        label: getString("menuitem-autoSetLang"),
        commandListener: () => {
          addon.hooks.onLintInBatch("require-language", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("menuitem-manuallySetLang"),
        commandListener: () => {
          addon.hooks.onLintInBatch("tool-set-language", menuPopup);
        },
      },
      {
        tag: "menuseparator",
      },
      {
        tag: "menuitem",
        label: getString("menuitem-setPublicationTitle"),
        commandListener: () => {
          addon.hooks.onLintInBatch("correct-publication-title", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("menuitem-setJournalAbbr"),
        commandListener: () => {
          addon.hooks.onLintInBatch("require-journal-abbr", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("menuitem-setPlace"),
        commandListener: () => {
          addon.hooks.onLintInBatch("require-university-place", menuPopup);
        },
      },
      {
        tag: "menuseparator",
      },
      {
        tag: "menu",
        label: getString("menuitem-retriveFields"),
        commandListener: () => {
          addon.hooks.onLintInBatch(["tool-update-metadata", "standard"], menuPopup);
        },
        // children: [
        //   {
        //     tag: "menuitem",
        //     label: getString("menuitem-getFieldsByDOIForBlack"),
        //     commandListener: () => {
        //       addon.hooks.onLintInBatch(["tool-update-metadata", "standard"], menuPopup);
        //     },
        //   },
        //   {
        //     tag: "menuitem",
        //     label: getString("menuitem-getFieldsByDOIForAll"),
        //     commandListener: () => {
        //       addon.hooks.onLintInBatch("update-metadata", menuPopup);
        //     },
        //   },
        //   {
        //     tag: "menuseparator",
        //   },
        //   {
        //     tag: "menuitem",
        //     label: getString("menuitem-getFieldsByDOIForBlackAndLint"),
        //     commandListener: () => {
        //       addon.hooks.onLintInBatch(["update-metadata", "standard"], menuPopup);
        //     },
        //   },
        //   // {
        //   //     tag: "menuitem",
        //   //     label: getString("menuitem-getFieldsByDOIForSelected"),
        //   //     commandListener: () => {
        //   //         addon.hooks.onUpdateInBatch("todo", menuPopup);
        //   //     },
        //   // },
        //   {
        //     tag: "menuitem",
        //     label: getString("menuitem-getFieldsByDOIForAllAndLint"),
        //     commandListener: () => {
        //       addon.hooks.onLintInBatch(["update-metadata", "standard"], menuPopup);
        //     },
        //   },
        // ],
      },
      // {
      //     tag: "menuseparator",
      // },
      // {
      //     tag: "menuitem",
      //     label: getString("menuitem-去除期卷页中多余的0"),
      //     commandListener: () => {
      //         addon.hooks.onUpdateInBatch("todo", menuPopup);
      //     },
      // },
      // {
      //     tag: "menuitem",
      //     label: getString("menuitem-清理非法占用的字段"),
      //     commandListener: () => {
      //         addon.hooks.onUpdateInBatch("todo", menuPopup);
      //     },
      // },
      {
        tag: "menuseparator",
      },
      {
        tag: "menu",
        label: getString("menuTools-label"),
        icon: menuIcon,
        children: [
          // {
          //     tag: "menuitem",
          //     label: getString("menuitem-titleDoubleQuoteToSingleQuote"),
          //     commandListener: () => {
          //         addon.hooks.onUpdateInBatch("titleDoubleQuoteToSingleQuote", "item");
          //     },
          // },
          // {
          //     tag: "menuitem",
          //     label: getString("menuitem-titleSingleQuoteToDoubleQuote"),
          //     commandListener: () => {
          //         addon.hooks.onUpdateInBatch("titleSingleQuoteToDoubleQuote", "item");
          //     },
          // },
          {
            tag: "menuitem",
            label: getString("menuitem-titleGuillemetToBrackets"),
            commandListener: () => {
              addon.hooks.onLintInBatch("tool-title-guillemet", "item");
            },
          },
          {
            tag: "menuseparator",
          },
          {
            tag: "menuitem",
            label: getString("menuitem-setDoi"),
            commandListener: () => {
              addon.hooks.onLintInBatch("no-doi-prefix", menuPopup);
            },
            disabled: true,
          },
          {
            tag: "menuitem",
            label: getString("menuitem-setDate"),
            commandListener: () => {
              addon.hooks.onLintInBatch("correct-data-format", menuPopup);
            },
          },
          {
            tag: "menuseparator",
          },
          {
            tag: "menuitem",
            label: getString("menuitem-setCreatorExt"),
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
      label: getString("menufield-toSentenceCase"),
    },
    listeners: [{ type: "click", listener: _e => addon.hooks.onLintInBatch("require-title-sentence-case", "item") }],
  });
  zoteroFieldTransformMenu?.append(toSentenceCaseExtMenu);
  // todo: 支持与 Zotero 本身菜单一样的禁用
  // @see https://github.com/zotero/zotero/blob/2639981ddab4c353c7c864fc8b979dae9926f967/chrome/content/zotero/elements/itemBox.js#L2103-L2123
}
