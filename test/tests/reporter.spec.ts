import { assert } from "chai";
import { config } from "../../package.json";

const REPORTER_CONTAINER_ID = "reporter-container";
const PREF_PREFIX = config.prefsPrefix;

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

async function waitUntil(
  condition: () => boolean,
  describe: () => string,
  timeout = 20_000,
): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout)
      throw new Error(`waitUntil timeout: ${describe()}`);
    await Zotero.Promise.delay(100);
  }
}

/** The results window is a chrome window, not an entry of `addon.data.dialogs`. */
function getReporterWindows(): Window[] {
  const windows: Window[] = [];
  const enumerator = Services.wm.getEnumerator(null as unknown as string);
  while (enumerator.hasMoreElements()) {
    const win = enumerator.getNext() as Window;
    if (!win.closed && win.document?.getElementById(REPORTER_CONTAINER_ID))
      windows.push(win);
  }
  return windows;
}

function getReporterWindow(): Window | undefined {
  return getReporterWindows()[0];
}

/** The batches appended so far, one element each. */
function getBatches(win: Window): Element[] {
  const container = win.document.getElementById(REPORTER_CONTAINER_ID);
  return container ? Array.from(container.children) : [];
}

/** The item cards of one batch, i.e. everything after its header. */
function getCards(batch: Element): Element[] {
  return Array.from(batch.children).slice(1);
}

/** Whether the batch has a card for this item, without matching a longer id by accident. */
function showsItem(batch: Element, itemID: number): boolean {
  return getCards(batch).some(
    card => new RegExp(`(^|\\D)${itemID}(\\D|$)`).test(card.textContent ?? ""),
  );
}

async function createBook(title: string): Promise<Zotero.Item> {
  const item = new Zotero.Item("book");
  item.setField("title", title);
  await item.saveTx();
  return item;
}

describe("reporter dialog", function () {
  this.timeout(120_000);

  const items: Zotero.Item[] = [];
  const originalPrefs = new Map<string, any>();

  function setPref(key: string, value: any) {
    const fullKey = `${PREF_PREFIX}.${key}`;
    if (!originalPrefs.has(fullKey))
      originalPrefs.set(fullKey, Zotero.Prefs.get(fullKey, true));
    Zotero.Prefs.set(fullKey, value, true);
  }

  before(async function () {
    await waitForAddon();

    // The window is a plugin-wide singleton: whatever an earlier spec left
    // open would be appended to instead of a fresh one.
    for (const win of getReporterWindows())
      win.close();
    await waitUntil(
      () => getReporterWindows().length === 0,
      () => `reporter windows=${getReporterWindows().length}`,
    );

    // Avoid the notify auto lint, which would start batches of its own.
    setPref("lint.onAdded", false);
    setPref("lint.onGroup", false);
  });

  after(async function () {
    for (const item of items) {
      if (item?.id)
        await item.eraseTx();
    }
    for (const win of getReporterWindows())
      win.close();

    for (const [key, value] of originalPrefs) {
      if (value === undefined)
        Zotero.Prefs.clear(key, true);
      else
        Zotero.Prefs.set(key, value, true);
    }
    originalPrefs.clear();
  });

  it("should keep a single window and append batches across lint runs", async function () {
    const addon = await waitForAddon();

    const item1 = await createBook("Reporter Test Item One");
    items.push(item1);

    await addon.hooks.onLintInBatch(["require-creators"], [item1]);
    await waitUntil(
      () => getReporterWindows().length === 1,
      () => `reporter windows=${getReporterWindows().length}`,
    );
    await waitUntil(
      () => getBatches(getReporterWindow()!).length === 1,
      () => `batches=${getBatches(getReporterWindow()!).length}`,
    );

    const item2 = await createBook("Reporter Test Item Two");
    items.push(item2);

    await addon.hooks.onLintInBatch(["require-creators"], [item2]);
    await waitUntil(
      () => getBatches(getReporterWindow()!).length === 2,
      () => `batches=${getBatches(getReporterWindow()!).length}, windows=${getReporterWindows().length}`,
    );

    assert.lengthOf(getReporterWindows(), 1, "the second run must reuse the window");

    const [batch1, batch2] = getBatches(getReporterWindow()!);
    assert.isTrue(showsItem(batch1, item1.id), "the first batch must be preserved");
    assert.isTrue(showsItem(batch2, item2.id), "the second batch must be appended");
  });

  it("should label every batch with its own time and finding count", async function () {
    const win = getReporterWindow()!;
    const header = getBatches(win)[0].firstElementChild;

    assert.isNotNull(header, "a batch should start with a header");
    assert.isTrue(
      /\d{1,2}:\d{2}/.test(header!.textContent ?? ""),
      `the header should show the time of the batch, got "${header!.textContent}"`,
    );
  });

  it("should grow with the content until it reaches the max height", async function () {
    const addon = await waitForAddon();
    const maxHeight = Number.parseFloat(
      getReporterWindow()!.getComputedStyle(getReporterWindow()!.document.body).maxHeight,
    );
    assert.isAbove(maxHeight, 0, "the dialog should cap its content height");

    let previous = getReporterWindow()!.innerHeight;
    let grew = false;

    for (let i = 0; i < 8 && getReporterWindow()!.innerHeight < maxHeight - 2; i++) {
      const group = await Promise.all(
        [0, 1, 2].map(n => createBook(`Reporter Growth Item ${i}-${n}`)),
      );
      items.push(...group);
      await addon.hooks.onLintInBatch(["require-creators"], group);

      const height = getReporterWindow()!.innerHeight;
      if (height > previous + 1)
        grew = true;
      previous = height;
    }

    assert.isTrue(grew, "the window should grow with the batches appended to it");
    assert.isAtLeast(
      getReporterWindow()!.innerHeight,
      maxHeight - 2,
      "the window should reach the max height before the content scrolls",
    );
  });

  it("should fit the window to its content and stop resizing once it scrolls", async function () {
    const addon = await waitForAddon();

    // `useDialog` caps the content at 80% of the screen: a batch taller than
    // that has to scroll inside the window instead of growing it.
    const maxHeight = Math.floor(getReporterWindow()!.screen.height * 0.8);
    const count = Math.ceil(maxHeight / 80) + 2;

    const batchItems: Zotero.Item[] = [];
    for (let i = 0; i < count; i++)
      batchItems.push(await createBook(`Reporter Test Item ${i}`));
    items.push(...batchItems);

    const batchesBefore = getBatches(getReporterWindow()!).length;
    await addon.hooks.onLintInBatch(["require-creators"], batchItems);
    await waitUntil(
      () => getBatches(getReporterWindow()!).length === batchesBefore + 1,
      () => `batches=${getBatches(getReporterWindow()!).length}`,
    );

    const win = getReporterWindow()!;
    assert.isAbove(
      win.document.body.scrollHeight,
      win.innerHeight,
      "what does not fit must scroll inside the window",
    );

    // A second, horizontal scroll bar shows up as a dark strip along the
    // bottom edge of the window.
    const body = win.document.body;
    assert.equal(win.getComputedStyle(body).overflowX, "hidden", "the window must not scroll sideways");
    assert.isAtMost(body.scrollWidth, body.clientWidth + 1, "the content must not overflow sideways");

    // Whatever the content does not cover has to keep the dialog palette
    // instead of the dark default of the preferred colour scheme.
    assert.notEqual(
      win.getComputedStyle(win.document.documentElement).backgroundColor,
      "rgba(0, 0, 0, 0)",
      "the canvas must be painted with the dialog palette",
    );

    // The batch appended while the window was at the bottom has to be brought
    // into view, instead of landing below the fold.
    const latest = getBatches(win).at(-1)!;
    const { top } = latest.getBoundingClientRect();
    assert.isAtLeast(top, -1, "the newest batch should be scrolled to the top");
    assert.isBelow(top, win.innerHeight, "the newest batch should be visible");
  });

  it("should open a fresh window after the previous one is closed", async function () {
    const addon = await waitForAddon();

    getReporterWindow()?.close();
    await waitUntil(
      () => getReporterWindows().length === 0,
      () => `reporter windows=${getReporterWindows().length}`,
    );

    const item = await createBook("Reporter Test Item Three");
    items.push(item);

    await addon.hooks.onLintInBatch(["require-creators"], [item]);
    await waitUntil(
      () => getReporterWindows().length === 1,
      () => `reporter windows=${getReporterWindows().length}`,
    );
    await waitUntil(
      () => getBatches(getReporterWindow()!).length === 1,
      () => `batches=${getBatches(getReporterWindow()!).length}`,
    );

    const [batch] = getBatches(getReporterWindow()!);
    assert.isTrue(showsItem(batch, item.id), "a closed window should be recreated on the next run");
  });
});
