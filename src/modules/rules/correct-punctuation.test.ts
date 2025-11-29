import { describe, expect, it } from "vitest";
import { convertQuotesToCurly, normalizeHyphens, normalizeInterpuncts } from "./correct-punctuation";

describe("normalizeHyphens", () => {
  it("normalizes various hyphen-like characters to hyphen-minus", () => {
    // U+2010 (HYPHEN), U+2011 (NON-BREAKING HYPHEN), U+2012 (FIGURE DASH)
    // U+2015 (HORIZONTAL BAR), U+FF0D (FULLWIDTH HYPHEN-MINUS), U+2212 (MINUS SIGN)
    const input = "COVID‐19 and A‒B — C−D ＋";
    const out = normalizeHyphens(input);
    // Should contain regular ASCII hyphen
    expect(out).toContain("-");
    // Should not contain any special hyphen characters
    expect(out).not.toContain("\u2010");
    expect(out).not.toContain("\u2011");
    expect(out).not.toContain("\u2012");
  });

  it("leaves regular text unchanged if no special hyphens", () => {
    const input = "Regular hyphen-minus text";
    const out = normalizeHyphens(input);
    expect(out).toBe(input);
  });

  it("handles empty string", () => {
    expect(normalizeHyphens("")).toBe("");
  });
});

describe("convertQuotesToCurly", () => {
  it("converts straight double quotes to curly", () => {
    const input = "He said \"hello\"";
    const out = convertQuotesToCurly(input);
    expect(out).toBe("He said “hello”");
  });

  it("converts straight single quotes to curly while preserving apostrophes in words", () => {
    const input = "don't and 'hello'";
    const out = convertQuotesToCurly(input);
    expect(out).toBe("don’t and ‘hello’");
  });

  it("leaves text unchanged if no quotes", () => {
    const input = "Regular text without quotes";
    const out = convertQuotesToCurly(input);
    expect(out).toBe(input);
  });

  it("handles empty string", () => {
    expect(convertQuotesToCurly("")).toBe("");
  });

  it("converts quote after opening punctuation to left quote", () => {
    const input = "(\"hello\")";
    const out = convertQuotesToCurly(input);
    // After (, quote should be left quote
    expect(out).toBe("(“hello”)");
  });
});

describe("normalizeInterpuncts", () => {
  it("should work", () => {
    const input = "名・姓";
    const out = normalizeInterpuncts(input);
    expect(out).toBe("名·姓");
  });
});
