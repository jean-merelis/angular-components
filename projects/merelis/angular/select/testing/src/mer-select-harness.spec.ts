import { OverlayModule } from "@angular/cdk/overlay";
import {Component} from '@angular/core';

import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { MerSelectModule } from "../../select.module";
import { MerSelectHarness } from "./mer-select-harness";

describe('MerSelectHarness', () => {
    let fixture: ComponentFixture<MerSelectHarnessTest>;
    let loader: HarnessLoader;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MerSelectHarnessTest],
            providers: [provideNoopAnimations()]
        }).compileComponents();

        fixture = TestBed.createComponent(MerSelectHarnessTest);
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
    });


    it('should get disabled state', async () => {
        const enabled = await loader.getHarness(MerSelectHarness.with({selector: '#plain'}));
        const disabled = await loader.getHarness(MerSelectHarness.with({testid: 'disabled-select'}));

        expect(await enabled.isDisabled()).toBe(false);
        expect(await disabled.isDisabled()).toBe(true);
    });

    it('should filter by whether an autocomplete is disabled', async () => {
        const enabledInputs = await loader.getAllHarnesses(
            MerSelectHarness.with({disabled: false}),
        );
        const disabledInputs = await loader.getAllHarnesses(
            MerSelectHarness.with({disabled: true}),
        );
        expect(enabledInputs.length).toBe(1);
        expect(disabledInputs.length).toBe(1);
    });

    it('should focus and blur an input', async () => {
        const input = await loader.getHarness(MerSelectHarness.with({selector: '#plain'}));
        expect(await input.isFocused()).toBe(false);
        await input.focus();
        expect(await input.isFocused()).toBe(true);
        await input.blur();
        expect(await input.isFocused()).toBe(false);
    });

    it('should be able to type in an input', async () => {
        const input = await loader.getHarness(MerSelectHarness.with({selector: '#plain'}));
        await input.setTextSearch('Hello there');
        expect(await input.getSearchText()).toBe('Hello there');
    });

    it('should be able to clear the input', async () => {
        const input = await loader.getHarness(MerSelectHarness.with({selector: '#plain'}));
        await input.setTextSearch('New York');
        await input.clickOnClearIcon();
        expect(await input.getValue()).toBe('');
    });

    it('should be able to get the autocomplete panel options', fakeAsync(async () => {
        const input = await loader.getHarness(MerSelectHarness.with({selector: '#plain'}));
        await input.focus();
        await input.click();
        flush();
        const options = await input.getOptions();

        expect(options.length).toBe(11);
        expect(await options[5].getText()).toBe('New York');
    }));

    it('should be able to get filtered options', async () => {
        const input = await loader.getHarness(MerSelectHarness.with({selector: '#plain'}));
        await input.focus();
        const options = await input.getOptions({text: /New/});

        expect(options.length).toBe(1);
        expect(await options[0].getText()).toBe('New York');
    });


    it('should be able to get whether the autocomplete is open', async () => {
        const input = await loader.getHarness(MerSelectHarness.with({selector: '#plain'}));

        expect(await input.isOpen()).toBe(false);
        await input.focus();
        expect(await input.isOpen()).toBe(true);
    });

    it('should be able to click on options', async () => {
        const input = await loader.getHarness(MerSelectHarness.with({selector: '#plain'}));
        await input.clickOptions({text: 'New York'});
        expect(await input.getValue()).toBe('New York');
    });
});

@Component({
    template: `
    <mer-select id="plain"
        [dataSource]="states"
        [displayWith]="displayWith"
        [compareWith]="compareWith"
    >
    </mer-select>

    <mer-select
        data-testid="disabled-select"
        [disabled]="true"
        [dataSource]="states"
                [displayWith]="displayWith"
                [compareWith]="compareWith"
    >
    </mer-select>
  `,
    imports: [MerSelectModule],
})
class MerSelectHarnessTest {
    states = [
        {code: 'AL', name: 'Alabama'},
        {code: 'CA', name: 'California'},
        {code: 'FL', name: 'Florida'},
        {code: 'KS', name: 'Kansas'},
        {code: 'MA', name: 'Massachusetts'},
        {code: 'NY', name: 'New York'},
        {code: 'OR', name: 'Oregon'},
        {code: 'PA', name: 'Pennsylvania'},
        {code: 'TN', name: 'Tennessee'},
        {code: 'VA', name: 'Virginia'},
        {code: 'WY', name: 'Wyoming'},
    ];

    protected displayWith(state: any): string {
        return state.name;
    }

    protected compareWith(a: any, b: any): boolean {
        return a?.code === b?.code;
    }
}
