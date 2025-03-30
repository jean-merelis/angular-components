import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, ValidationErrors } from "@angular/forms";
import { ValidationUtils } from "@merelis/angular/utils";

@Pipe({
    name: 'singleErrorMessage',
    standalone: true,
    pure: false
})
export class SingleErrorMessagePipe implements PipeTransform {

    transform(control: AbstractControl | (ValidationErrors | null)): string {
        return ValidationUtils.getSingleErrorMessage(control);
    }
}
