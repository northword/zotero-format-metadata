import csv from "csvtojson";

export interface Data {
  [key: string]: string;
}

export class DataLoader {
  private static cache = new Map<string, any>();

  static async load(key: "journalAbbr" | "conferencesAbbr" | "universityPlace" | "iso6393To6391"): Promise<Data>;
  static async load(key: "json", path: string): Promise<Data>;
  static async load(key: "csv", path: string, loaderOptions?: Parameters<typeof csv>[0]): Promise<any[]>;
  static async load(key: "txt", path: string): Promise<string>;
  static async load(key: string, path?: string, loaderOptions?: any): Promise<any>;
  static async load(key: string, path?: string, options?: any): Promise<any> {
    const { type, path: resolvedPath } = this.resolvePath(key, path);
    const cacheKey = `${type}:${resolvedPath}`;

    if (this.cache.has(cacheKey)) {
      ztoolkit.log(`[data-loader] Cache hit for ${resolvedPath}`);
      return this.cache.get(cacheKey);
    }

    const data = await this.readFile(resolvedPath);
    ztoolkit.log(`[data-loader] Read ${resolvedPath} (type=${type})`);

    let result: any;
    switch (type) {
      case "csv":
        result = await this.parseCSV(data, options);
        break;
      case "json":
        result = this.parseJSON(data);
        break;
      case "txt":
      default:
        result = this.parseTXT(data);
        break;
    }

    this.cache.set(cacheKey, result);
    return result;
  }

  static clearCache() {
    this.cache.clear();
    ztoolkit.log("[data-loader] Data cache cleared");
  }

  static getCacheKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  private static resolvePath(key: string, path?: string): { type: string; path: string } {
    switch (key) {
      case "journalAbbr":
        return { type: "json", path: `${rootURI}data/journal-abbr/journal-abbr.json` };
      case "conferencesAbbr":
        return { type: "json", path: `${rootURI}data/conference-abbr.json` };
      case "universityPlace":
        return { type: "json", path: `${rootURI}data/university-list/university-place.json` };
      default:
        if (!path)
          throw new Error("path must be provided when key is csv or json");
        return { type: path.split(".").pop() || key, path };
    }
  }

  private static async readFile(path: string): Promise<string> {
    if (path.startsWith("jar:file://")) {
      return (await Zotero.HTTP.request("get", path)).response;
    }
    else {
      return (await Zotero.File.getContentsAsync(path)) as string;
    }
  }

  private static async parseCSV(data: string, options?: any): Promise<any[]> {
    return csv({
      delimiter: "auto",
      trim: true,
      noheader: true,
      ...options,
    }).fromString(data);
  }

  private static parseJSON(data: string): any {
    if (!data || typeof data !== "string") {
      throw new SyntaxError("Invalid JSON file content.");
    }
    return JSON.parse(data);
  }

  private static parseTXT(data: string): string {
    return data;
  }
}
