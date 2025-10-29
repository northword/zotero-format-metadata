import { describe, expect, it } from "vitest";
import { getPinyin, getSurnamePinyin, splitChineseName } from "./pinyin";

describe("pinyin", () => {
  describe("getPinyin", () => {
    it("should work", () => {
      expect(getPinyin("灵慧")).toBe("Ling Hui");
      expect(getPinyin("")).toBe("");
    });
  });

  describe("getSurnamePinyin", () => {
    it("should work", () => {
      expect(getSurnamePinyin("苏")).toBe("Su");
      expect(getSurnamePinyin("盖")).toBe("Ge");
    });

    it("should not break if input is not a surname", () => {
      expect(getSurnamePinyin("测试")).toBe("Ce Shi");
      expect(getSurnamePinyin("")).toBe("");
    });
  });
});

describe("splitChineseName", () => {
  it("should work", () => {
    expect(splitChineseName("张三")).toEqual(["张", "三"]);
    expect(splitChineseName("张三丰")).toEqual(["张", "三丰"]);
    expect(splitChineseName("诸葛亮")).toEqual(["诸葛", "亮"]);
    expect(splitChineseName("南宫问天")).toEqual(["南宫", "问天"]);

    // should not break if input is not a chinese name
    expect(splitChineseName("这是测试")).toEqual(["这", "是测试"]);
  });
});
