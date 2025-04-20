import { NgModule } from '@angular/core';
import { MerOption, MerOptionGroup } from "./option";
import {
    MerSelectComponent,
    MerSelectMultiActionsDef,
    MerSelectOptionDef,
    MerSelectPanelOrigin,
    MerSelectTriggerDef
} from "./select";

@NgModule({
    imports: [
        MerSelectPanelOrigin, MerSelectTriggerDef, MerSelectOptionDef, MerSelectComponent,
        MerOption, MerOptionGroup, MerSelectMultiActionsDef
    ],
    exports: [
        MerSelectPanelOrigin, MerSelectTriggerDef, MerSelectOptionDef, MerSelectComponent,
        MerOption, MerOptionGroup, MerSelectMultiActionsDef
    ]
})
export class MerSelectModule {

}
