import { AbstractControl, ValidationErrors } from "@angular/forms";


export class ValidationUtils {
    private static defaultMessageTemplates: { [key: string]: string } = {
        required: 'This field is required',
        pending: 'This field validation is pending',
        min: 'Minimum value: $min',
        max: 'Maximum value: $max',
        email: 'Invalid email',
        minlength: 'Minimum of $requiredLength characters',
        maxlength: 'Maximum of $requiredLength characters',
        pattern: 'Invalid format',
        invalidNumber: "Invalid number",
        nonNegative: "Value must be non-negative",
        integerRequired: "Value must be an integer",
        validationError: "Validation error: $validationKey",
    };

    static getErrorMessages(errors: ValidationErrors | null): string[] {
        if (!errors) return [];

        return Object.entries(errors).map(([key, value]) => {
            // Se o valor for um objeto com uma propriedade 'message'
            if (value && typeof value === 'object' && 'message' in value) {
                return value.message;
            }

            // Se o valor for uma string, usa diretamente
            if (typeof value === 'string') {
                return value;
            }
            let messageTemplate = this.defaultMessageTemplates[key];
            if (messageTemplate) {
                Object.entries(value).forEach(([varName, varValue]) => {
                    messageTemplate = messageTemplate.replace("$" + varName, String(varValue));
                })
                return messageTemplate;
            }
            messageTemplate = this.defaultMessageTemplates["validationError"] || "Validation error: $validationKey";

            return messageTemplate.replace("$validationKey", key);
        });
    }


    static getSingleErrorMessage(control: AbstractControl): string ;
    static getSingleErrorMessage(errors: ValidationErrors | null): string ;
    static getSingleErrorMessage(errors: (ValidationErrors | null) | AbstractControl): string {
        if (!errors) return "";
        if (errors instanceof AbstractControl) {
            if (errors.pending) {
                return this.defaultMessageTemplates["pending"] ?? "Pending";
            }
            if (errors.valid) return "";
            errors = errors.errors;
        }
        const _errors = Object.assign({}, errors);

        /*
        handle "required" last, as there may be another validation preventing the value from being assigned.
        */
        const req = _errors["required"];
        delete _errors["required"];

        const messages = this.getErrorMessages(_errors);
        if (messages.length > 0) {
            return messages[0];
        }
        if (req) {
            return this.defaultMessageTemplates["required"] ?? "This field is required";
        }
        return "";
    }


    static setDefaultMessageTemplates(defaultMessageTemplates: { [key: string]: string }): void {
        this.defaultMessageTemplates = Object.assign({}, this.defaultMessageTemplates, defaultMessageTemplates);
    }

    static setDefaultMessageTemplate(key: string, message: string): void {
        this.defaultMessageTemplates[key] = message;
    }
}
