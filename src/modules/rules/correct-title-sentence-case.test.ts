import { describe, expect, it } from "vitest";
import { toSentenceCase } from "./correct-title-sentence-case";

/**
 * Test item / 测试项目信息
 * @property name - 条目名称
 * @property original - The input original text / 输入的原始文本
 * @property expected - The expected text       / 期望得到的文本
 */
interface testItem {
  name: string;
  original: string;
  expected: string;
}

const testItems: testItem[] = [
  {
    name: "常规转为句首大写",
    original: `Heterogeneous Catalytic Decomposition of Nitrous Oxides`,
    expected: `Heterogeneous catalytic decomposition of nitrous oxides`,
  },
  {
    name: "虚词应始终保持小写",
    original: `Heterogeneous Catalytic Decomposition Of Nitrous Oxides`,
    expected: `Heterogeneous catalytic decomposition of nitrous oxides`,
  },
  {
    name: "带有上下标的部分保持大小写",
    original: `Catalytic Decomposition of N<sub>2</sub>O on Ordered Crystalline Metal Oxides`,
    expected: `Catalytic decomposition of N<sub>2</sub>O on ordered crystalline metal oxides`,
  },
  {
    name: "上下标前有连字符的也应保持大小写",
    original: `Construction of oxygen vacancies in δ-MnO<sub>2</sub> for promoting low-temperature toluene oxidation`,
    expected: `Construction of oxygen vacancies in δ-MnO<sub>2</sub> for promoting low-temperature toluene oxidation`,
  },
  {
    name: "单词中非首字母存在大写的保持原有大写",
    original: `Accelerating VASP Electronic Structure Calculations Using Graphic Processing Units`,
    expected: `Accelerating VASP electronic structure calculations using graphic processing units`,
  },
  {
    name: "化学元素后跟逗号",
    original: `Taming the redox property of A<sub>0.5</sub>Co<sub>2.5</sub>O<sub>4</sub> (a = Mg, Ca, Sr, Ba) toward high catalytic activity for N<sub>2</sub>O decomposition`,
    expected: `Taming the redox property of A<sub>0.5</sub>Co<sub>2.5</sub>O<sub>4</sub> (a = Mg, Ca, Sr, Ba) toward high catalytic activity for N<sub>2</sub>O decomposition`,
  },
  {
    name: "化学元素加括号",
    original: `(N<sub>2</sub>O)`,
    expected: `(N<sub>2</sub>O)`,
  },
  {
    name: "月份应大写",
    original: `Attribution of the August 2022 Extreme Heatwave in Southern China: Role of Dynamical and Thermodynamical Processes`,
    expected: `Attribution of the August 2022 extreme heatwave in southern China: role of dynamical and thermodynamical processes`,
  },
  {
    name: "月份应大写：五月例外",
    original: `We'll Meet in May.`,
    expected: `We'll meet in May.`,
  },
  {
    name: "国名应大写",
    original: `This is in Southern China`,
    expected: `This is in southern China`,
  },
  {
    // https://github.com/northword/zotero-format-metadata/issues/227
    name: "国名应大写",
    original: `A shrubby resprouting pine with serotinous cones endemic to southwest China`,
    expected: `A shrubby resprouting pine with serotinous cones endemic to southwest China`,
  },
  {
    name: "城市名",
    original: `The Chengdu is A City of China`,
    expected: `The Chengdu is a city of China`,
  },
];

describe("toSentenceCase", () => {
  testItems.forEach((testItem) => {
    it(testItem.name, () => {
      expect(toSentenceCase(testItem.original)).to.equal(testItem.expected);
    });
  });
});
