import { Routes } from '@angular/router';

export const COURS_ROUTES: Routes = [
    {
        path: '',
        title: 'Cours',
        loadComponent: () => import('./feature/cours-list').then((m) => m.CoursList)
    }
];
