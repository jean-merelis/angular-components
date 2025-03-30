import { isPresent } from "./is-present";

export function isString(obj: any): boolean {
    return isPresent(obj) && typeof obj === "string";
}
