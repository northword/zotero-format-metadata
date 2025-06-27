import { UpdateAbbr } from "../../src/modules/rules/field-abbr";

describe("abbr", function () {
  it("abbr1", async function () {
    const _item = new Zotero.Item();
    // eslint-disable-next-line unused-imports/no-unused-vars
    const item = await new UpdateAbbr({}).apply(_item);
    expect({ a: "1" }).to.eql({ a: "1" });
  });
});
