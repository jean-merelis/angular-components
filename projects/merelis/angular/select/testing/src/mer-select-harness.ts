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

import { BaseHarnessFilters, ComponentHarness, HarnessPredicate, TestElement, TextOptions } from "@angular/cdk/testing"
import { SelectOptionHarnessFilters, MerSelectOptionHarness } from "./mer-select-option-harness";

export interface MerSelectHarnessFilters extends BaseHarnessFilters {
    testid?: string | RegExp;
    disabled?: boolean;
}



export class MerSelectHarness extends ComponentHarness {
    static hostSelector = 'mer-select';
    private _documentRootLocator = this.documentRootLocatorFactory();

    static with(options: MerSelectHarnessFilters): HarnessPredicate<MerSelectHarness> {
        return new HarnessPredicate(MerSelectHarness, options)
            .addOption('testid', options.testid,
                (harness, text) => HarnessPredicate.stringMatches(harness.getTestid(), text))
            .addOption('isDisabled', options.disabled,
               async (harness, disabled) => (await harness.isDisabled()) === disabled )

            ;
    }


    private getInputElement = this.locatorFor('input.mer-select-input');
    private getClearIcon = this.locatorFor('.chevron-wrapper');
    private getSelectTrigger = this.locatorFor('.mer-select-trigger');

    async getTestid(): Promise<string | null> {
        return (await this.host()).getAttribute("data-testid");
    }

    async click(): Promise<void> {
        return (await this.getInputElement()).click();
    }

    async clickOnClearIcon(): Promise<void> {
        return (await this.getClearIcon()).click();
    }

    async focus(): Promise<void> {
        const el = await this.getInputElement();
        return el.focus();
    }

    async blur(): Promise<void> {
        return (await this.getInputElement()).blur();
    }

    async isFocused(): Promise<boolean> {
        return (await this.host()).hasClass("focused");
    }

    async getValue(options?: TextOptions): Promise<string> {
        const t =await this.getSelectTrigger();
        if (options) {
            return t.text(options);
        }
        return t.text();
    }

    async isDisabled(): Promise<boolean> {
        return (await this.host()).hasClass("disabled");
    }

    async getSearchText(): Promise<string> {
        return (await this.getInputElement()).getProperty('value');
    }

    async setTextSearch(value: string): Promise<void> {
        const elem = await this.getInputElement();
        await elem.focus();
        await elem.clear();
        await elem.sendKeys(value);
        await elem.setInputValue(value);
    }

    /** Whether the autocomplete is open. */
    async isOpen(): Promise<boolean> {
        const panel = await this._getPanel();
        return !!panel && (await panel.hasClass(`mer-select-panel-visible`));
    }

    /** Gets the options inside the autocomplete panel. */
    async getOptions(filters?: Omit<SelectOptionHarnessFilters, 'ancestor'>): Promise<MerSelectOptionHarness[]> {
        if (!(await this.isOpen())) {
            throw new Error('Unable to retrieve options for select. Select panel is closed.');
        }

        return this._documentRootLocator.locatorForAll(
            MerSelectOptionHarness.with({
                ...(filters || {}),
                ancestor: await this._getPanelSelector(),
            } as SelectOptionHarnessFilters),
        )();
    }


    /** Clicks the options matching the given filters. */
    async clickOptions(filters: SelectOptionHarnessFilters): Promise<void> {
        await this.focus();
        await this.click();
        const options = await this.getOptions(filters);
        if (!options.length) {
            throw Error(`Could not find a mer-option matching ${JSON.stringify(filters)}`);
        }
        for (const option of options) {
          await option.click();
        }
    }

    /** Gets the selector that can be used to find the autocomplete trigger's panel. */
    protected async _getPanelSelector(): Promise<string> {
        return`#${await (await this.host()).getAttribute('aria-controls')}`;
    }

    /** Gets the panel associated with this autocomplete trigger. */
    private async _getPanel(): Promise<TestElement | null> {
        // Technically this is static, but it needs to be in a
        // function, because the autocomplete's panel ID can changed.
        return this._documentRootLocator.locatorForOptional(await this._getPanelSelector())();
    }
}
