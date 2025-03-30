import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    InjectionToken,
    input,
    ViewEncapsulation,
} from '@angular/core';


let _uniqueOptgroupIdCounter = 0;

export const MER_OPTION_GROUP = new InjectionToken<MerOptionGroup>('MerOptionGroup');

@Component({
    selector: 'mer-option-group',
    exportAs: 'merOptionGroup',
    template: `
        <span
            class="mer-option-group-label"
            role="presentation"
            [class.mer-option-disabled]="disabled()"
            [id]="_labelId">
           {{ label() }}
            <ng-content></ng-content>
        </span>
        <ng-content select="mer-option, ng-container"></ng-content>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './option-group.scss',
    host: {
        'class': 'mer-option-group',
        '[attr.role]': '"group"',
        '[attr.aria-disabled]': 'disabled().toString()',
        '[attr.aria-labelledby]': '_labelId',
    },
    providers: [{provide: MER_OPTION_GROUP, useExisting: MerOptionGroup}],
    standalone: true,
})
export class MerOptionGroup {

    label = input<string>();
    disabled = input(false, {transform: booleanAttribute});

    protected _labelId: string = `mer-option-group-label-${_uniqueOptgroupIdCounter++}`;

}
