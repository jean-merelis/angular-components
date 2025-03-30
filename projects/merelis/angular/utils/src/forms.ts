import { FormGroup } from "@angular/forms";
import { isNotPresent } from "@merelis/utils";

export function setValuesOfControlsToNull(formGroup: FormGroup, opts: any = {emitEvent: false}): void {
    if (isNotPresent(formGroup)) {
        throw new Error("FormGroup cant be null");
    }
    for (const key in formGroup.controls) {
        if (formGroup.controls.hasOwnProperty(key)) {
            const c = formGroup.controls[key];
            if (isNotPresent(c)) {
                continue;
            }
            if (c instanceof FormGroup) {
                setValuesOfControlsToNull(c as FormGroup, opts);
            } else {
                c.setValue(null, opts);
            }
        }
    }
}
