export function registerNotifier() {
    const callback = {
        notify: async (
            event: string,
            type: string,
            ids: number[] | string[],
            extraData: { [key: string]: unknown }
        ) => {
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

    /**
     * 监听 切换选择的条目
     * @see https://github.com/windingwind/zotero-pdf-preview/blob/f6dc89ad6113a0ec0385201f2b0f687524f2e158/src/events.ts#L56-L61
     */
    // ZoteroPane.itemsView.onSelect.addListener(() => {
    //     ztoolkit.log("Rich text toolbar updates triggered by selection changes");
    //     addon.hooks.onNotify("select", "item", [], {});
    // });
}

function unregisterNotifier(notifierID: string) {
    Zotero.Notifier.unregisterObserver(notifierID);
}

export function registerMutationObserver() {
    let targetNode: HTMLElement;
    if (ztoolkit.isZotero7()) {
        targetNode = document.getElementById("zotero-item-pane-content")!;
    } else {
        targetNode = document.getElementById("dynamic-fields")!;
    }
    // ztoolkit.log(targetNode);
    const observerOptions = {
        // childList: true, // 观察目标子节点的变化，是否有添加或者删除
        attributes: true, // 观察属性变动
        attributeFilter: ["control"],
        subtree: true, // 观察后代节点，默认为 false
    };

    function callback(records: MutationRecord[], observer: MutationObserver) {
        records.forEach((record) => {
            if (!addon?.data.alive) {
                observer.disconnect();
                return;
            }
            addon.hooks.onMutationObserver(record, observer);
        });
    }

    const observer = new window.MutationObserver(callback);
    observer.observe(targetNode, observerOptions);

    window.addEventListener(
        "unload",
        (e: Event) => {
            observer.disconnect();
        },
        false
    );
}
