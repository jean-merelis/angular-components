import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MerInputNumberHarness } from "../testing";
import { MerInputNumberDirective } from "./input-number.directive";


describe('MerInputNumberDirective', () => {
    let fixture: ComponentFixture<MerInputDirectiveTest>;
    let loader: HarnessLoader;
    let component: MerInputDirectiveTest;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MerInputDirectiveTest],
        }).compileComponents();

        fixture = TestBed.createComponent(MerInputDirectiveTest);
        component = fixture.componentInstance;
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
    });


    it('should get disabled state', async () => {
        const enabled = await loader.getHarness(MerInputNumberHarness.with({testid: 'plain'}));
        const disabled = await loader.getHarness(MerInputNumberHarness.with({testid: 'disabled'}));

        expect(await enabled.isDisabled()).toBe(false);
        expect(await disabled.isDisabled()).toBe(true);
    });

    it('should get readonly state', async () => {
        const writableInput = await loader.getHarness(MerInputNumberHarness.with({testid: 'plain'}));
        const readOnlyInput = await loader.getHarness(MerInputNumberHarness.with({testid: 'readonly'}));

        expect(await writableInput.isReadOnly()).toBe(false);
        expect(await readOnlyInput.isReadOnly()).toBe(true);
    });

    it('should format input as percentage', async () => {
        const percentageInput = await loader.getHarness(MerInputNumberHarness.with({testid: 'percentage'}));

        await percentageInput.setValue('50');
        await percentageInput.blur();

        // Check if the input value is formatted as percentage
        const inputElement = fixture.nativeElement.querySelector('[data-testid="percentage"]');
        expect(inputElement.value).toBe('50%');
        expect(component.percentage).toBe(0.5);
    });

    it('should format input with specified digits', async () => {
        const twoDigitsInput = await loader.getHarness(MerInputNumberHarness.with({testid: 'two-digits'}));

        await twoDigitsInput.setValue('10.5');
        await twoDigitsInput.blur();

        // Check if the input value is formatted with 2 decimal places
        const inputElement = fixture.nativeElement.querySelector('[data-testid="two-digits"]');
        expect(inputElement.value).toBe('10.50');
    });


    it('should update template-driven form model', async () => {
        const templateFormInput = await loader.getHarness(MerInputNumberHarness.with({testid: 'withTemplateForm'}));

        await templateFormInput.setValue('20.0');

        expect(component.withTemplateForm).toBe(20);
    });

    it('should update reactive form model', async () => {
        const reactiveFormInput = await loader.getHarness(MerInputNumberHarness.with({testid: 'withFormControl'}));

        await reactiveFormInput.setValue('30.50');
        await reactiveFormInput.blur();

        expect(component.withFormControl.value).toBe(30.5);
    });

    it('should update model only on blur when configured', async () => {
        const updateOnBlurInput = await loader.getHarness(MerInputNumberHarness.with({testid: 'withTemplateFormUpdateOnBlur'}));

        // Set initial value
        component.withTemplateFormOnBlur = 10;
        fixture.detectChanges();

        // get focus
        await updateOnBlurInput.focus();

        // Change value but don't blur
        await updateOnBlurInput.setValue('25');

        // Value should not be updated yet
        expect(component.withTemplateFormOnBlur).toBe(10);

        // Now blur the input
        await updateOnBlurInput.blur();

        // Value should be updated after blur
        expect(component.withTemplateFormOnBlur).toBe(25);
    });

    it('should handle invalid input', async () => {
        const plainInput = await loader.getHarness(MerInputNumberHarness.with({testid: 'withFormControl'}));

        // Try to set an invalid value
        await plainInput.setValue('abc');

        // Input should be empty or unchanged
        const inputElement = fixture.nativeElement.querySelector('[data-testid="withFormControl"]');
        expect(inputElement.value).toBe('abc');

        expect(component.withFormControl.invalid).toBe(true);
    });

    it('should return value as string when valueAsString is set', async () => {
        // Get the input with valueAsString attribute
        const valueAsStringInput = await loader.getHarness(MerInputNumberHarness.with({testid: 'valueAsString'}));

        // Set a numeric value
        await valueAsStringInput.setValue('42.5');

        // Check if the value is a string
        expect(typeof component.stringValueControl.value).toBe('string');
        expect(component.stringValueControl.value).toBe('42.5');
    });
});

@Component({
    template: `
        <input data-testid="plain" merInputNumber/>
        <input data-testid="disabled" merInputNumber disabled/>
        <input data-testid="readonly" merInputNumber readonly/>
        <input data-testid="percentage" merInputNumber isPercentage [(ngModel)]="percentage"/>
        <input data-testid="two-digits" merInputNumber digits="1.2-2"/>
        <input data-testid="integer" merInputNumber inputModeInteger/>
        <input data-testid="valueAsString" merInputNumber valueAsString [formControl]="stringValueControl"/>
        <input data-testid="withTemplateForm" merInputNumber [(ngModel)]="withTemplateForm"/>
        <input data-testid="withFormControl" merInputNumber [formControl]="withFormControl"/>
        <input data-testid="withTemplateFormUpdateOnBlur" merInputNumber merInputNumberUpdateOn="blur"
               [(ngModel)]="withTemplateFormOnBlur"/>
        <input data-testid="withFormControlUpdateOnBlur" merInputNumber merInputNumberUpdateOn="blur"
               [formControl]="withFormControlOnBlur"/>
    `,
    imports: [MerInputNumberDirective, FormsModule, ReactiveFormsModule],
})
class MerInputDirectiveTest {

    percentage = 0;
    withTemplateForm = 10;
    withTemplateFormOnBlur = 10;
    withFormControl = new FormControl(10.5);
    withFormControlOnBlur = new FormControl(10.5);
    stringValueControl = new FormControl();

}
