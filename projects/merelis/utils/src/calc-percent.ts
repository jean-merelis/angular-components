import { isNotPresent } from "./is-not-present";
import { round10 } from "./round10";

export function calcPercent(value: number, percent: number, roundExp: number = -2): number {
    if (isNotPresent(value) || isNotPresent(percent)) {
        return 0;
    }
    const p = percent / 100;
    return round10(value * p, roundExp);
}
