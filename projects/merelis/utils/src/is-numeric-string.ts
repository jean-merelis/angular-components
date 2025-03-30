import { isPresent } from "./is-present";

export function isNumericString(c: string): boolean {
    return isPresent(c) && /^[0-9]+$/.test(c);
}
