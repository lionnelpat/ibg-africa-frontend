import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AccountService } from '@/app/core/auth/account.service';

interface Statistique {
    valeur: string;
    libelle: string;
}

interface Temoignage {
    citation: string;
    auteur: string;
    role: string;
}

const STATISTIQUES: Statistique[] = [
    { valeur: '28', libelle: 'sessions depuis 1996' },
    { valeur: '60h', libelle: 'de cours par session' },
    { valeur: '1 600+', libelle: 'étudiants formés' },
    { valeur: '30 ans', libelle: 'de partenariat FES × IBG' }
];

const TEMOIGNAGES: Temoignage[] = [
    {
        citation: 'FORBIDEC a transformé ma manière de lire la Bible et d’enseigner dans mon assemblée.',
        auteur: 'Awa Diop',
        role: 'Ancienne étudiante'
    },
    {
        citation: 'Voir la passion des étudiants sénégalais pour la Parole de Dieu ravive ma propre foi.',
        auteur: 'Pierre Klipfel',
        role: 'Enseignant'
    }
];

@Component({
    selector: 'app-vitrine',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, RouterModule, ButtonModule, CardModule],
    template: `
        <div class="vitrine">
            <header class="vitrine-header">
                <div class="vitrine-container flex items-center justify-between py-4">
                    <span class="font-bold text-xl text-primary">FORBIDEC · IBG Afrique</span>
                    <p-button label="Se connecter" icon="pi pi-sign-in" (onClick)="seConnecter()" />
                </div>
            </header>

            <section class="vitrine-hero">
                <div class="vitrine-container flex flex-col items-center text-center gap-4 py-16">
                    <span class="text-muted-color uppercase tracking-wide text-sm">Institut Biblique de Genève · Afrique</span>
                    <h1 class="text-4xl md:text-5xl font-bold m-0">Formé pour servir,<br />ancré dans la Parole.</h1>
                    <p class="text-lg text-muted-color max-w-2xl">
                        Formation biblique et théologique intensive au Sénégal, portée par le réseau panafricain de l'Institut
                        Biblique de Genève (IBG) — ouverte aux chrétiens engagés, pasteurs, responsables d'église et évangélistes
                        à Dakar et au-delà.
                    </p>
                    <blockquote class="italic text-muted-color max-w-xl mt-2">
                        « Tu enseigneras ces choses à des hommes fidèles, qui soient capables de les enseigner aussi à d'autres. »
                        <br /><span class="text-sm not-italic">— 2 Timothée 2.2</span>
                    </blockquote>
                    <p-button label="Accéder à la plateforme" icon="pi pi-arrow-right" iconPos="right" size="large" class="mt-4" (onClick)="seConnecter()" />
                </div>
            </section>

            <section class="vitrine-stats">
                <div class="vitrine-container grid grid-cols-2 md:grid-cols-4 gap-6 py-10">
                    @for (stat of statistiques; track stat.libelle) {
                        <div class="text-center">
                            <div class="text-3xl font-bold text-primary">{{ stat.valeur }}</div>
                            <div class="text-muted-color text-sm">{{ stat.libelle }}</div>
                        </div>
                    }
                </div>
            </section>

            <section class="vitrine-container py-16">
                <div class="grid grid-cols-12 gap-8 items-center">
                    <div class="col-span-12 md:col-span-6">
                        <span class="text-primary font-semibold uppercase text-sm">Notre mission</span>
                        <h2 class="text-3xl font-bold mt-2 mb-4">30 ans à former l'Église en Afrique</h2>
                        <p class="text-muted-color mb-3">
                            Née en 1996 d'un partenariat entre la Fraternité Évangélique du Sénégal et l'Institut Biblique de
                            Genève, FORBIDEC offre chaque année une formation théologique intensive et décentralisée,
                            accessible à tous les chrétiens engagés à Dakar.
                        </p>
                        <p class="text-muted-color mb-3">
                            Des enseignants de Genève et d'Afrique dispensent ensemble des dizaines d'heures de cours bibliques
                            et théologiques. Après plusieurs sessions complètes, les étudiants reçoivent le certificat
                            <strong>IBG Afrique</strong>, reconnu au sein du réseau international de l'Institut Biblique de
                            Genève, actif dans plusieurs pays du continent.
                        </p>
                        <p class="text-muted-color">
                            Cette plateforme est l'outil de gestion académique d'IBG Afrique : cycles de formation, étudiants,
                            enseignants, notes et bulletins.
                        </p>
                    </div>
                    <div class="col-span-12 md:col-span-6">
                        <p-card>
                            <h3 class="mt-0">Ce que couvre la formation</h3>
                            <ul class="pl-5 flex flex-col gap-2 text-muted-color">
                                <li>Théologie systématique et biblique</li>
                                <li>Étude approfondie de l'Ancien et du Nouveau Testament</li>
                                <li>Formation pratique au ministère et à l'évangélisation</li>
                                <li>Certification IBG Afrique après cursus complet</li>
                            </ul>
                        </p-card>
                    </div>
                </div>
            </section>

            <section class="vitrine-temoignages">
                <div class="vitrine-container py-16">
                    <h2 class="text-3xl font-bold text-center mb-10">Ils témoignent</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        @for (t of temoignages; track t.auteur) {
                            <p-card>
                                <p class="italic mb-4">"{{ t.citation }}"</p>
                                <div class="font-semibold">{{ t.auteur }}</div>
                                <div class="text-muted-color text-sm">{{ t.role }}</div>
                            </p-card>
                        }
                    </div>
                </div>
            </section>

            <section class="vitrine-cta">
                <div class="vitrine-container flex flex-col items-center text-center gap-4 py-16">
                    <h2 class="text-3xl font-bold m-0">Vous êtes formateur, étudiant ou administrateur ?</h2>
                    <p class="text-muted-color max-w-xl">
                        Connectez-vous à la plateforme de gestion académique d'IBG Afrique pour consulter les cycles, les
                        étudiants, les notes et les bulletins.
                    </p>
                    <p-button label="Se connecter" icon="pi pi-sign-in" size="large" (onClick)="seConnecter()" />
                </div>
            </section>

            <footer class="vitrine-footer">
                <div class="vitrine-container py-6 text-center text-muted-color text-sm">
                    FORBIDEC · Institut Biblique de Genève — Afrique ·
                    <a href="https://model-technologie.com" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">
                        Model Technologie
                    </a>
                </div>
            </footer>
        </div>
    `,
    styles: [
        `
            .vitrine {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }

            .vitrine-container {
                max-width: 1100px;
                margin: 0 auto;
                padding-left: 1.5rem;
                padding-right: 1.5rem;
            }

            .vitrine-header {
                border-bottom: 1px solid var(--surface-200);
            }

            .vitrine-stats,
            .vitrine-temoignages {
                background-color: var(--surface-50);
            }

            .vitrine-cta {
                background-color: var(--surface-100);
            }

            .vitrine-footer {
                border-top: 1px solid var(--surface-200);
                margin-top: auto;
            }
        `
    ]
})
export class Vitrine {
    private readonly accountService = inject(AccountService);
    private readonly router = inject(Router);
    private readonly title = inject(Title);
    private readonly meta = inject(Meta);

    statistiques = STATISTIQUES;
    temoignages = TEMOIGNAGES;

    constructor() {
        this.title.setTitle('FORBIDEC — Formation biblique et théologique en Afrique | IBG Afrique');
        this.meta.updateTag({
            name: 'description',
            content:
                "FORBIDEC (IBG Afrique) forme depuis 1996 des chrétiens engagés, pasteurs et évangélistes à Dakar, Sénégal, à travers une formation biblique et théologique intensive portée par le réseau de l'Institut Biblique de Genève en Afrique."
        });
        this.meta.updateTag({
            property: 'og:title',
            content: 'FORBIDEC — Formation biblique et théologique en Afrique'
        });
        this.meta.updateTag({
            property: 'og:description',
            content: "Formation biblique décentralisée à Dakar (Sénégal), portée par l'Institut Biblique de Genève — Afrique."
        });
        this.meta.updateTag({ property: 'og:type', content: 'website' });

        this.accountService.load().then(() => {
            if (this.accountService.authenticated()) {
                this.router.navigateByUrl('/dashboard');
            }
        });
    }

    seConnecter(): void {
        this.accountService.login();
    }
}
