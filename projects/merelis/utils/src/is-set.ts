import { isPresent } from "./is-present";

export function isSet(obj: any): boolean {
    return isPresent(obj) && obj instanceof Set;
}
