import { isPresent } from "./is-present";

export function isNumber(obj: any): boolean {
    return isPresent(obj) && typeof obj === "number";
}
