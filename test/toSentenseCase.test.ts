import { toSentenceCase } from "../src/modules/untils/str";

interface testItem {
    name: string;
    original: string;
    expected: string;
}

const testItems: testItem[] = [
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
];

testItems.forEach((testItem, index) => {
    test(testItem.name, () => {
        expect(toSentenceCase(testItem.original)).toBe(testItem.expected);
    });
});
