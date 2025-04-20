import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProgressBarShowcaseComponent } from './components/progress-bar-showcase/progress-bar-showcase.component';
import { SelectShowcaseComponent } from './components/select-showcase/select-showcase.component';


export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'select', component: SelectShowcaseComponent},
    {path: 'progress-bar', component: ProgressBarShowcaseComponent},
    {path: '**', redirectTo: ''}
];
