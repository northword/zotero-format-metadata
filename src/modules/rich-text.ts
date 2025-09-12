import type { FluentMessageId } from "../../typings/i10n";
import { getString } from "../utils/locale";
import { getPref } from "../utils/prefs";
import { removeHtmlTag } from "../utils/str";

interface Button {
  name: string;
  i18nName: FluentMessageId;
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
  private observer?: MutationObserver;
  private window: Window;

  constructor(window: Window) {
    this.window = window;
  }

  private get itemPaneHeader(): HTMLElement {
    // @ts-expect-error itemPane has inited so not false
    return Zotero.getActiveZoteroPane().itemPane._itemDetails._header;
  }

  private get contextPaneHeader(): HTMLElement | null {
    // @ts-expect-error ZoteroContextPane has context
    return ztoolkit.getGlobal("ZoteroContextPane").context;
  }

  get itemPaneTitleField() {
    const itemPane = Zotero.getActiveZoteroPane().itemPane;
    if (!itemPane)
      return undefined;
    // @ts-expect-error itemPane has _itemDetails
    return itemPane._itemDetails!.querySelectorAll("editable-text[fieldname='title']")[0];
  }

  get contextPaneTitleField() {
    return Zotero.getMainWindow().document.querySelectorAll("#itembox-field-value-title")[1];
  }

  init(): void {
    if (!getPref("richtext.toolBar"))
      return;

    // Zotero not expose MutationObserver as global variable, so we define it here
    const MutationObserver = (this.window as Window & typeof globalThis).MutationObserver;
    this.observer = new MutationObserver(this.onMutations.bind(this));

    const options: MutationObserverInit = {
      childList: true,
      attributes: true,
      attributeFilter: ["class"],
      subtree: true,
    };

    this.observer.observe(this.itemPaneHeader, options);
    // if (this.itemPaneTitleField)
    //   this.observer.observe(this.itemPaneTitleField, options);
    if (this.contextPaneHeader) {
      this.observer.observe(this.contextPaneHeader, options);
    }

    this.window.addEventListener("unload", () => this.clean());
    Zotero.Plugins.addObserver({
      shutdown: ({ id }) => id === addon.data.config.addonID && this.clean(),
    });
  }

  private onMutations(records: MutationRecord[]): void {
    ztoolkit.log("mutations", records);
    for (const record of records) {
      if (record.type !== "attributes" || record.attributeName !== "class")
        return;

      const target = record.target as HTMLElement;

      let textarea: HTMLTextAreaElement | null = null;
      if (target.nodeName === "editable-text") {
        textarea = target.querySelector("textarea");
      }
      else if (target.nodeName === "textarea") {
        textarea = target as HTMLTextAreaElement;
      }

      if (!textarea)
        return;

      if (target.classList.contains("focused")) {
        this.attachToolbar(textarea);
        this.attachPreview(textarea);
      }
      else if (target.className === "") {
        this.close();
      }
    }
  }

  private attachToolbar(textarea: HTMLTextAreaElement): void {
    if (this.window.document?.querySelector(".linter-richtext-toolbar"))
      return;

    const bar = this.createToolbar();
    textarea.parentElement?.parentElement?.insertBefore(bar, textarea.parentElement);
  }

  private attachPreview(textarea: HTMLTextAreaElement): void {
    updatePreview(textarea);
    textarea.addEventListener("focus", () => updatePreview(textarea));
    textarea.addEventListener("input", () => updatePreview(textarea));
  }

  private createToolbar(): HTMLDivElement {
    const document = Zotero.getMainWindow().document;
    const toolbarDiv = document.createElement("div");
    toolbarDiv.className = "linter-richtext-toolbar";
    toolbarDiv.style.display = "flex";

    buttons.forEach((btn) => {
      const button = document.createElement("toolbarbutton");
      Object.assign(button, {
        id: `linter-richtext-${btn.hookName}-btn`,
        className: "zotero-tb-button",
      });
      Object.assign(button.style, {
        fill: "currentColor",
        stroke: "currentColor",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });
      button.setAttribute("title", getString(btn.i18nName));

      const image = document.createElement("image");
      image.className = "toolbarbutton-icon";
      image.innerHTML = btn.icon;

      const label = document.createElement("label");
      label.className = "toolbarbutton-text";

      button.append(image, label);

      button.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        addon.hooks.onShortcuts(btn.hookName);
      });

      toolbarDiv.appendChild(button);
    });

    return toolbarDiv;
  }

  close(): void {
    this.window.document.querySelectorAll(".linter-richtext-toolbar").forEach((el: Element) => el.remove());
    this.window.document.querySelectorAll("#zotero-textarea-preview").forEach((el: Element) => el.remove());
  }

  clean(): void {
    this.observer?.disconnect();
    this.close();
  }
}

/* 上下标 */
/**
 * Get the selected text and replace it with text with or without HTML tags depending on the operation.
 * @param tag sub | sup | b | i
 *
 * @see https://stackoverflow.com/questions/31036076/how-to-replace-selected-text-in-a-textarea-with-javascript
 */
export function setHtmlTag(tag: string, attribute?: string, value?: string): void {
  const textarea = Zotero.getMainWindow().document.activeElement as HTMLTextAreaElement | null;
  if (!textarea || textarea.selectionStart == null || textarea.selectionEnd == null)
    return;

  const { selectionStart: start, selectionEnd: end, value: text } = textarea;
  let selectedText = text.slice(start, end);

  const attributeText = attribute ? ` ${attribute}="${value}"` : "";
  selectedText = selectedText.startsWith(`<${tag}`)
    ? removeHtmlTag(selectedText)
    : `<${tag}${attributeText}>${selectedText}</${tag}>`;

  textarea.setRangeText(selectedText);
  updateTextareaHeight(textarea);

  const Event = Zotero.getMainWindow().Event;
  const inputEvent = new Event("input", { bubbles: true });
  textarea.dispatchEvent(inputEvent);

  textarea.focus();
}

function updateTextareaHeight(textarea: HTMLTextAreaElement): void {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function ensurePreview(textarea: HTMLTextAreaElement): HTMLDivElement {
  const previewId = "zotero-textarea-preview";
  let preview = textarea.parentElement?.querySelector<HTMLDivElement>(`#${previewId}`);

  if (!preview && textarea.parentElement) {
    preview = Zotero.getMainWindow().document.createElement("div");
    preview.id = previewId;
    Object.assign(preview.style, {
      border: "1px solid #ccc",
      padding: "6px",
      marginTop: "6px",
      // backgroundColor: "#fafafa",
      whiteSpace: "pre-wrap",
    });
    textarea.parentElement.appendChild(preview);
  }

  return preview!;
}

function updatePreview(textarea: HTMLTextAreaElement): void {
  const preview = ensurePreview(textarea);
  preview.innerHTML = textarea.value;
}
