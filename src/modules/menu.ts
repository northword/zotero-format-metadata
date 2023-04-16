import { config } from "../../package.json";
import { getString } from "./locale";

export function registerMenu() {
    const menuIcon = `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`;
    ztoolkit.Menu.register("item", {
        tag: "menuseparator",
    });
    ztoolkit.Menu.register("item", {
        tag: "menu",
        label: getString("menuitem.label"), // 格式化条目元数据
        id: "zotero-itemmenu-formatmetadata-menu-item",
        icon: menuIcon,
        children: [
            {
                tag: "menuitem",
                label: getString("menuitem.stdFormatFlow"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("std");
                },
            },
            {
                tag: "menuseparator",
            },
            {
                tag: "menuitem",
                label: getString("menuitem.setJournalAbbr"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("abbr");
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem.setPlace"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("place");
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem.setDoi"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("");
                },
                disabled: true,
            },
            {
                tag: "menuitem",
                label: getString("menuitem.setDate"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("");
                },
                disabled: true,
            },
            {
                tag: "menuitem",
                label: getString("menuitem.autoSetLang"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("lang");
                },
            },
            {
                tag: "menuitem",
                label: getString("menuitem.ManuallySetLang"),
                commandListener: (ev) => {
                    addon.hooks.onUpdateInBatch("");
                },
                disabled: true,
            },
        ],
    });
}

export function disableItemMenu() {
    const items = ZoteroPane.getSelectedItems(),
        isRegularItem = items.some((item) => item.isRegularItem()),
        itemMenuUpdateMetadata = document.getElementById(`zotero-itemmenu-formatmetadata-menu-item`);

    itemMenuUpdateMetadata?.setAttribute("disabled", `${!isRegularItem}`);
}
