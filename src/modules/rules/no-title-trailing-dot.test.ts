import { describe, expect, it } from "vitest";
import { removeTrailingDot } from "./no-title-trailing-dot";

describe("removeTrailingDot", () => {
  it("should remove trailing dot", () => {
    expect(removeTrailingDot("This is a title with dot.")).toBe("This is a title with dot");
  });

  it("should not change title without trailing dot", () => {
    expect(removeTrailingDot("This is a title with dot")).toBe("This is a title with dot");
    expect(removeTrailingDot("This is a title. And with dot")).toBe("This is a title. And with dot");
  });
});
