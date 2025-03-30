/**
 * This file was based on Angular Material sources, so there are parts of the code that were copied from there.
 * The names of classes and other objects have been changed to avoid collisions with the original package.
 *
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
    animate,
    AnimationEvent,
    AnimationTriggerMetadata,
    group,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';
import { ActiveDescendantKeyManager, addAriaReferencedId, removeAriaReferencedId } from '@angular/cdk/a11y';
import { Directionality } from "@angular/cdk/bidi";
import { SelectionModel } from "@angular/cdk/collections";
import { hasModifierKey } from "@angular/cdk/keycodes";
import {
    ConnectedPosition,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    OverlayRef,
    PositionStrategy,
    ScrollStrategy,
    ViewportRuler
} from "@angular/cdk/overlay";
import { _getEventTarget } from "@angular/cdk/platform";
import { TemplatePortal } from "@angular/cdk/portal";
import { CommonModule, DOCUMENT } from "@angular/common";
import {
    afterNextRender,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    contentChild,
    contentChildren,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    EventEmitter,
    forwardRef,
    inject,
    InjectionToken,
    Injector,
    input,
    model,
    NgZone,
    numberAttribute,
    OnDestroy,
    OnInit,
    output,
    Renderer2,
    signal,
    TemplateRef,
    viewChild,
    viewChildren,
    ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { ControlValueAccessor, FormGroupDirective, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MerProgressBar } from "@merelis/angular/progress-bar";
import { isNotPresent, noop } from "@merelis/utils";
import {
    BehaviorSubject,
    debounceTime,
    defer,
    distinctUntilChanged,
    fromEvent,
    merge,
    Observable,
    of as observableOf,
    Subject,
    Subscription
} from 'rxjs';
import { delay, filter, map, startWith, switchMap, take, tap } from 'rxjs/operators';

import {
    _countGroupLabelsBeforeOption,
    _getOptionScrollPosition,
    MER_OPTION_GROUP,
    MerOption,
    MerOptionSelectionChange
} from "../option";

import { Comparable, DisplayWith, FilterPredicate, OptionPredicate } from "../types";
import { CollectionViewer, MerSelectDataSource, SelectDataSource, ViewerChange } from "./select.datasource";

declare var ngDevMode: boolean;


/**
 * Directive applied to an element to make it usable
 * as a connection point for a select panel.
 */
@Directive({
    selector: '[merSelectPanelOrigin]',
    exportAs: 'merSelectPanelOrigin',
    standalone: true,
})
export class MerSelectPanelOrigin {
    constructor(
        /** Reference to the element on which the directive is applied. */
        public elementRef: ElementRef<HTMLElement>,
    ) {
    }
}


/** Injection token that determines the scroll handling while the autocomplete panel is open. */
export const MER_SELECT_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
    'mer-select-scroll-strategy',
    {
        providedIn: 'root',
        factory: () => {
            const overlay = inject(Overlay);
            return () => overlay.scrollStrategies.reposition();
        },
    },
);

/** @docs-private */
export function MER_SELECT_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const MER_SELECT_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: MER_SELECT_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: MER_SELECT_SCROLL_STRATEGY_FACTORY,
};


/** Default `mer-select` options that can be overridden. */
export interface MerSelectDefaultOptions {
    /** Whether the first option should be highlighted when an autocomplete panel is opened. */
    autoActiveFirstOption?: boolean;

    /** Whether the active option should be selected as the user is navigating. */
    autoSelectActiveOption?: boolean;

    /** Class or list of classes to be applied to the mer-select's overlay panel. */
    overlayPanelClass?: string | string[];

    /** Wheter icon indicators should be hidden for single-selection. */
    hideSingleSelectionIndicator?: boolean;
}

/** Injection token to be used to override the default options for `mat-autocomplete`. */
export const MER_SELECT_DEFAULT_OPTIONS = new InjectionToken<MerSelectDefaultOptions>(
    'mat-autocomplete-default-options',
    {
        providedIn: 'root',
        factory: MER_SELECT_DEFAULT_OPTIONS_FACTORY,
    },
);

/** @docs-private */
export function MER_SELECT_DEFAULT_OPTIONS_FACTORY(): MerSelectDefaultOptions {
    return {
        autoActiveFirstOption: false,
        autoSelectActiveOption: false,
        hideSingleSelectionIndicator: false,
    };
}


let _uniqueIdCounter = 0;

// TODO: organize some parts in another files

const panelAnimation: AnimationTriggerMetadata = trigger('panelAnimation', [
    state(
        'void, hidden',
        style({
            opacity: 0,
            transform: 'scaleY(0.8)',
        }),
    ),
    transition(':enter, hidden => visible', [
        group([
            animate('0.03s linear', style({opacity: 1})),
            animate('0.12s cubic-bezier(0, 0, 0.2, 1)', style({transform: 'scaleY(1)'})),
        ]),
    ]),
    transition(':leave, visible => hidden', [animate('0.075s linear', style({opacity: 0}))]),
]);


interface SelectOption<T> {
    option: T;
    disabled?: boolean;
    active?: boolean;
}

@Directive({
    selector: "ng-template[merSelectTriggerDef]",
    standalone: true,
})
export class MerSelectTriggerDef {
    constructor(public templateRef: TemplateRef<any>) {
    }
}

@Directive({
    selector: "ng-template[merSelectOptionDef]",
    standalone: true,
})
export class MerSelectOptionDef {
    constructor(public templateRef: TemplateRef<any>) {
    }
}

@Component({
    selector: "mer-select",
    templateUrl: './select.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        MerOption,
        MerProgressBar,
    ],
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MerSelectComponent), multi: true}
    ],
    animations: [panelAnimation],
    host: {
        "[class.mer-select]": "true",
        "[class.focused]": "_focused",
        "[class.disabled]": "disabled()"
    }
})
export class MerSelectComponent<T> implements CollectionViewer<T>, ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

    readonly value = model<T | T[] | null | undefined>();
    readonly loading = model<boolean>(false);
    readonly disabled = model(false);
    readonly readOnly = input(false, {transform: booleanAttribute});
    readonly disableSearch = input(false, {transform: booleanAttribute});
    readonly disableOpeningWhenFocusedByKeyboard = input(false, {transform: booleanAttribute});
    readonly multiple = input(false, {transform: booleanAttribute});
    readonly canClear = input(true, {transform: booleanAttribute});
    readonly alwaysIncludesSelected = input(false, {transform: booleanAttribute});
    readonly autoActiveFirstOption = input(true, {transform: booleanAttribute});
    readonly debounceTime = input(100, {transform: numberAttribute});
    readonly panelOffsetY = input(0, {transform: numberAttribute});
    readonly dataSource = input<SelectDataSource<T> | T[]>();
    readonly compareWith = input<Comparable<T>>();
    readonly displayWith = input<DisplayWith<T>>();
    readonly filterPredicate = input<FilterPredicate<T>>();
    readonly disableOptionPredicate = input<OptionPredicate<T>>(() => false);
    readonly disabledOptions = input<T[]>([]);
    readonly connectedTo = model<MerSelectPanelOrigin>();
    readonly panelClass = input<string | string[]>();
    readonly panelWidth = input<string | number>();
    readonly position = input<'auto' | 'above' | 'below'>('auto');
    readonly placeholder = input<string>();


    readonly opened = output<void>();
    readonly closed = output<void>();
    readonly onFocus = output<void>({alias: "focus"});
    readonly onBlur = output<void>({alias: "blur"});
    readonly onInputChange = output<string>({alias: "inputChanges"});

    inMatFormField?: boolean;
    protected _stateChanges = new Subject<void>();
    get stateChanges(): Observable<void> {
        return this._stateChanges.asObservable();
    }

    get viewChange(): Observable<ViewerChange<T>> {
        return this._viewChange.asObservable();
    }

    get panelOpen(): boolean {
        return this._overlayAttached && this.showPanel;
    }

    protected readonly filteredOptions = signal<T[]>([]);

    protected readonly elemnentRef = inject(ElementRef);
    protected readonly cd = inject(ChangeDetectorRef);
    protected readonly renderer = inject(Renderer2);
    protected readonly destroyRef: DestroyRef = inject(DestroyRef);
    protected readonly _overlay = inject(Overlay);
    protected readonly _viewContainerRef = inject(ViewContainerRef);
    protected readonly zone = inject(NgZone);
    protected readonly _injector = inject(Injector);
    protected readonly _viewportRuler = inject(ViewportRuler);
    protected readonly _scrollStrategy = inject<() => ScrollStrategy>(MER_SELECT_SCROLL_STRATEGY);
    protected readonly _document = inject<any>(DOCUMENT, {optional: true});
    protected readonly _dir = inject<Directionality | null>(Directionality, {optional: true});
    protected readonly _defaults = inject<MerSelectDefaultOptions | null>(MER_SELECT_DEFAULT_OPTIONS, {optional: true});
    protected parentFormGroup = inject(FormGroupDirective, {optional: true});

    protected readonly input = viewChild.required<ElementRef<HTMLInputElement>>("textinput");
    protected readonly triggerTemplate = contentChild(MerSelectTriggerDef);
    protected readonly optionTemplate = contentChild(MerSelectOptionDef);

    protected readonly viewChildOptions = viewChildren(MerOption<T>);
    protected readonly viewChildOptionGroups = viewChildren(MER_OPTION_GROUP);
    protected readonly contentChildOptions = contentChildren(MerOption<T>, {descendants: true});
    protected readonly contentChildOptionGroups = contentChildren(MER_OPTION_GROUP, {descendants: true});
    protected readonly renderedOptions = computed(() => {
        const v = this.viewChildOptions() ?? [];
        const c = this.contentChildOptions() ?? [];
        return [...v, ...c];
    });
    protected readonly renderedOptionGroups = computed(() => {
        const v = this.viewChildOptionGroups() ?? [];
        const c = this.contentChildOptionGroups() ?? [];
        return [...v, ...c];
    });
    protected readonly hasValue = computed(() => {
        const value = this.value();
        if (isNotPresent(value)) return false;
        if (this.multiple() && Array.isArray(value)) {
            return value.length > 0
        }
        return true;
    })

    get empty(): boolean {
        return !this.hasValue();
    }


    protected readonly renderedOptions$ = toObservable(this.renderedOptions);
    protected readonly panelTemplate = viewChild.required<string, TemplateRef<any>>("panelTmpl", {read: TemplateRef});
    protected internalDataSource?: MerSelectDataSource<T>;
    protected readonly _id: string = `${_uniqueIdCounter++}`;
    readonly id: string = `mer-select-${this._id}`;
    protected readonly panelId: string = `mer-select-panel-${this._id}`;
    protected readonly _aboveClass = 'mer-select-panel-above';
    protected _keyManager!: ActiveDescendantKeyManager<MerOption<T>>;
    protected _activeOptionChanges = Subscription.EMPTY;
    protected _keydownSubscription: Subscription | null | undefined;
    protected _initialized = new Subject();
    protected readonly input$ = new Subject<string>();
    protected inputSubscription?: Subscription;
    protected _outsideClickSubscription?: Subscription | null;
    protected _valueBeforeAutoSelection?: string | undefined;
    protected dataSourceConnectSubscription?: Subscription;
    protected dataSourceLoadingSubscription?: Subscription;
    protected _focused = false;
    get focused(): boolean {
        return this._focused;
    }

    private previousDataSource?: SelectDataSource<T>;

    togglePanel(): void {
        if (this.disabled() || this.readOnly()) {
            return;
        }
        if (this.panelOpen) {
            this.closePanel();
        } else if (this._canOpen()) {
            this.openPanel();
        }
    }

    focus(): void {
        if (!this.disabled()) {
            this.input().nativeElement.focus();
        }
    }


    protected checkFocus(): void {
        afterNextRender(() => {
            this._focused = this._document.activeElement === this.input().nativeElement;
            if (this._focused) {
                this.onFocus.emit();
            } else {
                this.onBlur.emit()
            }
            this._stateChanges.next();
        }, {injector: this._injector});
    }

    /**
     * Track which modal we have modified the `aria-owns` attribute of. When the combobox trigger is
     * inside an aria-modal, we apply aria-owns to the parent modal with the `id` of the options
     * panel. Track the modal we have changed so we can undo the changes on destroy.
     */
    protected _trackedModal?: Element | null = null;

    /**
     * A stream of actions that should close the panel, including
     * when an option is selected, on blur, and when TAB is pressed.
     */
    protected get panelClosingActions(): Observable<MerOptionSelectionChange | null> {
        return merge(
            this.optionSelections,
            this._keyManager.tabOut.pipe(filter(() => this._overlayAttached)),
            this._closeKeyEventStream,
            this._getOutsideClickStream(),
            this._overlayRef
                ? this._overlayRef.detachments().pipe(filter(() => this._overlayAttached))
                : observableOf(),
        ).pipe(
            // Normalize the output so we return a consistent type.
            map(event => (event instanceof MerOptionSelectionChange ? event : null)),
        );
    }

    /** Stream of changes to the selection state of the autocomplete options. */
    protected readonly optionSelections: Observable<MerOptionSelectionChange> = defer(() => {
        return this.renderedOptions$.pipe(
            startWith(this.renderedOptions()),
            switchMap(() => merge(...this.renderedOptions().map((option: MerOption<T>) => option.onSelectionChange))),
        );

    }) as Observable<MerOptionSelectionChange>;

    /** The currently active option, coerced to MatOption type. */
    protected get activeOption(): MerOption | null {
        if (this._keyManager) {
            return this._keyManager.activeItem;
        }

        return null;
    }

    protected readonly selection = computed(() => {
        if (this.multiple()) {
            const sel = new SelectionModel<T>(this.multiple(), []);
            sel.compareWith = this.compareWith();
            this.subscribeToSelectionChange(sel);
            return sel;
        }
        return;
    });
    protected _portal?: TemplatePortal;
    protected _viewChange = new BehaviorSubject({});
    protected onChangeCallback = noop;
    protected onTouchedCallback = noop;
    protected _overlayAttached: boolean = false;
    protected _viewportSubscription = Subscription.EMPTY;
    protected readonly _closeKeyEventStream = new Subject<void>();
    protected _componentDestroyed = false;
    protected _overlayRef?: OverlayRef | null;
    protected _positionStrategy?: FlexibleConnectedPositionStrategy;

    /** Value of the input element when the panel was attached (even if there are no options). */
    protected _valueOnAttach: string | number | null | undefined;

    /** Value on the previous keydown event. */
    protected _valueOnLastKeydown: string | null | undefined;
    /**
     * Whether the autocomplete can open the next time it is focused. Used to prevent a focused,
     * closed autocomplete from being reopened if the user switches to another browser tab and then
     * comes back.
     */
    protected _canOpenOnNextFocus = true;
    /**
     * Current option that we have auto-selected as the user is navigating,
     * but which hasn't been propagated to the model value yet.
     */
    protected _pendingAutoselectedOption?: MerOption<T> | null;

    /** The subscription for closing actions (some are bound to document). */
    private _closingActionsSubscription?: Subscription;

    //// panel

    /** Whether the autocomplete panel should be visible, depending on option length. */
    showPanel: boolean = false;

    /** Whether the autocomplete panel is open. */
    get isOpen(): boolean {
        return this._isOpen && this.showPanel;
    }

    _isOpen: boolean = false;

    /** Emits when the panel animation is done. Null if the panel doesn't animate. */
    _animationDone = new EventEmitter<AnimationEvent>();
    /** Element for the panel containing the autocomplete options. */
    protected readonly panel = viewChild.required<ElementRef>("panel");

    //// < panel


    protected subSelectionChanges?: Subscription;

    protected subscribeToSelectionChange(selection: SelectionModel<T>): void {
        this.subSelectionChanges?.unsubscribe();
        this.subSelectionChanges = selection.changed
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(s => {
                this.value.set(this.selection()?.selected);
                this.onChangeCallback(this.value());
            });
    }

    constructor() {
        effect(() => {
            const ds = this.dataSource();
            if (Array.isArray(ds) || isNotPresent(ds)) {
                const options = ds as T[];
                if (this.internalDataSource) {
                    this.internalDataSource.data = options ?? [];
                } else {
                    this.createInternalDs(options);
                }
            } else {
                this.previousDataSource?.disconnect(this);
                this.previousDataSource = ds;
                this.internalDataSource?.disconnect(this);
                this.internalDataSource?.dispose();
                this.internalDataSource = undefined;
                this.connectDataSource(ds as SelectDataSource<T>);
            }
        });
        effect(() => {
            this.subscribeToInputChanges();
        });
    }

    ngOnInit(): void {
        this.subscribeToInputChanges();
        this.renderedOptions$.subscribe(options => {
            options?.forEach(opt => {
                const selected = this.isOptionSelected(opt.value);
                if (selected) {
                    opt.select(false);
                } else {
                    opt.deselect(false);
                }
                opt.disabled = this.isOptionDisabled(opt.value);
            });
        })
    }

    protected subscribeToInputChanges(): void {
        this.inputSubscription?.unsubscribe();
        this.inputSubscription = this.input$.pipe(
            debounceTime(this.debounceTime()),
            distinctUntilChanged(),
        ).subscribe(value => {
            this._viewChange.next({text: value, selected: this.value()});
            this.onInputChange.emit(value);
        })
    }

    ngOnDestroy(): void {
        this.unsubscribeDataSource();
        const ds = this.dataSource();
        if (!Array.isArray(ds)){
            ds?.disconnect(this);
        }
        this.internalDataSource?.dispose();
        this.subSelectionChanges?.unsubscribe();
        this._activeOptionChanges.unsubscribe();
        this._keydownSubscription?.unsubscribe();
        this._outsideClickSubscription?.unsubscribe();
        this.inputSubscription?.unsubscribe();
        this._viewChange.complete();
        this._keyManager?.destroy();
        this._animationDone?.complete();
        this.input$.complete();
        this._initialized.complete();

        const window = this._getWindow();

        if (typeof window !== 'undefined') {
            window.removeEventListener('blur', this._windowBlurHandler);
        }

        this._viewportSubscription.unsubscribe();
        this._componentDestroyed = true;
        this._destroyPanel();
        this._closeKeyEventStream.complete();
        this._clearFromModal();
    }


    protected connectDataSource(ds: SelectDataSource<T>): void {
        this.unsubscribeDataSource();
        this.dataSourceConnectSubscription = ds.connect(this)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(data => this.filteredOptions.set(data));
        this.dataSourceLoadingSubscription = ds.loading(this)?.pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(isLoading => this.loading.set(isLoading));
    }

    protected unsubscribeDataSource(): void {
        this.dataSourceConnectSubscription?.unsubscribe();
        this.dataSourceLoadingSubscription?.unsubscribe();
    }


    ngAfterViewInit() {
        const window = this._getWindow();

        if (typeof window !== 'undefined') {
            this.zone.runOutsideAngular(() => window.addEventListener('blur', this._windowBlurHandler));
        }
        this.parentFormGroup?.ngSubmit
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(params => {
                this._stateChanges.next();
                this.cd.markForCheck();
            });
    }

    ngAfterContentInit() {
        this._keyManager = new ActiveDescendantKeyManager<MerOption<T>>(this.renderedOptions, this._injector)
            .withWrap()
            .skipPredicate(this._skipPredicate);
        this._activeOptionChanges = this._keyManager.change.subscribe(index => {
            if (this.isOpen) {
                // TODO:  this.optionActivated.emit({source: this, option: this.options.toArray()[index] || null});
            }
        });

        // Set the initial visibility state.
        this._setVisibility();
    }

    registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchedCallback = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
        this._stateChanges.next();
    }

    writeValue(value: T | T[]): void {
        this.value.set(value);
        this._stateChanges.next();
    }

    protected createInternalDs(options: T[]): void {
        this.internalDataSource?.dispose();
        this.internalDataSource = new MerSelectDataSource<T>(options ?? [], {
            alwaysIncludesSelected: this.alwaysIncludesSelected(),
            compareWith: this.compareWith(),
            displayWith: this.displayWith(),
            filterPredicate: this.filterPredicate(),
        });
        this.connectDataSource(this.internalDataSource);
    }

    /** Panel should hide itself when the option list is empty. */
    protected _setVisibility() {
        this.showPanel = !!this.renderedOptions().length;
        this.cd.markForCheck();
    }


    /**
     * Event handler for when the window is blurred. Needs to be an
     * arrow function in order to preserve the context.
     */
    protected _windowBlurHandler = () => {
        // If the user blurred the window while the autocomplete is focused, it means that it'll be
        // refocused when they come back. In this case we want to skip the first focus event, if the
        // pane was closed, in order to avoid reopening it unintentionally.
        this._canOpenOnNextFocus =
            this._document.activeElement !== this.input().nativeElement || this.panelOpen;
    };

    /** Stream of clicks outside of the panel. */
    protected _getOutsideClickStream(): Observable<any> {
        return merge(
            fromEvent(this._document, 'click') as Observable<MouseEvent>,
            fromEvent(this._document, 'auxclick') as Observable<MouseEvent>,
            fromEvent(this._document, 'touchend') as Observable<TouchEvent>,
        ).pipe(
            filter((event: Event) => {
                // If we're in the Shadow DOM, the event target will be the shadow root, so we have to
                // fall back to check the first element in the path of the click event.
                const clickTarget = _getEventTarget<HTMLElement>(event)!;
                const customOrigin = this.connectedTo() ? this.connectedTo()!.elementRef.nativeElement : null;

                return (
                    this._overlayAttached &&
                    clickTarget !== this.input().nativeElement &&
                    // Normally focus moves inside `mousedown` so this condition will almost always be
                    // true. Its main purpose is to handle the case where the input is focused from an
                    // outside click which propagates up to the `body` listener within the same sequence
                    // and causes the panel to close immediately (see #3106).
                    this._document.activeElement !== this.input().nativeElement &&
                    (!customOrigin || !customOrigin.contains(clickTarget)) &&
                    !!this._overlayRef &&
                    !this._overlayRef.overlayElement.contains(clickTarget)
                );
            }),
        );
    }

    // `skipPredicate` determines if key manager should avoid putting a given option in the tab
    // order. Allow disabled list items to receive focus via keyboard to align with WAI ARIA
    // recommendation.
    //
    // Normally WAI ARIA's instructions are to exclude disabled items from the tab order, but it
    // makes a few exceptions for compound widgets.
    //
    // From [Developing a Keyboard Interface](
    // https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/):
    //   "For the following composite widget elements, keep them focusable when disabled: Options in a
    //   Listbox..."
    //
    // The user can focus disabled options using the keyboard, but the user cannot click disabled
    // options.
    protected _skipPredicate() {
        return false;
    }

    openPanel(): void {
        this._openPanelInternal();
    }

    /** Closes the autocomplete suggestion panel. */
    closePanel(): void {

        if (!this._overlayAttached) {
            return;
        }

        if (this.panelOpen) {
            // Only emit if the panel was visible.
            // `afterNextRender` always runs outside of the Angular zone, so all the subscriptions from
            // `_subscribeToClosingActions()` are also outside of the Angular zone.
            // We should manually run in Angular zone to update UI after panel closing.
            this.zone.run(() => {
                this.closed.emit();
                if (!this._componentDestroyed) {
                    this.input$.next("");
                }
            });
        }
        this._isOpen = false;
        this._overlayAttached = false;
        this._pendingAutoselectedOption = null;

        if (this._overlayRef && this._overlayRef.hasAttached()) {
            this._overlayRef.detach();
            this._closingActionsSubscription?.unsubscribe();
        }

        this._updatePanelState();

        // Note that in some cases this can end up being called after the component is destroyed.
        // Add a check to ensure that we don't try to run change detection on a destroyed view.
        if (!this._componentDestroyed) {
            // We need to trigger change detection manually, because
            // `fromEvent` doesn't seem to do it at the proper time.
            // This ensures that the label is reset when the
            // user clicks outside.
            this.cd.detectChanges();
        }

        // Remove aria-owns attribute when the autocomplete is no longer visible.
        if (this._trackedModal) {
            removeAriaReferencedId(this._trackedModal, 'aria-owns', this.panelId);
        }
    }

    /**
     * Updates the position of the autocomplete suggestion panel to ensure that it fits all options
     * within the viewport.
     */
    updatePosition(): void {
        if (this._overlayAttached) {
            this._overlayRef!.updatePosition();
        }
    }

    protected clearValue(): void {
        if (!this.canClear() || this.disabled() || this.readOnly()) {
            return;
        }
        if (this.multiple()) {
            this.value.set([]);
        } else {
            this.value.set(null);
        }
        this.onChangeCallback(this.value());
        this._stateChanges.next();
    }

    protected _handleKeydown(event: KeyboardEvent): void {
        if (this.disabled() || this.readOnly()) {
            return;
        }

        const key = event.key;
        const hasModifier = hasModifierKey(event);

        // Prevent the default action on all escape key presses. This is here primarily to bring IE
        // in line with other browsers. By default, pressing escape on IE will cause it to revert
        // the input value to the one that it had on focus, however it won't dispatch any events
        // which means that the model value will be out of sync with the view.
        if (key === 'Escape' && !hasModifier) {
            event.preventDefault();
            this._updateNativeInputValue("");
        }

        this._valueOnLastKeydown = this.input().nativeElement.value;


        if (this._valueOnLastKeydown === "" && (key === "Backspace" || key === "Delete")) {
            this.clearValue();
            event.preventDefault();
            return;
        }

        if (this.activeOption && key === 'Enter' && this.panelOpen && !hasModifier) {
            this.activeOption._selectViaInteraction();
            this._resetActiveItem();
            event.preventDefault();
        } else {
            const prevActiveItem = this._keyManager.activeItem;
            const isArrowKey = key === 'ArrowUp' || key === 'ArrowDown';

            if (key === 'Tab' || (isArrowKey && !hasModifier && this.panelOpen)) {
                this._keyManager.onKeydown(event);
            } else if (isArrowKey && this._canOpen()) {
                this._openPanelInternal(this._valueOnLastKeydown);
            }

            if (isArrowKey || this._keyManager.activeItem !== prevActiveItem) {
                this._scrollToOption(this._keyManager.activeItemIndex || 0);

                // if (this.autoSelectActiveOption && this.activeOption) {
                //     if (!this._pendingAutoselectedOption) {
                //         this._valueBeforeAutoSelection = this._valueOnLastKeydown;
                //     }
                //
                //     this._pendingAutoselectedOption = this.activeOption;
                //     this._assignOptionValue(this.activeOption.value);
                // }
            }
        }
    }

    protected _handleInput(event: Event): void {
        let target = event.target as HTMLInputElement;
        let value: string = target.value;
        this.input$.next(value);
        this._pendingAutoselectedOption = null;

        if (!value) {
            this._clearPreviousSelectedOption(null, false);
        }

        if (this._canOpen() && this._document.activeElement === event.target) {
            // When the `input` event fires, the input's value will have already changed. This means
            // that if we take the `this._element.nativeElement.value` directly, it'll be one keystroke
            // behind. This can be a problem when the user selects a value, changes a character while
            // the input still has focus and then clicks away (see #28432). To work around it, we
            // capture the value in `keydown` so we can use it here.
            const valueOnAttach = this._valueOnLastKeydown ?? this.input().nativeElement.value;
            this._valueOnLastKeydown = null;
            this._openPanelInternal(valueOnAttach);
        }
    }

    protected _handleFocus(): void {
        if (!this._canOpenOnNextFocus) {
            this._canOpenOnNextFocus = true;
        } else if (!this.disableOpeningWhenFocusedByKeyboard() && this._canOpen()) {
            this._attachOverlay();
        }
        this.checkFocus();
    }

    protected _handleBlur(): void {
        this.onTouchedCallback();
        this.checkFocus();
        this.renderer.setValue(this.input().nativeElement, "");
    }

    protected _handleClick(event: MouseEvent): void {
        if (this._canOpen() && !this.panelOpen) {
            event.stopPropagation();
            this._openPanelInternal();
        }
    }

    //
    // /**
    //  * In "auto" mode, the label will animate down as soon as focus is lost.
    //  * This causes the value to jump when selecting an option with the mouse.
    //  * This method manually floats the label until the panel can be closed.
    //  * @param shouldAnimate Whether the label should be animated when it is floated.
    //  */
    // private _floatLabel(shouldAnimate = false): void {
    //     if (this._formField && this._formField.floatLabel === 'auto') {
    //         if (shouldAnimate) {
    //             this._formField._animateAndLockLabel();
    //         } else {
    //             this._formField.floatLabel = 'always';
    //         }
    //
    //         this._manuallyFloatingLabel = true;
    //     }
    // }
    //
    // /** If the label has been manually elevated, return it to its normal state. */
    // private _resetLabel(): void {
    //     if (this._manuallyFloatingLabel) {
    //         if (this._formField) {
    //             this._formField.floatLabel = 'auto';
    //         }
    //         this._manuallyFloatingLabel = false;
    //     }
    // }
    //
    /**
     * This method listens to a stream of panel closing actions and resets the
     * stream every time the option list changes.
     */
    private _subscribeToClosingActions(): Subscription {
        const initialRender = new Observable(subscriber => {
            afterNextRender(
                () => {
                    subscriber.next(undefined);
                    subscriber.complete();
                },
                {injector: this._injector},
            );
        });
        const optionChanges = this.renderedOptions$.pipe(
            tap(() => this._positionStrategy?.reapplyLastPosition()),
            // Defer emitting to the stream until the next tick, because changing
            // bindings in here will cause "changed after checked" errors.
            delay(0),
        );

        // When the options are initially rendered, and when the option list changes...
        return (
            merge(initialRender, optionChanges)
                .pipe(
                    // create a new stream of panelClosingActions, replacing any previous streams
                    // that were created, and flatten it so our stream only emits closing events...
                    switchMap(() =>
                        this.zone.run(() => {
                            // `afterNextRender` always runs outside of the Angular zone, thus we have to re-enter
                            // the Angular zone. This will lead to change detection being called outside of the Angular
                            // zone and the `select.opened` will also emit outside of the Angular.
                            const wasOpen = this.panelOpen;
                            this._resetActiveItem();
                            this._updatePanelState();
                            this.cd.detectChanges();

                            if (this.panelOpen) {
                                this._overlayRef!.updatePosition();
                            }

                            if (wasOpen !== this.panelOpen) {
                                // If the `panelOpen` state changed, we need to make sure to emit the `opened` or
                                // `closed` event, because we may not have emitted it. This can happen
                                // - if the users opens the panel and there are no options, but the
                                //   options come in slightly later or as a result of the value changing,
                                // - if the panel is closed after the user entered a string that did not match any
                                //   of the available options,
                                // - if a valid string is entered after an invalid one.
                                if (this.panelOpen) {
                                    this.opened.emit();
                                } else {
                                    this.closed.emit();
                                }
                            }

                            return this.panelClosingActions;
                        }),
                    ),
                    // when the first closing event occurs...
                    take(1),
                )
                // set the value, close the panel, and complete.
                .subscribe(event => this._setValueAndClose(event))
        );
    }


    /** Destroys the autocomplete suggestion panel. */
    private _destroyPanel(): void {
        if (this._overlayRef) {
            this.closePanel();
            this._overlayRef.dispose();
            this._overlayRef = null;
        }
    }

    /** Given a value, returns the string that should be shown within the input. */
    protected getDisplayValue(value: T): T | string {
        if (isNotPresent(value)) {
            return "";
        }
        const displayWith = this.displayWith();
        return displayWith ? displayWith(value) : value;
    }

    protected _assignOptionValue(value: any): void {
        if (value == null) {
            this._clearPreviousSelectedOption(null, false);
        }
        this._updateNativeInputValue('');
    }

    protected _updateNativeInputValue(value: string): void {
        this.input().nativeElement.value = '';
        this.input$.next("");
    }


    /**
     * This method closes the panel, and if a value is specified, also sets the associated
     * control to that value. It will also mark the control as dirty if this interaction
     * stemmed from the user.
     */
    protected _setValueAndClose(event: MerOptionSelectionChange<T> | null): void {
        const toSelect = event ? event.source : this._pendingAutoselectedOption;
        if (toSelect) {
            this._clearPreviousSelectedOption(toSelect);
            this._assignOptionValue(toSelect.value);
            this.value.set(toSelect.value)
            // TODO(crisbeto): this should wait until the animation is done, otherwise the value
            // gets reset while the panel is still animating which looks glitchy. It'll likely break
            // some tests to change it at this point.
            this.onChangeCallback(toSelect.value);
            this._focused = true;
            this.input().nativeElement.focus();
            this._stateChanges.next();

        } else {
            this._clearPreviousSelectedOption(null);
            this._assignOptionValue(null);
            // // Wait for the animation to finish before clearing the form control value, otherwise
            // // the options might change while the animation is running which looks glitchy.
            // if (this.canClear()) {
            //     if (this._animationDone) {
            //         this._animationDone.pipe(take(1)).subscribe(() => {
            //             this.onChangeCallback(null)
            //             this.value.set(null);
            //         });
            //     } else {
            //         this.onChangeCallback(null);
            //         this.value.set(null);
            //     }
            // }
        }

        this.closePanel();
    }

    /**
     * Clear any previous selected option and emit a selection change event for this option
     */
    protected _clearPreviousSelectedOption(skip: MerOption | null, emitEvent?: boolean) {
        // Null checks are necessary here, because the autocomplete
        // or its options may not have been assigned yet.
        this.renderedOptions()?.forEach(option => {
            if (option !== skip && option.selected) {
                option.deselect(emitEvent);
            }
        });
    }

    protected _openPanelInternal(valueOnAttach = this.input().nativeElement.value) {
        this._attachOverlay();
        // Add aria-owns attribute when the autocomplete becomes visible.
        if (this._trackedModal) {
            addAriaReferencedId(this._trackedModal, 'aria-owns', this.panelId);
        }
    }

    private _attachOverlay(): void {
        let overlayRef = this._overlayRef;

        if (!overlayRef) {
            this._portal = new TemplatePortal(this.panelTemplate(), this._viewContainerRef, {
                id: this.panelId,
            });
            overlayRef = this._overlay.create(this._getOverlayConfig());
            this._overlayRef = overlayRef;
            this._viewportSubscription = this._viewportRuler.change().subscribe(() => {
                if (this.panelOpen && overlayRef) {
                    overlayRef.updateSize({width: this._getPanelWidth()});
                }
            });
        } else {
            // Update the trigger, panel width and direction, in case anything has changed.
            this._positionStrategy?.setOrigin(this._getConnectedElement());
            overlayRef.updateSize({width: this._getPanelWidth()});
        }

        if (overlayRef && !overlayRef.hasAttached()) {
            overlayRef.attach(this._portal);
            this._valueOnAttach = '';
            this._valueOnLastKeydown = null;
            this._closingActionsSubscription = this._subscribeToClosingActions();
        }

        const wasOpen = this.panelOpen;

        this._isOpen = this._overlayAttached = true;
        this._updatePanelState();
        this._applyModalPanelOwnership();

        // We need to do an extra `panelOpen` check in here, because the
        // autocomplete won't be shown if there are no options.
        if (this.panelOpen && wasOpen !== this.panelOpen) {
            this.opened.emit();
        }
        this._scrollToOption(this.getFirsSelectedOptionItemIndex());
    }

    protected getFirsSelectedOptionItemIndex(onlyEnabled: boolean = false): number {
        const value = this.value();
        const rendered = this.renderedOptions();
        if (isNotPresent(value) || !rendered.length) {
            return -1;
        }
        let v: T | null | undefined;
        if (Array.isArray(value)) {
            v = value[0]
        } else {
            v = value;
        }
        if (isNotPresent(value)) {
            return -1;
        }
        const compareWith = this.compareWith() ?? ((a, b) => a === b);
        return rendered.findIndex(option => {
            if (onlyEnabled && option.disabled) {
                return false;
            }
            return compareWith(option.value, v!);
        });
    }

    /** Handles keyboard events coming from the overlay panel. */
    private _handlePanelKeydown = (event: KeyboardEvent) => {
        // Close when pressing ESCAPE or ALT + UP_ARROW, based on the a11y guidelines.
        // See: https://www.w3.org/TR/wai-aria-practices-1.1/#textbox-keyboard-interaction
        if (
            (event.key === 'Escape' && !hasModifierKey(event)) ||
            (event.key === 'ArrowUp' && hasModifierKey(event, 'altKey'))
        ) {
            // If the user had typed something in before we autoselected an option, and they decided
            // to cancel the selection, restore the input value to the one they had typed in.
            if (this._pendingAutoselectedOption) {
                this._updateNativeInputValue(this._valueBeforeAutoSelection ?? '');
                this._pendingAutoselectedOption = null;
            }
            this._closeKeyEventStream.next();
            this._resetActiveItem();
            // We need to stop propagation, otherwise the event will eventually
            // reach the input itself and cause the overlay to be reopened.
            event.stopPropagation();
            event.preventDefault();
        }
    };


    /** Updates the panel's visibility state and any trigger state tied to id. */
    private _updatePanelState() {
        this._setVisibility();

        // Note that here we subscribe and unsubscribe based on the panel's visiblity state,
        // because the act of subscribing will prevent events from reaching other overlays and
        // we don't want to block the events if there are no options.
        if (this.panelOpen) {
            const overlayRef = this._overlayRef!;

            if (!this._keydownSubscription) {
                // Use the `keydownEvents` in order to take advantage of
                // the overlay event targeting provided by the CDK overlay.
                this._keydownSubscription = overlayRef.keydownEvents().subscribe(this._handlePanelKeydown);
            }

            if (!this._outsideClickSubscription) {
                // Subscribe to the pointer events stream so that it doesn't get picked up by other overlays.
                // TODO(crisbeto): we should switch `_getOutsideClickStream` eventually to use this stream,
                // but the behvior isn't exactly the same and it ends up breaking some internal tests.
                this._outsideClickSubscription = overlayRef.outsidePointerEvents().subscribe();
            }
        } else {
            this._keydownSubscription?.unsubscribe();
            this._outsideClickSubscription?.unsubscribe();
            this._keydownSubscription = this._outsideClickSubscription = null;
        }
    }

    private _getOverlayConfig(): OverlayConfig {
        return new OverlayConfig({
            positionStrategy: this._getOverlayPosition(),
            scrollStrategy: this._scrollStrategy(),
            width: this._getPanelWidth(),
            direction: this._dir ?? undefined,
            panelClass: this._defaults?.overlayPanelClass,
        });
    }

    private _getOverlayPosition(): PositionStrategy {
        const strategy = this._overlay
            .position()
            .flexibleConnectedTo(this._getConnectedElement())
            .withDefaultOffsetY(this.panelOffsetY())
            .withFlexibleDimensions(false)
            .withPush(false);

        this._setStrategyPositions(strategy);
        this._positionStrategy = strategy;
        return strategy;
    }

    /** Sets the positions on a position strategy based on the directive's input state. */
    private _setStrategyPositions(positionStrategy: FlexibleConnectedPositionStrategy) {
        // Note that we provide horizontal fallback positions, even though by default the dropdown
        // width matches the input, because consumers can override the width. See #18854.
        const belowPositions: ConnectedPosition[] = [
            {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top'},
            {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'},
        ];

        // The overlay edge connected to the trigger should have squared corners, while
        // the opposite end has rounded corners. We apply a CSS class to swap the
        // border-radius based on the overlay position.
        const panelClass = this._aboveClass;
        const abovePositions: ConnectedPosition[] = [
            {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', panelClass},
            {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', panelClass},
        ];

        let positions: ConnectedPosition[];

        if (this.position() === 'above') {
            positions = abovePositions;
        } else if (this.position() === 'below') {
            positions = belowPositions;
        } else {
            positions = [...belowPositions, ...abovePositions];
        }

        positionStrategy.withPositions(positions);
    }


    private _getPanelWidth(): number | string {
        return this.panelWidth() || this._getHostWidth();
    }

    /** Returns the width of the input element, so the panel width can match it. */
    private _getHostWidth(): number {
        return this._getConnectedElement().nativeElement.getBoundingClientRect().width;
    }

    private _getConnectedElement(): ElementRef<HTMLElement> {
        if (this.connectedTo()) {
            return this.connectedTo()!.elementRef;
        }

        return this.elemnentRef as any;
    }

    protected isOptionDisabled(opt: T): boolean {
        if (this.disableOptionPredicate()(opt)) {
            return true;
        }
        const compareWith = this.compareWith() ?? ((a, b) => a === b);
        return this.disabledOptions().some(item => compareWith(opt, item));
    }

    protected isOptionSelected(opt: T): boolean {
        const value = this.value();
        if (isNotPresent(value)) {
            return false;
        }
        const compareWith = this.compareWith() ?? ((a, b) => a === b);
        if (Array.isArray(value)) {
            return value.some(v => compareWith(v, opt));
        } else {
            return compareWith(value!, opt);
        }
    }

    /**
     * Reset the active item to -1. This is so that pressing arrow keys will activate the correct
     * option.
     *
     * If the consumer opted-in to automatically activatating the first option, activate the first
     * *enabled* option.
     */
    private _resetActiveItem(): void {
        const firstSelected = this.getFirsSelectedOptionItemIndex(true);
        if (firstSelected > -1) {
            this._keyManager.setActiveItem(firstSelected);
            this._scrollToOption(firstSelected);
            return;
        }

        if (this.autoActiveFirstOption()) {
            // Find the index of the first *enabled* option. Avoid calling `_keyManager.setActiveItem`
            // because it activates the first option that passes the skip predicate, rather than the
            // first *enabled* option.
            let firstEnabledOptionIndex = -1;
            const options = this.filteredOptions();
            for (let index = 0; index < options.length; index++) {
                const option = options[index];
                if (!this.isOptionDisabled(option)) {
                    firstEnabledOptionIndex = index;
                    break;
                }
            }
            this._keyManager.setActiveItem(firstEnabledOptionIndex);
        } else {
            this._keyManager.setActiveItem(-1);
        }
    }


    /** Determines whether the panel can be opened. */
    protected _canOpen(): boolean {
        return !this.disabled() && !this.readOnly();
    }

    /** Use defaultView of injected document if available or fallback to global window reference */
    protected _getWindow(): Window {
        return this._document?.defaultView || window;
    }

    /** Scrolls to a particular option in the list. */
    private _scrollToOption(index: number): void {
        // Given that we are not actually focusing active options, we must manually adjust scroll
        // to reveal options below the fold. First, we find the offset of the option from the top
        // of the panel. If that offset is below the fold, the new scrollTop will be the offset -
        // the panel height + the option height, so the active option will be just visible at the
        // bottom of the panel. If that offset is above the top of the visible panel, the new scrollTop
        // will become the offset. If that offset is visible within the panel already, the scrollTop is
        // not adjusted.

        const labelCount = _countGroupLabelsBeforeOption(
            index,
            this.renderedOptions(),
            this.renderedOptionGroups(),
        );

        if (index === 0 && labelCount === 1) {
            // If we've got one group label before the option and we're at the top option,
            // scroll the list to the top. This is better UX than scrolling the list to the
            // top of the option, because it allows the user to read the top group's label.
            this._setScrollTop(0);
        } else if (this.panel()) {
            const option = this.renderedOptions()[index];
            if (option) {
                const element = option._getHostElement();
                const newScrollPosition = _getOptionScrollPosition(
                    element.offsetTop,
                    element.offsetHeight,
                    this._getScrollTop(),
                    this.panel().nativeElement.offsetHeight,
                );

                this._setScrollTop(newScrollPosition);
            }
        }
    }

    /**
     * Sets the panel scrollTop. This allows us to manually scroll to display options
     * above or below the fold, as they are not actually being focused when active.
     */
    protected _setScrollTop(scrollTop: number): void {
        if (this.panel()) {
            this.panel().nativeElement.scrollTop = scrollTop;
        }
    }

    /** Returns the panel's scrollTop. */
    protected _getScrollTop(): number {
        return this.panel() ? this.panel().nativeElement.scrollTop : 0;
    }

    /**
     * If the autocomplete trigger is inside of an `aria-modal` element, connect
     * that modal to the options panel with `aria-owns`.
     *
     * For some browser + screen reader combinations, when navigation is inside
     * of an `aria-modal` element, the screen reader treats everything outside
     * of that modal as hidden or invisible.
     *
     * This causes a problem when the combobox trigger is _inside_ of a modal, because the
     * options panel is rendered _outside_ of that modal, preventing screen reader navigation
     * from reaching the panel.
     *
     * We can work around this issue by applying `aria-owns` to the modal with the `id` of
     * the options panel. This effectively communicates to assistive technology that the
     * options panel is part of the same interaction as the modal.
     *
     * At time of this writing, this issue is present in VoiceOver.
     * See https://github.com/angular/components/issues/20694
     */
    protected _applyModalPanelOwnership() {
        // TODO(http://github.com/angular/components/issues/26853): consider de-duplicating this with
        // the `LiveAnnouncer` and any other usages.
        //
        // Note that the selector here is limited to CDK overlays at the moment in order to reduce the
        // section of the DOM we need to look through. This should cover all the cases we support, but
        // the selector can be expanded if it turns out to be too narrow.
        const modal = this.input().nativeElement.closest(
            'body > .cdk-overlay-container [aria-modal="true"]',
        );

        if (!modal) {
            // Most commonly, the autocomplete trigger is not inside a modal.
            return;
        }


        if (this._trackedModal) {
            removeAriaReferencedId(this._trackedModal, 'aria-owns', this.panelId);
        }

        addAriaReferencedId(modal, 'aria-owns', this.panelId);
        this._trackedModal = modal;
    }

    // /** Clears the references to the listbox overlay element from the modal it was added to. */
    private _clearFromModal() {
        if (this._trackedModal) {
            removeAriaReferencedId(this._trackedModal, 'aria-owns', this.panelId);
            this._trackedModal = null;
        }
    }

}
