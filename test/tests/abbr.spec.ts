import { UpdateAbbr } from "../../src/modules/rules/field-abbr";

describe("abbr", () => {
  it("abbr1", async () => {
    const _item = new Zotero.Item();
    // eslint-disable-next-line unused-imports/no-unused-vars
    const item = await new UpdateAbbr({}).apply(_item);
    expect({ a: "1" }).to.equal({ a: "1" });
  });
});
