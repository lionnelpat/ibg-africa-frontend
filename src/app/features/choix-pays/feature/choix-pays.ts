import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaysActifApi } from '@/app/core/pays/pays-actif.api';
import { PaysActif } from '@/app/core/pays/pays-actif.model';
import { PaysContextService, VALEUR_TOUS } from '@/app/core/pays/pays-context.service';

/** Vignette + couleur d'accent par pays, tant qu'un vrai logo/photo n'est pas fourni. */
const VIGNETTE_PAR_CODE: Record<string, { photo: string; accent: string }> = {
    SN: { photo: 'https://placehold.co/400x400/8f3d22/fbf4ea?text=SN', accent: '#8f3d22' },
    MG: { photo: 'https://placehold.co/400x400/233a5c/fbf4ea?text=MG', accent: '#233a5c' }
};
const VIGNETTE_DEFAUT = { photo: 'https://placehold.co/400x400/6b5d51/fbf4ea?text=%3F', accent: '#6b5d51' };

@Component({
    selector: 'app-choix-pays',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule],
    template: `
        <div class="cp">
            <div class="cp-panel">
                <span class="cp-eyebrow">IBG Afrique</span>
                <h1 class="cp-title">Quel centre rejoignez-vous&nbsp;?</h1>
                <p class="cp-lede">
                    Les données affichées seront limitées au pays choisi. Vous pourrez en changer à tout moment depuis le menu
                    en haut à droite.
                </p>

                @if (chargement()) {
                    <div class="cp-loading" aria-live="polite">
                        <span class="cp-spinner" aria-hidden="true"></span>
                        Préparation de votre espace…
                    </div>
                } @else {
                    <div class="cp-grid">
                        @for (pays of paysSelectionnables(); track pays.id) {
                            <button type="button" class="cp-card" [style.--accent]="vignette(pays.codeIso).accent" (click)="choisir(pays.codeIso)">
                                <img [src]="vignette(pays.codeIso).photo" [alt]="pays.nom" />
                                <span class="cp-card-nom">{{ pays.nom }}</span>
                                <span class="cp-card-go" aria-hidden="true">→</span>
                            </button>
                        }
                        @if (admin()) {
                            <button type="button" class="cp-card cp-card--tous" (click)="choisir(valeurTous)">
                                <span class="cp-card-icon" aria-hidden="true">⊞</span>
                                <span class="cp-card-nom">Tous les pays</span>
                                <span class="cp-card-go" aria-hidden="true">→</span>
                            </button>
                        }
                    </div>
                }
            </div>
        </div>
    `,
    styles: [
        `
            :host {
                --cp-ink: #211b17;
                --cp-ink-soft: #6b5d51;
                --cp-cream: #fbf4ea;
                --cp-line: rgba(33, 27, 23, 0.12);

                display: block;
                min-height: 100vh;
                font-family: 'Karla', sans-serif;
                color: var(--cp-ink);
                background: radial-gradient(1200px 700px at 15% -10%, #f2e6d3 0%, var(--cp-cream) 55%);
            }

            .cp {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem 1.5rem;
            }

            .cp-panel {
                width: 100%;
                max-width: 34rem;
                animation: cp-rise 0.5s ease both;
            }

            @keyframes cp-rise {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .cp-eyebrow {
                display: block;
                font-weight: 700;
                font-size: 0.75rem;
                letter-spacing: 0.14em;
                text-transform: uppercase;
                color: #8f3d22;
                margin-bottom: 0.75rem;
            }

            .cp-title {
                font-family: 'Fraunces', serif;
                font-weight: 500;
                font-size: clamp(1.9rem, 4vw, 2.5rem);
                line-height: 1.1;
                margin: 0 0 0.75rem;
                text-wrap: balance;
            }

            .cp-lede {
                color: var(--cp-ink-soft);
                line-height: 1.6;
                margin: 0 0 2.25rem;
                max-width: 30rem;
            }

            .cp-grid {
                display: grid;
                gap: 0.85rem;
            }

            .cp-card {
                display: flex;
                align-items: center;
                gap: 1rem;
                width: 100%;
                text-align: left;
                background: var(--cp-cream);
                border: 1.5px solid var(--cp-line);
                border-radius: 0.75rem;
                padding: 0.85rem 1.1rem;
                cursor: pointer;
                font-family: inherit;
                font-size: 1.05rem;
                font-weight: 600;
                color: var(--cp-ink);
                transition:
                    border-color 0.15s ease,
                    transform 0.15s ease,
                    box-shadow 0.15s ease;
            }

            .cp-card:hover {
                border-color: var(--accent, #8f3d22);
                transform: translateX(2px);
                box-shadow: 0 10px 26px -16px rgba(33, 27, 23, 0.45);
            }

            .cp-card img {
                width: 2.75rem;
                height: 2.75rem;
                border-radius: 50%;
                object-fit: cover;
                flex: none;
            }

            .cp-card-icon {
                width: 2.75rem;
                height: 2.75rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--cp-line);
                font-size: 1.3rem;
                flex: none;
            }

            .cp-card-nom {
                flex: 1;
            }

            .cp-card-go {
                color: var(--accent, var(--cp-ink-soft));
                font-size: 1.1rem;
                transition: transform 0.15s ease;
            }

            .cp-card:hover .cp-card-go {
                transform: translateX(3px);
            }

            .cp-card--tous {
                border-style: dashed;
            }

            .cp-loading {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                color: var(--cp-ink-soft);
                padding: 1rem 0;
            }

            .cp-spinner {
                width: 1.1rem;
                height: 1.1rem;
                border-radius: 50%;
                border: 2px solid var(--cp-line);
                border-top-color: #8f3d22;
                animation: cp-spin 0.7s linear infinite;
            }

            @keyframes cp-spin {
                to {
                    transform: rotate(360deg);
                }
            }
        `
    ]
})
export class ChoixPays implements OnInit {
    private readonly paysActifApi = inject(PaysActifApi);
    private readonly paysContext = inject(PaysContextService);
    private readonly router = inject(Router);

    readonly valeurTous = VALEUR_TOUS;

    paysSelectionnables = signal<PaysActif[]>([]);
    admin = signal(false);
    chargement = signal(true);

    ngOnInit(): void {
        this.paysActifApi.get().subscribe((contexte) => {
            this.paysSelectionnables.set(contexte.paysSelectionnables);
            this.admin.set(contexte.admin);
            this.chargement.set(false);

            if (contexte.sautEcran && contexte.paysSelectionnables.length === 1) {
                this.choisir(contexte.paysSelectionnables[0].codeIso);
            }
        });
    }

    vignette(codeIso: string): { photo: string; accent: string } {
        return VIGNETTE_PAR_CODE[codeIso] ?? VIGNETTE_DEFAUT;
    }

    choisir(code: string): void {
        this.paysContext.setActif(code);
        this.router.navigateByUrl('/dashboard');
    }
}
