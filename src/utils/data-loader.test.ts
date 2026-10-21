import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataLoader } from "./data-loader";

describe("dataLoader", () => {
  beforeEach(() => {
    vi.stubGlobal("ztoolkit", { log: vi.fn() });
  });

  afterEach(() => {
    DataLoader.clearCache();
    vi.unstubAllGlobals();
  });

  it("should select the parser by the given key instead of the file extension", async () => {
    const content = "word\tabbr. # a CSV-like line\n";
    vi.stubGlobal("Zotero", {
      File: { getContentsAsync: vi.fn(async () => content) },
    });

    // A CSV file loaded as `txt` should be returned as raw text,
    // which is required by the LTWA data used for ISO 4 inference.
    await expect(DataLoader.load("txt", "file:///plugin/data/ltwa.csv")).resolves.toBe(content);
  });

  it("should parse JSON by the given key", async () => {
    vi.stubGlobal("Zotero", {
      File: { getContentsAsync: vi.fn(async () => "{\"a\":\"b\"}") },
    });

    await expect(DataLoader.load("json", "file:///plugin/data/whatever.txt")).resolves.toEqual({ a: "b" });
  });
});
