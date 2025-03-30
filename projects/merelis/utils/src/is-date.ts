import { isPresent } from "./is-present";

export function isDate(obj: any): boolean {
    return isPresent(obj) && obj instanceof Date && !isNaN(obj.valueOf());
}
