import { DateTime } from "luxon";
import { isBlank } from "./is-blank";
import { isDate } from "./is-date";
import { isNotPresent } from "./is-not-present";
import { isNumber } from "./is-number";
import { isString } from "./is-string";

export function toDateTime(value: any): DateTime | null | undefined {
    if (isNotPresent(value) || isBlank(value)) {
        return value;
    }
    if (DateTime.isDateTime(value)) {
        return value;
    }
    if (isString(value)) {
        return DateTime.fromISO(value);
    }
    if (isDate(value)) {
        return DateTime.fromJSDate(value);
    }
    if (isNumber(value)) {
        return DateTime.fromMillis(value);
    }
    throw Error("Invalid DateTime format: " + JSON.stringify(value));
}
