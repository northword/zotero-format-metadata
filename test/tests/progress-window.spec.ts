import { assert } from "chai";
import { config } from "../../package.json";

const PREF_PREFIX = config.prefsPrefix;
const FTL = `${config.addonRef}-addon.ftl`;

// Keep in sync with `PROGRESS_WINDOW_CLOSE_DELAY` in src/modules/reporter.ts
const CLOSE_DELAY = 5000;

function getAddon(): any {
  return (Zotero as any)[config.addonInstance];
}

async function waitForAddon(timeout = 10_000): Promise<any> {
  const start = Date.now();
  while (!getAddon()) {
    if (Date.now() - start > timeout)
      throw new Error(`Plugin ${config.addonInstance} was not loaded in ${timeout}ms`);
    await Zotero.Promise.delay(50);
  }
  return getAddon();
}

function l10nMessage(id: string, args?: Record<string, string | number>): string {
  const l10n = new Localization([FTL], true);
  const [message] = l10n.formatValuesSync([
    { id: `${config.addonRef}-${id}`, args },
  ]);
  return message ?? "";
}

/**
 * The progress window is a separate chrome window with `windowtype="alert:alert"`,
 * as declared in Zotero's `progressWindow.xhtml`.
 */
function getProgressWindows(): Window[] {
  const windows: Window[] = [];
  const enumerator = Services.wm.getEnumerator("alert:alert");
  while (enumerator.hasMoreElements()) {
    const win = enumerator.getNext() as Window;
    if (!win.closed)
      windows.push(win);
  }
  return windows;
}

function getLineTexts(win: Window): string[] {
  const labels = win.document.querySelectorAll(
    "#zotero-progress-text-box .zotero-progress-item-label",
  );
  return Array.from(labels, label => label.textContent?.trim() ?? "");
}

async function waitFor(
  predicate: () => boolean,
  timeout: number,
  interval = 100,
): Promise<boolean> {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeout)
      return false;
    await Zotero.Promise.delay(interval);
  }
  return true;
}

describe("progress window", function () {
  this.timeout(120_000);

  let item: Zotero.Item;
  const originalPrefs = new Map<string, any>();

  function setPref(key: string, value: any) {
    const fullKey = `${PREF_PREFIX}.${key}`;
    if (!originalPrefs.has(fullKey))
      originalPrefs.set(fullKey, Zotero.Prefs.get(fullKey, true));
    Zotero.Prefs.set(fullKey, value, true);
  }

  before(async function () {
    await waitForAddon();

    // Saving the item must not start another batch.
    setPref("lint.onAdded", false);
    // We are testing the notification here.
    setPref("lint.notify", true);

    item = new Zotero.Item("journalArticle");
    item.setField("title", "metamaterial inspired skin conformal flexoelectric sports monitoring sensor");
    item.setField("date", "2026 01 01");
    item.setField("language", "en");
    await item.saveTx();
  });

  after(async function () {
    // Close the report dialog, if any: `correct-date-format` shows one.
    const allWindows = Services.wm.getEnumerator(null as unknown as string);
    while (allWindows.hasMoreElements()) {
      const win = allWindows.getNext() as Window;
      if (win.document?.title === "Linter for Zotero")
        win.close();
    }
    Zotero.ProgressWindowSet.closeAll();

    if (item?.id)
      await item.eraseTx();

    for (const [key, value] of originalPrefs) {
      if (value === undefined)
        Zotero.Prefs.clear(key, true);
      else
        Zotero.Prefs.set(key, value, true);
    }
    originalPrefs.clear();
  });

  it("reports the save result and closes after the mouse leaves it", async function () {
    const addon = await waitForAddon();

    await addon.hooks.onLintInBatch(["correct-date-format"], [item]);

    const win = getProgressWindows()[0];
    assert.isDefined(win, "progress window should be shown");

    const lines = getLineTexts(win);
    assert.include(lines[0], l10nMessage("info-batch-finish"));
    // The save line used to keep "Saving..."/"Pending save..." forever.
    assert.equal(lines[1], l10nMessage("info-batch-saved", { count: 1 }));
    assert.notEqual(lines[2], l10nMessage("info-batch-break"));

    // Keeping the mouse over the window postpones the close (#461)
    win.dispatchEvent(new (win as any).MouseEvent("mouseover"));
    assert.isFalse(
      await waitFor(() => win.closed, CLOSE_DELAY + 1500),
      "progress window should stay while the mouse is over it",
    );

    // Moving it out restarts the close timer, even if Zotero's own `mouseout`
    // bounds check misjudges the pointer position on scaled displays.
    win.dispatchEvent(new (win as any).MouseEvent("mouseout"));
    assert.isTrue(
      await waitFor(() => win.closed, CLOSE_DELAY + 2000),
      "progress window should close after the mouse leaves it",
    );
  });

  it("reports a batch without changes and closes on click", async function () {
    const addon = await waitForAddon();

    // The date is already normalized by the previous test, so nothing is saved
    await addon.hooks.onLintInBatch(["correct-date-format"], [item]);

    const win = getProgressWindows()[0];
    assert.isDefined(win, "progress window should be shown");
    assert.equal(
      getLineTexts(win)[1],
      l10nMessage("info-batch-nothing-to-save"),
    );

    // A finished notification can be dismissed by clicking it (#461)
    win.dispatchEvent(new (win as any).MouseEvent("mouseup"));
    assert.isTrue(
      await waitFor(() => win.closed, 2000),
      "click should close the notification",
    );
  });
});
