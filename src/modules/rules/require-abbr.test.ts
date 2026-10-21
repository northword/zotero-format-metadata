import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AbbrevIso } from "../../lib/abbrev-iso";

const dataDir = join(import.meta.dirname, "../../../data/journal-abbr/issn-ltwa/");
const abbrevIso = new AbbrevIso(
  readFileSync(`${dataDir}ltwa_2024-modified.csv`, "utf8"),
  readFileSync(`${dataDir}shortwords.txt`, "utf8"),
);

describe("abbrevIso with the bundled LTWA data", () => {
  it("should abbreviate English journal titles per ISO 4", () => {
    expect(abbrevIso.makeAbbreviation("International Journal of Geographical Information Science"))
      .toBe("Int. J. Geogr. Inf. Sci.");
    expect(abbrevIso.makeAbbreviation("Journal of the American Chemical Society"))
      .toBe("J. Am. Chem. Soc.");
    expect(abbrevIso.makeAbbreviation("Physical Review Letters"))
      .toBe("Phys. Rev. Lett.");
  });

  it("should keep non-abbreviatable single word titles", () => {
    expect(abbrevIso.makeAbbreviation("Nature")).toBe("Nature");
  });

  it("should handle titles containing diacritics", () => {
    expect(abbrevIso.makeAbbreviation("Zeitschrift für deutsches Altertum und deutsche Literatur"))
      .toBe("Z. dtsch. Altert. dtsch. Lit.");
  });
});
