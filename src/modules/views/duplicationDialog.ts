import { getString } from "../../utils/locale";

export class duplicationDialog {
  static async creatDialog(item: Zotero.Item) {
    const dialogData: { [key: string | number]: any } = {
      loadCallback: () => {
        ztoolkit.log(dialogData, "Dialog Opened!");
        // eslint-disable-next-line ts/no-use-before-define
        addon.data.dialogs.duplicationDialog = dialog;
        // this.updateDialog(item);
      },
      unloadCallback: () => {
        addon.data.dialogs.duplicationDialog = undefined;
      },
    };

    const dialog = new ztoolkit.Dialog(2, 1)
      .addCell(0, 0, {
        tag: "h3",
        properties: { innerHTML: getString("dialog-dup-desc") },
      })
      .addCell(1, 0, {
        tag: "div",
        id: "formetmetadata-duplication-details",
        children: [{ tag: "li", properties: { innerHTML: item.getField("title") } }],
      })
      .addButton(getString("dialog-dup-button-merge"), "ok", {
        callback: () => {
          // 聚焦
          Zotero.getActiveZoteroPane().setVirtual("1", "duplicates", true, true);
        },
      });

    dialog.setDialogData(dialogData);
    return dialog;
  }

  static async showDialog(item: Zotero.Item) {
    if (addon.data.dialogs.duplicationDialog === undefined) {
      addon.data.dialogs.duplicationDialog = await this.creatDialog(item);
      addon.data.dialogs.duplicationDialog.open(getString("dialog-dup-title"), {
        fitContent: true,
        resizable: true,
        centerscreen: true,
        alwaysRaised: true,
      });
      await addon.data.dialogs.duplicationDialog.dialogData.loadLock?.promise;
    }
    else {
      // 已存在窗口
      this.updateDialog(item);
    }
  }

  static updateDialog(item: Zotero.Item) {
    ztoolkit.log("adding item to dialog");
    const window = addon.data.dialogs.duplicationDialog!.window;
    const newItem = window.document.createElement("li");
    newItem.textContent = item.getField("title") as string;

    window.document.getElementById("formetmetadata-duplication-details")?.appendChild(newItem);
    window.sizeToContent();
  }

  static closeDialog() {
    //
  }
}
