import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '@/app/core/auth/account.service';

interface Statistique {
    valeur: string;
    libelle: string;
}

interface Centre {
    pays: string;
    ville: string;
    photo: string;
    depuis: string;
    effectif: string;
    description: string;
}

interface Temoignage {
    citation: string;
    auteur: string;
    role: string;
    photo: string;
}

const STATISTIQUES: Statistique[] = [
    { valeur: '2', libelle: 'centres — Sénégal & Madagascar' },
    { valeur: '30', libelle: 'sessions depuis 1996' },
    { valeur: '700+', libelle: 'étudiants formés' },
    { valeur: '30 ans', libelle: 'de partenariat FES × IBG' }
];

const CENTRES: Centre[] = [
    {
        pays: 'Sénégal',
        ville: 'Dakar',
        photo: '/vitrine/centre-dakar.jpg',
        depuis: 'Depuis 1996',
        effectif: '547 étudiants formés',
        description:
            "Né d'un partenariat entre la Fraternité Évangélique du Sénégal et l'Institut Biblique de Genève, le centre de Dakar est le foyer historique de FORBIDEC : trente années de cours bibliques et théologiques dispensés à des chrétiens engagés, pasteurs et évangélistes de toute la sous-région."
    },
    {
        pays: 'Madagascar',
        ville: 'Antananarivo',
        photo: 'https://placehold.co/900x1100/233a5c/fbf4ea?font=playfair-display&text=Centre%20de%20Madagascar',
        depuis: 'Depuis 2016',
        effectif: '177 étudiants formés',
        description:
            "Ouvert dix ans après Dakar, le centre d'Antananarivo étend le réseau IBG Afrique à l'océan Indien. Un corps enseignant en partie commun aux deux centres y transmet la même exigence académique et le même ancrage biblique, au service de l'Église malgache."
    }
];

const TEMOIGNAGES: Temoignage[] = [
    {
        citation: 'FORBIDEC a transformé ma manière de lire la Bible et d’enseigner dans mon assemblée.',
        auteur: 'Awa Diop',
        role: 'Ancienne étudiante — Dakar',
        photo: 'https://placehold.co/160x160/d9a441/211b17?text=AD'
    },
    {
        citation: 'Voir la passion des étudiants pour la Parole de Dieu, à Dakar comme à Antananarivo, ravive ma propre foi.',
        auteur: 'Pierre Klipfel',
        role: 'Enseignant — Sénégal & Madagascar',
        photo: 'https://placehold.co/160x160/8f3d22/fbf4ea?text=PK'
    }
];

@Component({
    selector: 'app-vitrine',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="v">
            <header class="v-header">
                <div class="v-container v-header-row">
                    <span class="v-wordmark">FORBIDEC <em>· IBG Afrique</em></span>
                    <button type="button" class="v-btn v-btn--ghost" (click)="seConnecter()">Se connecter</button>
                </div>
            </header>

            <section class="v-hero">
                <div class="v-hero-bg" aria-hidden="true"></div>
                <div class="v-hero-overlay" aria-hidden="true"></div>
                <div class="v-container v-hero-content">
                    <span class="v-eyebrow">Institut Biblique de Genève · Afrique</span>
                    <h1 class="v-h1">Formés pour servir,<br />ancrés dans la Parole.</h1>
                    <p class="v-lede">
                        Formation biblique et théologique intensive à Dakar et à Antananarivo, portée par le réseau panafricain
                        de l'Institut Biblique de Genève — ouverte aux chrétiens engagés, pasteurs, responsables d'église et
                        évangélistes.
                    </p>
                    <blockquote class="v-verse">
                        « Tu enseigneras ces choses à des hommes fidèles, qui soient capables de les enseigner aussi à d'autres. »
                        <cite>— 2 Timothée 2.2</cite>
                    </blockquote>
                    <button type="button" class="v-btn v-btn--solid" (click)="seConnecter()">
                        Accéder à la plateforme <span aria-hidden="true">→</span>
                    </button>
                </div>
            </section>

            <section class="v-stats">
                <div class="v-container v-stats-row">
                    @for (stat of statistiques; track stat.libelle; let last = $last) {
                        <div class="v-stat" [class.v-stat--last]="last">
                            <div class="v-stat-value">{{ stat.valeur }}</div>
                            <div class="v-stat-label">{{ stat.libelle }}</div>
                        </div>
                    }
                </div>
            </section>

            <section class="v-mission">
                <div class="v-container v-mission-grid">
                    <div class="v-mission-text">
                        <span class="v-eyebrow v-eyebrow--dark">Notre mission</span>
                        <h2 class="v-h2">Trente ans à former l'Église en Afrique</h2>
                        <p>
                            Née en 1996 d'un partenariat entre la Fraternité Évangélique du Sénégal et l'Institut Biblique de
                            Genève, FORBIDEC offre une formation théologique intensive et décentralisée. Depuis 2016, un second
                            centre à Antananarivo étend ce même enseignement à Madagascar.
                        </p>
                        <p>
                            Des enseignants de Genève et d'Afrique — parfois communs aux deux centres — dispensent ensemble des
                            dizaines d'heures de cours bibliques et théologiques. Après plusieurs sessions complètes, les
                            étudiants reçoivent le certificat <strong>IBG Afrique</strong>, reconnu au sein du réseau
                            international de l'Institut Biblique de Genève.
                        </p>
                        <ul class="v-list">
                            <li>Théologie systématique et biblique</li>
                            <li>Étude approfondie de l'Ancien et du Nouveau Testament</li>
                            <li>Formation pratique au ministère et à l'évangélisation</li>
                            <li>Certification IBG Afrique après cursus complet</li>
                        </ul>
                    </div>
                    <div class="v-mission-photo">
                        <img
                            src="/vitrine/session-dakar.jpg"
                            alt="Session de cours au centre de Dakar"
                            loading="lazy"
                        />
                        <div class="v-mission-caption">
                            <span class="v-mission-caption-value">28+</span>
                            <span class="v-mission-caption-label">sessions organisées depuis la fondation</span>
                        </div>
                    </div>
                </div>
            </section>

            <section class="v-centres">
                <div class="v-container">
                    <div class="v-section-head">
                        <span class="v-eyebrow v-eyebrow--dark">Deux centres, un même réseau</span>
                        <h2 class="v-h2">Nos centres de formation</h2>
                    </div>
                    <div class="v-centres-grid">
                        @for (centre of centres; track centre.pays) {
                            <article class="v-centre-card">
                                <div class="v-centre-photo">
                                    <img [src]="centre.photo" [alt]="'Centre de ' + centre.ville" loading="lazy" />
                                </div>
                                <div class="v-centre-body">
                                    <span class="v-centre-tag">{{ centre.pays }}</span>
                                    <h3 class="v-h3">{{ centre.ville }}</h3>
                                    <div class="v-centre-meta">
                                        <span>{{ centre.depuis }}</span>
                                        <span aria-hidden="true">·</span>
                                        <span>{{ centre.effectif }}</span>
                                    </div>
                                    <p>{{ centre.description }}</p>
                                </div>
                            </article>
                        }
                    </div>
                </div>
            </section>

            <section class="v-temoignages">
                <div class="v-container">
                    <h2 class="v-h2 v-h2--center">Ils témoignent</h2>
                    <div class="v-temoignages-grid">
                        @for (t of temoignages; track t.auteur) {
                            <figure class="v-temoignage">
                                <blockquote>« {{ t.citation }} »</blockquote>
                                <figcaption>
                                    <img [src]="t.photo" [alt]="t.auteur" loading="lazy" />
                                    <div>
                                        <div class="v-temoignage-auteur">{{ t.auteur }}</div>
                                        <div class="v-temoignage-role">{{ t.role }}</div>
                                    </div>
                                </figcaption>
                            </figure>
                        }
                    </div>
                </div>
            </section>

            <section class="v-cta">
                <div class="v-container v-cta-content">
                    <h2 class="v-h2">Vous êtes formateur, étudiant ou administrateur&nbsp;?</h2>
                    <p>
                        Connectez-vous à la plateforme de gestion académique d'IBG Afrique pour consulter les cycles, les
                        étudiants, les notes et les bulletins — à Dakar comme à Antananarivo.
                    </p>
                    <button type="button" class="v-btn v-btn--solid v-btn--light" (click)="seConnecter()">Se connecter</button>
                </div>
            </section>

            <footer class="v-footer">
                <div class="v-container v-footer-row">
                    <span>FORBIDEC · Institut Biblique de Genève — Afrique</span>
                    <a href="https://model-technologie.com" target="_blank" rel="noopener noreferrer">Model Technologie</a>
                </div>
            </footer>
        </div>
    `,
    styles: [
        `
            :host {
                --v-ink: #211b17;
                --v-ink-soft: #6b5d51;
                --v-cream: #fbf4ea;
                --v-cream-deep: #f2e6d3;
                --v-terracotta: #b5502f;
                --v-terracotta-deep: #8f3d22;
                --v-indigo: #233a5c;
                --v-gold: #d9a441;
                --v-line: rgba(33, 27, 23, 0.12);

                display: block;
                font-family: 'Karla', sans-serif;
                color: var(--v-ink);
                background: var(--v-cream);
            }

            .v {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                overflow-x: clip;
            }

            .v-container {
                max-width: 1160px;
                margin: 0 auto;
                padding-left: 1.75rem;
                padding-right: 1.75rem;
            }

            /* ---------- header ---------- */
            .v-header {
                position: sticky;
                top: 0;
                z-index: 20;
                background: color-mix(in srgb, var(--v-cream) 92%, transparent);
                backdrop-filter: blur(6px);
                border-bottom: 1px solid var(--v-line);
            }

            .v-header-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1.1rem 0;
            }

            .v-wordmark {
                font-family: 'Fraunces', serif;
                font-size: 1.3rem;
                font-weight: 600;
                letter-spacing: -0.01em;
                color: var(--v-ink);
            }

            .v-wordmark em {
                font-style: italic;
                font-weight: 500;
                color: var(--v-terracotta-deep);
            }

            .v-btn {
                font-family: 'Karla', sans-serif;
                font-weight: 600;
                font-size: 0.95rem;
                border-radius: 999px;
                padding: 0.7rem 1.5rem;
                border: 1.5px solid transparent;
                cursor: pointer;
                transition:
                    transform 0.15s ease,
                    background-color 0.15s ease,
                    box-shadow 0.15s ease;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }

            .v-btn:hover {
                transform: translateY(-1px);
            }

            .v-btn--ghost {
                background: transparent;
                border-color: var(--v-ink);
                color: var(--v-ink);
            }

            .v-btn--ghost:hover {
                background: var(--v-ink);
                color: var(--v-cream);
            }

            .v-btn--solid {
                background: var(--v-terracotta);
                color: var(--v-cream);
                box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--v-terracotta) 70%, transparent);
            }

            .v-btn--solid:hover {
                background: var(--v-terracotta-deep);
            }

            .v-btn--light {
                background: var(--v-gold);
                color: var(--v-ink);
            }

            .v-btn--light:hover {
                background: color-mix(in srgb, var(--v-gold) 85%, white);
            }

            /* ---------- hero ---------- */
            .v-hero {
                position: relative;
                display: flex;
                align-items: flex-end;
                min-height: min(92vh, 780px);
                color: var(--v-cream);
                isolation: isolate;
            }

            .v-hero-bg {
                position: absolute;
                inset: 0;
                background: url('/vitrine/hero-dakar.jpg') center/cover no-repeat;
                z-index: -2;
            }

            .v-hero-overlay {
                position: absolute;
                inset: 0;
                background: linear-gradient(180deg, rgba(33, 20, 14, 0.35) 0%, rgba(24, 15, 10, 0.55) 55%, rgba(17, 11, 8, 0.92) 100%);
                z-index: -1;
            }

            .v-hero-content {
                padding-top: 6rem;
                padding-bottom: 5rem;
                max-width: 780px;
            }

            .v-eyebrow {
                display: inline-block;
                font-family: 'Karla', sans-serif;
                font-weight: 700;
                font-size: 0.78rem;
                letter-spacing: 0.14em;
                text-transform: uppercase;
                color: var(--v-gold);
                margin-bottom: 1.1rem;
            }

            .v-eyebrow--dark {
                color: var(--v-terracotta-deep);
            }

            .v-h1 {
                font-family: 'Fraunces', serif;
                font-optical-sizing: auto;
                font-size: clamp(2.6rem, 5.5vw, 4.4rem);
                line-height: 1.04;
                font-weight: 500;
                margin: 0 0 1.25rem;
                text-wrap: balance;
                color: var(--v-cream);
            }

            .v-lede {
                font-size: 1.15rem;
                line-height: 1.6;
                color: color-mix(in srgb, var(--v-cream) 88%, transparent);
                max-width: 42rem;
                margin: 0 0 1.75rem;
            }

            .v-verse {
                font-family: 'Fraunces', serif;
                font-style: italic;
                font-size: 1.15rem;
                line-height: 1.5;
                margin: 0 0 2.25rem;
                padding-left: 1.25rem;
                border-left: 3px solid var(--v-gold);
                max-width: 34rem;
                color: color-mix(in srgb, var(--v-cream) 94%, transparent);
            }

            .v-verse cite {
                display: block;
                margin-top: 0.5rem;
                font-family: 'Karla', sans-serif;
                font-style: normal;
                font-size: 0.85rem;
                color: var(--v-gold);
            }

            /* ---------- stats ---------- */
            .v-stats {
                background: var(--v-ink);
                color: var(--v-cream);
            }

            .v-stats-row {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                padding: 2.75rem 0;
            }

            @media (min-width: 800px) {
                .v-stats-row {
                    grid-template-columns: repeat(4, 1fr);
                }
            }

            .v-stat {
                text-align: center;
                padding: 0.75rem 1rem;
                border-right: 1px solid rgba(251, 244, 234, 0.14);
            }

            .v-stat--last {
                border-right: none;
            }

            .v-stat-value {
                font-family: 'Fraunces', serif;
                font-size: 2.1rem;
                font-weight: 500;
                color: var(--v-gold);
            }

            .v-stat-label {
                font-size: 0.85rem;
                color: color-mix(in srgb, var(--v-cream) 75%, transparent);
                margin-top: 0.25rem;
            }

            /* ---------- mission ---------- */
            .v-mission {
                padding: 6rem 0;
            }

            .v-mission-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 3.5rem;
                align-items: center;
            }

            @media (min-width: 900px) {
                .v-mission-grid {
                    grid-template-columns: 1.05fr 0.95fr;
                }
            }

            .v-h2 {
                font-family: 'Fraunces', serif;
                font-weight: 500;
                font-size: clamp(1.9rem, 3vw, 2.6rem);
                line-height: 1.12;
                margin: 0.4rem 0 1.25rem;
                text-wrap: balance;
                color: var(--v-ink);
            }

            .v-h2--center {
                text-align: center;
            }

            .v-mission-text p {
                color: var(--v-ink-soft);
                line-height: 1.7;
                margin: 0 0 1rem;
            }

            .v-list {
                list-style: none;
                margin: 1.5rem 0 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                gap: 0.6rem;
            }

            .v-list li {
                position: relative;
                padding-left: 1.6rem;
                color: var(--v-ink);
                font-weight: 500;
            }

            .v-list li::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0.5em;
                width: 0.6rem;
                height: 2px;
                background: var(--v-terracotta);
            }

            .v-mission-photo {
                position: relative;
            }

            .v-mission-photo img {
                width: 100%;
                aspect-ratio: 9 / 11;
                object-fit: cover;
                border-radius: 4px;
                display: block;
            }

            .v-mission-caption {
                position: absolute;
                left: -1.25rem;
                bottom: -1.5rem;
                background: var(--v-cream);
                border: 1px solid var(--v-line);
                box-shadow: 0 20px 40px -20px rgba(33, 27, 23, 0.35);
                padding: 1.1rem 1.4rem;
                display: flex;
                flex-direction: column;
                max-width: 12rem;
            }

            .v-mission-caption-value {
                font-family: 'Fraunces', serif;
                font-size: 1.6rem;
                color: var(--v-terracotta-deep);
                line-height: 1;
            }

            .v-mission-caption-label {
                font-size: 0.78rem;
                color: var(--v-ink-soft);
                margin-top: 0.35rem;
            }

            /* ---------- centres ---------- */
            .v-centres {
                background: var(--v-cream-deep);
                padding: 6rem 0;
            }

            .v-section-head {
                text-align: center;
                max-width: 40rem;
                margin: 0 auto 3rem;
            }

            .v-centres-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 2.5rem;
            }

            @media (min-width: 800px) {
                .v-centres-grid {
                    grid-template-columns: 1fr 1fr;
                }
            }

            .v-centre-card {
                background: var(--v-cream);
                border: 1px solid var(--v-line);
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .v-centre-photo {
                aspect-ratio: 16 / 10;
                overflow: hidden;
            }

            .v-centre-photo img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                transition: transform 0.4s ease;
            }

            .v-centre-card:hover .v-centre-photo img {
                transform: scale(1.04);
            }

            .v-centre-body {
                padding: 1.75rem 1.75rem 2rem;
            }

            .v-centre-tag {
                display: inline-block;
                font-size: 0.72rem;
                font-weight: 700;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                color: var(--v-terracotta-deep);
                background: color-mix(in srgb, var(--v-terracotta) 14%, transparent);
                padding: 0.25rem 0.65rem;
                border-radius: 999px;
                margin-bottom: 0.75rem;
            }

            .v-h3 {
                font-family: 'Fraunces', serif;
                font-weight: 500;
                font-size: 1.6rem;
                margin: 0 0 0.4rem;
                color: var(--v-ink);
            }

            .v-centre-meta {
                display: flex;
                gap: 0.5rem;
                font-size: 0.85rem;
                color: var(--v-ink-soft);
                margin-bottom: 1rem;
            }

            .v-centre-body p {
                color: var(--v-ink-soft);
                line-height: 1.65;
                margin: 0;
            }

            /* ---------- temoignages ---------- */
            .v-temoignages {
                padding: 6rem 0;
            }

            .v-temoignages-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 2rem;
                margin-top: 3rem;
            }

            @media (min-width: 800px) {
                .v-temoignages-grid {
                    grid-template-columns: 1fr 1fr;
                }
            }

            .v-temoignage {
                margin: 0;
                padding: 2rem;
                background: var(--v-cream-deep);
                border-left: 3px solid var(--v-gold);
            }

            .v-temoignage blockquote {
                margin: 0 0 1.5rem;
                font-family: 'Fraunces', serif;
                font-style: italic;
                font-size: 1.2rem;
                line-height: 1.5;
                color: var(--v-ink);
            }

            .v-temoignage figcaption {
                display: flex;
                align-items: center;
                gap: 0.85rem;
            }

            .v-temoignage img {
                width: 3rem;
                height: 3rem;
                border-radius: 50%;
                object-fit: cover;
            }

            .v-temoignage-auteur {
                font-weight: 700;
            }

            .v-temoignage-role {
                font-size: 0.82rem;
                color: var(--v-ink-soft);
            }

            /* ---------- cta ---------- */
            .v-cta {
                background: var(--v-indigo);
                color: var(--v-cream);
            }

            .v-cta-content {
                text-align: center;
                padding: 5.5rem 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1.25rem;
            }

            .v-cta .v-h2 {
                color: var(--v-cream);
                max-width: 34rem;
            }

            .v-cta-content p {
                max-width: 32rem;
                color: color-mix(in srgb, var(--v-cream) 82%, transparent);
                line-height: 1.6;
                margin: 0;
            }

            /* ---------- footer ---------- */
            .v-footer {
                margin-top: auto;
                border-top: 1px solid var(--v-line);
            }

            .v-footer-row {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem 1rem;
                justify-content: space-between;
                padding: 1.5rem 0;
                font-size: 0.85rem;
                color: var(--v-ink-soft);
            }

            .v-footer-row a {
                color: var(--v-terracotta-deep);
                font-weight: 700;
                text-decoration: none;
            }

            .v-footer-row a:hover {
                text-decoration: underline;
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
    centres = CENTRES;
    temoignages = TEMOIGNAGES;

    constructor() {
        this.title.setTitle('FORBIDEC — Formation biblique et théologique en Afrique | IBG Afrique');
        this.meta.updateTag({
            name: 'description',
            content:
                "FORBIDEC (IBG Afrique) forme depuis 1996 des chrétiens engagés, pasteurs et évangélistes à Dakar (Sénégal) et Antananarivo (Madagascar), à travers une formation biblique et théologique intensive portée par le réseau de l'Institut Biblique de Genève en Afrique."
        });
        this.meta.updateTag({
            property: 'og:title',
            content: 'FORBIDEC — Formation biblique et théologique en Afrique'
        });
        this.meta.updateTag({
            property: 'og:description',
            content: "Formation biblique décentralisée à Dakar et Antananarivo, portée par l'Institut Biblique de Genève — Afrique."
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
