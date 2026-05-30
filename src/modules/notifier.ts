let notifierID: string;

export function registerNotifier() {
  // Register the callback in Zotero as an item observer
  notifierID = Zotero.Notifier.registerObserver(
    {
      notify: async (
        event: string,
        type: string,
        ids: number[] | string[],
        extraData: { [key: string]: unknown },
      ) => {
        if (!addon?.data.alive) {
          unregisterNotifier();
          return;
        }
        await addon.hooks.onNotify(event, type, ids, extraData);
      },
    },
    ["item"],
    "linter",
    // We expect the Linter to run after all plugins so that we can
    // clear up any unexpected data performed by other plugins.
    666,
  );
}

export function unregisterNotifier() {
  Zotero.Notifier.unregisterObserver(notifierID);
}
