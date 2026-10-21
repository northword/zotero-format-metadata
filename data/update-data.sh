#!/usr/bin/env bash
set -e

## Update submodule
git submodule update --remote --init

## journal-abbr
python data/journal-abbr/generate-journal-list-dot.py

## abbrevIso data (LTWA-based ISO 4 abbreviation rules)
# The upstream file name contains the LTWA release year, update the URL if
# abbrevIso switches to a newer LTWA release.
ABBREVISO_RAW="https://raw.githubusercontent.com/marcinwrochna/abbrevIso/master"
curl -fsSL "$ABBREVISO_RAW/LTWA_2024-modified.csv" -o data/journal-abbr/issn-ltwa/ltwa_2024-modified.csv
curl -fsSL "$ABBREVISO_RAW/shortwords.txt" -o data/journal-abbr/issn-ltwa/shortwords.txt
