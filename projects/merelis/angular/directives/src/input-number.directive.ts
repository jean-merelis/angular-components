import { DecimalPipe, PercentPipe } from "@angular/common";
import {
    booleanAttribute,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    HostListener,
    inject,
    input,
    LOCALE_ID,
    model,
    OnInit,
    Renderer2
} from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ValueValidators } from "../../../angular/utils";
import { isBlank, isNotPresent, isPresent, noop } from "../../../utils";


function getNumberSeparators(locale?: string) {
    const numberWithGroupAndDecimal = 1234.5;
    const parts = new Intl.NumberFormat(locale).formatToParts(numberWithGroupAndDecimal);
    return {
        decimal: parts.find(part => part.type === 'decimal')?.value ?? '.',
        group: parts.find(part => part.type === 'group')?.value ?? ','
    };
}

export const MER_INPUT_NUMBER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MerInputNumberDirective),
    multi: true
};

@Directive({
    selector: "[merInputNumber]",
    providers: [MER_INPUT_NUMBER_VALUE_ACCESSOR,
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => MerInputNumberDirective),
            multi: true
        }
    ]
})
export class MerInputNumberDirective implements ControlValueAccessor, OnInit {
    protected _renderer = inject(Renderer2);
    protected _elementRef = inject(ElementRef);
    protected _locale = inject(LOCALE_ID);

    validateFn: any;
    readonly digits = model("1.0-8");
    readonly locale = input<string>();
    readonly valueAsString = input(false, {transform: booleanAttribute});
    readonly integer = input(false, {transform: booleanAttribute});
    readonly isPercentage = input(false, {transform: booleanAttribute});

    protected _value: number | string | null = null;
    protected _numberPipe: DecimalPipe;
    protected _percentagePipe: PercentPipe;
    protected _onTouchedCallback: () => void = noop;
    protected _onChangeCallback: (_: any) => void = noop;
    protected separators!: { group: string, decimal: string };

    constructor() {
        this._numberPipe = new DecimalPipe(this._locale);
        this._percentagePipe = new PercentPipe(this._locale);
        effect(() => {
            if (this.integer()) {
                this._renderer.setProperty(this._elementRef.nativeElement, "inputmode", "numeric");
            } else {
                this._renderer.setProperty(this._elementRef.nativeElement, "inputmode", "decimal");
            }
        });
        effect(() => {
            const locale = this.locale() ?? this._locale;
            this.separators = getNumberSeparators(locale);
            this._numberPipe = new DecimalPipe(locale);
        });
        effect(() => {
            this.isPercentage();
            this._toValue();
        });
    }

    ngOnInit(): void {
        this._renderer.setProperty(this._elementRef.nativeElement, "autocomplete", "off");
    }

    ngOnDestroy(): void {
    }


    validate(c: FormControl): any {
        return ValueValidators.numeric(c.value);
    }


    setDisabledState(isDisabled: boolean): void {
        this._renderer.setProperty(this._elementRef.nativeElement, "disabled", isDisabled);
    }

    writeValue(value: number | string | null): void {
        if (isPresent(value)) {
            this._value = value;
        } else {
            this._value = null;
        }

        const normalizedValue = this._value === null ? "" : this.format(this._value);
        this._writeViewValue(normalizedValue ?? "");
    }

    protected _writeViewValue(v: string): void {
        this._renderer.setProperty(this._elementRef.nativeElement, "value", v);
    }

    @HostListener("keydown.enter", ["$event"])
    onEnterKeyDown(evt: KeyboardEvent): void {
        if (!(this._elementRef.nativeElement as HTMLInputElement).disabled
            && !(this._elementRef.nativeElement as HTMLInputElement).readOnly) {
            this._toValue();
        }
    }

    @HostListener("blur", ["$event"])
    onBlur(event: Event): void {
        if (!(this._elementRef.nativeElement as HTMLInputElement).disabled
            && !(this._elementRef.nativeElement as HTMLInputElement).readOnly) {
            this._toValue(true);
        }
        this._onTouchedCallback();
    }


    protected _toValue(writeToViewValue: boolean = true): void {
        let viewValue = (this._elementRef.nativeElement as HTMLInputElement).value;
        viewValue = (viewValue || "").trim();
        if (isBlank(viewValue)) {
            if (isPresent(this._value)) {
                this._value = null;
                this._onChangeCallback(null);
            }
            return;
        }
        if (this.isPercentage()) {
            viewValue = viewValue.replace("%", "");
        }

        const separated = viewValue.split(this.separators.group).join("").split(this.separators.decimal);
        let v: any = NaN;
        if (separated.length < 3) {
            let s = separated.join(".");

            // eslint-disable-next-line
            if (/[\+]?([\-]?([0-9]{1,})?[\.]?[0-9]{1,})/.test(s)) {
                v = Number(s);

                if (!isNaN(v)) {
                    if (this.isPercentage() && isPresent(v)) {
                        v = v / 100;
                    }
                    viewValue = this.format(v);
                    if (writeToViewValue) {
                        this._writeViewValue(viewValue);
                    }
                    // converter novamente para aplicar os aredondamentos do pipe...
                    if (this.isPercentage()) {
                        viewValue = viewValue.replace("%", "");
                    }
                    s = viewValue.split(this.separators.group).join("").split(this.separators.decimal).join(".");
                    v = parseFloat(s);
                    if (this.isPercentage() && isPresent(v)) {
                        v = v / 100;
                    }
                }
            }
        }

        if (isNaN(v)) {
            v = (this._elementRef.nativeElement as HTMLInputElement).value;
        }

        if (this.valueAsString()) {
            v = v.toString();
        }


        if (v !== this._value) {
            this._value = v;
            this._onChangeCallback(v);
        }

    }


    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {
        this._onTouchedCallback = fn;
    }

    protected format(value: number | string): string {
        if (isNotPresent(value)) {
            return "";
        }
        if (isNaN(Number(value))) {
            return String(value);
        }
        return (this.isPercentage() ?
            this._percentagePipe.transform(value, this.digits())
            : this._numberPipe.transform(value, this.digits())) ?? "";
    }

}
