import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { ValueValidators } from "./value-validators";

export class ControlValidators {

    static integer(control: AbstractControl): ValidationErrors | null {
        return ValueValidators.integer(control.value);
    }

    static numeric(control: AbstractControl): ValidationErrors | null {
        return ValueValidators.numeric(control.value);
    }

    static nonNegative(control: AbstractControl): ValidationErrors | null {
        return ValueValidators.nonNegative(control.value);
    }
}
