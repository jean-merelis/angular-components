import { NgModule } from '@angular/core';
import { MerOption, MerOptionGroup } from "./option";
import { MerSelectComponent, MerSelectOptionDef, MerSelectPanelOrigin, MerSelectTriggerDef } from "./select";

@NgModule({
    imports: [
        MerSelectPanelOrigin, MerSelectTriggerDef, MerSelectOptionDef, MerSelectComponent,
        MerOption, MerOptionGroup
    ],
    exports: [
        MerSelectPanelOrigin, MerSelectTriggerDef, MerSelectOptionDef, MerSelectComponent,
        MerOption, MerOptionGroup
    ]
})
export class MerSelectModule {

}
