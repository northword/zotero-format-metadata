// completely different approach copied from zotfile

export class BibliographyPreview  {
    this.currentStyle = "";

    /**
     * Initiate zoteropreview
     * called from include.js
     * adds a select listener to the main window
     * @return {void}
     */
    this.init = async function () {
        Zotero.debug("zoteropreview: init");
        await Zotero.Schema.schemaUpdatePromise;
        await Zotero.uiReadyPromise;

        /* 		// Register the callback in Zotero as an item observer
		var notifierID = Zotero.Notifier.registerObserver({
				notify: async function (event, type, ids, extraData) {
					Zotero.debug('notifying');
					//Zotero.zoteropreview.getCitationPreview('notification');
					deferred.resolve(extraData[ids[0]]);
					deferred.resolve(Zotero.zoteropreview.getCitationPreview('notification'));
				}
			}, ['item','collection-item','collection'], "test");
 
		// Unregister callback when the window closes (important to avoid a memory leak)
		window.addEventListener('unload', function(e) {
				Zotero.Notifier.unregisterObserver(notifierID);
		}, false); */

        // thanks to https://github.com/diegodlh/zotero-cita/blob/b64f963ae22ba27f05da5436f8fb162a039e4cb8/src/zoteroOverlay.jsx
        Zotero.uiReadyPromise.then(() => {
            debug('Adding getCitationPreview listener to ZoteroPane.itemsView "select" listeners');
            ZoteroPane.itemsView.onSelect.addListener(Zotero.zoteropreview.getCitationPreview);
        });

        // probably a massive hack, but it works, oh and zotfile does something like this it turns out
        // do not know how to hook into chrome/content/zotero/itemPane.js for "viewItem" code
        // so just listen for a select - tried all kinds of things before this
        if (window.ZoteroPane && Zotero.version.indexOf("5") == 0) {
            const doc = window.ZoteroPane.document;
            window.ZoteroPane.itemsView.onSelectionChange.addListener(
                Zotero.zoteropreview.getCitationPreview,
                "zoteropreview1",
            );
            //window.ZoteroPane.collectionsView.itemTreeView.onSelect.addListener(Zotero.zoteropreview.listenerTesting,'zoteropreview2');
            doc.addEventListener("select", function () {
                //Zotero.debug('zoteropreview: select');
                Zotero.zoteropreview.getCitationPreview("select");
            });
            doc.addEventListener("click", function () {
                //Zotero.debug('zoteropreview: click');
                Zotero.zoteropreview.getCitationPreview("click");
            });
            doc.addEventListener("focus", function () {
                //Zotero.debug('zoteropreview: focus');
                Zotero.zoteropreview.getCitationPreview("focus");
            });
            window.ZoteroPane.document.getElementById("zotero-items-tree").addEventListener("focus", function () {
                //Zotero.debug('zoteropreview: focus new');
                Zotero.zoteropreview.getCitationPreview("focus new");
            });
            window.ZoteroPane.document.getElementById("zotero-items-tree").addEventListener("click", function () {
                //Zotero.debug('zoteropreview: click new');
                Zotero.zoteropreview.getCitationPreview("click new");
            });
        }
    };

    this.notifierCallback = function () {
        this.notify = function (event, type, ids, extraData) {
            Zotero.debug("zoteropreview: notify");
            Zotero.zoteropreview.getCitationPreview();
        };
    };

    this.listenerTesting = function (testParam) {
        Zotero.debug("zoteropreview: " + testParam);
        Zotero.debug("zoteropreview: listenerTesting");
        Zotero.zoteropreview.getCitationPreview();
    };

    /**
     * Primary function to generate the preview
     * called from a number of places, but primarily on selection change
     * @return {void}
     */
    this.getCitationPreview = async function (debugParam) {
        Zotero.debug("zoteropreview: getCitationPreview testing " + debugParam);

        // see https://www.zotero.org/support/dev/client_coding/javascript_api#managing_citations_and_bibliographies
        const items = Zotero.getActiveZoteroPane().getSelectedItems();

        if (
            items.length == 1 &&
            Zotero.getActiveZoteroPane().document.getElementById("zotero-view-tabbox").selectedTab.id ==
                "zotero-editpane-preview-tab"
        ) {
            Zotero.debug("zoteropreview: updating citation");
            const qc = Zotero.QuickCopy;
            let format = qc.getFormatFromURL(qc.lastActiveURL);
            format = Zotero.QuickCopy.unserializeSetting(format);

            Zotero.debug("zoteropreview: " + JSON.stringify(format));

            if (format.mode == "") {
                format.mode = "bibliography";
            }

            const userpref = Zotero.Prefs.get("extensions.zoteropreview.citationstyle", true);
            // get the font size preference from the global setting
            const fontSizePref = Zotero.Prefs.get("fontSize");
            // Zotero.debug("format is: " + format);
            Zotero.debug("userpref is: " + userpref);

            if (userpref != "") {
                Zotero.debug("format: " + format["id"]);
                Zotero.debug("setting userpref");
                format.id = userpref;
                format.mode = "bibliography";
            }
            Zotero.debug("format is now: " + JSON.stringify(format));

            let msg = "No bibliography style is chosen in the settings for QuickCopy. Set Preview preference.";

            // added a pane in overlay.xul
            const iframe = Zotero.getActiveZoteroPane().document.getElementById("zoteropreview-preview-box");

            if (format.id == "" || format.mode == "export") {
                iframe.contentDocument.documentElement.innerHTML = msg;
                this.openPreferenceWindow();
                return;
            }

            const biblio = qc.getContentFromItems(items, format);
            msg = "<h3>" + Zotero.getString("styles.bibliography") + "</h3>" + biblio.html;
            //msg += "<p><a href=\"#\" onclick=\"Zotero.zoteropreview.copyCitation(true);\">" + Zotero.getString('general.copy') + "</a></p>";

            Zotero.debug("zoteropreview: " + msg);

            const locale = format.locale ? format.locale : Zotero.Prefs.get("export.quickCopy.locale");

            Zotero.debug("format is: " + format);

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
                Zotero.getString("styles.editor.output.individualCitations") +
                "</h3>" +
                citations;
            // msg += "<p><a href=\"#\" onclick=\"Zotero.zoteropreview.copyCitation(false);\">" + Zotero.getString('general.copy') + "</a></p>";
            Zotero.debug("zoteropreview: " + msg);

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
            msg = '<div style="font-size: ' + fontSizePref + 'em">' + msg + "</div>";
            // Zotero.debug(msg);

            // https://github.com/zotero/zotero/blob/master/chrome/content/zotero/tools/cslpreview.js
            // https://github.com/zotero/zotero/blob/master/chrome/content/zotero/tools/cslpreview.xul

            // Zotero_CSL_Editor.generateBibliography(styleEngine);

            if (iframe.contentDocument.documentElement.innerHTML != msg) {
                iframe.contentDocument.documentElement.innerHTML = msg;
            }
        }
        Zotero.debug("zoteropreview: getCitationPreview done");
        Zotero.debug("-------------------");
    };

    /**
     * Open zoteropreview preference window
     * this took way too long to work out how to do, mostly because of a typo in styleChooser.xul ;-)
     */
    this.openPreferenceWindow = function (paneID, action) {
        // var io = {pane: paneID, action: action};
        // Zotero.debug(prefWindow);
        // Zotero.debug(window.title);
        const prefWindow = window.openDialog(
            "chrome://zoteropreview/content/styleChooser.xul",
            "zoteropreview-stylechooser",
            "chrome,centerscreen,scrollbars=yes,resizable=yes",
        );
    };

    this.copyCitation = function (asCitations) {
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
        Zotero_File_Interface.copyItemsToClipboard(items, format.id, locale, format.contentType == "html", asCitations);
    };
})();
