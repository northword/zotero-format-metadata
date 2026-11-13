import { assert } from "chai";
import { config } from "../../package.json";

const PREF_PREFIX = config.prefsPrefix;

/**
 * The addon instance lives in the plugin sandbox, so its runner and the rules
 * (together with every bundled dependency) run there, not in this test page.
 * Driving the lint through it is what catches runtime APIs that exist in a
 * normal window but not in the sandbox, e.g. `AbortController` (#463, #464)
 * or any other global a dependency starts to require.
 */
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

describe("lint in the plugin sandbox", function () {
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

    // Saving the item must not start another batch: batches are serialized,
    // and the next one would only run after this test finished.
    setPref("lint.onAdded", false);
    // No progress window in tests.
    setPref("lint.notify", false);
    // The rule asserted on below has to be enabled.
    setPref("rule.correct-date-format", true);

    item = new Zotero.Item("journalArticle");
    item.setField("title", "metamaterial inspired skin conformal flexoelectric sports monitoring sensor");
    item.setField("publicationTitle", "Advanced Functional Materials");
    item.setField("date", "2026 01 01");
    item.setField("language", "en");
    item.setField("DOI", "10.1002/adfm.202529747");
    item.setField("volume", "36");
    item.setField("issue", "12");
    item.setField("pages", "e29747");
    item.setCreators([{ firstName: "Ygan", lastName: "Kong", creatorType: "author" }]);
    await item.saveTx();
  });

  after(async function () {
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

  it("runs every enabled rule without error", async function () {
    const addon = await waitForAddon();
    const records: { level?: string; message: string; ruleID: string }[]
      = await addon.hooks.onLintInBatch("standard", [item], { silent: true });

    const errors = records
      .filter(record => record.level === "error")
      .map(record => `${record.ruleID}: ${record.message}`);

    assert.deepEqual(errors, [], `Rules failed:\n${errors.join("\n")}`);
  });

  it("applies the rules to the item", function () {
    // `correct-date-format` is enabled in `before`.
    assert.equal(item.getField("date"), "2026-01-01");
  });
});
