type LogLevel = "debug" | "log" | "warn" | "error";

class Logger {
  constructor(private prefix?: string) {}

  private _log(level: LogLevel, ...args: any[]) {
    const base = [
      ["debug", "log"].includes(level) ? "" : "[Linter]",
      this.prefix ? `[${this.prefix}]` : "",
    ].filter(Boolean).join(" ");

    const data = base ? [base, ...args] : args;

    switch (level) {
      case "debug":
      case "log":
        ztoolkit.log(...data);
        break;
      case "warn":
      case "error":{
        const console = ztoolkit.getGlobal("window").console;
        console[level](...data);
        Zotero.debug(data.join(" "));
        break;
      }
    }
  }

  debug(...args: any[]) { __env__ === "development" && this._log("debug", ...args); }
  log(...args: any[]) { this._log("log", ...args); }
  warn(...args: any[]) { this._log("warn", ...args); }
  error(...args: any[]) { this._log("error", ...args); }

  hint(text: string, type = "default", progress = 100) {
    return new ztoolkit.ProgressWindow(addon.data.config.addonName, {
      closeOnClick: true,
    })
      .createLine({
        text,
        type,
        progress,
      })
      .show();
  }
}

export function createLogger(tag?: string): Logger {
  return new Logger(tag);
}

export const logger = createLogger();
