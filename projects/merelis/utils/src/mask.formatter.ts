import { isAlphabet } from "./is-alphabet";
import { isAlphanumeric } from "./is-alphanumeric";
import { isBlank } from "./is-blank";
import { isNotPresent } from "./is-not-present";
import { isNumericString } from "./is-numeric-string";

export class MaskFormatter {

    static removeMask(value: string, mask: string): string {
        if (isNotPresent(value) || isBlank(value)) {
            return "";
        }
        if (isNotPresent(mask) || isBlank(mask)) {
            return value;
        }

        let maskValueLength = 0;
        for (let i = 0; i < mask.length; i++) {
            if (
                mask.charAt(i) === "#"
                || mask.charAt(i) === "C"
                || mask.charAt(i) === "A"
            ) {
                maskValueLength++;
            }
        }


        const newValue: string[] = [];

        for (let i = 0; i < value.length; i++) {
            if (isAlphanumeric(value.charAt(i))
                // || i > (mask.length - 1)
                // || mask.charAt(i) === '#'
                // || mask.charAt(i) === 'C'
                // || mask.charAt(i) === 'A'
            ) {
                newValue.push(value.charAt(i));
            }
        }
        let result = newValue.join("");
        if (result.length > maskValueLength) {
            result = result.substring(0, maskValueLength);
        }
        return result;
    }

    static format2(value: string, mask: string, valueIsMasked: boolean): string {
        if (isNotPresent(value) || isBlank(value)) {
            return "";
        }
        if (isNotPresent(mask) || isBlank(mask)) {
            return value;
        }

        if (valueIsMasked) {
            // remover máscara.
            value = MaskFormatter.removeMask(value, mask);
        }

        /*
         * A máscara que será usada na formatação.
         * '#' para aceitar números.
         * 'C' para aceitar letras.
         * 'A' para aceitar alfanumérico.
         */

        let posMask = 0;
        const newValue: string[] = [];

        for (let i = 0; i < value.length; i++) {

            while (
                mask.charAt(posMask) !== "#"
                && mask.charAt(posMask) !== "C"
                && mask.charAt(posMask) !== "A"
                ) {
                newValue.push(mask.charAt(posMask));
                posMask++;
                if (posMask >= mask.length) {
                    break;
                }
            }
            if (posMask >= mask.length) {
                break;
            }


            const m = mask.charAt(posMask);
            posMask++;
            const c = value.charAt(i);

            switch (m) {
                case "#": {
                    if (isNumericString(c)) {
                        newValue.push(c);
                    }
                    break;
                }
                case "C": {
                    if (isAlphabet(c)) {
                        newValue.push(c);
                    }
                    break;
                }
                case "A": {
                    if (isAlphanumeric(c)) {
                        newValue.push(c);
                    }
                    break;
                }
            }

        }


        // for mask end with simbol, e.g. ###-####(##)
        if (posMask === (mask.length - 1) && mask.charAt(posMask) !== "#") {
            newValue.push(mask.charAt(posMask));
            posMask++;
        }

        return newValue.join("");
    }

    static format(valueWithoutMask: string, mask: string): string {
        if (isBlank(valueWithoutMask)) {
            return "";
        }
        if (isBlank(mask)) {
            return valueWithoutMask;
        }

        let posMask = 0;
        const newValue: string[] = [];
        for (let i = 0; i < valueWithoutMask.length; i++) {

            while (mask.charAt(posMask) !== "#") {
                newValue.push(mask.charAt(posMask));
                posMask++;
                if (posMask >= mask.length) {
                    break;
                }
            }
            if (posMask >= mask.length) {
                break;
            }

            posMask++;
            newValue.push(valueWithoutMask.charAt(i));
        }

        // for mask end with simbol, e.g. ###-####(##)
        if (posMask === (mask.length - 1) && mask.charAt(posMask) !== "#") {
            newValue.push(mask.charAt(posMask));
            posMask++;
        }

        return newValue.join("");
    }

    static reverseFormat(valueWithoutMask: string, mask: string, maskSize?: number): string {
        if (isBlank(valueWithoutMask)) {
            return "";
        }
        if (isBlank(mask)) {
            return valueWithoutMask;
        }

        let posMask: number = mask.length - 1;
        const newValue: string[] = [];

        // trunc
        if (!maskSize) {
            maskSize = 0;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < mask.length; i++) {
                if (mask[i] === "#") {
                    maskSize++;
                }
            }
        }
        if (valueWithoutMask.length > maskSize) {
            valueWithoutMask = valueWithoutMask.substring(0, maskSize);
        }


        for (let i = valueWithoutMask.length - 1; i >= 0; i--) {

            while (mask.charAt(posMask) !== "#") {
                newValue.unshift(mask.charAt(posMask));
                posMask--;
                if (posMask < 0) {
                    break;
                }
            }
            if (posMask < 0) {
                break;
            }

            posMask--;
            newValue.unshift(valueWithoutMask.charAt(i));
        }

        if (posMask >= 0) {
            while (mask.charAt(posMask) !== "#") {
                newValue.unshift(mask.charAt(posMask));
                posMask--;
                if (posMask < 0) {
                    break;
                }
            }
        }

        return newValue.join("");
    }
}
