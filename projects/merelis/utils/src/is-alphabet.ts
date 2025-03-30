import { isPresent } from "./is-present";

export function isAlphabet(c: string): boolean {
    return isPresent(c) && /^[a-zA-Z]+$/.test(c);
}
