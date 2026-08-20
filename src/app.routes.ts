import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            {
                path: '',
                title: 'Dashboard',
                loadComponent: () => import('./app/pages/dashboard/dashboard').then((m) => m.Dashboard)
            },
            {
                path: 'etudiant',
                loadChildren: () => import('./app/features/etudiant/etudiant.routes').then((m) => m.ETUDIANT_ROUTES)
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
