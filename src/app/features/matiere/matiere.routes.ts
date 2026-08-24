import { Routes } from '@angular/router';

export const MATIERE_ROUTES: Routes = [
    {
        path: '',
        title: 'Matiere',
        loadComponent: () => import('./feature/matiere-list').then((m) => m.MatiereList)
    }
];
