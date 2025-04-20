import { Component } from '@angular/core';
import { MerSelectComponent } from "../../../../../../../merelis/angular/select";
import { HighlightComponent } from "../../../highlight/highlight.component";

@Component({
  selector: 'app-select-states-showcase',
  imports: [
      MerSelectComponent,
      HighlightComponent
  ],
  templateUrl: './select-states-showcase.component.html',
  styleUrl: './select-states-showcase.component.scss'
})
export class SelectStatesShowcaseComponent {
    basicOptions = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];
    selectedBasicOption: string | null = null;

    statesLoading = false;
    disabledSelect = false;
    readOnlySelect = false;

    toggleLoading(): void {
        this.statesLoading = !this.statesLoading;

        if (this.statesLoading) {
            setTimeout(() => {
                this.statesLoading = false;
            }, 2000);
        }
    }

    toggleDisabled(): void {
        this.disabledSelect = !this.disabledSelect;
    }

    toggleReadOnly(): void {
        this.readOnlySelect = !this.readOnlySelect;
    }

    htmlCode = `

    <div class="controls">
        <button (click)="toggleLoading()">Toggle Loading</button>
        <button (click)="toggleDisabled()">Toggle Disabled</button>
        <button (click)="toggleReadOnly()">Toggle ReadOnly</button>
    </div>

    <mer-select class="mer-standard"
        [dataSource]="basicOptions"
        [(value)]="selectedBasicOption"
        [placeholder]="'Select a fruit'"
        [loading]="statesLoading"
        [disabled]="disabledSelect"
        [readOnly]="readOnlySelect">
    </mer-select>

    <div class="state-info">
        <p><strong>Loading:</strong> {{ statesLoading }}</p>
        <p><strong>Disabled:</strong> {{ disabledSelect }}</p>
        <p><strong>ReadOnly:</strong> {{ readOnlySelect }}</p>
    </div>    `;



    tsCode = `
import { Component } from '@angular/core';
import { MerSelectComponent } from "@merelis/angular/select";

@Component({
  selector: 'app-select-states-showcase',
  imports: [
      MerSelectComponent,
  ],
  templateUrl: './select-states-showcase.component.html',
  styleUrl: './select-states-showcase.component.scss'
})
export class SelectStatesShowcaseComponent {
    basicOptions = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];
    selectedBasicOption: string | null = null;

    statesLoading = false;
    disabledSelect = false;
    readOnlySelect = false;

    toggleLoading(): void {
        this.statesLoading = !this.statesLoading;

        if (this.statesLoading) {
            setTimeout(() => {
                this.statesLoading = false;
            }, 2000);
        }
    }

    toggleDisabled(): void {
        this.disabledSelect = !this.disabledSelect;
    }

    toggleReadOnly(): void {
        this.readOnlySelect = !this.readOnlySelect;
    }
  }
    `;
}
