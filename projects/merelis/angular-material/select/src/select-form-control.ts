import {
    afterNextRender,
    AfterViewInit,
    booleanAttribute,
    DestroyRef,
    Directive, EnvironmentInjector,
    inject,
    Injector,
    input,
    Input,
    OnDestroy,
    OnInit
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroupDirective, NgControl, NgForm } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { MAT_FORM_FIELD, MatFormFieldControl } from "@angular/material/form-field";
import { MerSelect } from "@merelis/angular/select";
import { Observable, Subject } from "rxjs";


@Directive({
    selector: "mer-select[merSelectFormField]",
    standalone: true,
    providers: [{provide: MatFormFieldControl, useExisting: MerSelectFormFieldControl}],
})
export class MerSelectFormFieldControl<T> implements MatFormFieldControl<T>, OnInit, OnDestroy, AfterViewInit {
    readonly errorStateMatcher = input<ErrorStateMatcher>();
    protected select: MerSelect<T> = inject(MerSelect<T>, {host: true});
    protected matFormField = inject(MAT_FORM_FIELD, {host: true});
    protected destroyRef = inject(DestroyRef);
    protected parentFormGroup = inject(FormGroupDirective, {optional: true});
    protected parentForm = inject(NgForm, {optional: true});
    protected defaultErrorStateMatcher = inject(ErrorStateMatcher);
    protected injector = inject(EnvironmentInjector);

    ngOnInit() {
        this.select._floatLabel = this.matFormField.floatLabel === 'always';
        this.select.inMatFormField = true;
        this.select.stateChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                afterNextRender(() => {
                    this.updateErrorState();
                    this._stateChanges.next()
                }, {injector: this.injector})
            });
    }

    ngOnDestroy() {
        this._stateChanges.complete();
    }


    ngAfterViewInit(): void {
        this.select.connectedTo.set({elementRef: this.matFormField.getConnectedOverlayOrigin()});
        this.select.updatePosition();
    }

    get value(): T | null {
        return this.select.value() as any;
    }

    set value(value) {
        this.select.value.set(value)
    }

    /**
     * Stream that emits whenever the state of the control changes such that the parent `MatFormField`
     * needs to run change detection.
     */
    protected readonly _stateChanges = new Subject<void>();
    get stateChanges(): Observable<void> {
        return this._stateChanges.asObservable();
    }

    /** The element ID for this control. */
    get id(): string {
        return this.select.id;
    }

    @Input() placeholder: string = '';

    /** The placeholder for this control. */
    // get placeholder(): string {
    //     return this.select.placeholder() ?? "";
    // }

    /** Gets the AbstractControlDirective for this control. */
    readonly ngControl = inject(NgControl, {optional: true});

    /** Whether the control is focused. */
    get focused(): boolean {
        return this.select.focused;
    }

    /** Whether the control is empty. */
    get empty(): boolean {
        return this.select.empty
    }

    /** Whether the `MatFormField` label should try to float. */
    get shouldLabelFloat(): boolean {
        return this.select.isOpen || !this.empty || (this.focused && !!this.placeholder);
    }

    /** Whether the control is required. */
    @Input({transform: booleanAttribute}) required: boolean = false;

    /** Whether the control is disabled. */
    get disabled(): boolean {
        return this.select.disabled();
    }

    /** Whether the control is in an error state. */
    protected _errorState = false
    get errorState(): boolean {
        return this._errorState;
    }

    /**
     * An optional name for the control type that can be used to distinguish `mat-form-field` elements
     * based on their control type. The form field will add a class,
     * `mat-form-field-type-{{controlType}}` to its root element.
     */
    readonly controlType = "mer-select";
    /**
     * Whether the input is currently in an autofilled state. If property is not present on the
     * control it is assumed to be false.
     */
    readonly autofilled?: boolean;
    /**
     * Value of `aria-describedby` that should be merged with the described-by ids
     * which are set by the form-field.
     */
    readonly userAriaDescribedBy?: string;
    /**
     * Whether to automatically assign the ID of the form field as the `for` attribute
     * on the `<label>` inside the form field. Set this to true to prevent the form
     * field from associating the label with non-native elements.
     */
    readonly disableAutomaticLabeling?: boolean;

    /** Sets the list of element IDs that currently describe this control. */
    setDescribedByIds(ids: string[]): void {

    }

    /** Handles a click on the control's container. */
    onContainerClick(event: MouseEvent): void {
        if (!this.focused) {
            this.select.focus();
        }
    }

    private updateErrorState(): void {
        const oldState = this.errorState;
        const parent = this.parentFormGroup || this.parentForm;
        const matcher = this.errorStateMatcher() || this.defaultErrorStateMatcher;
        const control = this.ngControl ? this.ngControl.control as FormControl : null;
        const newState = matcher.isErrorState(control, parent ?? null);
        if (newState !== oldState) {
            this._errorState = newState;
            this._stateChanges.next();
        }
    }

    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();

        }

        // We need to dirty-check and set the placeholder attribute ourselves, because whether it's
        // present or not depends on a query which is prone to "changed after checked" errors.
        //  this._dirtyCheckPlaceholder();
    }


    // private _previousPlaceholder?: string | null;
    // /** Does some manual dirty checking on the native input `placeholder` attribute. */
    // private _dirtyCheckPlaceholder() {
    //     const placeholder = this._getPlaceholder();
    //     if (placeholder !== this._previousPlaceholder) {
    //         this.select.placeholder.set(placeholder);
    //         this._previousPlaceholder = placeholder;
    //         // placeholder
    //         //     ? element.setAttribute('placeholder', placeholder)
    //         //     : element.removeAttribute('placeholder');
    //     }
    // }

    // /** Gets the current placeholder of the form field. */
    // protected _getPlaceholder(): string | null {
    //     return this.placeholder || null;
    // }

}
