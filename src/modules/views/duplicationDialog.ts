import { getPref, setPref } from "../../utils/prefs";
import { getString } from "../../utils/locale";

export class duplicationDialog {
    static creatDialog() {
        const dialogData: { [key: string | number]: unknown } = {
            loadCallback: () => {
                // ztoolkit.log(dialogData, "Dialog Opened!");
            },
            unloadCallback: () => {
                // setPref(
                //     "richText.toolbarPosition.left",
                //     addon.data.panel.toolBarPanelWindow?.screenX ?? addon.data.panel.toolBarPanelWindow?.screenX ?? "0"
                // );
                // setPref(
                //     "richText.toolbarPosition.top",
                //     addon.data.panel.toolBarPanelWindow?.screenY ?? addon.data.panel.toolBarPanelWindow?.screenY ?? "0"
                // );
            },
        };

        const buttons = [
            {
                name: "Subscript",
                i18nName: "subscript",
                hookName: "subscript",
                icon: `<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-darkreader-inline-fill="" width="16" height="16"><path d="M755.809524 109.714286V243.809524h-73.142857V182.857143h-207.238096V828.952381H536.380952v24.380952c0 17.773714 4.754286 34.450286 13.068191 48.786286L316.952381 902.095238v-73.142857h85.333333V182.857143h-219.428571V243.809524h-73.142857V109.714286H755.809524zM877.714286 560.761905a48.761905 48.761905 0 0 1 48.761904 48.761905v243.809523a48.761905 48.761905 0 0 1-48.761904 48.761905H633.904762a48.761905 48.761905 0 0 1-48.761905-48.761905V609.52381a48.761905 48.761905 0 0 1 48.761905-48.761905h243.809524z m-24.380953 73.142857h-195.047619v195.047619h195.047619v-195.047619z"></path></svg>`,
            },
        ];

        const toolBarPanel = new ztoolkit.Dialog(1, buttons.length);
        buttons.forEach((button, index) => {
            toolBarPanel.addCell(
                0,
                index,
                {
                    tag: "button",
                    namespace: "html",
                    attributes: {
                        type: "button",
                        title: getString(button.i18nName),
                    },
                    listeners: [
                        {
                            type: "click",
                            listener: () => {
                                addon.hooks.onShortcuts(button.hookName);
                            },
                        },
                    ],
                    children: [
                        {
                            tag: "div",
                            styles: {
                                padding: "2.5px 10px",
                            },
                            properties: {
                                innerHTML: button.icon,
                            },
                        },
                    ],
                },
                true
            );
        });
        toolBarPanel.setDialogData(dialogData);
        return toolBarPanel;

        // addon.data.panel.toolBarPanel = ztoolkit.getGlobal("openDialog")(
        //     `chrome://${config.addonRef}/content/standalone.xhtml`,
        //     `${config.addonRef}-standalone`,
        //     `chrome,extrachrome,menubar,resizable=yes,scrollbars,status,dialog=no,alwaysRaised=yes`,
        //     dialogData
        // );
    }

    static showToolBar() {
        const toolBarPanel = this.creatDialog();
        const windowFuture: {
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

        toolBarPanel !== null && toolBarPanel !== undefined
            ? toolBarPanel.open("Zotero Format Metadata Rich Text Tool Bar", windowFuture)
            : console.warn("addon.data.panel.toolBarPanel is null");
        addon.data.panel.toolBarPanelWindow = toolBarPanel.window;
    }

    static closeToolBar() {
        // ztoolkit.log("close tool bar");
        addon.data.panel.toolBarPanelWindow !== null
            ? addon.data.panel.toolBarPanelWindow.close()
            : console.warn("addon.data.panel.toolBarPanelWindow is null");
    }
}
