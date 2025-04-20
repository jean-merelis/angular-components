import { Component, ViewEncapsulation } from '@angular/core';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSidenavModule } from "@angular/material/sidenav";
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [
        MatFormFieldModule,
        MatSidenavModule,
        RouterModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent {

}
