import { Routes } from '@angular/router';

export const BAREME_MENTION_ROUTES: Routes = [
    {
        path: '',
        title: 'BaremeMention',
        loadComponent: () => import('./feature/bareme-mention-list').then((m) => m.BaremeMentionList)
    }
];
