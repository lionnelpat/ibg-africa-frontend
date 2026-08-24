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
            { label: 'Cycles', icon: 'pi pi-fw pi-calendar', routerLink: ['/cycle'] },
            { label: 'Enseignants', icon: 'pi pi-fw pi-user', routerLink: ['/enseignant'] },
            { label: 'Étudiants', icon: 'pi pi-fw pi-users', routerLink: ['/etudiant'] }
        ]
    },
    {
        label: 'Paramétrages',
        items: [
            { label: 'Pays', icon: 'pi pi-fw pi-globe', routerLink: ['/pays'] },
            { label: 'Centres de formation', icon: 'pi pi-fw pi-building', routerLink: ['/centre-formation'] },
            { label: 'Matières', icon: 'pi pi-fw pi-book', routerLink: ['/matiere'] },
            { label: 'Sous-matières', icon: 'pi pi-fw pi-bookmark', routerLink: ['/sous-matiere'] },
            { label: 'Cours', icon: 'pi pi-fw pi-graduation-cap', routerLink: ['/cours'] },
            { label: 'Types de tâche', icon: 'pi pi-fw pi-list', routerLink: ['/type-tache'] },
            { label: 'Barèmes de mention', icon: 'pi pi-fw pi-star', routerLink: ['/bareme-mention'] },
            { label: 'Paramètres', icon: 'pi pi-fw pi-cog', routerLink: ['/parametre'] }
        ]
    }
];
