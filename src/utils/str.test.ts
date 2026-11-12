import { describe, expect, it } from "vitest";
import { convertToRegex } from "./str";

describe("convertToRegex", () => {
  it("should escape plain strings", () => {
    expect(convertToRegex("a.b").test("axb")).toBe(false);
    expect(convertToRegex("a.b").test("a.b")).toBe(true);
  });

  it("should support regex literals", () => {
    expect(convertToRegex("/^ab/i").test("AB")).toBe(true);
  });

  it("should append extra flags", () => {
    // https://github.com/northword/zotero-format-metadata/issues/462
    const title = "Can strong finnish national identity influence confidence in confronting bears: a study of finnish homeowners";
    expect(title.replace(convertToRegex("finnish", "g"), "Finnish"))
      .toBe("Can strong Finnish national identity influence confidence in confronting bears: a study of Finnish homeowners");
  });

  it("should not duplicate flags", () => {
    expect(convertToRegex("/ab/g", "g").flags).toBe("g");
    expect(convertToRegex("/ab/i", "gi").flags).toBe("gi");
  });
});
