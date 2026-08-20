import { MenuItem } from 'primeng/api';

/**
 * Modèle de navigation de la sidebar, consommé par `app.menu.ts`.
 * Externalisé ici (docs/ANGULAR-GUIDELINES.md §9) pour rester filtrable
 * par rôle une fois l'authentification branchée, sans toucher au layout Sakai.
 */
export const NAVIGATION: MenuItem[] = [
    {
        label: 'Général',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
            { label: 'Étudiant', icon: 'pi pi-fw pi-users', routerLink: ['/etudiant'] }
        ]
    }
];
