import * as fs from 'fs';
import journalAbbrISO4JabRef from "./jabref-abbr/journal-list-dots";
import journalAbbrISO4Ubc from "./library-ubc-ca/journalAbbrData"
import { normalizeKey } from '../../utils/str';


const dataList = [
    journalAbbrISO4Ubc,
    journalAbbrISO4JabRef
] as {
    [key: string]: string;
}[]

// 合并两个对象
// const mergedJson = { ...json1, ...json2 } as {
//     [key: string]: string;
//   };

// 创建一个新Set来处理去重
const uniqueKeys: Set<string> = new Set();

// 创建一个新对象来存储唯一的键值对
const uniqueJson = {} as { [key: string]: string };

// 遍历合并后的对象
for (const currentData of dataList) {
    for (const key in currentData) {
        // 将键转为小写并去除空格
        const normalizedKey = normalizeKey(key);

        // 如果新Set中没有相同键，就添加到新Set和新对象中
        if (!uniqueKeys.has(normalizedKey)) {
            uniqueKeys.add(normalizedKey);
            uniqueJson[key] = currentData[key];
        }
    }
}

export const resultJson = `export default ${JSON.stringify(uniqueJson, null, 2)}`;

fs.writeFileSync('journalAbbr.ts', resultJson, 'utf8');
