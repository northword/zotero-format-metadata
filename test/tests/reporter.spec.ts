import { assert } from "chai";
import { config } from "../../package.json";

// @ts-expect-error no types
const addon = Zotero[config.addonInstance];

const REPORTER_CONTAINER_ID = "reporter-container";

async function waitUntil(
  condition: () => boolean,
  describe: () => string,
  timeout = 20000,
): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout)
      throw new Error(`waitUntil timeout: ${describe()}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function createBook(title: string): Promise<Zotero.Item> {
  const item = new Zotero.Item("book");
  item.setField("title", title);
  await item.saveTx();
  return item;
}

function getReporterWindow(): Window | undefined {
  return [...addon.data.dialogs.values()][0];
}

function getBatchCount(): number | null {
  const win = getReporterWindow();
  if (!win?.document)
    return null;
  const container = win.document.getElementById(REPORTER_CONTAINER_ID);
  return container?.children.length ?? null;
}

describe("reporter dialog", function () {
  this.timeout(120000);
  const items: Zotero.Item[] = [];

  before(function () {
    // 避免条目创建时的 notify 自动 lint 干扰批次计数
    const prefix = addon.data.config.prefsPrefix;
    Zotero.Prefs.set(`${prefix}.lint.onAdded`, false, true);
    Zotero.Prefs.set(`${prefix}.lint.onGroup`, false, true);
  });

  after(async function () {
    for (const item of items) {
      try {
        await item.eraseTx();
      }
      catch {
        // already erased
      }
    }
    getReporterWindow()?.close();
  });

  it("should keep a single dialog and append batches across lint runs", async function () {
    const item1 = await createBook("Reporter Test Item One");
    items.push(item1);

    await addon.hooks.onLintInBatch(["require-creators"], [item1]);
    await waitUntil(
      () => addon.data.dialogs.size === 1,
      () => `dialogs.size=${addon.data.dialogs.size}`,
    );
    await waitUntil(
      () => getBatchCount() === 1,
      () => `batchCount=${getBatchCount()}`,
    );
    assert.strictEqual(addon.data.dialogs.size, 1, "first lint should open one dialog");

    const item2 = await createBook("Reporter Test Item Two");
    items.push(item2);

    await addon.hooks.onLintInBatch(["require-creators"], [item2]);
    await waitUntil(
      () => getBatchCount() === 2,
      () => `batchCount=${getBatchCount()}, dialogs.size=${addon.data.dialogs.size}`,
    );
    assert.strictEqual(addon.data.dialogs.size, 1, "second lint must reuse the dialog");

    const container = getReporterWindow()!.document.getElementById(REPORTER_CONTAINER_ID)!;
    assert.strictEqual(container.children.length, 2, "both batches should be present");
    assert.include(container.children[0].textContent!, String(item1.id), "first batch must be preserved");
    assert.include(container.children[1].textContent!, String(item2.id), "second batch must be appended");
  });

  it("should open a fresh dialog after the previous one is closed", async function () {
    const item = await createBook("Reporter Test Item Three");
    items.push(item);

    getReporterWindow()?.close();
    await waitUntil(
      () => addon.data.dialogs.size === 0,
      () => `dialogs.size=${addon.data.dialogs.size}`,
    );

    await addon.hooks.onLintInBatch(["require-creators"], [item]);
    await waitUntil(
      () => addon.data.dialogs.size === 1,
      () => `dialogs.size=${addon.data.dialogs.size}`,
    );
    await waitUntil(
      () => getBatchCount() === 1,
      () => `batchCount=${getBatchCount()}`,
    );
    assert.strictEqual(addon.data.dialogs.size, 1, "a closed dialog should be recreated on next lint");
  });
});
