export function registerNotifier() {
  // Register the callback in Zotero as an item observer
  const notifierID = Zotero.Notifier.registerObserver(
    {
      notify: async (
        event: string,
        type: string,
        ids: number[] | string[],
        extraData: { [key: string]: unknown },
      ) => {
        if (!addon?.data.alive) {
          unregisterNotifier(notifierID);
          return;
        }
        addon.hooks.onNotify(event, type, ids, extraData);
      },
    },
    ["item"],
  );

  Zotero.Plugins.addObserver({
    shutdown: () => {
      unregisterNotifier(notifierID);
    },
  });

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
