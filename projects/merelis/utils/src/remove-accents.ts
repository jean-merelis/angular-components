import { isBlank } from "./is-blank";

export function removeAccents(value: string  | null | undefined): string  | null | undefined{
    if (isBlank(value)) {
        return value;
    }
    return value!.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
