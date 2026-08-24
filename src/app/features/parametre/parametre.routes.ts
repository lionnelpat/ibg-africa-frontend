import { Routes } from '@angular/router';

export const PARAMETRE_ROUTES: Routes = [
    {
        path: '',
        title: 'Parametre',
        loadComponent: () => import('./feature/parametre-list').then((m) => m.ParametreList)
    }
];
