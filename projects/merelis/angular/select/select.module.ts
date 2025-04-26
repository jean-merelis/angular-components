import { NgModule } from '@angular/core';
import { MerOption, MerOptionGroup } from "./option";
import {
    MerSelect,
    MerSelectMultiActionsDef,
    MerSelectOptionDef,
    MerSelectPanelOrigin,
    MerSelectTriggerDef
} from "./select";

@NgModule({
    imports: [
        MerSelectPanelOrigin, MerSelectTriggerDef, MerSelectOptionDef, MerSelect,
        MerOption, MerOptionGroup, MerSelectMultiActionsDef
    ],
    exports: [
        MerSelectPanelOrigin, MerSelectTriggerDef, MerSelectOptionDef, MerSelect,
        MerOption, MerOptionGroup, MerSelectMultiActionsDef
    ]
})
export class MerSelectModule {

}
