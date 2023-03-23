import { config } from "../../package.json";
import { getString } from "./locale";
import formatMetadata from "./formatMetadata";

export function registerMenu() {
    const menuIcon = `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`;
    ztoolkit.Menu.register("item", {
        tag: "menuseparator",
    });
    // ztoolkit.Menu.register("item", {
    //     tag: "menuitem",
    //     label: "test", // getString("itemmenu.translateTitle.label"),
    //     id: "zotero-itemmenu-addontemplate-test",
    //     commandListener: (ev) => {
    //         formatMetadata.unimplemented();
    //     },
    //     icon: menuIcon,
    //     disabled: true,
    // });

    ztoolkit.Menu.register("item", {
        tag: "menu",
        label: getString("menuitem.label"), // 格式化条目元数据
        id: "zotero-itemmenu-formatmetadata-menu-item",
        icon: menuIcon,
        children: [
            {
                tag: "menuitem",
                label: "标准格式化", //getString("menuitem.submenulabel"),
                commandListener: (ev) => {
                    formatMetadata.unimplemented();
                },
            },
            {
                tag: "menuseparator",
            },
            {
                tag: "menuitem",
                label: "期刊缩写", //getString("menuitem.submenulabel"),
                commandListener: (ev) => {
                    formatMetadata.updateJournalAbbrBatch();
                },
            },
            {
                tag: "menuitem",
                label: "学校地点", //getString("menuitem.submenulabel"),
                commandListener: (ev) => {
                    formatMetadata.updateUniversityPlaceBatch();
                },
            },
            {
                tag: "menuitem",
                label: "DOI 统一", //getString("menuitem.submenulabel"),
                commandListener: (ev) => {
                    formatMetadata.unimplemented();
                },
                disabled: true,
            },
            {
                tag: "menuitem",
                label: "日期统一为 ISO 格式", //getString("menuitem.submenulabel"),
                commandListener: (ev) => {
                    formatMetadata.unimplemented();
                },
                disabled: true,
            },
            {
                tag: "menuitem",
                label: "自动设置语言", //getString("menuitem.submenulabel"),
                commandListener: (ev) => {
                    formatMetadata.updateLanguageBatch();
                },
                disabled: true,
            },
            {
                tag: "menuitem",
                label: "设置为指定语言", //getString("menuitem.submenulabel"),
                commandListener: (ev) => {
                    formatMetadata.unimplemented();
                },
                disabled: true,
            },
        ],
    });
}
