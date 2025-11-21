import type { FluentMessageId } from "../../typings/i10n";

const localeFilesForJS = [
  "addon.ftl",
  "main-window.ftl",
  "rules.ftl",
];

const localeFilesForMainWindow = [
  "main-window.ftl",
  "rules.ftl",
];

function getLocaleFileFullNames(files: string[]) {
  return files.map(file => `${addon.data.config.addonRef}-${file}`);
}

export function registerMainWindowLocale(win: Window) {
  getLocaleFileFullNames(localeFilesForMainWindow)
    .forEach(file => (win as any).MozXULElement.insertFTLIfNeeded(file));
}

export function unregisterMainWindowLocale(win: Window) {
  getLocaleFileFullNames(localeFilesForMainWindow)
    .forEach(file => win.document
      .querySelector(`[href="${file}"]`)
      ?.remove());
}

/**
 * Initialize locale data
 */
export function initLocale() {
  const l10n = new Localization(
    getLocaleFileFullNames(localeFilesForJS),
    true,
  );
  addon.data.locale = {
    current: l10n,
  };
}

interface GetStringOptions {
  branch?: string;
  args?: Record<string, unknown>;
}

/**
 * Get locale string, see https://firefox-source-docs.mozilla.org/l10n/fluent/tutorial.html#fluent-translation-list-ftl
 * @example
 * ```ftl
 * # addon.ftl
 * addon-static-example = This is default branch!
 *     .branch-example = This is a branch under addon-static-example!
 * addon-dynamic-example =
    { $count ->
        [one] I have { $count } apple
 *[other] I have { $count } apples
    }
 * ```
 * ```js
 * getString("addon-static-example"); // This is default branch!
 * getString("addon-static-example", { branch: "branch-example" }); // This is a branch under addon-static-example!
 * getString("addon-dynamic-example", { args: { count: 1 } }); // I have 1 apple
 * getString("addon-dynamic-example", { args: { count: 2 } }); // I have 2 apples
 * ```
 */
export function getString(id: FluentMessageId): string;
export function getString(id: FluentMessageId, branch: string): string;
export function getString(id: FluentMessageId, options: GetStringOptions): string;
export function getString(...inputs: any[]): string {
  const { id, options } = normalizeOptions(inputs);
  return _getString(id, options);
}

function normalizeOptions(inputs: any[]): { id: FluentMessageId; options: GetStringOptions } {
  if (inputs.length === 1) {
    return { id: inputs[0], options: {} };
  }

  if (inputs.length === 2) {
    const [id, second] = inputs;
    if (typeof second === "string") {
      return { id, options: { branch: second } };
    }
    return { id, options: second ?? {} };
  }

  throw new Error("Invalid arguments");
}

interface PatternAttribute {
  name: string;
  value: string;
}

interface Pattern {
  value?: string | null;
  attributes?: PatternAttribute[] | null;
}

function _getString(id: FluentMessageId, options: GetStringOptions): string {
  const localeID = getLocaleID(id);
  if (!localeID)
    return id;

  const { branch, args } = options;

  const msgs = addon.data.locale?.current.formatMessagesSync([{ id: localeID, args }]);
  const pattern = msgs?.[0] as Pattern | undefined;
  if (!pattern)
    return localeID;

  if (branch) {
    const attr = pattern.attributes?.find(a => a.name === branch);
    return attr?.value ?? localeID;
  }

  return pattern.value ?? localeID;
}

export function getLocaleID(id?: FluentMessageId): string | undefined {
  return id ? `${addon.data.config.addonRef}-${id}` : undefined;
}
