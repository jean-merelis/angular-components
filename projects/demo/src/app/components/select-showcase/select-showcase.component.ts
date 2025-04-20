import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SelectBasicShowcaseComponent } from "./examples/basic/select-basic-showcase.component";
import {
    SelectCustomTemplateShowcaseComponent
} from "./examples/select-custom-template-showcase/select-custom-template-showcase.component";
import {
    SelectMaterialShowcaseComponent
} from "./examples/select-material-showcase/select-material-showcase.component";
import { SelectMultiShowcaseComponent } from "./examples/select-multi-showcase/select-multi-showcase.component";
import { SelectObjectsShowcaseComponent } from "./examples/select-objects-showcase/select-objects-showcase.component";
import { SelectStatesShowcaseComponent } from "./examples/select-states-showcase/select-states-showcase.component";


interface ExampleTab {
    id: string;
    title: string;
}

@Component({
    selector: 'app-select-showcase',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SelectMaterialShowcaseComponent,
        SelectBasicShowcaseComponent,
        SelectObjectsShowcaseComponent,
        SelectCustomTemplateShowcaseComponent,
        SelectMultiShowcaseComponent,
        SelectStatesShowcaseComponent,
    ],
    templateUrl: './select-showcase.component.html',
    styleUrls: ['./select-showcase.component.scss']
})
export class SelectShowcaseComponent {


    // Tabs for examples
    activeTab: string = 'basic';
    tabs: ExampleTab[] = [
        {id: 'basic', title: 'Basic Usage'},
        {id: 'objects', title: 'Object Selection'},
        {id: 'multiple', title: 'Multiple Selection'},
        {id: 'states', title: 'Component States'},
        {id: 'custom', title: 'Custom Templates'},
        {id: 'material', title: 'Angular Material'},
    ];
    selectedTab: ExampleTab = this.tabs[0];


    setTab(tabId: string): void {
        this.activeTab = tabId;
        this.selectedTab = this.tabs.find(tab => tab.id === tabId) || this.tabs[0];
    }


}
