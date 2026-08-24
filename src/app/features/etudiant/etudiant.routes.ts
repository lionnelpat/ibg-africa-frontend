import { Routes } from '@angular/router';

export const ETUDIANT_ROUTES: Routes = [
    {
        path: '',
        title: 'Etudiant',
        loadComponent: () => import('./feature/etudiant-list').then((m) => m.EtudiantList)
    }
];
