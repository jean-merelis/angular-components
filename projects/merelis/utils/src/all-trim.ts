import { isNotPresent } from "./is-not-present";

export function allTrim(s: string, defaultValue: string | null = null): string | null | undefined {
    if (isNotPresent(s)) {
        return defaultValue;
    }
    s = s.trim();
    return s.replace(/  +/g, " ");
}
