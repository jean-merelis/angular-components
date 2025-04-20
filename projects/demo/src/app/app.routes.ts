import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SelectShowcaseComponent } from './components/select-showcase/select-showcase.component';
import { ProgressBarShowcaseComponent } from './components/progress-bar-showcase/progress-bar-showcase.component';
import { SelectComponent } from "./select/select.component";

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'select', component: SelectShowcaseComponent },
    { path: 'select2', component: SelectComponent },
    { path: 'progress-bar', component: ProgressBarShowcaseComponent },
    { path: '**', redirectTo: '' }
];
