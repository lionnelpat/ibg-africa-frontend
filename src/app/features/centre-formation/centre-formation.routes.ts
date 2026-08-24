import { Routes } from '@angular/router';

export const CENTRE_FORMATION_ROUTES: Routes = [
    {
        path: '',
        title: 'CentreFormation',
        loadComponent: () => import('./feature/centre-formation-list').then((m) => m.CentreFormationList)
    }
];
