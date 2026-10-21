import { config } from "../../package.json";
import { CorrectDateFormat, normalizeDateSeparators } from "../../src/modules/rules/correct-date-format";

describe("correct-date-format", function () {
  let item: Zotero.Item;
  let reports: { level?: string; message: string }[];

  before(function () {
    // `getString()` used by the rule resolves locale via the `addon` global,
    // which only exists inside the plugin sandbox.
    (globalThis as any).addon = (Zotero as any)[config.addonInstance];
  });

  beforeEach(function () {
    item = new Zotero.Item("book");
    reports = [];
  });

  async function applyRule(date: string) {
    item.setField("date", date);
    await CorrectDateFormat.apply({
      item,
      options: {},
      debug: () => {},
      report: info => reports.push(info),
    });
    return item.getField("date");
  }

  describe("normalizeDateSeparators", function () {
    it("should normalize whitespace separators", function () {
      expect(normalizeDateSeparators("2026 01 01")).to.equal("2026-01-01");
      expect(normalizeDateSeparators("2026 1 1")).to.equal("2026-1-1");
      expect(normalizeDateSeparators("2026 / 01 / 01")).to.equal("2026-01-01");
    });

    it("should not touch non numeric dates", function () {
      expect(normalizeDateSeparators("January 2026")).to.equal("January 2026");
      expect(normalizeDateSeparators("2026 01 01 (Spring)")).to.equal("2026 01 01 (Spring)");
    });
  });

  describe("apply", function () {
    it("should convert recognized date formats to ISO", async function () {
      const cases: [string, string][] = [
        ["2026 01 01", "2026-01-01"],
        ["2026 1 1", "2026-01-01"],
        ["2026 01", "2026-01"],
        ["2026", "2026"],
        [" 2026 ", "2026"],
        ["2026-01", "2026-01"],
        ["2026/01/01", "2026-01-01"],
        ["2026.01.01", "2026-01-01"],
        ["2026-1-1", "2026-01-01"],
        ["January 2026", "2026-01"],
      ];

      for (const [input, expected] of cases) {
        reports = [];
        expect(await applyRule(input)).to.equal(expected, input);
        expect(reports).to.have.lengthOf(0, input);
      }
    });

    it("should leave unparseable dates untouched", async function () {
      for (const date of ["forthcoming", "n.d.", ""]) {
        reports = [];
        expect(await applyRule(date)).to.equal(date);
        expect(reports).to.have.lengthOf(0);
      }
    });

    it("should leave ambiguous day-first dates untouched", async function () {
      const date = "01 02 2026";
      expect(await applyRule(date)).to.equal(date);
      expect(reports).to.have.lengthOf(1);
      expect(reports[0].level).to.equal("warning");
    });

    it("should leave dates with a two-digit leading part untouched", async function () {
      const date = "26 01 01";
      expect(await applyRule(date)).to.equal(date);
      expect(reports).to.have.lengthOf(0);
    });

    it("should leave invalid dates untouched", async function () {
      for (const date of ["2026 00 01", "2026 13 01", "2026 02 30"]) {
        reports = [];
        expect(await applyRule(date)).to.equal(date);
        expect(reports).to.have.lengthOf(1);
        expect(reports[0].level).to.equal("warning");
      }
    });

    it("should convert a valid leap day", async function () {
      expect(await applyRule("2024 02 29")).to.equal("2024-02-29");
      expect(reports).to.have.lengthOf(0);
    });

    it("should not truncate the date when Zotero cannot parse it fully", async function () {
      const date = "2026 01 01 (Spring)";
      expect(await applyRule(date)).to.equal(date);
      expect(reports).to.have.lengthOf(1);
      expect(reports[0].level).to.equal("warning");
    });
  });
});
