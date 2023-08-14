import { config } from "../../package.json";

export function callingLoggerForMethod(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: never) {
        try {
            ztoolkit.log(`Calling ${target.name}.${String(propertyKey)} at ${new Date()}`);
            return original.apply(this, args);
        } catch (e) {
            ztoolkit.log(`Error in ${target.name}.${String(propertyKey)} at ${new Date()}`, e);
            throw e;
        }
    };
    return descriptor;
}

// export function callingLoggerForClass<T extends { new (...args: any[]): {} }>(constructor: T) {
//     return class extends constructor {
//         constructor(...args: any[]) {
//             super(...args);

//             // 遍历类的静态方法
//             const staticMethods = Object.getOwnPropertyNames(constructor);
//             for (const methodName of staticMethods) {
//                 const method = constructor[methodName];

//                 // 判断方法是否为函数
//                 if (typeof method === "function") {
//                     // 创建新的方法，添加日志功能
//                     this[methodName] = function (...args: any[]) {
//                         console.log(`Calling static method ${methodName} with arguments:`, args);
//                         const result = method.apply(this, args);
//                         console.log(`Method ${methodName} returned:`, result);
//                         return result;
//                     };
//                 }
//             }
//         }
//     };
// }

export function progressWindow(text: string, type = "default", progress = 100) {
    new ztoolkit.ProgressWindow(config.addonName, {
        closeOnClick: true,
    })
        .createLine({
            text: text,
            type: type,
            progress: progress,
        })
        .show();
}

export function logError(...data: any) {
    const orgOption = addon.data.ztoolkit.basicOptions.log.disableConsole;
    addon.data.ztoolkit.basicOptions.log.disableConsole = false;
    console.error("[Linter for Zotero] An error occurred and the detailed error log is shown below: \n", data);
    // ztoolkit.log("Error! ", data);
    addon.data.ztoolkit.basicOptions.log.disableConsole = orgOption;
}
