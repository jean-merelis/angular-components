import {Component, signal, ViewEncapsulation} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatListItem, MatNavList} from "@angular/material/list";
import {MatSidenavModule} from "@angular/material/sidenav";

@Component({
    selector: 'app-root',
    imports: [
        MatFormFieldModule,
        MatSidenavModule,
        MatListItem,
        RouterModule,
        MatNavList],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
    title = 'demo';


    shouldRun = signal(false);

    constructor() {
        setTimeout(() => this.shouldRun.set(true), 3000)
    }
}
