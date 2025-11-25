import { describe, expect, it } from "vitest";
import { extractDOIFromUrl, extractIdentifiers } from "./identifiers";

// Mock Zotero item
function mockItem(fields: Record<string, string>) {
  return {
    getField: (key: string) => fields[key] || "",
  } as Zotero.Item;
}

// Mock ztoolkit ExtraField
(globalThis as any).ztoolkit = {
  ExtraField: {
    getExtraField: (item: Zotero.Item, field: string) =>
      (item as any)[`extra_${field}`] || "",
  },
};

describe("extractDOIFromUrl", () => {
  it("extracts DOI from URL", () => {
    expect(
      extractDOIFromUrl("https://example.com/10.1234/abcd.5678"),
    ).toBe("10.1234/abcd.5678");
  });

  it("returns null for invalid URL", () => {
    expect(extractDOIFromUrl("not-a-url")).toBeNull();
  });

  it("handles encoded DOI", () => {
    expect(
      extractDOIFromUrl("https://example.com/10.1234%2Fabcd.5678"),
    ).toBe("10.1234/abcd.5678");
  });

  it("handles URL with query", () => {
    expect(
      extractDOIFromUrl("https://example.com/10.1234/abcd.5678?abc=11"),
    ).toBe("10.1234/abcd.5678");
  });
});

describe("extractIdentifiers", () => {
  it("extracts DOI, URL and arXiv", () => {
    const item = mockItem({
      DOI: "10.48550/arXiv.1234.5678",
      url: "https://arxiv.org/abs/1234.5678",
    });

    const result = extractIdentifiers(item);

    expect(result.DOI).toBe("10.48550/arXiv.1234.5678");
    expect(result.arXiv).toBe("1234.5678");
    expect(result.URL).toBe("https://arxiv.org/abs/1234.5678");
  });

  it("falls back to DOI from URL if missing", () => {
    const item = mockItem({
      url: "https://example.com/10.9999/xyz567",
    });

    const result = extractIdentifiers(item);
    expect(result.DOI).toBe("10.9999/xyz567");
  });

  it("extracts extra fields like PMID and ISBN", () => {
    const item = mockItem({
      url: "https://example.com",
    });

    (item as any).extra_PMID = "99999";
    (item as any).extra_ISBN = "123-4567";

    const result = extractIdentifiers(item);

    expect(result.PMID).toBe("99999");
    expect(result.ISBN).toBe("123-4567");
  });
});
