import { isNotPresent } from "./is-not-present";

export function onlyLettersAndNumbers(s: string | null | undefined, defaultValue: string | null = null): string | null | undefined {
    if (isNotPresent(s)) {
        return defaultValue;
    }
    return s!.replace(/[^0-9a-zA-Z]+/g, "");
}
