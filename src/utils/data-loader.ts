import csv from "csvtojson";

export interface Data {
  [key: string]: string;
}

export async function useData(key: "journalAbbr" | "conferencesAbbr" | "universityPlace" | "iso6393To6391"): Promise<Data>;
export async function useData(key: "json", path: string): Promise<Data>;
export async function useData(key: "csv", path: string, loaderOptions: Parameters<typeof csv>[0]): Promise<any[]>;
export async function useData(key: "txt", path: string): Promise<string>;
export async function useData(key: string, path: string): Promise<any>;
export async function useData(key: string, path?: string, loaderOptions?: any) {
  switch (key) {
    case "journalAbbr":
      path = `${rootURI}data/journal-abbr/journal-abbr.json`;
      break;
    case "conferencesAbbr":
      path = `${rootURI}data/conference-abbr.json`;
      break;
    case "universityPlace":
      path = `${rootURI}data/university-list/university-place.json`;
      break;
    case "csv":
    case "json":
    case "txt":
    default:
      if (!path)
        throw new Error("path must provide when key is csv or json");
      break;
  }

  let data: string;
  if (path.startsWith("jar:file://")) {
    data = (await Zotero.HTTP.request("get", path)).response;
  }
  else {
    data = await Zotero.File.getContentsAsync(path) as string;
  }
  ztoolkit.log(`${path} data: ${data}`);

  if (key === "csv") {
    return (await csv({
      delimiter: "auto",
      trim: true,
      noheader: true,
      ...loaderOptions,
    }).fromString(data));
  }
  else if (key === "json") {
    if (typeof data !== "string" || data === "") {
      throw new SyntaxError("The custom json data file format error.");
    }
    return JSON.parse(data);
  }
  else if (key === "txt") {
    return data;
  }
  else {
    return data;
  }
}
