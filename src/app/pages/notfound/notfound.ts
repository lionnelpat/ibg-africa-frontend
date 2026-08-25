import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-notfound',
    standalone: true,
    imports: [RouterModule, ButtonModule],
    template: `
        <div class="flex items-center justify-center min-h-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center gap-4">
                <span class="text-primary font-bold text-3xl">404</span>
                <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2">Page introuvable</h1>
                <div class="text-surface-600 dark:text-surface-200 mb-4">La ressource demandée n'existe pas.</div>
                <p-button label="Retour au tableau de bord" routerLink="/dashboard" />
            </div>
        </div>
    `
})
export class Notfound {}
