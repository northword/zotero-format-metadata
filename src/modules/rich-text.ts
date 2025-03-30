import { getString } from "../utils/locale";
import { getPref } from "../utils/prefs";
import { removeHtmlTag } from "../utils/str";

interface Button {
  name: string;
  i18nName: string;
  hookName: string;
  icon: string;
}

const buttons: Button[] = [
  {
    name: "Subscript",
    i18nName: "subscript",
    hookName: "subscript",
    icon: `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-darkreader-inline-fill="" width="16" height="16"><path d="M755.809524 109.714286V243.809524h-73.142857V182.857143h-207.238096V828.952381H536.380952v24.380952c0 17.773714 4.754286 34.450286 13.068191 48.786286L316.952381 902.095238v-73.142857h85.333333V182.857143h-219.428571V243.809524h-73.142857V109.714286H755.809524zM877.714286 560.761905a48.761905 48.761905 0 0 1 48.761904 48.761905v243.809523a48.761905 48.761905 0 0 1-48.761904 48.761905H633.904762a48.761905 48.761905 0 0 1-48.761905-48.761905V609.52381a48.761905 48.761905 0 0 1 48.761905-48.761905h243.809524z m-24.380953 73.142857h-195.047619v195.047619h195.047619v-195.047619z"></path></svg>`,
  },
  {
    name: "Supscript",
    i18nName: "supscript",
    hookName: "supscript",
    icon: `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-darkreader-inline-fill="" width="16" height="16"><path d="M755.809524 121.904762v134.095238h-73.142857V195.047619h-207.238096v646.095238H560.761905v73.142857H316.952381v-73.142857h85.333333V195.047619h-219.428571v60.952381h-73.142857V121.904762H755.809524z m121.904762 182.857143a48.761905 48.761905 0 0 1 48.761904 48.761905v243.809523a48.761905 48.761905 0 0 1-48.761904 48.761905H633.904762a48.761905 48.761905 0 0 1-48.761905-48.761905v-243.809523a48.761905 48.761905 0 0 1 48.761905-48.761905h243.809524z m-24.380953 73.142857h-195.047619v195.047619h195.047619v-195.047619z"></path></svg>`,
  },
  {
    name: "Bold",
    i18nName: "bold",
    hookName: "bold",
    icon: `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-darkreader-inline-fill="" width="16" height="16"><path d="M195.047619 914.285714v-73.142857h73.142857v-658.285714H195.047619v-73.142857h438.857143v1.340952c102.521905 11.337143 182.857143 93.208381 182.857143 193.706667 0 62.902857-31.451429 118.491429-80.11581 154.087619 76.873143 41.910857 128.877714 120.783238 128.877715 211.626666 0 127.24419-102.009905 231.033905-231.594667 242.712381L633.904762 914.285714H195.047619z m414.476191-414.47619H341.333333v341.333333h268.190477c101.424762 0 182.857143-76.897524 182.857142-170.666667s-81.432381-170.666667-182.857142-170.666666z m0-316.952381H341.333333v243.809524h268.190477l5.558857-0.097524c72.021333-2.681905 128.536381-56.783238 128.536381-121.807238 0-66.706286-59.465143-121.904762-134.095238-121.904762z"></path></svg>`,
  },
  {
    name: "Italic",
    i18nName: "italic",
    hookName: "italic",
    icon: `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-darkreader-inline-fill="" width="16" height="16"><path d="M764 200a4 4 0 0 0 4-4v-64a4 4 0 0 0-4-4H452a4 4 0 0 0-4 4v64a4 4 0 0 0 4 4h98.4L408.2 824H292a4 4 0 0 0-4 4v64a4 4 0 0 0 4 4h312a4 4 0 0 0 4-4v-64a4 4 0 0 0-4-4H488.2l142.2-624z"></path></svg>`,
  },
  {
    name: "No Case",
    i18nName: "no-case",
    hookName: "nocase",
    icon: `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M361.411765 356.894118h60.235294v120.470588H361.411765v-60.235294H240.941176v481.882353h60.235295v60.235294H120.470588v-60.235294h60.235294v-481.882353H60.235294v60.235294H0v-120.470588h361.411765zM963.764706 120.470588H361.411765v155.226353h60.235294V180.705882h240.941176v722.82353h-60.235294v60.235294h180.705883v-60.235294h-60.235295V180.705882h240.941177v94.991059h60.235294V120.470588h-60.235294z"></path></svg>`,
  },
  {
    name: "Small Caps",
    i18nName: "small-caps",
    hookName: "small-caps",
    icon: `<svg t="1715086915579" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="31298" data-darkreader-inline-fill="" width="16" height="16"><path d="M732.493 180.604l8.469 199.035h-25.308q-16.938-97.22-50.617-124.931c-19.662-18.474-60.546-27.76-122.368-27.76h-59.085v606.393q0 64.867 16.84 83.291c14.015 12.382 43.607 20.07 88.578 23.166v23.166H272.538v-23.302q67.456-4.482 84.394-27.76c11.143-9.286 16.839-40.042 16.839-92.577V226.837h-58.986q-92.863 0-122.368 27.76c-22.585 18.473-39.424 60.224-50.617 124.93h-25.308l8.47-199.035h607.53z" p-id="31299"></path><path d="M987.927 534.893l4.668 111.051h-14.103c-6.327-36.204-15.675-59.37-28.23-69.721q-16.505-15.54-68.335-15.477h-33.01v338.366c0 24.132 3.12 39.622 9.448 46.555 7.887 6.946 24.342 11.218 49.452 12.914v12.914H731.23v-12.901c25.11-1.709 40.785-6.835 47.112-15.477 6.191-5.126 9.447-22.287 9.447-51.681V560.783h-32.997q-51.842 0-68.334 15.477-18.833 15.539-28.23 69.721h-14.116l4.668-111.051z" p-id="31300"></path></svg>`,
  },
];

export class RichTextToolBar {
  observer?: MutationObserver;
  window: Window;
  constructor(window: Window) {
    this.window = window;
  }

  get itemPaneHeader() {
    // @ts-expect-error itemPane has inited so not false
    return Zotero.getActiveZoteroPane().itemPane._itemDetails._header;
  }

  get contextPaneHeader() {
    // @ts-expect-error ZoteroContextPane has context
    return ztoolkit.getGlobal("ZoteroContextPane").context;
    // const list = [...Zotero.getMainWindow().document.querySelectorAll("[tabType=\"reader\"]")];
    // return list.filter(node => node?.nodeName === "item-pane-header")[0]!;
    // return Zotero.getMainWindow().document.getElementById("zotero-item-pane-header") as HTMLElement;
    // // @ts-expect-error ZoteroContextPane has context
    // return ztoolkit.getGlobal("ZoteroContextPane").context._getItemContext(ztoolkit.getGlobal("Zotero_Tabs").selectedID)._header;
  }

  get itemPaneTitleField() {
    return Zotero.getMainWindow().document.querySelectorAll("#itembox-field-value-title")[0];
  }

  get contextPaneTitleField() {
    return Zotero.getMainWindow().document.querySelectorAll("#itembox-field-value-title")[1];
  }

  init() {
    if (!getPref("richtext.toolBar"))
      return;

    const observerOptions = {
      attributes: true, // 观察属性变动
      attributeFilter: ["class"],
      subtree: true, // 观察后代节点，默认为 false
    };

    const callback = (records: MutationRecord[], observer: MutationObserver) => {
      records.forEach((record) => {
        if (!addon?.data.alive) {
          observer.disconnect();
          return;
        }
        this.onMutationObserver(record, observer);
      });
    };

    const MutationObserver = (this.window as Window & typeof globalThis).MutationObserver;
    this.observer = new MutationObserver(callback);
    this.observer.observe(this.itemPaneHeader, observerOptions);
    this.observer.observe(this.contextPaneHeader, observerOptions);
    // this.observer.observe(this.itemPaneTitleField, observerOptions);

    this.window.addEventListener(
      "unload",
      this.clean.bind(this),
      false,
    );
    Zotero.Plugins.addObserver({
      shutdown: ({ id }) => {
        if (id !== addon.data.config.addonID)
          return;
        this.clean();
      },
    });
  }

  private onMutationObserver(record: MutationRecord, observer: MutationObserver) {
    ztoolkit.log("MutationObserver", record, observer);

    if (record.type === "attributes" && record.attributeName === "class") {
      const target = record.target as HTMLElement;
      ztoolkit.log(target.classList);
      if (target.classList.contains("focused")) {
        this.showToolBar("header");
      }
      if (target.className === "") {
        this.closeToolBar();
      }
    }
  }

  showToolBar(mode: "header" | "field") {
    if (mode === "header") {
      this.itemPaneHeader.insertBefore(this.toolbarDiv, this.itemPaneHeader.firstChild);
      this.contextPaneHeader?.insertBefore(this.toolbarDiv, this.contextPaneHeader.firstChild);
    }

    else if (mode === "field") {
      this.itemPaneTitleField.insertBefore(this.toolbarDiv, this.itemPaneTitleField.firstChild);
    }
  }

  closeToolBar() {
    this.window.document.querySelectorAll(".linter-richtext-toolbar")
      .forEach((richtoolbar: Element) => {
        richtoolbar?.parentNode?.removeChild(richtoolbar);
      });
  }

  clean() {
    this.observer?.disconnect();
    this.closeToolBar();
  }

  get toolbarDiv() {
    const document = Zotero.getMainWindow().document;
    // const document = ztoolkit.getGlobal("document");
    const toolbarDiv = document.createElement("div");
    toolbarDiv.className = "linter-richtext-toolbar";
    toolbarDiv.style.display = "flex";

    buttons.forEach((btn) => {
      const toolbarbutton = document.createElement("toolbarbutton");
      toolbarbutton.id = `linter-richtext-${btn.hookName}-btn`;
      toolbarbutton.className = "zotero-tb-button";
      // toolbarbutton.style.listStyleImage = `url("chrome://${addon.data.config.addonRef}/content/subscript.svg")`;
      toolbarbutton.style.fill = "currentColor";
      toolbarbutton.style.stroke = "currentColor";
      toolbarbutton.style.display = "flex";
      toolbarbutton.style.alignItems = "center";
      toolbarbutton.style.justifyContent = "center";
      toolbarbutton.setAttribute("title", getString(btn.i18nName));

      const image = document.createElement("image");
      image.className = "toolbarbutton-icon";
      image.innerHTML = btn.icon;
      toolbarbutton.appendChild(image);

      const label = document.createElement("label");
      label.className = "toolbarbutton-text";
      toolbarbutton.appendChild(label);

      toolbarbutton.addEventListener("mousedown", (event) => {
        // 阻止默认行为，避免按钮点击后导致输入框失焦
        event.preventDefault();
        addon.hooks.onShortcuts(btn.hookName);
        event.stopPropagation();
      });
      toolbarDiv.appendChild(toolbarbutton);
    });

    return toolbarDiv;
  }
}

/* 上下标 */
/**
 * Get the selected text and replace it with text with or without HTML tags depending on the operation.
 * @param tag sub | sup | b | i
 *
 * @see https://stackoverflow.com/questions/31036076/how-to-replace-selected-text-in-a-textarea-with-javascript
 */
export function setHtmlTag(tag: string, attribute?: string, value?: string) {
  const editpaneItemBox = Zotero.getMainWindow().document.activeElement as HTMLInputElement | null;
  if (
    editpaneItemBox !== null
    && typeof editpaneItemBox.selectionStart === "number"
    && typeof editpaneItemBox.selectionEnd === "number"
  ) {
    const start = editpaneItemBox.selectionStart;
    const end = editpaneItemBox.selectionEnd;
    let selectedText = editpaneItemBox.value.slice(start, end);
    const attributeText = attribute !== undefined ? ` ${attribute}="${value}"` : "";
    selectedText = selectedText.startsWith(`<${tag}`)
      ? removeHtmlTag(selectedText)
      : `<${tag}${attributeText}>${selectedText}</${tag}>`;
    // const text = editpaneItemBox.value.slice(0, start) + selectedText + editpaneItemBox.value.slice(end);
    // editpaneItemBox.value = text;
    editpaneItemBox.setRangeText(selectedText);
    editpaneItemBox.focus();
  }
}

/**
 * Rich text tool bar bak
 *
 * @deprecated 自 Zotero 7 beta 55 更新 UI 以来，此方法已失效，弹窗仍会导致输入框失焦
 */
// export class richTextToolBar_bak {
//     static creatRichTextDialog() {
//         const buttons = [
//             {
//                 name: "Subscript",
//                 i18nName: "subscript",
//                 hookName: "subscript",
//                 icon: `<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-darkreader-inline-fill="" width="16" height="16"><path d="M755.809524 109.714286V243.809524h-73.142857V182.857143h-207.238096V828.952381H536.380952v24.380952c0 17.773714 4.754286 34.450286 13.068191 48.786286L316.952381 902.095238v-73.142857h85.333333V182.857143h-219.428571V243.809524h-73.142857V109.714286H755.809524zM877.714286 560.761905a48.761905 48.761905 0 0 1 48.761904 48.761905v243.809523a48.761905 48.761905 0 0 1-48.761904 48.761905H633.904762a48.761905 48.761905 0 0 1-48.761905-48.761905V609.52381a48.761905 48.761905 0 0 1 48.761905-48.761905h243.809524z m-24.380953 73.142857h-195.047619v195.047619h195.047619v-195.047619z"></path></svg>`,
//             },
//             {
//                 name: "Supscript",
//                 i18nName: "supscript",
//                 hookName: "supscript",
//                 icon: `<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-darkreader-inline-fill="" width="16" height="16"><path d="M755.809524 121.904762v134.095238h-73.142857V195.047619h-207.238096v646.095238H560.761905v73.142857H316.952381v-73.142857h85.333333V195.047619h-219.428571v60.952381h-73.142857V121.904762H755.809524z m121.904762 182.857143a48.761905 48.761905 0 0 1 48.761904 48.761905v243.809523a48.761905 48.761905 0 0 1-48.761904 48.761905H633.904762a48.761905 48.761905 0 0 1-48.761905-48.761905v-243.809523a48.761905 48.761905 0 0 1 48.761905-48.761905h243.809524z m-24.380953 73.142857h-195.047619v195.047619h195.047619v-195.047619z"></path></svg>`,
//             },
//             {
//                 name: "Bold",
//                 i18nName: "bold",
//                 hookName: "bold",
//                 icon: `<svg class="icon" viewBox="0 0 1024 1024" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M195.047619 914.285714v-73.142857h73.142857v-658.285714H195.047619v-73.142857h438.857143v1.340952c102.521905 11.337143 182.857143 93.208381 182.857143 193.706667 0 62.902857-31.451429 118.491429-80.11581 154.087619 76.873143 41.910857 128.877714 120.783238 128.877715 211.626666 0 127.24419-102.009905 231.033905-231.594667 242.712381L633.904762 914.285714H195.047619z m414.476191-414.47619H341.333333v341.333333h268.190477c101.424762 0 182.857143-76.897524 182.857142-170.666667s-81.432381-170.666667-182.857142-170.666666z m0-316.952381H341.333333v243.809524h268.190477l5.558857-0.097524c72.021333-2.681905 128.536381-56.783238 128.536381-121.807238 0-66.706286-59.465143-121.904762-134.095238-121.904762z"></path></svg>`,
//             },
//             {
//                 name: "Italic",
//                 i18nName: "italic",
//                 hookName: "italic",
//                 icon: `<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-darkreader-inline-fill="" width="16" height="16"><path d="M764 200a4 4 0 0 0 4-4v-64a4 4 0 0 0-4-4H452a4 4 0 0 0-4 4v64a4 4 0 0 0 4 4h98.4L408.2 824H292a4 4 0 0 0-4 4v64a4 4 0 0 0 4 4h312a4 4 0 0 0 4-4v-64a4 4 0 0 0-4-4H488.2l142.2-624z"></path></svg>`,
//             },
//             {
//                 name: "No Case",
//                 i18nName: "no-case",
//                 hookName: "nocase",
//                 icon: `<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M361.411765 356.894118h60.235294v120.470588H361.411765v-60.235294H240.941176v481.882353h60.235295v60.235294H120.470588v-60.235294h60.235294v-481.882353H60.235294v60.235294H0v-120.470588h361.411765zM963.764706 120.470588H361.411765v155.226353h60.235294V180.705882h240.941176v722.82353h-60.235294v60.235294h180.705883v-60.235294h-60.235295V180.705882h240.941177v94.991059h60.235294V120.470588h-60.235294z"></path></svg>`,
//             },
//             // {
//             //     name: "small-caps",
//             //     hookName: "small-caps",
//             //     icon: `small-caps`,
//             // },
//         ];

//         const toolBarPanel = new ztoolkit.Dialog(1, buttons.length);
//         buttons.forEach((button, index) => {
//             toolBarPanel.addCell(
//                 0,
//                 index,
//                 {
//                     tag: "button",
//                     namespace: "html",
//                     attributes: {
//                         type: "button",
//                         title: getString(button.i18nName),
//                     },
//                     listeners: [
//                         {
//                             type: "click",
//                             listener: () => {
//                                 addon.hooks.onShortcuts(button.hookName);
//                             },
//                         },
//                     ],
//                     children: [
//                         {
//                             tag: "div",
//                             styles: {
//                                 padding: "2.5px 10px",
//                             },
//                             properties: {
//                                 innerHTML: button.icon,
//                             },
//                         },
//                     ],
//                 },
//                 true,
//             );
//         });

//         const dialogData: { [key: string | number]: unknown } = {
//             loadCallback: () => {
//                 // ztoolkit.log(dialogData, "Dialog Opened!");
//                 addon.data.dialogs.richTextToolBar ??= toolBarPanel;
//             },
//             unloadCallback: () => {
//                 const win = addon.data.dialogs?.richTextToolBar?.window as Window;
//                 setPref("richText.toolbarPosition.left", win.screenX ?? win.screenX ?? "0");
//                 setPref("richText.toolbarPosition.top", win.screenY ?? win.screenY ?? "0");
//                 // addon.data.dialogs.richTextToolBar = undefined;
//                 delete addon.data.dialogs.richTextToolBar;
//             },
//         };

//         toolBarPanel.setDialogData(dialogData);
//         return toolBarPanel;

//         // addon.data.panel.toolBarPanel = ztoolkit.getGlobal("openDialog")(
//         //     `chrome://${addon.data.config.addonRef}/content/standalone.xhtml`,
//         //     `${addon.data.config.addonRef}-standalone`,
//         //     `chrome,extrachrome,menubar,resizable=yes,scrollbars,status,dialog=no,alwaysRaised=yes`,
//         //     dialogData
//         // );
//     }

//     static showToolBar() {
//         // 准备窗口特性参数：位置、置顶
//         const windowFuture: {
//             left?: number;
//             top?: number;
//             centerscreen?: boolean;
//             resizable: boolean;
//             fitContent: boolean;
//             alwaysRaised: boolean;
//         } = {
//             resizable: false,
//             fitContent: true,
//             alwaysRaised: true,
//         };
//         if (
//             getPref("richText.toolbarPosition.top") === undefined ||
//             getPref("richText.toolbarPosition.left") === undefined
//         ) {
//             windowFuture.centerscreen = true;
//             // Object.defineProperty(windowFuture, "centerscreen", true);
//             delete windowFuture.left;
//             delete windowFuture.top;
//         } else {
//             windowFuture.left = getPref("richText.toolbarPosition.left") as number;
//             windowFuture.top = getPref("richText.toolbarPosition.top") as number;
//             delete windowFuture.centerscreen;
//         }

//         // 确认窗口存在，若无->创建，存在->open
//         // let addon.data.dialog.richTextToolBar: DialogHelper;
//         if (addon.data.dialogs.richTextToolBar === undefined) {
//             addon.data.dialogs.richTextToolBar = this.creatRichTextDialog();
//         } else {
//             ztoolkit.log("addon.data.dialogs.richTextToolBar 已存在，不再打开");
//             return;
//         }

//         addon.data.dialogs.richTextToolBar.open("Zotero Format Metadata Rich Text Tool Bar", windowFuture);
//     }

//     static closeToolBar() {
//         // ztoolkit.log("close tool bar");
//         addon.data.dialogs.richTextToolBar !== undefined
//             ? addon.data.dialogs.richTextToolBar.window.close()
//             : console.warn("addon.data.dialog.richTextToolBar is undefined");
//     }
// }

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
