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

  // Unregister callback when the plugin shutdown (important to avoid a memory leak)
  Zotero.Plugins.addObserver({
    shutdown: ({ id }) => {
      if (id === addon.data.config.addonID)
        unregisterNotifier(notifierID);
    },
  });
}

function unregisterNotifier(notifierID: string) {
  Zotero.Notifier.unregisterObserver(notifierID);
}
