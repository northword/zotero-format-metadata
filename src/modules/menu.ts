import type { MenuitemOptions } from "zotero-plugin-toolkit";
import { getString } from "../utils/locale";
import { isRegularItem } from "../utils/zotero";

export function registerMenu() {
  const menuIcon = `chrome://${addon.data.config.addonRef}/content/icons/favicon.png`;
  function getMenuItem(menuPopup: string) {
    const menuItem: MenuitemOptions[] = [
      {
        tag: "menuitem",
        label: getString("menuitem-stdFormatFlow"),
        commandListener: () => {
          addon.hooks.onLintInBatch("std", menuPopup);
        },
      },
      {
        tag: "menuseparator",
      },
      // {
      //     tag: "menuitem",
      //     label: getString("menuitem-自动识别标题中的上下标"),
      //     commandListener: () => {
      //         addon.hooks.onUpdateInBatch("todo", menuPopup);
      //     },
      // },
      {
        tag: "menuitem",
        label: getString("menuitem-toSentenceCase"),
        commandListener: () => {
          addon.hooks.onLintInBatch("toSentenceCase", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("menuitem-capitalizeName"),
        commandListener: () => {
          addon.hooks.onLintInBatch("capitalizeName", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("menuitem-capitalizePinyin"),
        commandListener: () => {
          addon.hooks.onLintInBatch("creatorsPinyin", menuPopup);
        },
      },
      {
        tag: "menuseparator",
      },
      {
        tag: "menuitem",
        label: getString("menuitem-autoSetLang"),
        commandListener: () => {
          addon.hooks.onLintInBatch("lang", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("menuitem-manuallySetLang"),
        commandListener: () => {
          addon.hooks.onLintInBatch("lang-manual", menuPopup);
        },
      },
      {
        tag: "menuseparator",
      },
      {
        tag: "menuitem",
        label: getString("menuitem-setPublicationTitle"),
        commandListener: () => {
          addon.hooks.onLintInBatch("publicationTitle", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("menuitem-setJournalAbbr"),
        commandListener: () => {
          addon.hooks.onLintInBatch("abbr", menuPopup);
        },
      },
      {
        tag: "menuitem",
        label: getString("menuitem-setPlace"),
        commandListener: () => {
          addon.hooks.onLintInBatch("place", menuPopup);
        },
      },
      {
        tag: "menuseparator",
      },
      {
        tag: "menu",
        label: getString("menuitem-retriveFields"),
        children: [
          {
            tag: "menuitem",
            label: getString("menuitem-getFieldsByDOIForBlack"),
            commandListener: () => {
              addon.hooks.onLintInBatch("getBlankFieldViaDOI", menuPopup);
            },
          },
          // {
          //     tag: "menuitem",
          //     label: getString("menuitem-getFieldsByDOIForSelected"),
          //     commandListener: () => {
          //         addon.hooks.onUpdateInBatch("todo", menuPopup);
          //     },
          // },
          {
            tag: "menuitem",
            label: getString("menuitem-getFieldsByDOIForAll"),
            commandListener: () => {
              addon.hooks.onLintInBatch("getAllFieldViaDOI", menuPopup);
            },
          },
          {
            tag: "menuseparator",
          },
          {
            tag: "menuitem",
            label: getString("menuitem-getFieldsByDOIForBlackAndLint"),
            commandListener: () => {
              addon.hooks.onLintInBatch("getBlankFieldViaDOIAndLint", menuPopup);
            },
          },
          // {
          //     tag: "menuitem",
          //     label: getString("menuitem-getFieldsByDOIForSelected"),
          //     commandListener: () => {
          //         addon.hooks.onUpdateInBatch("todo", menuPopup);
          //     },
          // },
          {
            tag: "menuitem",
            label: getString("menuitem-getFieldsByDOIForAllAndLint"),
            commandListener: () => {
              addon.hooks.onLintInBatch("getAllFieldViaDOIAndLint", menuPopup);
            },
          },
        ],
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
              addon.hooks.onLintInBatch("titleGuillemetToBrackets", "item");
            },
          },
          {
            tag: "menuitem",
            label: getString("menuitem-titleBracketsToGuillemet"),
            commandListener: () => {
              addon.hooks.onLintInBatch("titleBracketsToGuillemet", "item");
            },
          },
          {
            tag: "menuseparator",
          },
          {
            tag: "menuitem",
            label: getString("menuitem-setDoi"),
            commandListener: () => {
              addon.hooks.onLintInBatch("doi", menuPopup);
            },
            disabled: true,
          },
          {
            tag: "menuitem",
            label: getString("menuitem-setDate"),
            commandListener: () => {
              addon.hooks.onLintInBatch("date", menuPopup);
            },
          },
          {
            tag: "menuitem",
            label: getString("menuitem-remove-zeros"),
            commandListener: () => {
              addon.hooks.onLintInBatch("removeZeros", menuPopup);
            },
          },
          {
            tag: "menuseparator",
          },
          {
            tag: "menuitem",
            label: getString("menuitem-setCreatorExt"),
            commandListener: () => {
              addon.hooks.onLintInBatch("creatorExt", menuPopup);
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
        addon.hooks.onLintInBatch("test", "item");
      },
    });
  }

  // ztoolkit.Menu.register("menuTools", {
  //     tag: "menu",
  //     label: getString("menuTools-label"),
  //     id: `${addon.data.config.addonRef}-menuTools`,
  //     icon: menuIcon,
  //     children: [
  //         {
  //             tag: "menuitem",
  //             label: getString("menuitem-titleBracketsToGuillemet"),
  //             commandListener: () => {
  //                 addon.hooks.onUpdateInBatch("titleBracketsToGuillemet", "item");
  //             },
  //         },
  //         {
  //             tag: "menuitem",
  //             label: getString("menuitem-titleGuillemetToBrackets"),
  //             commandListener: () => {
  //                 addon.hooks.onUpdateInBatch("titleGuillemetToBrackets", "item");
  //             },
  //         },
  //     ],
  // });
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
    listeners: [{ type: "click", listener: _e => addon.hooks.onLintInBatch("toSentenceCase", "item") }],
  });
  zoteroFieldTransformMenu?.append(toSentenceCaseExtMenu);
  // todo: 支持与 Zotero 本身菜单一样的禁用
  // @see https://github.com/zotero/zotero/blob/2639981ddab4c353c7c864fc8b979dae9926f967/chrome/content/zotero/elements/itemBox.js#L2103-L2123
}
