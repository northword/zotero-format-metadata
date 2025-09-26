import { describe, expect, it } from "vitest";
import { correctCreatorPinyin, splitPinyin } from "./correct-creators-pinyin";

describe("splitPinyin", () => {
  it("should split simple pinyin correctly", () => {
    expect(splitPinyin("zhangsan")).toEqual(["Zhang San"]);
  });

  it.skip("should handle input with spaces", () => {
    expect(splitPinyin("zhang san")).toEqual(["Zhang San"]);
  });

  it("should return empty for invalid input", () => {
    expect(splitPinyin("xyz")).toEqual([]);
  });
});

describe("correctCreatorPinyin", () => {
  const creatorBase: _ZoteroTypes.Item.Creator = {
    fieldMode: 0,
    firstName: "",
    lastName: "",
    creatorTypeID: 1,
  };

  it("should correct firstName if valid pinyin", () => {
    const creator = {
      ...creatorBase,
      firstName: "sanfeng",
      lastName: "zhang",
    };
    const result = correctCreatorPinyin(creator);
    expect(result.firstName).toBe("San Feng");
  });

  it("should skip if fieldMode != 0", () => {
    const creator: _ZoteroTypes.Item.Creator = {
      ...creatorBase,
      fieldMode: 1,
      firstName: "san",
      lastName: "zhang",
    };
    const result = correctCreatorPinyin(creator);
    expect(result.firstName).toBe("san");
  });

  it("should skip if lastName is not valid pinyin", () => {
    const creator = {
      ...creatorBase,
      firstName: "san",
      lastName: "xxx",
    };
    const result = correctCreatorPinyin(creator);
    expect(result.firstName).toBe("san");
  });

  it("should skip if firstName contains space", () => {
    const creator = {
      ...creatorBase,
      firstName: "san li",
      lastName: "zhang",
    };
    const result = correctCreatorPinyin(creator);
    expect(result.firstName).toBe("san li");
  });

  it("should skip if firstName contains -", () => {
    const creator = {
      ...creatorBase,
      firstName: "san-li",
      lastName: "zhang",
    };
    const result = correctCreatorPinyin(creator);
    expect(result.firstName).toBe("san-li");
  });
});
