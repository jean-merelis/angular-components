import { isNotPresent } from "./is-not-present";

export function isEmpty(obj: string): boolean;
export function isEmpty(obj: any[]): boolean;
export function isEmpty(obj: Set<any>): boolean;
export function isEmpty(obj: Map<any, any>): boolean;

export function isEmpty(obj: any): boolean {
    if (isNotPresent(obj)) {
        return true;
    }
    if (typeof obj === "string") {
        return obj.length === 0
    }
    if (Array.isArray(obj)) {
        return obj.length === 0;
    }
    if (obj instanceof Set) {
        return obj.size === 0;
    }
    if (obj instanceof Map) {
        return obj.size === 0;
    }
    return Object.keys(obj).length === 0;
}
