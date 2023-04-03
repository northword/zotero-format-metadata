export function registerNotifier() {
    const callback = {
        notify: async (event: string, type: string, ids: number[] | string[], extraData: { [key: string]: any }) => {
            if (!addon?.data.alive) {
                unregisterNotifier(notifierID);
                return;
            }
            addon.hooks.onNotify(event, type, ids, extraData);
        },
    };

    // Register the callback in Zotero as an item observer
    const notifierID = Zotero.Notifier.registerObserver(callback, ["item"]);

    // Unregister callback when the window closes (important to avoid a memory leak)
    window.addEventListener(
        "unload",
        (e: Event) => {
            unregisterNotifier(notifierID);
        },
        false
    );

    ZoteroPane.itemsView.onSelect.addListener(() => {
        ztoolkit.log("Rich text toolbar updates triggered by selection changes");
        // addon.hooks.onNotify("select", "item", [], {});
    });
}

function unregisterNotifier(notifierID: string) {
    Zotero.Notifier.unregisterObserver(notifierID);
}
