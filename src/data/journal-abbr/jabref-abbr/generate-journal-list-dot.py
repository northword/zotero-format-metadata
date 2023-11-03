#!/usr/bin/env python3

"""
此脚本用来从 `abbrv.jabref.org` 生成本项目所用之期刊缩写数据集, 
此脚本修改自原项目 `combine_journal_lists_dots.py`.

Python script for combining several journal abbreviation lists
and producing an alphabetically sorted list. If the same journal
names are repeated, only the version found last is retained.

This version of the script specifically combines the lists following the ISO4
standard WITH dots after abbreviated words.

Usage: combine_journal_lists.py
Input: see list of files below
Output: writes file 'journal-list-dots.ts'
"""

import json
from pathlib import Path
import sys

base_path = Path(__file__).parent

import_order = [
    'abbrv.jabref.org/journals/journal_abbreviations_acs.csv',
    'abbrv.jabref.org/journals/journal_abbreviations_ams.csv',
    'abbrv.jabref.org/journals/journal_abbreviations_general.csv',
    'abbrv.jabref.org/journals/journal_abbreviations_geology_physics.csv',
    'abbrv.jabref.org/journals/journal_abbreviations_ieee.csv',
    'abbrv.jabref.org/journals/journal_abbreviations_lifescience.csv',
    'abbrv.jabref.org/journals/journal_abbreviations_mathematics.csv',
    'abbrv.jabref.org/journals/journal_abbreviations_mechanical.csv',
    'abbrv.jabref.org/journals/journal_abbreviations_meteorology.csv',
    'abbrv.jabref.org/journals/journal_abbreviations_sociology.csv',
    'abbrv.jabref.org/journals/journal_abbreviations_webofscience-dots.csv'
]

if len(sys.argv) == 1:
    out_file = base_path.joinpath('journal-list-dots.ts')
else:
    out_file = base_path.joinpath(sys.argv[1])
print(f"Writing : {out_file}")

journal_dict = {}

for in_file in import_order:
    count = 0
    f = open(base_path.joinpath(in_file), "r")
    for line in f:
        # 排除不存在缩写的、注释和不以字母开头的行
        if ";" in line and line[0] != "#" and line[0][0].isalpha():
            count += 1
            parts = line.partition(";")
            # key = parts[0].strip().lower().replace("the ", "")
            key = parts[0].strip()
            current_abbr = parts[2].partition(";")[0].strip()
            # 排除过长的和过短的期刊
            if (len(key) <= 80 or len(key) >= 3):
                # 重复期刊检查，优先使用先匹配到的
                if (key not in journal_dict):
                    journal_dict[key] = current_abbr
                else:
                    # pass
                    journal_dict[key] = current_abbr

                    # if len(journal_dict[key]) == len(current_abbr):
                    #     pass
                    # else:
                    #     pass
    f.close()
    print(f"{in_file}: {count}")

print(f"Combined key count: {len(journal_dict)}")

f = open(out_file, "w")
f.write("export default ")
f.write(str(json.dumps(dict(sorted(journal_dict.items())), indent=4)))
f.close()
