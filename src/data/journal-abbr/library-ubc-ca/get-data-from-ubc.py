import json
import requests
from bs4 import BeautifulSoup


def fetch_data(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.text
        json_start = data.find("(") + 1
        json_end = data.rfind(")")
        json_data = data[json_start:json_end]
        json_obj = json.loads(json_data)
        return json_obj["html"]

    except requests.exceptions.RequestException as req_err:
        print("网络请求异常:", req_err)
        return None

    except json.JSONDecodeError as json_err:
        print("JSON解析异常:", json_err)
        return None

    except Exception as e:
        print("发生未知异常:", e)
        return None


def parse_html(html_content):
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        table_rows = soup.find_all('tr')
        journal_dict = {}

        for row in table_rows:
            columns = row.find_all('td')
            if len(columns) == 2:
                journal_abbreviation = columns[0].get_text().strip()
                journal_full_name = columns[1].get_text().strip()
                if (journal_abbreviation and journal_full_name) and journal_full_name not in journal_dict:
                    journal_dict[journal_full_name] = journal_abbreviation

        sorted_data = {k: v for k, v in sorted(journal_dict.items())}  # 对键进行排序
        return sorted_data

    except Exception as e:
        print("解析HTML发生异常:", e)
        return None


def save_file(data, filename):
    try:
        json_content = json.dumps(data, indent=4, ensure_ascii=False)
        ts_content = f'export default {json_content};'
        with open(filename, 'w', encoding='utf-8') as ts_file:
            ts_file.write(ts_content)
        print(f"期刊缩写数据已保存为 '{filename}'")

    except Exception as e:
        print("保存期刊缩写文件发生异常:", e)


def main():
    url = "https://journal-abbreviations.library.ubc.ca/dump.php"
    html_content = fetch_data(url)

    if html_content is not None:
        parsed_data = parse_html(html_content)
        if parsed_data is not None:
            save_file(parsed_data, 'journalAbbrData.ts')


if __name__ == "__main__":
    main()
