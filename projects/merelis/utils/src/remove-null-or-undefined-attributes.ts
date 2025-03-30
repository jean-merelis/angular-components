import { isNotPresent } from "./is-not-present";

export function removeNullOrUndefinedAttributes(obj: any) {
    if (!obj) {
        return;
    }

    Object.entries(obj).forEach(([key, val]) => {
        if (val && typeof val === "object") {
            removeNullOrUndefinedAttributes(val);
        } else if (isNotPresent(val)) {
            delete obj[key];
        }
    });
}
