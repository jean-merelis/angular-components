import { Component } from '@angular/core';
import { MerSelect } from "../../../../../../../merelis/angular/select";
import { HighlightComponent } from "../../../highlight/highlight.component";

@Component({
  selector: 'app-select-basic-showcase',
    imports: [
        MerSelect,
        HighlightComponent
    ],
  templateUrl: './select-basic-showcase.component.html',
  styleUrl: './select-basic-showcase.component.scss'
})
export class SelectBasicShowcaseComponent {
    basicOptions = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];
    selectedBasicOption: string | null = null;

    htmlCode = `
    <mer-select class="mer-standard"
        [dataSource]="basicOptions"
        [(value)]="selectedBasicOption"
        [placeholder]="'Select a fruit'">
    </mer-select>

    <div class="result">
        <p>Selected value: <strong>{{ selectedBasicOption || 'None' }}</strong></p>
    </div>
    `;
    tsCode = `
import { Component } from '@angular/core';
import { MerSelect } from "@merelis/angular/select";

@Component({
  selector: 'app-basic',
    imports: [
        MerSelect,
    ],
  templateUrl: './basic.component.html',
  styleUrl: './basic.component.scss'
})
export class BasicComponent {
    basicOptions = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];
    selectedBasicOption: string | null = null;
}
`;

}
