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
    BaseHarnessFilters,
    ContentContainerComponentHarness,
    HarnessPredicate,
} from '@angular/cdk/testing';


export interface SelectOptionHarnessFilters extends BaseHarnessFilters {
    text?: string | RegExp;
    isSelected?: boolean;
}

/** Harness for interacting with a `mat-option` in tests. */
export class MerSelectOptionHarness extends ContentContainerComponentHarness {
    /** Selector used to locate option instances. */
    static hostSelector = '.mer-option';

    /** Element containing the option's text. */
    private _text = this.locatorFor('.mer-option-label');

    /**
     * Gets a `HarnessPredicate` that can be used to search for an option with specific attributes.
     * @param options Options for filtering which option instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options: SelectOptionHarnessFilters = {},): HarnessPredicate<MerSelectOptionHarness> {
        return new HarnessPredicate(this, options)
            .addOption('text', options.text, async (harness, title) =>
                HarnessPredicate.stringMatches(await harness.getText(), title),
            )
            .addOption(
                'isSelected',
                options.isSelected,
                async (harness, isSelected) => (await harness.isSelected()) === isSelected,
            );
    }

    /** Clicks the option. */
    async click(): Promise<void> {
        return (await this.host()).click();
    }

    /** Gets the option's label text. */
    async getText(): Promise<string> {
        return (await this._text()).text();
    }

    /** Gets whether the option is disabled. */
    async isDisabled(): Promise<boolean> {
        return (await this.host()).hasClass('mer-option-disabled');
    }

    /** Gets whether the option is selected. */
    async isSelected(): Promise<boolean> {
        return (await this.host()).hasClass('mer-option-selected');
    }

    /** Gets whether the option is active. */
    async isActive(): Promise<boolean> {
        return (await this.host()).hasClass('mer-option-active');
    }

    /** Gets whether the option is in multiple selection mode. */
    async isMultiple(): Promise<boolean> {
        return (await this.host()).hasClass('mer-option-multiple');
    }
}
