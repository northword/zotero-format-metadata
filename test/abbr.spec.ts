import { UpdateAbbr } from "../src/modules/rules/field-abbr";

describe("abbr", () => {
  it("should have plugin instance defined", async () => {
    const _item = new Zotero.Item();
    const item = await new UpdateAbbr({}).apply(_item);
    console.log(item);
    // expect(1 + 1).to.equal(3);
  });
});
