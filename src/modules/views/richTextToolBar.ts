import { getPref, setPref } from "../preference";

export class richTextToolBar {
    static creatRichTextDialog() {
        const dialogData: { [key: string | number]: unknown } = {
            loadCallback: () => {
                // ztoolkit.log(dialogData, "Dialog Opened!");
            },
            unloadCallback: () => {
                setPref(
                    "richText.toolbarPosition.left",
                    addon.data.panel.toolBarPanelWindow?.screenX ?? addon.data.panel.toolBarPanelWindow?.screenX ?? "0"
                );
                setPref(
                    "richText.toolbarPosition.top",
                    addon.data.panel.toolBarPanelWindow?.screenY ?? addon.data.panel.toolBarPanelWindow?.screenY ?? "0"
                );
            },
        };

        const buttons = [
            {
                name: "Subscript",
                hookName: "subscript",
                icon: `<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-darkreader-inline-fill="" width="16" height="16"><path d="M755.809524 109.714286V243.809524h-73.142857V182.857143h-207.238096V828.952381H536.380952v24.380952c0 17.773714 4.754286 34.450286 13.068191 48.786286L316.952381 902.095238v-73.142857h85.333333V182.857143h-219.428571V243.809524h-73.142857V109.714286H755.809524zM877.714286 560.761905a48.761905 48.761905 0 0 1 48.761904 48.761905v243.809523a48.761905 48.761905 0 0 1-48.761904 48.761905H633.904762a48.761905 48.761905 0 0 1-48.761905-48.761905V609.52381a48.761905 48.761905 0 0 1 48.761905-48.761905h243.809524z m-24.380953 73.142857h-195.047619v195.047619h195.047619v-195.047619z"></path></svg>`,
            },
            {
                name: "Supscript",
                hookName: "supscript",
                icon: `<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-darkreader-inline-fill="" width="16" height="16"><path d="M755.809524 121.904762v134.095238h-73.142857V195.047619h-207.238096v646.095238H560.761905v73.142857H316.952381v-73.142857h85.333333V195.047619h-219.428571v60.952381h-73.142857V121.904762H755.809524z m121.904762 182.857143a48.761905 48.761905 0 0 1 48.761904 48.761905v243.809523a48.761905 48.761905 0 0 1-48.761904 48.761905H633.904762a48.761905 48.761905 0 0 1-48.761905-48.761905v-243.809523a48.761905 48.761905 0 0 1 48.761905-48.761905h243.809524z m-24.380953 73.142857h-195.047619v195.047619h195.047619v-195.047619z"></path></svg>`,
            },
            {
                name: "Bold",
                hookName: "bold",
                icon: `<svg class="icon" viewBox="0 0 1024 1024" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M195.047619 914.285714v-73.142857h73.142857v-658.285714H195.047619v-73.142857h438.857143v1.340952c102.521905 11.337143 182.857143 93.208381 182.857143 193.706667 0 62.902857-31.451429 118.491429-80.11581 154.087619 76.873143 41.910857 128.877714 120.783238 128.877715 211.626666 0 127.24419-102.009905 231.033905-231.594667 242.712381L633.904762 914.285714H195.047619z m414.476191-414.47619H341.333333v341.333333h268.190477c101.424762 0 182.857143-76.897524 182.857142-170.666667s-81.432381-170.666667-182.857142-170.666666z m0-316.952381H341.333333v243.809524h268.190477l5.558857-0.097524c72.021333-2.681905 128.536381-56.783238 128.536381-121.807238 0-66.706286-59.465143-121.904762-134.095238-121.904762z"></path></svg>`,
            },
            {
                name: "Italic",
                hookName: "italic",
                icon: `<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-darkreader-inline-fill="" width="16" height="16"><path d="M764 200a4 4 0 0 0 4-4v-64a4 4 0 0 0-4-4H452a4 4 0 0 0-4 4v64a4 4 0 0 0 4 4h98.4L408.2 824H292a4 4 0 0 0-4 4v64a4 4 0 0 0 4 4h312a4 4 0 0 0 4-4v-64a4 4 0 0 0-4-4H488.2l142.2-624z"></path></svg>`,
            },
            {
                name: "No Case",
                hookName: "nocase",
                icon: `<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M361.411765 356.894118h60.235294v120.470588H361.411765v-60.235294H240.941176v481.882353h60.235295v60.235294H120.470588v-60.235294h60.235294v-481.882353H60.235294v60.235294H0v-120.470588h361.411765zM963.764706 120.470588H361.411765v155.226353h60.235294V180.705882h240.941176v722.82353h-60.235294v60.235294h180.705883v-60.235294h-60.235295V180.705882h240.941177v94.991059h60.235294V120.470588h-60.235294z"></path></svg>`,
            },
            // {
            //     name: "small-caps",
            //     hookName: "small-caps",
            //     icon: `small-caps`,
            // },
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
                        title: button.name,
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
        const toolBarPanel = this.creatRichTextDialog();
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
