import { capitalizeFirstLetter } from "../../utils/str";
import { defineRule } from "./rule-base";

export const CorrectCreatorsPinyin = defineRule({
  id: "correct-creators-pinyin",
  scope: "field",
  targetItemField: "creators",

  apply({ item }) {
    const creators = item.getCreators();
    for (const creator of creators) {
      if (creator.fieldMode !== 0)
        continue;
      // TODO: 添加姓的拼音
      if (splitPinyin(creator.lastName).length === 0)
        continue;
      if (creator.firstName.match(/[ -]/))
        continue;
      creator.firstName = splitPinyin(creator.firstName)[0] || creator.firstName;
    }
    item.setCreators(creators);
  },
});

// prettier-ignore
const pinyinArray = [
  "ba pa ma fa da ta na la ga ka ha za ca sa zha cha sha a",
  "bo po mo fo o",
  "me de te ne le ge ke he ze ce se zhe che she re e",
  "bai pai mai dai tai nai lai gai kai hai zai cai sai zhai chai shai ai",
  "bei pei mei fei dei tei nei lei gei kei hei zei zhei shei ei",
  "bao pao mao dao tao nao lao gao kao hao zao cao sao zhao chao shao rao ao",
  "pou mou fou dou tou nou lou gou kou hou zou cou sou zhou chou shou rou ou",
  "ban pan man fan dan tan nan lan gan kan han zan can san zhan chan shan ran an",
  "bang pang mang fang dang tang nang lang gang kang hang zang cang sang zhang chang shang rang ang",
  "ben pen men fen den nen gen ken hen zen cen sen zhen chen shen ren en",
  "beng peng meng feng deng teng neng leng geng keng heng zeng ceng seng zheng cheng sheng reng eng",
  "dong tong nong long gong kong hong zong cong song zhong chong rong",
  "bu pu mu fu du tu nu lu gu ku hu zu cu su zhu chu shu ru wu",
  "gua kua hua zhua chua shua rua wa",
  "duo tuo nuo luo guo kuo huo zuo cuo suo zhuo chuo shuo ruo wo",
  "guai kuai huai zhuai chuai shuai wai",
  "dui tui gui kui hui zui cui sui zhui chui shui rui wei",
  "duan tuan nuan luan guan kuan huan zuan cuan suan zhuan chuan shuan ruan wan",
  "guang kuang huang zhuang chuang shuang wang",
  "dun tun nun lun gun kun hun zun cun sun zhun chun shun run wen",
  "weng",
  "bi pi mi di ti ni li zi ci si zhi chi shi ri ji qi xi yi",
  "dia lia jia qia xia ya",
  "bie pie mie die tie nie lie jie qie xie ye",
  "biao piao miao diao tiao niao liao jiao qiao xiao yao",
  "miu diu niu liu jiu qiu xiu you",
  "bian pian mian dian tian nian lian jian qian xian yan",
  "niang liang jiang qiang xiang yang",
  "bin pin min nin lin jin qin xin yin",
  "bing ping ming ding ting ning ling jing qing xing ying",
  "jiong qiong xiong yong",
  "nü lü ju qu xu yu",
  "nüe lüe jue que xue yue",
  "juan quan xuan yuan",
  "jun qun xun yun",
].flatMap(item => item.split(" ").filter(Boolean));

const _lastNamePinyin: string[] = [];

function splitPinyin(inputPinyin: string): string[] {
  const result: string[] = [];
  backtrack(inputPinyin, 0, [], result);
  return result.sort((a, b) => a.length - b.length);
}

function isValidPinyinSegment(segment: string): boolean {
  if (pinyinArray.includes(segment)) {
    return true;
  }
  return false;
}

function backtrack(pinyin: string, start: number, currentSegments: string[], result: string[]) {
  if (start === pinyin.length) {
    result.push(currentSegments.join(" "));
    return;
  }

  // 如果当前字符是空格，优先以空格分词
  if (pinyin[start] === " ") {
    currentSegments.push("");
    backtrack(pinyin, start + 1, currentSegments, result);
    currentSegments.pop();
  }

  for (let end = start + 1; end <= pinyin.length; end++) {
    const segment = pinyin.substring(start, end);
    // console.log(segment.toLowerCase(), isValidPinyinSegment(segment.toLowerCase()));
    if (isValidPinyinSegment(segment.toLowerCase())) {
      currentSegments.push(capitalizeFirstLetter(segment));
      backtrack(pinyin, end, currentSegments, result);
      currentSegments.pop();
    }
  }
}

// // 示例
// const pinyinString = "Li Feifei Aiyuan Jianbei";
// const result = splitPinyin(pinyinString);
// console.log(result);
