import { assert } from "chai";
import { config } from "../../package.json";

describe("startup", function () {
  it("should have plugin instance defined", function () {
    // @ts-expect-error no types
    assert.isObject(Zotero[config.addonInstance]);
    // assert.property(Zotero, config.addonRef);
  });
});
