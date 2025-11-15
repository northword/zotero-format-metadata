type LogLevel = "debug" | "log" | "warn" | "error" | "group" | "groupEnd";

export interface Logger {
  debug: (...args: any[]) => void;
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  group: (...args: any[]) => void;
  groupEnd: (...args: any[]) => void;
}

export function createLogger(prefix?: string): Logger {
  const _log = (level: LogLevel, ...args: any[]) => {
    const base = [
      ["debug"].includes(level) ? "" : "[Linter]",
      prefix ? `[${prefix}]` : "",
    ].filter(Boolean).join(" ");

    const data = base ? [base, ...args] : args;

    const console = ztoolkit.getGlobal("window").console;

    switch (level) {
      case "debug":
        ztoolkit.log(...data);
        break;
      case "log":
      case "warn":
      case "error":{
        console[level](...data);
        Zotero.debug(data.join(" "));
        break;
      }
      case "group":
      case "groupEnd":
        console[level](...data);
        break;
    }
  };

  return {
    debug: (...args: any[]) => _log("debug", ...args),
    log: (...args: any[]) => _log("log", ...args),
    warn: (...args: any[]) => _log("warn", ...args),
    error: (...args: any[]) => _log("error", ...args),
    group: (...args: any[]) => _log("group", ...args),
    groupEnd: (...args: any[]) => _log("groupEnd", ...args),
  };
}

export const logger = createLogger();
