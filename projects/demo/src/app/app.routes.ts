import { Routes } from '@angular/router';
import { HomeComponent } from "./home/home.component";

export const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "select", loadComponent: () => import("./select/select.component").then(m => m.SelectComponent)},
];
