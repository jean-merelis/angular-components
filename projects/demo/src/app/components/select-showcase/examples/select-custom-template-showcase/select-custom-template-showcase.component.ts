import { Component } from '@angular/core';
import {MerSelectComponent, MerSelectOptionDef, MerSelectTriggerDef} from  "../../../../../../../merelis/angular/select";
import { HighlightComponent } from "../../../highlight/highlight.component";


interface User {
    id: number;
    name: string;
    email: string;
}

@Component({
  selector: 'app-select-custom-template-showcase',
    imports: [
        MerSelectComponent,
        MerSelectOptionDef,
        MerSelectTriggerDef,
        HighlightComponent
    ],
  templateUrl: './select-custom-template-showcase.component.html',
  styleUrl: './select-custom-template-showcase.component.scss'
})
export class SelectCustomTemplateShowcaseComponent {
    users: User[] = [
        { id: 1, name: 'John Smith', email: 'john@example.com' },
        { id: 2, name: 'Mary Johnson', email: 'mary@example.com' },
        { id: 3, name: 'Peter Williams', email: 'peter@example.com' },
        { id: 4, name: 'Sarah Brown', email: 'sarah@example.com' },
        { id: 5, name: 'David Miller', email: 'david@example.com' }
    ];
    selectedUser: User | null = null;


    compareUsers(user1: User, user2: User): boolean {
        return user1?.id === user2?.id;
    }

    htmlCode = `
    <mer-select class="mer-standard custom-select"
                [dataSource]="users"
                [(value)]="selectedUser"
                [compareWith]="compareUsers"
                [placeholder]="'Select a user'">

        <!-- Custom trigger template -->
        <ng-template merSelectTriggerDef let-user>
            @if (user) {
                <div class="custom-trigger">
                    <div class="user-trigger">
                        <span class="initials">{{ user.name.charAt(0) }}</span>
                        <span class="name">{{ user.name }}</span>
                    </div>
                </div>
            }
        </ng-template>

        <!-- Custom option template -->
        <ng-template merSelectOptionDef let-option>
            <div class="custom-option">
                <span class="initials">{{ option.name.charAt(0) }}</span>
                <div class="user-details">
                    <div class="name">{{ option.name }}</div>
                    <div class="email">{{ option.email }}</div>
                </div>
            </div>
        </ng-template>
    </mer-select>
    `;
    tsCode = `
import { Component } from '@angular/core';
import {MerSelectComponent, MerSelectOptionDef, MerSelectTriggerDef} from  "@merelis/angular/select";

interface User {
    id: number;
    name: string;
    email: string;
}

@Component({
  selector: 'app-select-custom-template-showcase',
    imports: [
        MerSelectComponent,
        MerSelectOptionDef,
        MerSelectTriggerDef,
    ],
  templateUrl: './select-custom-template-showcase.component.html',
  styleUrl: './select-custom-template-showcase.component.scss'
})
export class SelectCustomTemplateShowcaseComponent {
    users: User[] = [
        { id: 1, name: 'John Smith', email: 'john@example.com' },
        { id: 2, name: 'Mary Johnson', email: 'mary@example.com' },
        { id: 3, name: 'Peter Williams', email: 'peter@example.com' },
        { id: 4, name: 'Sarah Brown', email: 'sarah@example.com' },
        { id: 5, name: 'David Miller', email: 'david@example.com' }
    ];
    selectedUser: User | null = null;


    compareUsers(user1: User, user2: User): boolean {
        return user1?.id === user2?.id;
    }
}
`;
    cssCode = `
.custom-select .mer-select-trigger{
    min-height: 48px;
}
.custom-trigger, .custom-option {
  display: flex;
  align-items: center;
}
.user-trigger{
    display: flex;
    flex-direction: row;
    gap: 4px;
    align-items: center;
}

.initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #0d67ca;
  color: white;
  margin-right: 8px;
  font-weight: bold;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.email {
  font-size: 0.8em;
  color: #666;
}
    `;
}
