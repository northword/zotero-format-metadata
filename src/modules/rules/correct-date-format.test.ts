import { describe, expect, it } from "vitest";
import { normalizeDateSeparators } from "./correct-date-format";

describe("normalizeDateSeparators", () => {
  it("should replace whitespace separators in big-endian dates", () => {
    expect(normalizeDateSeparators("2026 01 01")).toBe("2026-01-01");
    expect(normalizeDateSeparators("2026 1 1")).toBe("2026-1-1");
    expect(normalizeDateSeparators("2026 01")).toBe("2026-01");
    expect(normalizeDateSeparators("2026 - 01 - 01")).toBe("2026-01-01");
  });

  it("should normalize mixed separators and surrounding spaces", () => {
    expect(normalizeDateSeparators("2026 / 01 / 01")).toBe("2026-01-01");
    expect(normalizeDateSeparators("2026 -1- 1")).toBe("2026-1-1");
    expect(normalizeDateSeparators(" 2026.1.1 ")).toBe("2026-1-1");
    expect(normalizeDateSeparators("2026\t01\n01")).toBe("2026-01-01");
  });

  it("should keep numeric dates untouched", () => {
    expect(normalizeDateSeparators("2026-01-01")).toBe("2026-01-01");
    expect(normalizeDateSeparators("2026-01")).toBe("2026-01");
    expect(normalizeDateSeparators("2026")).toBe("2026");
  });

  it("should not touch non big-endian numeric dates", () => {
    // Which part is the month depends on the user's locale,
    // so these must not be guessed as `YYYY MM DD`.
    expect(normalizeDateSeparators("01 02 2026")).toBe("01 02 2026");
    expect(normalizeDateSeparators("12 11 2026")).toBe("12 11 2026");
    expect(normalizeDateSeparators("26 01 01")).toBe("26 01 01");
    expect(normalizeDateSeparators("1 2 3")).toBe("1 2 3");
  });

  it("should not touch invalid dates", () => {
    expect(normalizeDateSeparators("2026 00 01")).toBe("2026 00 01");
    expect(normalizeDateSeparators("2026 13 01")).toBe("2026 13 01");
    expect(normalizeDateSeparators("2026 01 32")).toBe("2026 01 32");
    expect(normalizeDateSeparators("2026 02 30")).toBe("2026 02 30");
  });

  it("should handle leap years", () => {
    expect(normalizeDateSeparators("2024 02 29")).toBe("2024-02-29");
    expect(normalizeDateSeparators("2000 02 29")).toBe("2000-02-29");
    expect(normalizeDateSeparators("2026 02 29")).toBe("2026 02 29");
    expect(normalizeDateSeparators("1900 02 29")).toBe("1900 02 29");
  });

  it("should not touch non numeric dates", () => {
    expect(normalizeDateSeparators("January 2026")).toBe("January 2026");
    expect(normalizeDateSeparators("1 Jan 2026")).toBe("1 Jan 2026");
    expect(normalizeDateSeparators("2026 01 01 (Spring)")).toBe("2026 01 01 (Spring)");
    expect(normalizeDateSeparators("2026-01-01 12:00:00")).toBe("2026-01-01 12:00:00");
  });
});
