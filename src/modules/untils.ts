import { config } from "../../package.json";

export function descriptor(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
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
