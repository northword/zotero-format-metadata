export function callingLoggerForMethod(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: never) {
    try {
      ztoolkit.log(`Calling ${target.name}.${String(propertyKey)} at ${new Date().toLocaleString()}`);
      return original.apply(this, args);
    }
    catch (e) {
      ztoolkit.log(`Error in ${target.name}.${String(propertyKey)} at ${new Date().toLocaleString()}`, e);
      throw e;
    }
  };
  return descriptor;
}

export function progressWindow(text: string, type = "default", progress = 100) {
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

export function logError(...data: any | Error) {
  const orgOption = addon.data.ztoolkit.basicOptions.log.disableConsole;
  addon.data.ztoolkit.basicOptions.log.disableConsole = false;
  console.error(`[Linter for Zotero] An error occurred and the detailed error log is shown below: ${data}\n`, data);
  // ztoolkit.log("Error! ", data);
  addon.data.ztoolkit.basicOptions.log.disableConsole = orgOption;
}
