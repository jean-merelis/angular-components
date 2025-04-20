import { Component } from '@angular/core';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { faker } from "@faker-js/faker";
import { MerSelectFormFieldControl } from "../../../../../../../merelis/angular-material/select";
import { MerSelectComponent } from "../../../../../../../merelis/angular/select";
import { HighlightComponent } from "../../../highlight/highlight.component";

@Component({
  selector: 'app-select-material-showcase',
  imports: [
      MatFormField,
      MatLabel,
      MerSelectComponent,
      MerSelectFormFieldControl,
      HighlightComponent,
  ],
  templateUrl: './select-material-showcase.component.html',
  styleUrl: './select-material-showcase.component.scss'
})
export class SelectMaterialShowcaseComponent {
    colors: string[] = [];
    color?: string;

    ngOnInit(): void {
        const colors = new Set<string>();
        for (let i = 0; i < 30; i++) {
            colors.add(faker.color.human());
        }
        this.colors = Array.from(colors);
    }


    htmlCode = `
        <mat-form-field appearance="fill">
            <mat-label>Colors</mat-label>
            <mer-select merSelectFormField [dataSource]="colors" [(value)]="color"></mer-select>
        </mat-form-field>


        <mat-form-field appearance="outline">
            <mat-label>Colors</mat-label>
            <mer-select merSelectFormField [dataSource]="colors" [(value)]="color"></mer-select>
        </mat-form-field>
    `;
    tsCode = `
import { Component } from '@angular/core';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MerSelectFormFieldControl } from "@merelis/angular-material/select";
import { MerSelectComponent } from "@merelis/angular/select";

@Component({
  selector: 'app-select-material-showcase',
  imports: [
      MatFormField,
      MatLabel,
      MerSelectComponent,
      MerSelectFormFieldControl,
  ],
  templateUrl: './select-material-showcase.component.html'
})
export class SelectMaterialShowcaseComponent {
    colors: string[] = ['blue', 'green', 'red', 'yellow', 'brown', 'pink', 'purple'];
    color?: string;
}
    `;
}
