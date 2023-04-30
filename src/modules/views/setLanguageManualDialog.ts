import { TagElementProps } from "zotero-plugin-toolkit/dist/tools/ui";
import { getPref } from "../preference";
import FormatMetadata from "../formatMetadata";

export async function setLanguageManualDialog() {
    const dialogData: { [key: string | number]: any } = {
        selectedLang: "",
        inputLang: "",
    };

    const allowLangs = ["cmn", "eng"];
    if (getPref("lang.only.enable")) {
        const otherLang = getPref("lang.only.other") as string;
        otherLang !== "" && otherLang !== undefined
            ? allowLangs.push.apply(otherLang.replace(/ /g, "").split(","))
            : "pass";
    }
    const row = allowLangs.length > 2 ? allowLangs.length : 3;

    const dialog = new ztoolkit.Dialog(row, 2);

    const radiogroupChildren: Array<TagElementProps> = [];
    allowLangs.forEach((lang, index) => {
        radiogroupChildren.push({
            tag: "radio",
            id: `dialog-checkbox-${lang}`,
            attributes: {
                value: FormatMetadata.toIso639_1(lang) ?? lang,
                label: FormatMetadata.toIso639_1(lang) ?? lang,
            },
        });
    });

    dialog
        .addCell(0, 0, {
            tag: "radiogroup",
            id: `dialog-checkboxgroup`,
            attributes: { "data-bind": "selectedLang" },
            children: radiogroupChildren,
        })
        .addCell(1, 0, {
            tag: "div",
            children: [
                {
                    tag: "label",
                    namespace: "html",
                    attributes: {
                        for: `dialog-checkbox-input`,
                    },
                    properties: { innerHTML: `other` },
                },
                {
                    tag: "input",
                    id: `dialog-checkbox-input`,
                    attributes: {
                        type: "text",
                        "data-bind": "inputLang",
                        "data-prop": "value",
                    },
                },
            ],
        });

    dialog
        .addButton("Confirm", "confirm")
        .addButton("Cancel", "cancel")
        .setDialogData(dialogData)
        .open("Dialog Example");
    await dialogData.unloadLock.promise;
    if (dialogData._lastButtonId == "confirm") {
        if (dialogData.inputLang !== "" && dialogData.inputLang !== undefined) {
            return dialogData.inputLang;
        } else {
            return dialogData.selectedLang;
        }
    } else {
        return false;
    }
}
