import csv from "csvtojson";

export interface Data {
  [key: string]: string;
}

export async function useData(key: "journalAbbr" | "conferencesAbbr" | "universityPlace" | "iso6393To6391"): Promise<Data>;
export async function useData(key: "json", path: string): Promise<Data>;
export async function useData(key: "csv", path: string, loaderOptions: Parameters<typeof csv>[0]): Promise<any[]>;
export async function useData(key: string, path: string): Promise<any>;
export async function useData(key: string, path?: string, loaderOptions?: any) {
  switch (key) {
    case "journalAbbr":
      path = `${rootURI}data/journal-abbr/journal-abbr.json`;
      break;
    case "universityPlace":
      path = `${rootURI}data/university-place.json`;
      break;
    case "csv":
    case "json":
    default:
      if (!path)
        throw new Error("path must provide when key is csv or json");
      if (!(await IOUtils.exists(path)))
        throw new Error(`The custom file ${path} not exist.`);
      break;
  }

  const data = await Zotero.File.getContentsAsync(path) as string;

  if (path.endsWith(".csv")) {
    return await csv({
      delimiter: "auto",
      trim: true,
      noheader: true,
      ...loaderOptions,
    }).fromString(data);
  }
  else if (path.endsWith(".json")) {
    if (typeof data !== "string" || data === "") {
      throw new SyntaxError("The custom json data file format error.");
    }
    return JSON.parse(data);
  }
}
