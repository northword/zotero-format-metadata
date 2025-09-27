import { describe, expect, it } from "vitest";
import { generateRange, shouldApply } from "./correct-pages-range";

describe("shouldApply", () => {
  it("should work", () => {
    expect(shouldApply("1")).toBe(true);
    expect(shouldApply("111")).toBe(true);
  });

  it("should skip for page range", () => {
    expect(shouldApply("1-13")).toBe(false);
    expect(shouldApply("1,13")).toBe(false);
  });

  it("should skip for non-number", () => {
    expect(shouldApply("e0111")).toBe(false);
  });

  it("should skip for long number", () => {
    expect(shouldApply("1111")).toBe(false);
    expect(shouldApply("0111")).toBe(false);
    expect(shouldApply("085038")).toBe(false);
  });
});

describe("generateRange", () => {
  it("should work", () => {
    expect(generateRange("1", 10)).toBe("1-11");
    expect(generateRange("011", 10)).toBe("11-21");
  });
});
