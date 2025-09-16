import { describe, expect, it } from "vitest";
import { getShortTitle } from "./require-short-title";

describe("require-short-title", () => {
  it("should work", async () => {
    const title = "A review: this is a review";
    expect(getShortTitle(title)).toBe("A review");
  });
});
