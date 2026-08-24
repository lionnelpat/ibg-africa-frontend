import { Routes } from '@angular/router';
import { authGuard } from './app/core/auth/auth.guard';
import { AppLayout } from './app/layout/component/app.layout';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                title: 'Dashboard',
                loadComponent: () => import('./app/pages/dashboard/dashboard').then((m) => m.Dashboard)
            },
            {
                path: 'pays',
                loadChildren: () => import('./app/features/pays/pays.routes').then((m) => m.PAYS_ROUTES)
            },
            {
                path: 'centre-formation',
                loadChildren: () => import('./app/features/centre-formation/centre-formation.routes').then((m) => m.CENTRE_FORMATION_ROUTES)
            },
            {
                path: 'cycle',
                loadChildren: () => import('./app/features/cycle/cycle.routes').then((m) => m.CYCLE_ROUTES)
            },
            {
                path: 'enseignant',
                loadChildren: () => import('./app/features/enseignant/enseignant.routes').then((m) => m.ENSEIGNANT_ROUTES)
            },
            {
                path: 'etudiant',
                loadChildren: () => import('./app/features/etudiant/etudiant.routes').then((m) => m.ETUDIANT_ROUTES)
            },
            {
                path: 'matiere',
                loadChildren: () => import('./app/features/matiere/matiere.routes').then((m) => m.MATIERE_ROUTES)
            },
            {
                path: 'sous-matiere',
                loadChildren: () => import('./app/features/sous-matiere/sous-matiere.routes').then((m) => m.SOUS_MATIERE_ROUTES)
            },
            {
                path: 'cours',
                loadChildren: () => import('./app/features/cours/cours.routes').then((m) => m.COURS_ROUTES)
            },
            {
                path: 'type-tache',
                loadChildren: () => import('./app/features/type-tache/type-tache.routes').then((m) => m.TYPE_TACHE_ROUTES)
            },
            {
                path: 'bareme-mention',
                loadChildren: () => import('./app/features/bareme-mention/bareme-mention.routes').then((m) => m.BAREME_MENTION_ROUTES)
            },
            {
                path: 'parametre',
                loadChildren: () => import('./app/features/parametre/parametre.routes').then((m) => m.PARAMETRE_ROUTES)
            }
        ]
    },
    {
        path: 'notfound',
        title: 'Page introuvable',
        loadComponent: () => import('./app/pages/notfound/notfound').then((m) => m.Notfound)
    },
    { path: '**', redirectTo: '/notfound' }
];
