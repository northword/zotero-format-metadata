import { describe, expect, it } from "vitest";
import { capitalizePublicationTitle as capitalize } from "./correct-publication-title-case";

describe("capitalizePublicationTitle", () => {
  describe("should work", () => {
    it("should capitalize normal lowercase journal title", () => {
      expect(capitalize("nature communications")).toBe("Nature Communications");
    });

    it("should handle all-uppercase journal titles", () => {
      expect(capitalize("JOURNAL OF NEUROSCIENCE")).toBe("Journal of Neuroscience");
    });
  });

  describe("function words", () => {
    it("should lowercase function words except first one", () => {
      expect(capitalize("proceedings of the national academy of sciences"))
        .toBe("Proceedings of the National Academy of Sciences");
    });

    it("should capitalize function word if it's the first word", () => {
      expect(capitalize("the title of book")).toBe("The Title of Book");
    });
  });

  describe("special words", () => {
    it("should capitalize special words - buildins", () => {
      expect(capitalize("rsc advances")).toBe("RSC Advances");
      expect(capitalize("npj advances")).toBe("npj Advances");
    });

    it("should preserve special case words - iScience like", () => {
      expect(capitalize("iScience")).toBe("iScience");
    });

    it("should preserve special case words - full uppercase", () => {
      expect(capitalize("COVID-19 research")).toBe("COVID-19 Research");
    });
  });

  it("should handle short titles correctly", () => {
    expect(capitalize("cell")).toBe("Cell");
    expect(capitalize("science")).toBe("Science");
    expect(capitalize("nature")).toBe("Nature");
  });
});
