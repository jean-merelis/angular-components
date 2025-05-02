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


export interface SelectAllOptionHarnessFilters extends BaseHarnessFilters {
}

/** Harness for interacting with a `.mer-select-all-options` in tests. */
export class MerSelectAllOptionHarness extends ContentContainerComponentHarness {
    /** Selector used to locate option instances. */
    static hostSelector = '.mer-select-all-options';

    /**
     * Gets a `HarnessPredicate` that can be used to search for an option with specific attributes.
     * @param options Options for filtering which option instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options: SelectAllOptionHarnessFilters = {},): HarnessPredicate<MerSelectAllOptionHarness> {
        return new HarnessPredicate(this, options);
    }

    /** Clicks the option. */
    async click(): Promise<void> {
        return (await this.host()).click();
    }

    /** Gets the option's label text. */
    async getText(): Promise<string> {
        return (await this.host()).text()
    }
}
