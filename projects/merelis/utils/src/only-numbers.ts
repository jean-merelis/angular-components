import { isNotPresent } from "./is-not-present";

export function onlyNumbers(s: string | null | undefined, defaultValue: string | null = null): string | null | undefined {
    if (isNotPresent(s)) {
        return defaultValue;
    }
    return s!.replace(/[^0-9]+/g, "");
}
