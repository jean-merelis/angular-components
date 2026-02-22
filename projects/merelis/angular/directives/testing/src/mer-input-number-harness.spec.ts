import {Component} from '@angular/core';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MerInputNumberDirective } from "@merelis/angular/directives";
import { MerInputNumberHarness } from "./mer-input-number-harness";

describe('MerInputNumberHarness', () => {
    let fixture: ComponentFixture<MerInputHarnessTest>;
    let loader: HarnessLoader;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MerInputHarnessTest],
        }).compileComponents();

        fixture = TestBed.createComponent(MerInputHarnessTest);
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

});

@Component({
    template: `
    <input data-testid="plain" merInputNumber />
    <input data-testid="disabled" merInputNumber disabled />
    <input data-testid="readonly" merInputNumber readonly />
    <input data-testid="percentage" merInputNumber isPercentage />
    <input data-testid="two-digits" merInputNumber digits="1.2-2" />
    <input data-testid="integer" merInputNumber inputModeInteger />
    <input data-testid="withTemplateForm" merInputNumber [(ngModel)]="withTemplateForm" />
    <input data-testid="withFormControl" merInputNumber [formControl]="formControl" />
    <input data-testid="withTemplateFormUpdateOnBlur" merInputNumber merInputNumberUpdateOn="blur" [(ngModel)]="withTemplateForm" />
    <input data-testid="withFormControlUpdateOnBlur" merInputNumber merInputNumberUpdateOn="blur" [formControl]="formControl" />
  `,
    imports: [MerInputNumberDirective, FormsModule, ReactiveFormsModule],
})
class MerInputHarnessTest {


    withTemplateForm = 10;
    formControl = new FormControl(10.5);

}
