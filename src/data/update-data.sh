#!/usr/bin/env bash
set -e

## Update submodule
git submodule update --remote

## journal-abbr
python src/data/journal-abbr/generate-journal-list-dot.py
