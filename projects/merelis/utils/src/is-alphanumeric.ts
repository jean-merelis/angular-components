import { isPresent } from "./is-present";

export function isAlphanumeric(c: string): boolean {
    return isPresent(c) && /^[a-zA-Z0-9]+$/.test(c);
}
