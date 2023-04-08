import { getPref, setPref } from "./preference";
import { config } from "../../package.json";

export class richTextToolBar {
    static async creatRichTextDialog() {
        if (getPref("richtext.isEnableToolBar")) {
            const dialogData: { [key: string | number]: any } = {
                //   inputValue: "test",
                //   checkboxValue: true,
                loadCallback: () => {
                    ztoolkit.log(dialogData, "Dialog Opened!");
                },
                unloadCallback: () => {
                    ztoolkit.log(dialogData, "Dialog closed!");
                    // console.log(addon.data.panel.toolBarPanel.window);
                    setPref(
                        "richText.toolbarPosition.left",
                        addon.data.panel.toolBarPanelWindow?.screenX ??
                            addon.data.panel.toolBarPanelWindow?.screenX ??
                            "0"
                    );
                    setPref(
                        "richText.toolbarPosition.top",
                        addon.data.panel.toolBarPanelWindow?.screenY ??
                            addon.data.panel.toolBarPanelWindow?.screenY ??
                            "0"
                    );
                },
            };
            addon.data.panel.toolBarPanel = new ztoolkit.Dialog(1, 4)
                .addCell(
                    0,
                    0,
                    {
                        tag: "button",
                        namespace: "html",
                        attributes: {
                            type: "button",
                        },
                        listeners: [
                            {
                                type: "click",
                                listener: (e: Event) => {
                                    addon.hooks.onShortcuts("subscript");
                                },
                            },
                        ],
                        children: [
                            {
                                tag: "div",
                                styles: {
                                    padding: "2.5px 15px",
                                },
                                properties: {
                                    innerHTML: "Subscript",
                                },
                            },
                        ],
                    },
                    true
                )
                .addCell(
                    0,
                    1,
                    {
                        tag: "button",
                        namespace: "html",
                        attributes: {
                            type: "button",
                        },
                        listeners: [
                            {
                                type: "click",
                                listener: (e: Event) => {
                                    addon.hooks.onShortcuts("supscript");
                                },
                            },
                        ],
                        children: [
                            {
                                tag: "div",
                                styles: {
                                    padding: "2.5px 15px",
                                },
                                properties: {
                                    innerHTML: "Supscript",
                                },
                            },
                        ],
                    },
                    true
                )
                .addCell(
                    0,
                    2,
                    {
                        tag: "button",
                        namespace: "html",
                        attributes: {
                            type: "button",
                        },
                        listeners: [
                            {
                                type: "click",
                                listener: (e: Event) => {
                                    addon.hooks.onShortcuts("bold");
                                },
                            },
                        ],
                        children: [
                            {
                                tag: "div",
                                styles: {
                                    padding: "2.5px 15px",
                                },
                                properties: {
                                    innerHTML: "Bold",
                                },
                            },
                        ],
                    },
                    false
                )
                .addCell(
                    0,
                    3,
                    {
                        tag: "button",
                        namespace: "html",
                        attributes: {
                            type: "button",
                        },
                        listeners: [
                            {
                                type: "click",
                                listener: (e: Event) => {
                                    addon.hooks.onShortcuts("italic");
                                },
                            },
                        ],
                        children: [
                            {
                                tag: "div",
                                styles: {
                                    padding: "2.5px 15px",
                                },
                                properties: {
                                    innerHTML: "Italic",
                                },
                            },
                        ],
                    },
                    false
                )
                .setDialogData(dialogData);

            // addon.data.panel.toolBarPanel = ztoolkit.getGlobal("openDialog")(
            //     `chrome://${config.addonRef}/content/standalone.xhtml`,
            //     `${config.addonRef}-standalone`,
            //     `chrome,extrachrome,menubar,resizable=yes,scrollbars,status,dialog=no,alwaysRaised=yes`,
            //     dialogData
            // );
        } else {
            addon.data.panel.toolBarPanel = null;
        }
    }

    static showToolBar() {
        // ztoolkit.log("show tool bar");
        this.creatRichTextDialog();
        // ztoolkit.log("addon.data.panel", addon.data.panel);
        // ztoolkit.log("addon.data.panel.toolBarPanel", addon.data.panel.toolBarPanel);
        var windowFuture: {
            left?: number;
            top?: number;
            centerscreen?: boolean;
            resizable: boolean;
            fitContent: boolean;
            alwaysRaised: boolean;
        } = {
            resizable: false,
            fitContent: true,
            alwaysRaised: true,
        };
        if (
            getPref("richText.toolbarPosition.top") == undefined ||
            getPref("richText.toolbarPosition.left") == undefined
        ) {
            windowFuture.centerscreen = true;
            // Object.defineProperty(windowFuture, "centerscreen", true);
            delete windowFuture.left;
            delete windowFuture.top;
        } else {
            windowFuture.left = getPref("richText.toolbarPosition.left") as number;
            windowFuture.top = getPref("richText.toolbarPosition.top") as number;
            delete windowFuture.centerscreen;
        }

        addon.data.panel.toolBarPanel !== null
            ? addon.data.panel.toolBarPanel.open("Zotero Formet Metadata Rich Text Tool Bar", windowFuture)
            : console.warn("addon.data.panel.toolBarPanel is null");
        addon.data.panel.toolBarPanelWindow = addon.data.panel.toolBarPanel.window;
    }

    static closeToolBar() {
        // ztoolkit.log("close tool bar");
        addon.data.panel.toolBarPanelWindow !== null
            ? addon.data.panel.toolBarPanelWindow.close()
            : console.warn("addon.data.panel.toolBarPanelWindow is null");
    }
}
