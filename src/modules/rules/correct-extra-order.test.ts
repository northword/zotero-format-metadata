// src/sortMapByZoteroRules.test.ts
import { describe, expect, it } from "vitest";
import { sortExtraFieldMap } from "./correct-extra-order";

describe("sortMapByZoteroRules", () => {
  const zoteroFields = ["type", "title", "author", "abstract", "date"];

  it("should place citation key first", () => {
    const map = new Map<string, string[]>([
      ["author", ["Alice"]],
      ["citation-key", ["Smith2021"]],
      ["title", ["A Title"]],
    ]);

    const result = [...sortExtraFieldMap(map, zoteroFields).keys()];
    expect(result[0]).toBe("citation-key");
  });

  it("should sort Zotero fields with type first and others alphabetically", () => {
    const map = new Map<string, string[]>([
      ["date", ["2022"]],
      ["title", ["Example"]],
      ["type", ["book"]],
      ["author", ["Zoe"]],
      ["abstract", ["Summary"]],
    ]);

    const result = [...sortExtraFieldMap(map, zoteroFields).keys()];
    expect(result).toEqual(["type", "abstract", "author", "date", "title"]);
  });

  it("should place 'original-' fields after Zotero fields", () => {
    const map = new Map<string, string[]>([
      ["original-title", ["Old"]],
      ["citation-key", ["Key"]],
      ["type", ["book"]],
      ["author", ["Alice"]],
    ]);

    const result = [...sortExtraFieldMap(map, zoteroFields).keys()];
    expect(result).toEqual(["citation-key", "type", "author", "original-title"]);
  });

  it("should sort non-Zotero, non-original keys alphabetically (with Chinese pinyin)", () => {
    const map = new Map<string, string[]>([
      ["中文字段", ["示例"]],
      ["banana", ["b"]],
      ["apple", ["a"]],
    ]);

    const result = [...sortExtraFieldMap(map, zoteroFields).keys()];
    expect(result).toEqual(["apple", "banana", "中文字段"]);
  });

  it("should sort non-standard keys", () => {
    const map = new Map<string, string[]>([
      ["__nonStandard__", ["titleTranslation"]],
      ["type", ["b"]],
      ["apple", ["a"]],
    ]);

    const result = [...sortExtraFieldMap(map, zoteroFields).keys()];
    expect(result).toEqual(["type", "apple", "__nonStandard__"]);
  });

  it("should correctly apply all sorting rules together", () => {
    const map = new Map<string, string[]>([
      ["title", ["A"]],
      ["type", ["T"]],
      ["original-title", ["O"]],
      ["citation-key", ["C"]],
      ["中文字段", ["Z"]],
      ["author", ["A"]],
      ["date", ["D"]],
      ["abstract", ["A"]],
    ]);

    const result = [...sortExtraFieldMap(map, zoteroFields).keys()];
    expect(result).toEqual([
      "citation-key", // 1️⃣ citation key
      "type", // 2️⃣ type first among Zotero
      "abstract", // 2️⃣ remaining Zotero fields in order
      "author",
      "date",
      "title",
      "original-title", // 3️⃣ original-
      "中文字段", // 4️⃣ others
    ]);
  });
});
