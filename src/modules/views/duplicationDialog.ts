import { getPref, setPref } from "../../utils/prefs";
import { getString } from "../../utils/locale";

export class duplicationDialog {
    static creatDialog() {
        const dialogData: { [key: string | number]: unknown } = {
            loadCallback: () => {
                // ztoolkit.log(dialogData, "Dialog Opened!");
            },
            unloadCallback: () => {
                //
            },
        };

        const toolBarPanel = new ztoolkit.Dialog(1, 1);
        toolBarPanel.setDialogData(dialogData);
        return toolBarPanel;
    }

    static showToolBar() {
        //
    }

    static closeToolBar() {
        //
    }
}
