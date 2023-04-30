import { getPref, setPref } from "../preference";

export class richTextToolBar {
    static async creatRichTextDialog() {
        if (getPref("richtext.isEnableToolBar")) {
            const dialogData: { [key: string | number]: unknown } = {
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
                                listener: () => {
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
                                listener: () => {
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
                                listener: () => {
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
                                listener: () => {
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

        addon.data.panel.toolBarPanel !== null && addon.data.panel.toolBarPanel !== undefined
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

/**
 * 富文本工具条的实现，旧版
 * 该版本监听标题值标签和文本框的点击与失焦事件
 * 但无法解决点击工具条后文本框失焦的问题
 *
 */
// @descriptor
// public static richTextToolbar() {
//     var richTextToolBarWarper = document.createElement("div");
//     richTextToolBarWarper.id = "format-metadata-richTextToolBar-warper";
//     // richTextToolBarWarper.innerHTML = "===========";
//     richTextToolBarWarper.style.display = "none";
//     richTextToolBarWarper.style.textAlign = "center";

//     var imgWarp = document.createElement("img");

//     const btnList = ["subscript", "supscript", "bold", "italic"];
//     btnList.forEach((btn) => {
//         var button = document.createElement("button");
//         button.id = `format-metadata-richTextToolBar-${btn}`;
//         button.setAttribute("title", `${btn}`);
//         button.setAttribute("class", "toolbar-button");
//         button.innerHTML = `${btn}`;
//         button.append(imgWarp);
//         button.addEventListener("click", (ev: Event) => {
//             addon.hooks.onShortcuts(`${btn}`);
//         });
//         richTextToolBarWarper.append(button);
//     });

//     var row = document.getElementById("dynamic-fields")?.getElementsByTagName("row")["1"];
//     row?.before(richTextToolBarWarper);
//     // ztoolkit.log(row);

//     // https://developer.mozilla.org/zh-CN/docs/Web/API/Element/focus_event
//     function showToolbarListener() {
//         // `itembox-field-value-title` 被点击时，显示 toolbar
//         document
//             .getElementById("itembox-field-value-title")
//             ?.addEventListener("click", showToolbarListenerCallback, true);
//     }

//     function showToolbarListenerCallback() {
//         richTextToolBarWarper.style.display = "";
//         hiddenToolbarListener();
//         document
//             .getElementById("itembox-field-value-title")
//             ?.removeEventListener("click", showToolbarListenerCallback, true);
//     }

//     function hiddenToolbarListener() {
//         // `itembox-field-textbox-title` 失焦时，隐藏 toolbar
//         document
//             .getElementById("itembox-field-textbox-title")
//             ?.addEventListener("blur", hiddenToolbarListenerCallback, true);
//     }

//     async function hiddenToolbarListenerCallback() {
//         richTextToolBarWarper.style.display = "none";
//         await Zotero.Promise.delay(500);
//         document
//             .getElementById("itembox-field-textbox-title")
//             ?.removeEventListener("blur", hiddenToolbarListenerCallback, true);

//         ztoolkit.log("add show again listener");
//         if (document.getElementById("itembox-field-value-title")) {
//             showToolbarListener();
//             // ztoolkit.log(document.getElementById("itembox-field-value-title"));
//         } else {
//             ztoolkit.log("`itembox-field-value-title` not exist, check `textbox` is exist");
//             if (document.getElementById("itembox-field-textbox-title")) {
//                 richTextToolBarWarper.style.display = "";
//                 hiddenToolbarListener();
//             } else {
//                 ztoolkit.log("`itembox-field-textbox-title` not exist, add show again listener again");
//                 // showToolbarListener();
//             }
//         }
//     }

//     showToolbarListener();
// }

/**
 * 富文本工具条的实现，旧版
 * 在上一版本监听事件基础上打开 dialog 来避免文本框失焦
 * 然而 dialog 弹出的时候依然会触发 textbox 的 blur
 * 放弃，转用 MutationObserver
 *
 */
// @descriptor
// public static async richTextToolbar() {
//     document.getElementById("itembox-field-value-title")?.addEventListener(
//         "click",
//         async () => {
//             ztoolkit.log("value label click");
//             const dialogData: { [key: string | number]: any } = {
//                 //   inputValue: "test",
//                 //   checkboxValue: true,
//                 loadCallback: () => {
//                     ztoolkit.log(dialogData, "Dialog Opened!");
//                 },
//                 unloadCallback: () => {
//                     ztoolkit.log(dialogData, "Dialog closed!");
//                 },
//             };
//             const dialogHelper = new ztoolkit.Dialog(3, 5)
//                 .addCell(
//                     0,
//                     0,
//                     {
//                         tag: "button",
//                         namespace: "html",
//                         attributes: {
//                             type: "button",
//                         },
//                         listeners: [
//                             {
//                                 type: "click",
//                                 listener: (e: Event) => {
//                                     addon.hooks.onShortcuts("subscript");
//                                 },
//                             },
//                         ],
//                         children: [
//                             {
//                                 tag: "div",
//                                 styles: {
//                                     padding: "2.5px 15px",
//                                 },
//                                 properties: {
//                                     innerHTML: "Subscript",
//                                 },
//                             },
//                         ],
//                     },
//                     true
//                 )
//                 .addCell(
//                     0,
//                     1,
//                     {
//                         tag: "button",
//                         namespace: "html",
//                         attributes: {
//                             type: "button",
//                         },
//                         listeners: [
//                             {
//                                 type: "click",
//                                 listener: (e: Event) => {
//                                     addon.hooks.onShortcuts("supscript");
//                                 },
//                             },
//                         ],
//                         children: [
//                             {
//                                 tag: "div",
//                                 styles: {
//                                     padding: "2.5px 15px",
//                                 },
//                                 properties: {
//                                     innerHTML: "Supscript",
//                                 },
//                             },
//                         ],
//                     },
//                     true
//                 )
//                 .addCell(
//                     0,
//                     2,
//                     {
//                         tag: "button",
//                         namespace: "html",
//                         attributes: {
//                             type: "button",
//                         },
//                         listeners: [
//                             {
//                                 type: "click",
//                                 listener: (e: Event) => {
//                                     addon.hooks.onShortcuts("bold");
//                                 },
//                             },
//                         ],
//                         children: [
//                             {
//                                 tag: "div",
//                                 styles: {
//                                     padding: "2.5px 15px",
//                                 },
//                                 properties: {
//                                     innerHTML: "Bold",
//                                 },
//                             },
//                         ],
//                     },
//                     false
//                 )
//                 .addCell(
//                     0,
//                     3,
//                     {
//                         tag: "button",
//                         namespace: "html",
//                         attributes: {
//                             type: "button",
//                         },
//                         listeners: [
//                             {
//                                 type: "click",
//                                 listener: (e: Event) => {
//                                     addon.hooks.onShortcuts("italic");
//                                 },
//                             },
//                         ],
//                         children: [
//                             {
//                                 tag: "div",
//                                 styles: {
//                                     padding: "2.5px 15px",
//                                 },
//                                 properties: {
//                                     innerHTML: "Italic",
//                                 },
//                             },
//                         ],
//                     },
//                     false
//                 )
//                 .open("Zotero Formet Metadata Rich Text Tool Bar");
//             ztoolkit.log(dialogData);
//             await Zotero.Promise.delay(2000);

//             // document
//             //     .getElementById("itembox-field-value-title")
//             //     ?.removeEventListener("click", showToolbarListenerCallback, true);
//             // hiddenToolbarListener();
//             document.getElementById("itembox-field-textbox-title")?.addEventListener(
//                 "change",
//                 async () => {
//                     ztoolkit.log("textarea blur");
//                     dialogHelper.window.close();
//                     await Zotero.Promise.delay(2000);
//                     this.richTextToolbar();
//                     //     document
//                     //         .getElementById("itembox-field-textbox-title")
//                     //         ?.removeEventListener("blur", hiddenToolbarListenerCallback, true);
//                 },
//                 {
//                     once: true,
//                 }
//             );
//         },
//         {
//             once: true,
//         }
//     );

//     // https://developer.mozilla.org/zh-CN/docs/Web/API/Element/focus_event
//     // function showToolbarListener() {
//     //     // `itembox-field-value-title` 被点击时，显示 toolbar
//     //     document
//     //         .getElementById("itembox-field-value-title")
//     //         ?.addEventListener("click", showToolbarListenerCallback, true);
//     // }

//     // function showToolbarListenerCallback() {
//     //     // richTextToolBarWarper.style.display = "";
//     //     // richTextDialog();

//     //     document
//     //         .getElementById("itembox-field-value-title")
//     //         ?.removeEventListener("click", showToolbarListenerCallback, true);
//     //     hiddenToolbarListener();
//     // }

//     // function hiddenToolbarListener() {
//     //     // `itembox-field-textbox-title` 失焦时，隐藏 toolbar
//     //     document
//     //         .getElementById("itembox-field-textbox-title")
//     //         ?.addEventListener("blur", hiddenToolbarListenerCallback, true);
//     // }

//     // async function hiddenToolbarListenerCallback() {
//     //     // richTextToolBarWarper.style.display = "none";
//     //     dialogHelper.window.close();
//     //     await Zotero.Promise.delay(1000);
//     //     document
//     //         .getElementById("itembox-field-textbox-title")
//     //         ?.removeEventListener("blur", hiddenToolbarListenerCallback, true);

//     //     ztoolkit.log("add show again listener");
//     //     if (document.getElementById("itembox-field-value-title")) {
//     //         showToolbarListener();
//     //         // ztoolkit.log(document.getElementById("itembox-field-value-title"));
//     //     } else {
//     //         ztoolkit.log("`itembox-field-value-title` not exist, check `textbox` is exist");
//     //         if (document.getElementById("itembox-field-textbox-title")) {
//     //             // richTextToolBarWarper.style.display = "";
//     //             hiddenToolbarListener();
//     //         } else {
//     //             ztoolkit.log("`itembox-field-textbox-title` not exist, add show again listener again");
//     //             // showToolbarListener();
//     //         }
//     //     }
//     // }

//     // showToolbarListener();
// }
