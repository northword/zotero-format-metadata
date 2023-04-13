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
import sys

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
    out_file = 'journal-list-dots.ts'
else:
   out_file = sys.argv[1]
print(f"Writing : {out_file}")

journal_dict = {}

for in_file in import_order:
    count = 0
    f = open(in_file, "r")
    for line in f:
        if ";" in line and line[0] != "#":
            count += 1
            parts = line.partition(";")
            journal_dict[parts[0].strip().lower()] = parts[2].partition(";")[0].strip()
            # print(count, parts, parts[0].strip(), parts[1].strip(), parts[2].strip(), line.strip() )
    f.close()
    print(f"{in_file}: {count}")

print(f"Combined key count: {len(journal_dict)}")

f = open(out_file, "w")
f.write("export default ")
f.write(str(json.dumps(journal_dict, indent=4)))
# for key in sorted(journal_dict.keys()):
#     # print(key, "====",journal_dict[key])
#     f.write(journal_dict[key]+"\n")
#     # f.write(str(journal_dict))
f.close()
