// import { assert } from "chai";
import { config } from "../../package.json";

describe("startup", () => {
  it("should have plugin instance defined", () => {
    // @ts-expect-error no types
    assert.isObject(Zotero[config.addonInstance]);
    // assert.property(Zotero, config.addonRef);
  });
});
