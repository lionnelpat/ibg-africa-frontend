import { Routes } from '@angular/router';

export const TYPE_TACHE_ROUTES: Routes = [
    {
        path: '',
        title: 'TypeTache',
        loadComponent: () => import('./feature/type-tache-list').then((m) => m.TypeTacheList)
    }
];
