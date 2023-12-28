// completely different approach copied from zotfile
import { getString } from "../utils/locale";

export class BibliographyPreview {
    constructor() {}

    currentStyle = "";

    /**
     * Initiate zoteropreview
     * called from include.js
     * adds a select listener to the main window
     * @return {void}
     */
    async init() {
        ztoolkit.log("zoteropreview: init");

        /* 		// Register the callback in Zotero as an item observer
		var notifierID = Zotero.Notifier.registerObserver({
				notify: async function (event, type, ids, extraData) {
					ztoolkit.log('notifying');
					//this.getCitationPreview('notification');
					deferred.resolve(extraData[ids[0]]);
					deferred.resolve(this.getCitationPreview('notification'));
				}
			}, ['item','collection-item','collection'], "test");
 
		// Unregister callback when the window closes (important to avoid a memory leak)
		window.addEventListener('unload', function(e) {
				Zotero.Notifier.unregisterObserver(notifierID);
		}, false); */

        // thanks to https://github.com/diegodlh/zotero-cita/blob/b64f963ae22ba27f05da5436f8fb162a039e4cb8/src/zoteroOverlay.jsx
        ztoolkit.log('Adding getCitationPreview listener to ZoteroPane.itemsView "select" listeners');
        ZoteroPane.itemsView.onSelect.addListener(this.getCitationPreview);

        // probably a massive hack, but it works, oh and zotfile does something like this it turns out
        // do not know how to hook into chrome/content/zotero/itemPane.js for "viewItem" code
        // so just listen for a select - tried all kinds of things before this
        if (ZoteroPane) {
            const doc = ZoteroPane.document;
            // ZoteroPane.itemsView.onSelect.addListener(this.getCitationPreview, "zoteropreview1");
            //ZoteroPane.collectionsView.itemTreeView.onSelect.addListener(this.listenerTesting,'zoteropreview2');
            // doc.addEventListener("select", () => {
            //     //ztoolkit.log('zoteropreview: select');
            //     this.getCitationPreview("select");
            // });
            // doc.addEventListener("click", () => {
            //     //ztoolkit.log('zoteropreview: click');
            //     this.getCitationPreview("click");
            // });
            // doc.addEventListener("focus", () => {
            //     //ztoolkit.log('zoteropreview: focus');
            //     this.getCitationPreview("focus");
            // });
            // ZoteroPane.document.getElementById("zotero-items-tree")?.addEventListener("focus", () => {
            //     //ztoolkit.log('zoteropreview: focus new');
            //     this.getCitationPreview("focus new");
            // });
            // ZoteroPane.document.getElementById("zotero-items-tree")?.addEventListener("click", () => {
            //     //ztoolkit.log('zoteropreview: click new');
            //     this.getCitationPreview("click new");
            // });
        }
    }

    // notifierCallback = function () {
    //     notify = function (event, type, ids, extraData) {
    //         ztoolkit.log("zoteropreview: notify");
    //         this.getCitationPreview();
    //     };
    // };

    // listenerTesting = function (testParam) {
    //     ztoolkit.log("zoteropreview: " + testParam);
    //     ztoolkit.log("zoteropreview: listenerTesting");
    //     this.getCitationPreview();
    // };

    /**
     * Primary function to generate the preview
     * called from a number of places, but primarily on selection change
     * @return {void}
     */
    getCitationPreview = async function (debugParam: any = "default") {
        ztoolkit.log("zoteropreview: getCitationPreview testing " + debugParam);

        // see https://www.zotero.org/support/dev/client_coding/javascript_api#managing_citations_and_bibliographies
        const items = Zotero.getActiveZoteroPane().getSelectedItems();

        // if (
        //     items.length == 1 &&
        //     // @ts-ignore 应该是村咋 selectedTab 的
        //     Zotero.getActiveZoteroPane().document.getElementById("zotero-view-tabbox")?.selectedTab.id ==
        //         "zotero-editpane-preview-tab"
        // ) {
        ztoolkit.log("zoteropreview: updating citation");
        const qc = Zotero.QuickCopy;
        let format = await qc.getFormatFromURL(qc.lastActiveURL);
        format = Zotero.QuickCopy.unserializeSetting(format);

        ztoolkit.log("zoteropreview: " + JSON.stringify(format));

        if (format.mode == "") {
            format.mode = "bibliography";
        }

        const userpref = Zotero.Prefs.get("extensions.zoteropreview.citationstyle", true);
        // get the font size preference from the global setting
        const fontSizePref = Zotero.Prefs.get("fontSize");
        // ztoolkit.log("format is: " + format);
        ztoolkit.log("userpref is: " + userpref);

        if (userpref) {
            ztoolkit.log("format: " + format["id"]);
            ztoolkit.log("setting userpref");
            format.id = userpref;
            format.mode = "bibliography";
        }
        ztoolkit.log("format is now: " + JSON.stringify(format));

        let msg = "No bibliography style is chosen in the settings for QuickCopy. Set Preview preference.";

        // // added a pane in overlay.xul
        // const iframe = Zotero.getActiveZoteroPane().document.getElementById("zoteropreview-preview-box");
        // if (iframe == null) return;
        // if (format.id == "" || format.mode == "export") {
        //     iframe.ownerDocument.documentElement.innerHTML = msg;
        //     // openPreferenceWindow();
        //     return;
        // }

        const biblio = qc.getContentFromItems(items, format);
        ztoolkit.log(biblio);
        msg = "<h3>" + getString("styles.bibliography") + "</h3>" + biblio.html;
        //msg += "<p><a href=\"#\" onclick=\"this.copyCitation(true);\">" + getString('general.copy') + "</a></p>";

        ztoolkit.log("zoteropreview: " + msg);

        const locale = format.locale ? format.locale : Zotero.Prefs.get("export.quickCopy.locale");

        ztoolkit.log("format is: " + format);

        const style = Zotero.Styles.get(format.id);
        const styleEngine = style.getCiteProc(locale, "html");

        const citations = styleEngine.previewCitationCluster(
            {
                citationItems: items.map((item) => ({ id: item.id })),
                properties: {},
            },
            [],
            [],
            "html",
        );
        styleEngine.free();

        msg = '<h4 style="border-bottom:1px solid #eeeeee">' + style.title + "</h4>" + msg;
        msg +=
            '<h3 style="border-top:1px solid #eeeeee">' +
            getString("styles.editor.output.individualCitations") +
            "</h3>" +
            citations;
        // msg += "<p><a href=\"#\" onclick=\"this.copyCitation(false);\">" + getString('general.copy') + "</a></p>";
        ztoolkit.log("zoteropreview: " + msg);

        // working on copy

        // var asCitations = true; // in text
        // Zotero_File_Interface.copyItemsToClipboard(
        // 	items, format.id, locale, format.contentType == 'html', asCitations
        // );
        // asCitations = false; // bibliography
        // Zotero_File_Interface.copyItemsToClipboard(
        // 	items, format.id, locale, format.contentType == 'html', asCitations
        // );

        // wrap the output in a div that has the font size preference
        // msg = '<div style="font-size: ' + fontSizePref + 'em">' + msg + "</div>";
        // ztoolkit.log("msg", msg);

        // https://github.com/zotero/zotero/blob/master/chrome/content/zotero/tools/cslpreview.js
        // https://github.com/zotero/zotero/blob/master/chrome/content/zotero/tools/cslpreview.xul

        // Zotero_CSL_Editor.generateBibliography(styleEngine);

        // if (iframe.ownerDocument.documentElement.innerHTML != msg) {
        //     iframe.ownerDocument.documentElement.innerHTML = msg;
        // }
        // }
        ztoolkit.log("zoteropreview: getCitationPreview done");
        ztoolkit.log("-------------------");
    };

    /**
     * Open zoteropreview preference window
     * this took way too long to work out how to do, mostly because of a typo in styleChooser.xul ;-)
     */
    // openPreferenceWindow = function (paneID, action) {
    //     // var io = {pane: paneID, action: action};
    //     // ztoolkit.log(prefWindow);
    //     // ztoolkit.log(window.title);
    //     const prefWindow = window.openDialog(
    //         "chrome://zoteropreview/content/styleChooser.xul",
    //         "zoteropreview-stylechooser",
    //         "chrome,centerscreen,scrollbars=yes,resizable=yes",
    //     );
    // };

    copyCitation = function (asCitations: any) {
        // true = citation
        // false = bib
        const qc = Zotero.QuickCopy;
        const items = Zotero.getActiveZoteroPane().getSelectedItems();
        let format = qc.getFormatFromURL(qc.lastActiveURL);
        format = qc.unserializeSetting(format);
        const locale = format.locale ? format.locale : Zotero.Prefs.get("export.quickCopy.locale");
        const userpref = Zotero.Prefs.get("extensions.zoteropreview.citationstyle", true);
        if (userpref != "") {
            format.id = userpref;
        }
        //@ts-ignore 存在这个方法
        Zotero_File_Interface.copyItemsToClipboard(items, format.id, locale, format.contentType == "html", asCitations);
    };
}
