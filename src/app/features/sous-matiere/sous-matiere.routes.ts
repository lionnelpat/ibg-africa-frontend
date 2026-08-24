import { Routes } from '@angular/router';

export const SOUS_MATIERE_ROUTES: Routes = [
    {
        path: '',
        title: 'SousMatiere',
        loadComponent: () => import('./feature/sous-matiere-list').then((m) => m.SousMatiereList)
    }
];
