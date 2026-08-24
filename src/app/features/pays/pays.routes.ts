import { Routes } from '@angular/router';

export const PAYS_ROUTES: Routes = [
    {
        path: '',
        title: 'Pays',
        loadComponent: () => import('./feature/pays-list').then((m) => m.PaysList)
    }
];
