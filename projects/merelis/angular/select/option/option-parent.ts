import { InjectionToken } from '@angular/core';

export interface MerOptionParentComponent {
    multiple?: boolean;
}

export const MER_OPTION_PARENT_COMPONENT = new InjectionToken<MerOptionParentComponent>(
    'MER_OPTION_PARENT_COMPONENT',
);
