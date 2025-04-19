import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from "@angular/core";
import { FormsModule, ReactiveFormsModule, UntypedFormControl, Validators } from "@angular/forms";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { faker } from "@faker-js/faker";
import { MerSelectFormFieldControl } from "../../../../merelis/angular-material/select";
import { MerOption, MerSelectComponent, MerSelectOptionDef } from "../../../../merelis/angular/select";
import { PersonDataSource, PersonService } from "./typeahead.datasource";

@Component({
    selector: "select-page",
    templateUrl: "select.component.html",
    styleUrls: ["select.component.scss"],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatFormField,
        MatLabel,
        MerSelectComponent,
        MerSelectFormFieldControl,
        FormsModule,
        ReactiveFormsModule,
    ]
})
export class SelectComponent {
    data: any[] = [];
    colors: string[] = [];
    color = 'Green';
    matform1 = new UntypedFormControl(null, Validators.required)
    matform2 = new UntypedFormControl(null, Validators.required)
    form = new UntypedFormControl('Blue', Validators.required)

    personDS = new PersonDataSource(inject(PersonService));

    ngOnInit(): void {
        const colors = new Set<string>();
        for (let i = 0; i < 30; i++) {
            colors.add(faker.color.human());
        }
        this.colors = Array.from(colors);

        this.data = []
        for (let i = 0; i < 30; i++) {
            this.data.push({
                name: faker.person.fullName(),
                jobTitle: faker.person.jobTitle(),
                jobArea: faker.person.jobArea(),
                jobDescriptor: faker.lorem.text(),
                bio: faker.person.bio(),
                age: faker.number.int({min: 18, max: 60}),
            })
        }
    }

    displayPersonWith(p: any): string {
        return p.name;
    }

    toggleLoading(s1: MerSelectComponent<string>, s2: MerSelectComponent<any>) {
        if (s1.loading()) {
            s1.loading.set(false);
            s2.loading.set(false);
        } else {
            s1.loading.set(true);
            s2.loading.set(true);
        }
    }
}
