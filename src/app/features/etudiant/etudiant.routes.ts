import { Routes } from '@angular/router';

export const ETUDIANT_ROUTES: Routes = [
    {
        path: '',
        title: 'Étudiants',
        loadComponent: () => import('./feature/etudiant').then((m) => m.Etudiant)
    }
];
