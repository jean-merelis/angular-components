export function round10(value: number, exp: number): number {
    return decimalAdjust("round", value, exp);
}


/**
 * Decimal adjustment of a number.
 *
 * @param  type  The type of adjustment.
 * @param  value The number.
 * @param exp   The exponent (the 10 logarithm of the adjustment base).
 * @returns The adjusted value.
 */
function decimalAdjust(type: string, value: any, exp: any) {
    // If the exp is undefined or zero...
    if (typeof exp === "undefined" || +exp === 0) {
        return (Math as any)[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
        return NaN;
    }
    // Shift
    value = value.toString().split("e");
    value = (Math as any)[type](+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
    // Shift back
    value = value.toString().split("e");
    return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
}
