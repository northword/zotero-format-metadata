import json
import os


def parse_tsv_file(file_path):
    journals = {}
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()
        for line in lines:
            fields = line.strip().split('\t')
            if len(fields) == 3:
                full_name, iso_with_dot, iso_without_dot = fields
                journals[full_name] = iso_with_dot
    return journals


def merge_dictionaries(dicts):
    merged_dict = {}
    for d in dicts:
        merged_dict.update(d)
    return merged_dict


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    term_lists_dir = os.path.join(script_dir, 'terms-lists')

    txt_files = [file for file in os.listdir(
        term_lists_dir) if file.endswith('.txt')]
    all_journals = []

    for txt_file in txt_files:
        file_path = os.path.join(term_lists_dir, txt_file)
        journals = parse_tsv_file(file_path)
        all_journals.append(journals)

    merged_journals = merge_dictionaries(all_journals)

    sorted_journals = dict(sorted(merged_journals.items()))

    with open('journals.json', 'w', encoding='utf-8') as json_file:
        json.dump(sorted_journals, json_file, ensure_ascii=False, indent=4)


if __name__ == '__main__':
    main()
