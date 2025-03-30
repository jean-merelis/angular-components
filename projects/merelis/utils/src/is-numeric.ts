import { isBlank } from "./is-blank";

export function isNumeric(obj: string): boolean {
    if (isBlank(obj)) {
        return false;
    }

    let test;
    try {
        test = parseFloat("0" + obj);
    } catch (e) {
        return false;
    }
    return !isNaN(test);
}
