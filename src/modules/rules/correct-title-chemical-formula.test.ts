import { describe, expect, it } from "vitest";
import sentenceCase from "../../../test/data/sentenceCase.json";
import { containsValidElementsOnly, formatChemicalFormula, formatPart } from "./correct-title-chemical-formula";

describe("containsValidElementsOnly", () => {
  it("should work", () => {
    const map = {
      "Na-": true,
      "Co3O4": true,
      "H2O": true,
      "HAP": false,
      "HTML5": false,
      "3D": false,
      "goal-": false,

      // expected error
      "P3": true, // because 'P' is valid element, although 'P3' is not valid chemical formula
      "C4": true, // because 'C' is valid element, although 'C4' is not valid chemical formula
    };
    Object.entries(map).forEach(([input, expected]) => {
      expect(containsValidElementsOnly(input)).toBe(expected);
    });
  });
});

describe("formatPart", () => {
  // skip
  it("should skip if do not have numbers", () => {
    expect(formatPart("NaCl")).toBe("NaCl");
  });

  it("should skip if letters not in chemical formula", () => {
    expect(formatPart("SAIHOP2")).toBe("SAIHOP2");
  });

  // supscript
  it("should format end with +/-", () => {
    expect(formatPart("Na-")).toBe("Na<sup>-</sup>");
  });

  it("should format supscript with +/-", () => {
    expect(formatPart("Co2+")).toBe("Co<sup>2+</sup>");
    expect(formatPart("O2-")).toBe("O<sup>2-</sup>");
  });

  // subscript
  it("should format chemical formula", () => {
    expect(formatPart("NO2")).toBe("NO<sub>2</sub>");
  });

  it("should format chemical formula, multi-characters", () => {
    expect(formatPart("Co3O4")).toBe("Co<sub>3</sub>O<sub>4</sub>");
    expect(formatPart("Mn0.1Co0.9Co2O4")).toBe("Mn<sub>0.1</sub>Co<sub>0.9</sub>Co<sub>2</sub>O<sub>4</sub>");
  });

  it("should format cnki style sub/sup", () => {
    expect(formatPart("Co_3O_4")).toBe("Co<sub>3</sub>O<sub>4</sub>");
  });

  it("should format stoichiometric number after ()", () => {
    expect(formatPart("Fe(NO3)3")).toBe("Fe(NO<sub>3</sub>)<sub>3</sub>");
  });
});

const data = {
  "A study of NO conversion into NO2 and N2O over Co3O4 catalyst":
    "A study of NO conversion into NO<sub>2</sub> and N<sub>2</sub>O over Co<sub>3</sub>O<sub>4</sub> catalyst",
  "Co-existence of atomically dispersed Ru and Ce3+ sites is responsible for excellent low temperature N2O reduction activity of Ru/CeO2":
    "Co-existence of atomically dispersed Ru and Ce<sup>3+</sup> sites is responsible for excellent low temperature N<sub>2</sub>O reduction activity of Ru/CeO<sub>2</sub>",

  // CNKI: Co_3O_4
  "A study of NO conversion into NO_2 and N_2O over Co_3O_4 catalyst":
    "A study of NO conversion into NO<sub>2</sub> and N<sub>2</sub>O over Co<sub>3</sub>O<sub>4</sub> catalyst",

  // should skip if already has sub/sup
  "A study of NO conversion into NO<sub>2</sub> and N<sub>2</sub>O over Co<sub>3</sub>O<sub>4</sub> catalyst": "A study of NO conversion into NO<sub>2</sub> and N<sub>2</sub>O over Co<sub>3</sub>O<sub>4</sub> catalyst",

};

describe("transformTitle", () => {
  it("should not break sentence case", () => {
    Object
      .values(sentenceCase)
      .filter(i => !(i.includes("SHOP2")))
      .filter(i => ![
        "CI2 – a logic for plural representation",
      ].includes(i))
      .forEach((expected) => {
        expect(formatChemicalFormula(expected)).toBe(expected);
      });
  });

  Object.entries(data).forEach(([title, expected], index) => {
    it(`should transform ${index}`, () => {
      expect(formatChemicalFormula(title)).toBe(expected);
    });
  });
});
