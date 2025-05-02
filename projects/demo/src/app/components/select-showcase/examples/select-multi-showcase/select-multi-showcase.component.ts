import { NgFor, NgIf } from "@angular/common";
import { Component } from '@angular/core';
import { MerSelect } from "../../../../../../../merelis/angular/select";
import { HighlightComponent } from "../../../highlight/highlight.component";

@Component({
  selector: 'app-select-multi-showcase',
  imports: [
      NgIf, NgFor,
      MerSelect,
      HighlightComponent
  ],
  templateUrl: './select-multi-showcase.component.html',
  styleUrl: './select-multi-showcase.component.scss'
})
export class SelectMultiShowcaseComponent {
    colors = ['Red', 'Green', 'Blue', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Black', 'White'];
    selectedColors: string[] = [];

    htmlCode = `
    <mer-select class="mer-standard"
                [dataSource]="colors"
                [(value)]="selectedColors"
                [multiple]="true"
                [placeholder]="'Select colors'">
    </mer-select>

    <mer-select class="mer-standard"
                [dataSource]="colors"
                [(value)]="selectedColors"
                [multiple]="true"
                [showMultiSelectAllOption]="true"
                [placeholder]="'Select colors'">
    </mer-select>
    `;
    tsCode = `
import { NgFor, NgIf } from "@angular/common";
import { Component } from '@angular/core';
import { MerSelect } from "@merelis/angular/select";

@Component({
  selector: 'app-select-multi-showcase',
  imports: [
      NgIf, NgFor,
      MerSelect,
  ],
  templateUrl: './select-multi-showcase.component.html',
  styleUrl: './select-multi-showcase.component.scss'
})
export class SelectMultiShowcaseComponent {
    colors = ['Red', 'Green', 'Blue', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Black', 'White'];
    selectedColors: string[] = [];
 }
    `;
}
