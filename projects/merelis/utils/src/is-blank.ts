/**
 * Returns true if the value is undefined or null or if the string is empty or contains only white space codepoints, otherwise false.
 */
export function isBlank(value: string | null | undefined): boolean {
    if (value === undefined || value === null) {
        return true;
    }
    return value.trim() === "";
}

export function isNotBlank(value: string | null | undefined): boolean {
    return !isBlank(value);
}
