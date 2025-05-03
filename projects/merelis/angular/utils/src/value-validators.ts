import { ValidationErrors } from "@angular/forms";
import { isString } from "lodash-es";
import { isBlank } from "@merelis/utils";
import { ValueValidatorFn } from "./value-validator";


export class ValueValidators {

    static required(value: any): ValidationErrors | null {
        return requiredValidator(value);
    }

    static integer(value: any): ValidationErrors | null {
        return integerValidator(value);
    }

    static numeric(value: any): ValidationErrors | null {
        return numericValidator(value);
    }

    static nonNegative(value: any): ValidationErrors | null {
        return nonNegativeValidator(value);
    }

    static min(minValue: number): ValueValidatorFn<number | string> {
        return (value: number | string) => minValidator(value, minValue);
    }

    static max(maxValue: number): ValueValidatorFn<number | string> {
        return (value: number | string) => maxValidator(value, maxValue);
    }

    static minLength(minLength: number): ValueValidatorFn<string | any[]> {
        return (value: string | any[]) => minLengthValidator(value, minLength);
    }

    static maxLength(maxLength: number): ValueValidatorFn<string | any[]> {
        return (value: string | any[]) => maxLengthValidator(value, maxLength);
    }
}

function isEmptyInputValue(value: any): boolean {
    return (
        value == null || ((typeof value === 'string' || Array.isArray(value)) && value.length === 0)
    );
}

export function requiredValidator(value: any): ValidationErrors | null {
    return isEmptyInputValue(value) ? {'required': true} : null;
}

export function numericValidator(value: number | string | null | undefined): ValidationErrors | null {
    if (value === undefined || value === null){
        return null;
    }
    if (isString(value)) {
        if (isBlank(value)) {
            return null;
        }
    }
    value = Number(value);
    return isNaN(value) ? {invalidNumber: true} : null;
}

export function integerValidator(value: any): ValidationErrors | null {
    if (value === undefined || value === null){
        return null;
    }
    if (isString(value)) {
        if (isBlank(value)) {
            return null;
        }
    }
    value = Number(value);
    if (isNaN(value) || value == 0) {
        return null;
    }
    const n = value < 0 ? (-1 * value) : value;
    return ((n % 1) !== 0) ? {integerRequired: true} : null;
}

export function nonNegativeValidator(value: number | string): ValidationErrors | null {
    if (value === undefined || value === null){
        return null;
    }
    if (isString(value)) {
        if (isBlank(value)) {
            return null;
        }
    }
    value = Number(value);

    if (isNaN(value as number)) {
        return null;
    }

    return value < 0 ? {'nonNegative': true} : null;
}


export function minValidator(value: number | string, min: number): ValidationErrors | null {
    if (value === undefined || value === null){
        return null;
    }
    if (typeof (value) === 'string') {
        value = Number(value);
    }
    return min > value ? {min: {min}} : null;
}

export function maxValidator(value: number | string, max: number): ValidationErrors | null {
    if (value === undefined || value === null){
        return null;
    }
    if (typeof (value) === 'string') {
        value = Number(value);
    }
    return value > max ? {max: {max}} : null;
}

export function minLengthValidator(value: string | any[], minlength: number): ValidationErrors | null {
    if (value === undefined || value === null){
        return null;
    }
    const currentLength = value.length;
    return minlength > currentLength ? {minlength: {requiredLength: minlength, currentLength}} : null;
}


export function maxLengthValidator(value: string | any[], maxlength: number): ValidationErrors | null {
    if (value === undefined || value === null){
        return null;
    }
    const currentLength = value.length;
    return currentLength > maxlength ? {maxlength: {requiredLength: maxlength, currentLength}} : null;
}
