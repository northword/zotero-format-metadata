import { config } from "../../package.json";

export function descriptor(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: any) {
        try {
            ztoolkit.log(`Calling ${target.name}.${String(propertyKey)}`);
            return original.apply(this, args);
        } catch (e) {
            ztoolkit.log(`Error in ${target.name}.${String(propertyKey)}`, e);
            throw e;
        }
    };
    return descriptor;
}

export function progressWindow(text: string, type: string = "default", progress: number = 100) {
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