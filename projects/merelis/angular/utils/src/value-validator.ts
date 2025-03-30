import { ValidationErrors } from "@angular/forms";

export type ValueValidatorFn<T> = (value: T, owner?: any) => ValidationErrors | null;
