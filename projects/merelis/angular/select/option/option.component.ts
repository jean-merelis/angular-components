import { FocusableOption, FocusOrigin } from '@angular/cdk/a11y';
import { ENTER, hasModifierKey, SPACE } from '@angular/cdk/keycodes';
import {
    AfterViewChecked,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { Subject } from 'rxjs';
import { MER_OPTION_GROUP, MerOptionGroup } from "./option-group";
import { MER_OPTION_PARENT_COMPONENT, MerOptionParentComponent } from "./option-parent";


let _uniqueIdCounter = 0;

/** Event object emitted by MerOption when selected or deselected. */
export class MerOptionSelectionChange<T = any> {
    constructor(
        /** Reference to the option that emitted the event. */
        public source: MerOption<T>,
        /** Whether the change in the option's value was a result of a user action. */
        public isUserInput = false,
    ) {
    }
}

@Component({
    selector: 'mer-option',
    exportAs: 'merOption',
    host: {
        'role': 'option',
        '[class.mer-option-selected]': 'selected',
        '[class.mer-option-multiple]': 'multiple',
        '[class.mer-option-active]': 'active',
        '[class.mer-option-disabled]': 'disabled',
        '[id]': 'id',
        // Set aria-selected to false for non-selected items and true for selected items. Conform to
        // [WAI ARIA Listbox authoring practices guide](
        //  https://www.w3.org/WAI/ARIA/apg/patterns/listbox/), "If any options are selected, each
        // selected option has either aria-selected or aria-checked  set to true. All options that are
        // selectable but not selected have either aria-selected or aria-checked set to false." Align
        // aria-selected implementation of Chips and List components.
        //
        // Set `aria-selected="false"` on not-selected listbox options to fix VoiceOver announcing
        // every option as "selected" (#21491).
        '[attr.aria-selected]': 'selected',
        '[attr.aria-disabled]': 'disabled.toString()',
        '(click)': '_selectViaInteraction()',
        '(keydown)': '_handleKeydown($event)',
        'class': 'mer-option',
    },
    templateUrl: './option.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    // MatPseudoCheckbox
    ]
})
export class MerOption<T = any> implements FocusableOption, AfterViewChecked, OnDestroy {
    private _selected = false;
    private _active = false;
    private _mostRecentViewValue = '';

    /** Whether the wrapping component is in multiple selection mode. */
    get multiple() {
        return this._parent && this._parent.multiple;
    }

    /** Whether or not the option is currently selected. */
    get selected(): boolean {
        return this._selected;
    }

    /** The form value of the option. */
    @Input({required: true}) value!: T;

    /** The unique ID of the option. */
    @Input() id = `mat-option-${_uniqueIdCounter++}`;

    private _disabled = false;
    /** Whether the option is disabled. */
    @Input({transform: booleanAttribute})
    get disabled(): boolean {
        return (this.group && this.group.disabled()) || this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;
    }



    /** Event emitted when the option is selected or deselected. */
        // tslint:disable-next-line:no-output-on-prefix
    @Output() readonly onSelectionChange = new EventEmitter<MerOptionSelectionChange<T>>();

    /** Element containing the option's text. */
    @ViewChild('text', {static: true}) _text: ElementRef<HTMLElement> | undefined;

    /** Emits when the state of the option changes and any parents have to be notified. */
    readonly _stateChanges = new Subject<void>();

    constructor(
        private _element: ElementRef<HTMLElement>,
        public _changeDetectorRef: ChangeDetectorRef,
        @Optional() @Inject(MER_OPTION_PARENT_COMPONENT) private _parent: MerOptionParentComponent,
        @Optional() @Inject(MER_OPTION_GROUP) public group: MerOptionGroup,
    ) {
    }

    /**
     * Whether or not the option is currently active and ready to be selected.
     * An active option displays styles as if it is focused, but the
     * focus is actually retained somewhere else. This comes in handy
     * for components like autocomplete where focus must remain on the input.
     */
    get active(): boolean {
        return this._active;
    }

    /**
     * The displayed value of the option. It is necessary to show the selected option in the
     * select's trigger.
     */
    get viewValue(): string {
        // TODO(kara): Add input property alternative for node envs.
        return (this._text?.nativeElement.textContent || '').trim();
    }

    /** Selects the option. */
    select(emitEvent = true): void {
        if (!this._selected) {
            this._selected = true;
            this._changeDetectorRef.markForCheck();

            if (emitEvent) {
                this._emitSelectionChangeEvent();
            }
        }
    }

    /** Deselects the option. */
    deselect(emitEvent = true): void {
        if (this._selected) {
            this._selected = false;
            this._changeDetectorRef.markForCheck();

            if (emitEvent) {
                this._emitSelectionChangeEvent();
            }
        }
    }

    /** Sets focus onto this option. */
    focus(_origin?: FocusOrigin, options?: FocusOptions): void {
        // Note that we aren't using `_origin`, but we need to keep it because some internal consumers
        // use `MatOption` in a `FocusKeyManager` and we need it to match `FocusableOption`.
        const element = this._getHostElement();

        if (typeof element.focus === 'function') {
            element.focus(options);
        }
    }

    /**
     * This method sets display styles on the option to make it appear
     * active. This is used by the ActiveDescendantKeyManager so key
     * events will display the proper options as active on arrow key events.
     */
    setActiveStyles(): void {
        if (!this._active) {
            this._active = true;
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * This method removes display styles on the option that made it appear
     * active. This is used by the ActiveDescendantKeyManager so key
     * events will display the proper options as active on arrow key events.
     */
    setInactiveStyles(): void {
        if (this._active) {
            this._active = false;
            this._changeDetectorRef.markForCheck();
        }
    }

    /** Gets the label to be used when determining whether the option should be focused. */
    getLabel(): string {
        return this.viewValue;
    }

    /** Ensures the option is selected when activated from the keyboard. */
    _handleKeydown(event: KeyboardEvent): void {
        if ((event.keyCode === ENTER || event.keyCode === SPACE) && !hasModifierKey(event)) {
            this._selectViaInteraction();

            // Prevent the page from scrolling down and form submits.
            event.preventDefault();
        }
    }

    /**
     * `Selects the option while indicating the selection came from the user. Used to
     * determine if the select's view -> model callback should be invoked.`
     */
    _selectViaInteraction(): void {
        if (!this.disabled) {
            this._selected = this.multiple ? !this._selected : true;
            this._changeDetectorRef.markForCheck();
            this._emitSelectionChangeEvent(true);
        }
    }

    /** Returns the correct tabindex for the option depending on disabled state. */
    // This method is only used by `MatLegacyOption`. Keeping it here to avoid breaking the types.
    // That's because `MatLegacyOption` use `MatOption` type in a few places such as
    // `MatOptionSelectionChange`. It is safe to delete this when `MatLegacyOption` is deleted.
    _getTabIndex(): string {
        return this.disabled ? '-1' : '0';
    }

    /** Gets the host DOM element. */
    _getHostElement(): HTMLElement {
        return this._element.nativeElement;
    }

    ngAfterViewChecked() {
        // Since parent components could be using the option's label to display the selected values
        // (e.g. `mat-select`) and they don't have a way of knowing if the option's label has changed
        // we have to check for changes in the DOM ourselves and dispatch an event. These checks are
        // relatively cheap, however we still limit them only to selected options in order to avoid
        // hitting the DOM too often.
        if (this._selected) {
            const viewValue = this.viewValue;

            if (viewValue !== this._mostRecentViewValue) {
                if (this._mostRecentViewValue) {
                    this._stateChanges.next();
                }

                this._mostRecentViewValue = viewValue;
            }
        }
    }

    ngOnDestroy() {
        this._stateChanges.complete();
    }

    /** Emits the selection change event. */
    private _emitSelectionChangeEvent(isUserInput = false): void {
        this.onSelectionChange.emit(new MerOptionSelectionChange<T>(this, isUserInput));
    }
}

/**
 * Counts the amount of option group labels that precede the specified option.
 * @param optionIndex Index of the option at which to start counting.
 * @param options Flat list of all of the options.
 * @param optionGroups Flat list of all of the option groups.
 * @docs-private
 */
export function _countGroupLabelsBeforeOption(
    optionIndex: number,
    options: readonly MerOption<any>[],
    optionGroups: readonly MerOptionGroup[],
): number {
    if (optionGroups.length) {
        let groupCounter = 0;
        for (let i = 0; i < optionIndex + 1; i++) {
            if (options[i].group && options[i].group === optionGroups[groupCounter]) {
                groupCounter++;
            }
        }
        return groupCounter;
    }
    return 0;
}

/**
 * Determines the position to which to scroll a panel in order for an option to be into view.
 * @param optionOffset Offset of the option from the top of the panel.
 * @param optionHeight Height of the options.
 * @param currentScrollPosition Current scroll position of the panel.
 * @param panelHeight Height of the panel.
 * @docs-private
 */
export function _getOptionScrollPosition(
    optionOffset: number,
    optionHeight: number,
    currentScrollPosition: number,
    panelHeight: number,
): number {
    if (optionOffset < currentScrollPosition) {
        return optionOffset;
    }

    if (optionOffset + optionHeight > currentScrollPosition + panelHeight) {
        return Math.max(0, optionOffset - panelHeight + optionHeight);
    }

    return currentScrollPosition;
}
