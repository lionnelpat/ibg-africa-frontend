import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PaysActifApi } from '@/app/core/pays/pays-actif.api';
import { PaysActif } from '@/app/core/pays/pays-actif.model';
import { PaysContextService, VALEUR_TOUS } from '@/app/core/pays/pays-context.service';

@Component({
    selector: 'app-choix-pays',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, ButtonModule, CardModule],
    template: `
        <div class="flex items-center justify-center min-h-screen p-4">
            <p-card header="Choisissez un pays" class="w-full" [style]="{ 'max-width': '28rem' }">
                <p class="text-muted-color mt-0 mb-4">
                    Les données affichées seront limitées au pays sélectionné. Vous pourrez en changer à tout moment depuis le menu
                    utilisateur.
                </p>
                <div class="flex flex-col gap-3">
                    @for (pays of paysSelectionnables(); track pays.id) {
                        <p-button [label]="pays.nom" icon="pi pi-flag" severity="secondary" outlined (onClick)="choisir(pays.codeIso)" />
                    }
                    @if (admin()) {
                        <p-button label="Tous les pays" icon="pi pi-globe" (onClick)="choisir(valeurTous)" />
                    }
                </div>
            </p-card>
        </div>
    `
})
export class ChoixPays implements OnInit {
    private readonly paysActifApi = inject(PaysActifApi);
    private readonly paysContext = inject(PaysContextService);
    private readonly router = inject(Router);

    readonly valeurTous = VALEUR_TOUS;

    paysSelectionnables = signal<PaysActif[]>([]);
    admin = signal(false);

    ngOnInit(): void {
        this.paysActifApi.get().subscribe((contexte) => {
            this.paysSelectionnables.set(contexte.paysSelectionnables);
            this.admin.set(contexte.admin);

            if (contexte.sautEcran && contexte.paysSelectionnables.length === 1) {
                this.choisir(contexte.paysSelectionnables[0].codeIso);
            }
        });
    }

    choisir(code: string): void {
        this.paysContext.setActif(code);
        this.router.navigateByUrl('/dashboard');
    }
}
