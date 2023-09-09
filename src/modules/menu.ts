import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { isRegularItem } from "../utils/zotero";
import { MenuitemOptions } from "zotero-plugin-toolkit/dist/managers/menu";

export function registerMenu() {
    const menuIcon = `chrome://${config.addonRef}/content/icons/favicon.png`;
    function getMenuItem(menuPopup: string) {
        const menuItem: MenuitemOptions[] = [
            {
                tag: "menuitem",
                label: getString("menuitem-stdFormatFlow"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("std", menuPopup);
                },
            },
            {
                tag: "menuseparator",
            },
            {
                tag: "menuitem",
                label: getString("menuitem-自动识别标题中的上下标"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("todo", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem-toSentenceCase"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("toSentenceCase", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem-capitalizeName"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("capitalizeName", menuPopup);
                },
            },
            {
                tag: "menuseparator",
            },
            {
                tag: "menuitem",
                label: getString("menuitem-autoSetLang"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("lang", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem-manuallySetLang"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("lang-manual", menuPopup);
                },
            },
            {
                tag: "menuseparator",
            },
            {
                tag: "menuitem",
                label: getString("menuitem-setPublicationTitle"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("publicationTitle", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem-setJournalAbbr"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("abbr", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem-setPlace"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("place", menuPopup);
                },
            },
            {
                tag: "menuseparator",
            },
            {
                tag: "menuitem",
                label: getString("menuitem-getFieldsByDOIForBlack"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("getBlankFieldViaDOI", menuPopup);
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
                    addon.hooks.onUpdateInBatch("getAllFieldViaDOI", menuPopup);
                },
            },
            {
                tag: "menuseparator",
            },
            {
                tag: "menuitem",
                label: getString("menuitem-去除期卷页中多余的0"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("todo", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem-清理非法占用的字段"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("todo", menuPopup);
                },
            },
            {
                tag: "menuseparator",
            },
            {
                tag: "menu",
                label: "其他小工具",
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
                        label: getString("menuitem-titleBracketsToGuillemet"),
                        commandListener: (ev) => {
                            addon.hooks.onUpdateInBatch("titleBracketsToGuillemet", "item");
                        },
                    },
                    {
                        tag: "menuitem",
                        label: getString("menuitem-titleGuillemetToBrackets"),
                        commandListener: (ev) => {
                            addon.hooks.onUpdateInBatch("titleGuillemetToBrackets", "item");
                        },
                    },
                    {
                        tag: "menuseparator",
                    },
                    {
                        tag: "menuitem",
                        label: getString("menuitem-setDoi"),
                        commandListener: (ev) => {
                            addon.hooks.onUpdateInBatch("doi", menuPopup);
                        },
                        disabled: true,
                    },
                    {
                        tag: "menuitem",
                        label: getString("menuitem-setDate"),
                        commandListener: (ev) => {
                            addon.hooks.onUpdateInBatch("date", menuPopup);
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
        id: "zotero-itemmenu-formatmetadata-menu-item",
        icon: menuIcon,
        children: getMenuItem("item"),
        getVisibility: (elem, ev) => isRegularItem(),
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
                addon.hooks.onUpdateInBatch("test", "item");
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
        listeners: [{ type: "click", listener: (e) => addon.hooks.onUpdateInBatch("toSentenceCase", "item") }],
    });
    zoteroFieldTransformMenu?.append(toSentenceCaseExtMenu);
    // todo: 支持与 Zotero 本身菜单一样的禁用
    // @see https://github.com/zotero/zotero/blob/2639981ddab4c353c7c864fc8b979dae9926f967/chrome/content/zotero/elements/itemBox.js#L2103-L2123
}
