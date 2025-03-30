import { isPresent } from "./is-present";

export function objToFormData(obj: any): FormData {
    const form = new FormData();
    if (isPresent(obj)) {
        Object.keys(obj)
            .forEach(key => {
                form.append(key, obj[key]);
            });
    }
    return form;
}
