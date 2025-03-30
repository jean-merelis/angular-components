import { isPresent } from "./is-present";

export function isMap(obj: any): boolean {
    return isPresent(obj) && obj instanceof Map;
}
