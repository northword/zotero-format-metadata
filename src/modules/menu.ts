import { config } from "../../package.json";
import { getString } from "./locale";
import { MenuitemOptions } from "zotero-plugin-toolkit/dist/managers/menu";

export function registerMenu() {
    const menuIcon = `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`;
    function getMenuItem(menuPopup: string) {
        const menuItem: MenuitemOptions[] = [
            {
                tag: "menuitem",
                label: getString("menuitem.stdFormatFlow"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("std", menuPopup);
                },
            },
            {
                tag: "menuseparator",
            },
            {
                tag: "menuitem",
                label: getString("menuitem.setJournalAbbr"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("abbr", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem.setPlace"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("place", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem.getOtherFields"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("other-field", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem.setDoi"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("doi", menuPopup);
                },
                disabled: true,
            },
            {
                tag: "menuitem",
                label: getString("menuitem.setDate"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("date", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem.autoSetLang"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("lang", menuPopup);
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem.manuallySetLang"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("lang-manual", menuPopup);
                },
                disabled: true,
            },
            {
                tag: "menuitem",
                label: getString("menuitem.toSentenceCase"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("toSentenceCase", menuPopup);
                },
                disabled: true,
            },
        ];
        return menuItem;
    }
    ztoolkit.Menu.register("item", {
        tag: "menuseparator",
    });
    ztoolkit.Menu.register("item", {
        tag: "menu",
        label: getString("menuitem.label"), // 格式化条目元数据
        id: "zotero-itemmenu-formatmetadata-menu-item",
        icon: menuIcon,
        children: getMenuItem("item"),
    });
    ztoolkit.Menu.register("collection", {
        tag: "menuseparator",
    });
    ztoolkit.Menu.register("collection", {
        tag: "menu",
        label: getString("menuitem.label"),
        id: "",
        icon: menuIcon,
        children: getMenuItem("collection"),
    });
}

export function disableItemMenu() {
    const items = ZoteroPane.getSelectedItems(),
        isRegularItem = items.some((item) => item.isRegularItem()),
        itemMenuUpdateMetadata = document.getElementById(`zotero-itemmenu-formatmetadata-menu-item`);

    itemMenuUpdateMetadata?.setAttribute("disabled", `${!isRegularItem}`);
}
