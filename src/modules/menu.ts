import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { isRegularItem } from "../utils/zotero";
import type { MenuitemOptions } from "zotero-plugin-toolkit";

export function registerMenu() {
    const menuIcon = `chrome://${config.addonRef}/content/icons/favicon.png`;
    function getMenuItem(menuPopup: string) {
        const menuItem: MenuitemOptions[] = [
            {
                tag: "menuitem",
                label: getString("menuitem-stdFormatFlow"),
                commandListener: (ev) => {
                    addon.hooks.onLintInBatch("std", menuPopup);
                },
            },
            {
                tag: "menuseparator",
            },
            // {
            //     tag: "menuitem",
            //     label: getString("menuitem-自动识别标题中的上下标"),
            //     commandListener: (ev) => {
            //         addon.hooks.onUpdateInBatch("todo", menuPopup);
            //     },
            // },
            {
                tag: "menuitem",
                label: getString("menuitem-toSentenceCase"),
                commandListener: (ev) => {
                    addon.hooks.onLintInBatch("toSentenceCase", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem-capitalizeName"),
                commandListener: (ev) => {
                    addon.hooks.onLintInBatch("capitalizeName", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem-capitalizePinyin"),
                commandListener: (ev) => {
                    addon.hooks.onLintInBatch("creatorsPinyin", menuPopup);
                },
            },
            {
                tag: "menuseparator",
            },
            {
                tag: "menuitem",
                label: getString("menuitem-autoSetLang"),
                commandListener: (ev) => {
                    addon.hooks.onLintInBatch("lang", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem-manuallySetLang"),
                commandListener: (ev) => {
                    addon.hooks.onLintInBatch("lang-manual", menuPopup);
                },
            },
            {
                tag: "menuseparator",
            },
            {
                tag: "menuitem",
                label: getString("menuitem-setPublicationTitle"),
                commandListener: (ev) => {
                    addon.hooks.onLintInBatch("publicationTitle", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem-setJournalAbbr"),
                commandListener: (ev) => {
                    addon.hooks.onLintInBatch("abbr", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem-setPlace"),
                commandListener: (ev) => {
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
                        commandListener: (ev) => {
                            addon.hooks.onLintInBatch("getBlankFieldViaDOI", menuPopup);
                        },
                    },
                    // {
                    //     tag: "menuitem",
                    //     label: getString("menuitem-getFieldsByDOIForSelected"),
                    //     commandListener: (ev) => {
                    //         addon.hooks.onUpdateInBatch("todo", menuPopup);
                    //     },
                    // },
                    {
                        tag: "menuitem",
                        label: getString("menuitem-getFieldsByDOIForAll"),
                        commandListener: (ev) => {
                            addon.hooks.onLintInBatch("getAllFieldViaDOI", menuPopup);
                        },
                    },
                    {
                        tag: "menuseparator",
                    },
                    {
                        tag: "menuitem",
                        label: getString("menuitem-getFieldsByDOIForBlackAndLint"),
                        commandListener: (ev) => {
                            addon.hooks.onLintInBatch("getBlankFieldViaDOIAndLint", menuPopup);
                        },
                    },
                    // {
                    //     tag: "menuitem",
                    //     label: getString("menuitem-getFieldsByDOIForSelected"),
                    //     commandListener: (ev) => {
                    //         addon.hooks.onUpdateInBatch("todo", menuPopup);
                    //     },
                    // },
                    {
                        tag: "menuitem",
                        label: getString("menuitem-getFieldsByDOIForAllAndLint"),
                        commandListener: (ev) => {
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
            //     commandListener: (ev) => {
            //         addon.hooks.onUpdateInBatch("todo", menuPopup);
            //     },
            // },
            // {
            //     tag: "menuitem",
            //     label: getString("menuitem-清理非法占用的字段"),
            //     commandListener: (ev) => {
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
                    //     commandListener: (ev) => {
                    //         addon.hooks.onUpdateInBatch("titleDoubleQuoteToSingleQuote", "item");
                    //     },
                    // },
                    // {
                    //     tag: "menuitem",
                    //     label: getString("menuitem-titleSingleQuoteToDoubleQuote"),
                    //     commandListener: (ev) => {
                    //         addon.hooks.onUpdateInBatch("titleSingleQuoteToDoubleQuote", "item");
                    //     },
                    // },
                    {
                        tag: "menuitem",
                        label: getString("menuitem-titleGuillemetToBrackets"),
                        commandListener: (ev) => {
                            addon.hooks.onLintInBatch("titleGuillemetToBrackets", "item");
                        },
                    },
                    {
                        tag: "menuitem",
                        label: getString("menuitem-titleBracketsToGuillemet"),
                        commandListener: (ev) => {
                            addon.hooks.onLintInBatch("titleBracketsToGuillemet", "item");
                        },
                    },
                    {
                        tag: "menuseparator",
                    },
                    {
                        tag: "menuitem",
                        label: getString("menuitem-setDoi"),
                        commandListener: (ev) => {
                            addon.hooks.onLintInBatch("doi", menuPopup);
                        },
                        disabled: true,
                    },
                    {
                        tag: "menuitem",
                        label: getString("menuitem-setDate"),
                        commandListener: (ev) => {
                            addon.hooks.onLintInBatch("date", menuPopup);
                        },
                    },
                    {
                        tag: "menuitem",
                        label: getString("menuitem-remove-zeros"),
                        commandListener: (ev) => {
                            addon.hooks.onLintInBatch("removeZeros", menuPopup);
                        },
                    },
                    {
                        tag: "menuseparator",
                    },
                    {
                        tag: "menuitem",
                        label: getString("menuitem-setCreatorExt"),
                        commandListener: (ev) => {
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
        getVisibility: (elem, ev) => isRegularItem(),
    });
    ztoolkit.Menu.register("item", {
        tag: "menu",
        label: getString("menuitem-label"), // 格式化条目元数据
        id: "linter-menu-item",
        icon: menuIcon,
        children: getMenuItem("item"),
        getVisibility: (elem, ev) => isRegularItem(),
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
    if (addon.data.env == "development") {
        ztoolkit.Menu.register("item", {
            tag: "menuitem",
            label: "测试",
            icon: menuIcon,
            commandListener: (ev) => {
                addon.hooks.onLintInBatch("test", "item");
            },
        });
    }

    // ztoolkit.Menu.register("menuTools", {
    //     tag: "menu",
    //     label: getString("menuTools-label"),
    //     id: `${config.addonRef}-menuTools`,
    //     icon: menuIcon,
    //     children: [
    //         {
    //             tag: "menuitem",
    //             label: getString("menuitem-titleBracketsToGuillemet"),
    //             commandListener: (ev) => {
    //                 addon.hooks.onUpdateInBatch("titleBracketsToGuillemet", "item");
    //             },
    //         },
    //         {
    //             tag: "menuitem",
    //             label: getString("menuitem-titleGuillemetToBrackets"),
    //             commandListener: (ev) => {
    //                 addon.hooks.onUpdateInBatch("titleGuillemetToBrackets", "item");
    //             },
    //         },
    //     ],
    // });
}

export function registerTextTransformMenu() {
    const zoteroFieldTransformMenu = document.getElementById("zotero-field-transform-menu");
    const toSentenceCaseExtMenu = ztoolkit.UI.createElement(document, "menuitem", {
        id: "creator-transform-sentence-case-ext",
        skipIfExists: true,
        classList: ["menuitem-non-iconic"],
        attributes: {
            label: getString("menufield-toSentenceCase"),
        },
        listeners: [{ type: "click", listener: (e) => addon.hooks.onLintInBatch("toSentenceCase", "item") }],
    });
    zoteroFieldTransformMenu?.append(toSentenceCaseExtMenu);
    // todo: 支持与 Zotero 本身菜单一样的禁用
    // @see https://github.com/zotero/zotero/blob/2639981ddab4c353c7c864fc8b979dae9926f967/chrome/content/zotero/elements/itemBox.js#L2103-L2123
}
