import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { BaremeMention } from '@/app/features/bareme-mention/domain/bareme-mention.model';
import { BaremeMentionApi } from '@/app/features/bareme-mention/data-access/bareme-mention.api';
import { Bulletin } from '../domain/bulletin.model';
import { BulletinApi } from '../data-access/bulletin.api';

function borneLabel(bareme: BaremeMention): string {
    if (bareme.borneMin === null) {
        return `moins de ${bareme.borneMax}`;
    }
    const open = bareme.minInclus ? '[' : ']';
    const close = bareme.maxInclus ? ']' : '[';
    return `${open}${bareme.borneMin}-${bareme.borneMax}${close}`;
}

@Component({
    selector: 'app-etudiant-bulletin',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, RouterModule, ButtonModule, CardModule, TableModule],
    template: `
        <div class="screen-only flex flex-col gap-4">
            <p-card>
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h5 class="m-0">{{ bulletin()?.nom }} {{ bulletin()?.prenom }}</h5>
                        <div class="text-muted-color mt-1">
                            {{ bulletin()?.centreNom }} ({{ bulletin()?.centreCode }}) — Matricule : {{ bulletin()?.matricule ?? 'n/a' }}
                        </div>
                    </div>
                    <p-button
                        label="Télécharger le PDF"
                        icon="pi pi-file-pdf"
                        [loading]="telechargementEnCours()"
                        (onClick)="telechargerPdf()"
                        [disabled]="!bulletin()"
                    />
                </div>
            </p-card>

            <p-card header="Historique">
                <p-table [value]="bulletin()?.lignes ?? []">
                    <ng-template #header>
                        <tr>
                            <th>Cycle</th>
                            <th>Cours</th>
                            <th>Mention</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-row>
                        <tr>
                            <td>{{ row.cycleAnnee }}</td>
                            <td>{{ row.coursIntitule }}</td>
                            <td>{{ row.mentionLongue }}</td>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="3" class="text-center py-6">Aucune note comptant dans la moyenne pour cet étudiant.</td>
                        </tr>
                    </ng-template>
                </p-table>
                @if (bulletin()?.moyenneGenerale !== null && bulletin()?.moyenneGenerale !== undefined) {
                    <div class="flex gap-8 mt-4">
                        <div>
                            <span class="font-bold">Moyenne générale : </span>{{ bulletin()?.moyenneGenerale }}
                        </div>
                        <div>
                            <span class="font-bold">Mention : </span>{{ bulletin()?.mentionGeneraleLongue }}
                        </div>
                    </div>
                }
            </p-card>
        </div>

        @if (bulletin(); as b) {
            <div class="bulletin-print">
                <div class="masthead">
                    @if (b.centreCode === CODE_CENTRE_AVEC_FES) {
                        <img src="/logos/fes-logo.jpg" alt="FES" class="logo logo-gauche" />
                    }
                    <p class="entete">{{ b.centreEnteteDocument }}</p>
                    <img src="/logos/ibg-logo.png" alt="IBG" class="logo logo-droit" />
                </div>
                <p class="identite">{{ b.nom }}, {{ b.prenom }}</p>
                <h2 class="titre">{{ b.centreCode }} - Feuille récapitulative des mentions</h2>

                <table class="lignes">
                    <thead>
                        <tr>
                            <th>Cycle</th>
                            <th>Cours</th>
                            <th>Mention</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (ligne of b.lignes; track ligne.cycleAnnee + ligne.coursIntitule) {
                            <tr>
                                <td>{{ ligne.cycleAnnee }}</td>
                                <td>{{ ligne.coursIntitule }}</td>
                                <td>{{ ligne.mentionLongue }}</td>
                            </tr>
                        }
                    </tbody>
                </table>

                <div class="synthese">
                    <span class="synthese-titre">COURS</span>
                    <div class="synthese-ligne"><span>Moyenne Générale</span><span class="box">{{ b.moyenneGenerale }}</span></div>
                    <div class="synthese-ligne"><span>Mention</span><span class="box">{{ b.mentionGeneraleCourte }}</span></div>
                </div>

                <div class="signature">
                    <span>{{ b.centreVille }}, le {{ b.dateEdition | date: 'd MMMM y' }}</span>
                    <span>{{ b.centreSignataire }}</span>
                </div>

                <p class="legende">{{ legende() }}</p>
                <p class="pied">{{ b.centreCode }} - {{ b.derniereAnnee }} - {{ b.nom }}, {{ b.prenom }}</p>
            </div>
        }
    `,
    styles: [
        `
            .bulletin-print {
                display: none;
            }

            @media print {
                .screen-only {
                    display: none !important;
                }

                .bulletin-print {
                    display: block;
                    font-family: Arial, sans-serif;
                    color: #000;
                }

                .masthead {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .masthead .logo {
                    height: 64px;
                    width: 64px;
                    object-fit: contain;
                    flex: none;
                }

                .masthead .logo-droit {
                    margin-left: auto;
                    object-position: right center;
                }

                .entete {
                    flex: 1;
                    text-align: center;
                    font-style: italic;
                    font-weight: bold;
                    margin: 0;
                    white-space: pre-line;
                }

                .identite {
                    text-align: center;
                    font-weight: bold;
                    margin-bottom: 2rem;
                }

                .titre {
                    text-align: center;
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                }

                table.lignes {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1.5rem;
                }

                table.lignes th {
                    text-align: left;
                    border-bottom: 1px solid #000;
                    padding: 0.25rem 0.5rem;
                }

                table.lignes td {
                    padding: 0.15rem 0.5rem;
                }

                .synthese {
                    margin-bottom: 2rem;
                }

                .synthese-titre {
                    font-weight: bold;
                }

                .synthese-ligne {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin: 0.5rem 0 0 2rem;
                    max-width: 16rem;
                }

                .synthese-ligne span:first-child {
                    font-weight: bold;
                    flex: 1;
                }

                .box {
                    border: 1px solid #000;
                    padding: 0.1rem 1rem;
                    min-width: 3rem;
                    text-align: center;
                }

                .signature {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 3rem;
                }

                .legende {
                    font-size: 0.7rem;
                    border-top: 1px solid #000;
                    padding-top: 0.5rem;
                }

                .pied {
                    font-size: 0.7rem;
                    display: flex;
                    justify-content: space-between;
                }
            }
        `
    ]
})
export class EtudiantBulletin {
    private readonly api = inject(BulletinApi);
    private readonly baremeApi = inject(BaremeMentionApi);

    readonly CODE_CENTRE_AVEC_FES = 'CDDakar';

    id = input.required<string>();

    bulletin = signal<Bulletin | null>(null);
    baremes = signal<BaremeMention[]>([]);
    telechargementEnCours = signal(false);

    legende = computed(() =>
        this.baremes()
            .filter((b) => b.actif)
            .sort((a, b) => a.ordreAffichage - b.ordreAffichage)
            .map((b) => `${b.libelleCourt} = ${b.libelleLong}: ${borneLabel(b)}`)
            .join(' ; ')
    );

    constructor() {
        effect(() => {
            this.bulletin.set(null);
            this.api.get(Number(this.id())).subscribe((bulletin) => this.bulletin.set(bulletin));
        });
        this.baremeApi.query({ size: 100 }).subscribe((page) => this.baremes.set(page.content));
    }

    telechargerPdf(): void {
        const b = this.bulletin();
        if (!b) {
            return;
        }
        this.telechargementEnCours.set(true);
        this.api.getPdf(b.etudiantId).subscribe({
            next: (blob) => {
                this.telechargementEnCours.set(false);
                const url = window.URL.createObjectURL(blob);
                const lien = document.createElement('a');
                lien.href = url;
                lien.download = `bulletin-${b.matricule ?? b.etudiantId}.pdf`;
                lien.click();
                window.URL.revokeObjectURL(url);
            },
            error: () => this.telechargementEnCours.set(false)
        });
    }
}
