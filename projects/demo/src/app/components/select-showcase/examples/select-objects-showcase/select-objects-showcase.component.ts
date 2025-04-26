import { NgIf } from "@angular/common";
import { Component } from '@angular/core';
import { MerSelect } from "../../../../../../../merelis/angular/select";
import { HighlightComponent } from "../../../highlight/highlight.component";


interface User {
    id: number;
    name: string;
    email: string;
}

@Component({
  selector: 'app-select-objects-showcase',
  imports: [
      NgIf,
      MerSelect,
      HighlightComponent
  ],
  templateUrl: './select-objects-showcase.component.html',
  styleUrl: './select-objects-showcase.component.scss'
})
export class SelectObjectsShowcaseComponent {

    users: User[] = [
        { id: 1, name: 'John Smith', email: 'john@example.com' },
        { id: 2, name: 'Mary Johnson', email: 'mary@example.com' },
        { id: 3, name: 'Peter Williams', email: 'peter@example.com' },
        { id: 4, name: 'Sarah Brown', email: 'sarah@example.com' },
        { id: 5, name: 'David Miller', email: 'david@example.com' }
    ];
    selectedUser: User | null = null;

    // Helper functions for select examples
    displayUser(user: User): string {
        return user?.name || '';
    }

    compareUsers(user1: User, user2: User): boolean {
        return user1?.id === user2?.id;
    }
    htmlCode = `
    <mer-select class="mer-standard"
                [dataSource]="users"
                [(value)]="selectedUser"
                [displayWith]="displayUser"
                [compareWith]="compareUsers"
                [placeholder]="'Select a user'">
    </mer-select>

    <div class="result">
        <p *ngIf="!selectedUser">No user selected</p>
        <div *ngIf="selectedUser" class="user-info">
            <p><strong>ID:</strong> {{ selectedUser.id }}</p>
            <p><strong>Name:</strong> {{ selectedUser.name }}</p>
            <p><strong>Email:</strong> {{ selectedUser.email }}</p>
        </div>
    </div>
    `;
    tsCode = `
import { Component } from '@angular/core';
import { MerSelect } from "@merelis/angular/select";

interface User {
    id: number;
    name: string;
    email: string;
}

@Component({
  selector: 'app-select-objets-showcase',
  imports: [
      NgIf,
      MerSelect
  ],
  templateUrl: './select-objects-showcase.component.html',
  styleUrl: './select-objects-showcase.component.scss'
})
export class SelectObjectsShowcaseComponent {

    users: User[] = [
        { id: 1, name: 'John Smith', email: 'john@example.com' },
        { id: 2, name: 'Mary Johnson', email: 'mary@example.com' },
        { id: 3, name: 'Peter Williams', email: 'peter@example.com' },
        { id: 4, name: 'Sarah Brown', email: 'sarah@example.com' },
        { id: 5, name: 'David Miller', email: 'david@example.com' }
    ];
    selectedUser: User | null = null;

    // Helper functions for select examples
    displayUser(user: User): string {
        return user?.name || '';
    }

    compareUsers(user1: User, user2: User): boolean {
        return user1?.id === user2?.id;
    }
}
    `;
}
