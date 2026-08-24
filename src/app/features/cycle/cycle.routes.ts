import { Routes } from '@angular/router';

export const CYCLE_ROUTES: Routes = [
    {
        path: '',
        title: 'Cycle',
        loadComponent: () => import('./feature/cycle-list').then((m) => m.CycleList)
    },
    {
        path: ':id',
        title: 'Détail du cycle',
        loadComponent: () => import('./feature/cycle-detail').then((m) => m.CycleDetail)
    },
    {
        path: ':id/matiere/:evaluationPrevueId',
        title: 'Saisie des notes',
        loadComponent: () => import('./feature/saisie-notes').then((m) => m.SaisieNotes)
    }
];
