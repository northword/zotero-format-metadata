// import { assert } from "chai";
import { config } from "../package.json";

describe("startup", () => {
  it("should have plugin instance defined", () => {
    // @ts-expect-error no types
    assert.isNotEmpty(Zotero[config.addonInstance]);
  });
});
