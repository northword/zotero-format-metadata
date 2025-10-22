import { describe, expect, it } from "vitest";
import { compareVersion } from "./compat";

describe("compareVersion", () => {
  it("should compare version correctly", () => {
    expect(compareVersion("1.0.0", "1.0.0")).toBe(0);
    expect(compareVersion("1.0.0", "1.0.1")).toBe(-1);
    expect(compareVersion("1.0.1", "1.0.0")).toBe(1);
    expect(compareVersion("1.0.0", "1.1.0")).toBe(-1);
    expect(compareVersion("1.0.0-beta.1", "1.0.0-beta.2")).toBe(-1);
    expect(compareVersion("1.0.0-beta.10", "1.0.0-beta.12")).toBe(-1);
  });
});
