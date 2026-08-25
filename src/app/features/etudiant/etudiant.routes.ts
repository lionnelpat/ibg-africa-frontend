import { Routes } from '@angular/router';

export const ETUDIANT_ROUTES: Routes = [
    {
        path: '',
        title: 'Etudiant',
        loadComponent: () => import('./feature/etudiant-list').then((m) => m.EtudiantList)
    },
    {
        path: ':id',
        title: 'Étudiant',
        loadComponent: () => import('./feature/etudiant-detail').then((m) => m.EtudiantDetail)
    },
    {
        path: ':id/bulletin',
        title: 'Bulletin',
        loadComponent: () => import('./feature/etudiant-bulletin').then((m) => m.EtudiantBulletin)
    }
];
