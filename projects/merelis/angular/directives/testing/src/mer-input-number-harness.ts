import { BaseHarnessFilters, ComponentHarness, HarnessPredicate, TextOptions } from "@angular/cdk/testing"

export interface MerInputNumberHarnessFilters extends BaseHarnessFilters {
    testid?: string | RegExp;
    disabled?: boolean;
    readOnly?: boolean;
}


export class MerInputNumberHarness extends ComponentHarness {
    static hostSelector = 'input[merInputNumber]';

    static with(options: MerInputNumberHarnessFilters): HarnessPredicate<MerInputNumberHarness> {
        return new HarnessPredicate(MerInputNumberHarness, options)
            .addOption('testid', options.testid,
                (harness, text) => HarnessPredicate.stringMatches(harness.getTestid(), text))
            .addOption('isDisabled', options.disabled,
                async (harness, disabled) => (await harness.isDisabled()) === disabled)
            .addOption('isReadOnly', options.readOnly,
                async (harness, readOnly) => (await harness.isReadOnly()) === readOnly)
            ;
    }

    async getTestid(): Promise<string | null> {
        return (await this.host()).getAttribute("data-testid");
    }

    async click(): Promise<void> {
        return (await this.host()).click();
    }

    async focus(): Promise<void> {
        return (await this.host()).focus();
    }

    async blur(): Promise<void> {
        return (await this.host()).blur();
    }

    async isFocused(): Promise<boolean> {
        return (await this.host()).isFocused();
    }

    async isDisabled(): Promise<boolean> {
        const value = await (await this.host()).getAttribute('disabled');
        return value !== null && value !== undefined && value !== 'false';
    }

    async isReadOnly(): Promise<boolean> {
        const value = await (await this.host()).getAttribute('readonly');
        return value !== null && value !== undefined && value !== 'false';
    }

    async getValue(options?: TextOptions): Promise<string> {
        const t = await this.host();
        if (options) {
            return t.text(options);
        }
        return t.text();
    }

    async setValue(value: string): Promise<void> {
        const elem = await this.host();
        await elem.clear();
        await elem.sendKeys(value);
        await elem.setInputValue(value);
    }
}
