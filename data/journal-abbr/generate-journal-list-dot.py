#!/usr/bin/env python3

"""
Script to combine multiple journal abbreviation lists and produce an
alphabetically sorted JSON file, retaining only the first occurrence of each journal name.
"""

import csv
import json
from pathlib import Path
import re

import_order = [
    "override.csv",
    # Keep IEEE before ubc, because IEEE has its own style.
    "abbrv.jabref.org/journals/journal_abbreviations_ieee.csv",
    "abbrv.jabref.org/journals/journal_abbreviations_acs.csv",
    # Keep ubc before other jabref's, because ubc's data is more accurate.
    "abbrv.jabref.org/journals/journal_abbreviations_ubc.csv",
    "abbrv.jabref.org/journals/journal_abbreviations_ams.csv",
    "abbrv.jabref.org/journals/journal_abbreviations_general.csv",
    "abbrv.jabref.org/journals/journal_abbreviations_geology_physics.csv",
    "abbrv.jabref.org/journals/journal_abbreviations_lifescience.csv",
    "abbrv.jabref.org/journals/journal_abbreviations_mathematics.csv",
    "abbrv.jabref.org/journals/journal_abbreviations_mechanical.csv",
    "abbrv.jabref.org/journals/journal_abbreviations_meteorology.csv",
    "abbrv.jabref.org/journals/journal_abbreviations_sociology.csv",
    "abbrv.jabref.org/journals/journal_abbreviations_webofscience-dots.csv",
]


def load_data(file_paths):
    """Load and combine data from CSV files."""
    journal_dict = {}
    normalized_keys = set()
    for path in file_paths:
        with open(path, mode="r", encoding="utf-8") as file:
            reader = csv.reader(decomment(file))
            for row in reader:
                name = row[0].strip()
                abbr = row[1].strip()

                # Discard entries where name or abbr is missing
                if not (name and abbr):
                    continue
                # Discard entries that are too long or too short
                if len(name) >= 80 or len(name) <= 3:
                    continue
                # Discard names that start with non-alphanumeric characters
                if not name[0].isalnum():
                    continue
                # Discard names that consist only of numbers
                if name.replace(" ", "").isnumeric():
                    continue
                # Discard names containing \
                if name.count("\\"):
                    continue
                # Discard entries where the first letters of name and abbr do not match
                if abbr[0] != name.replace("The", "").replace("A ", "")[0]:
                    continue
                # Only keep the first occurrence
                if name in journal_dict:
                    continue
                # Generate normalizedKey, keeping only the first match
                normalized_key = normalize_name(name)
                if normalized_key in normalized_keys:
                    continue

                journal_dict[name] = abbr
                normalized_keys.add(normalized_key)  # Add to the set of used keys
    return journal_dict


def decomment(csvfile):
    for row in csvfile:
        raw = row.split("#")[0].strip()
        if raw:
            yield row


def normalize_name(name):
    """
    Normalize the journal name by removing specified characters using regex.
    See src/utils/str.ts -> normalizeKey()
    """
    return re.sub(r"\b(the|and)\b|[&\-:, ()]", "", name, flags=re.IGNORECASE).lower()


def save_to_json(data, output_file):
    """Save the data to a JSON file."""
    with open(output_file, mode="w", encoding="utf-8") as json_file:
        json.dump(data, json_file, indent=2, ensure_ascii=False)


def main():
    base_path = Path(__file__).parent
    output_filename = base_path / "journal-abbr.json"
    import_paths = [base_path / file for file in import_order]

    journal_data = load_data(import_paths)
    sorted_journal_data = dict(sorted(journal_data.items()))  # Sort alphabetically
    save_to_json(sorted_journal_data, output_filename)


if __name__ == "__main__":
    main()
