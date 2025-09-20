import { describe, expect, it } from "vitest";
import { normalizeField } from "./correct-edition-numeral";

describe("normalizeField", () => {
  it("should convert Roman numerals to numbers", () => {
    expect(normalizeField("I")).toBe("1");
    expect(normalizeField("ii")).toBe("2");
    expect(normalizeField("III edition")).toBe("3");
    expect(normalizeField("iv")).toBe("4");
  });

  it("should convert standalone Chinese numbers", () => {
    expect(normalizeField("一")).toBe("1");
    expect(normalizeField("二")).toBe("2");
    expect(normalizeField("十")).toBe("10");
    expect(normalizeField("十二")).toBe("12");
    expect(normalizeField("二十")).toBe("20");
  });

  it("should convert English ordinal words to numbers", () => {
    expect(normalizeField("first")).toBe("1");
    expect(normalizeField("Second edition")).toBe("2");
    expect(normalizeField("third")).toBe("3");
    expect(normalizeField("Fourth")).toBe("4");
  });

  it("should remove ordinal suffixes", () => {
    expect(normalizeField("1st ed.")).toBe("1");
    expect(normalizeField("2nd edition")).toBe("2");
    expect(normalizeField("3rd")).toBe("3");
    expect(normalizeField("4th ed.")).toBe("4");
  });

  it("should normalize Chinese ordinals", () => {
    expect(normalizeField("第一版")).toBe("1");
    expect(normalizeField("第2版")).toBe("2");
    expect(normalizeField("第十二版")).toBe("12");
    expect(normalizeField("第十七册")).toBe("17");
  });

  it("should normalize incomplete names", () => {
    expect(normalizeField("修订")).toBe("修订版");
    expect(normalizeField("影印")).toBe("影印本");
    expect(normalizeField("Revised")).toBe("Revised Edition");
    expect(normalizeField("Facsimile")).toBe("Facsimile Edition");
  });

  it("should trim and remove 'ed.' or 'edition' suffix", () => {
    expect(normalizeField(" 1st ed. ")).toBe("1");
    expect(normalizeField("Second edition")).toBe("2");
    expect(normalizeField("III edition")).toBe("3");
  });

  it("should leave already correct values unchanged", () => {
    expect(normalizeField("3")).toBe("3");
    expect(normalizeField("修订版")).toBe("修订版");
    expect(normalizeField("Revised Edition")).toBe("Revised Edition");
  });

  it("should handle mixed cases", () => {
    expect(normalizeField("Vol. IV")).toBe("Vol. 4");
    expect(normalizeField("3rd Edition")).toBe("3");
    expect(normalizeField("影印")).toBe("影印本");
  });
});
