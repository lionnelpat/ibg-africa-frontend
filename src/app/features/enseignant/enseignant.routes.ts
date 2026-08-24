import { Routes } from '@angular/router';

export const ENSEIGNANT_ROUTES: Routes = [
    {
        path: '',
        title: 'Enseignant',
        loadComponent: () => import('./feature/enseignant-list').then((m) => m.EnseignantList)
    }
];
