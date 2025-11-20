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
export function getString(localString: FluentMessageId): string;
export function getString(localString: FluentMessageId, branch: string): string;
export function getString(
  localString: FluentMessageId,
  options: { branch?: string | undefined; args?: Record<string, unknown> },
): string;
export function getString(...inputs: any[]) {
  if (inputs.length === 1) {
    return _getString(inputs[0]);
  }
  else if (inputs.length === 2) {
    if (typeof inputs[1] === "string") {
      return _getString(inputs[0], { branch: inputs[1] });
    }
    else {
      return _getString(inputs[0], inputs[1]);
    }
  }
  else {
    throw new Error("Invalid arguments");
  }
}

interface Pattern {
  value: string;
  attributes: Array<{
    name: string;
    value: string;
  }> | null;
}

function _getString(
  localString: FluentMessageId,
  options: { branch?: string | undefined; args?: Record<string, unknown> } = {},
): string {
  const localStringWithPrefix = `${addon.data.config.addonRef}-${localString}`;
  const { branch, args } = options;
  const pattern = addon.data.locale?.current.formatMessagesSync([{ id: localStringWithPrefix, args }])[0] as Pattern;
  if (!pattern) {
    return localStringWithPrefix;
  }
  if (branch && pattern.attributes) {
    return pattern.attributes.find(attr => attr.name === branch)?.value || localStringWithPrefix;
  }
  else {
    return pattern.value || localStringWithPrefix;
  }
}

export function getLocaleID(id?: FluentMessageId): string | undefined {
  if (!id)
    return undefined;
  return `${addon.data.config.addonRef}-${id}`;
}
