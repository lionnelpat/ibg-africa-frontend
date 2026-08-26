import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { NotificationService } from '@/app/core/notification/notification.service';
import { SaisieLigne, SaisieMatiere, StatutNote } from '../domain/saisie.model';
import { SaisieApi } from '../data-access/saisie.api';

const STATUT_OPTIONS: { label: string; value: StatutNote }[] = [
    { label: 'Non saisie', value: 'NON_SAISIE' },
    { label: 'Saisie', value: 'SAISIE' },
    { label: 'Absent', value: 'ABSENT' },
    { label: 'Dispensé', value: 'DISPENSE' },
    { label: 'Validée', value: 'VALIDEE' }
];

@Component({
    selector: 'app-saisie-notes',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonModule, CardModule, InputNumberModule, SelectModule, TableModule, TagModule],
    template: `
        <div class="flex flex-col gap-4">
            <p-card>
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h5 class="m-0">{{ matiere()?.intitule }}</h5>
                        <div class="text-muted-color mt-1">
                            {{ matiere()?.coursIntitule }} — Cycle {{ matiere()?.cycleAnnee }} — Coefficient {{ matiere()?.coefficient }} — Note sur {{ matiere()?.noteMaximale }}
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        @if (matiere()?.cycleCloture) {
                            <p-tag value="Cycle clôturé — lecture seule" severity="warn" />
                        }
                        <p-button label="Retour au cycle" icon="pi pi-arrow-left" text [routerLink]="['/cycle', matiere()?.cycleId]" />
                    </div>
                </div>
            </p-card>

            @if (!matiere()?.cycleCloture) {
                <p-card header="Saisie en masse (Excel)">
                    <p class="text-muted-color mt-0 mb-4">
                        Fichier .xlsx avec les informations de la matière et de l'enseignant en en-tête, puis un tableau à trois colonnes (matricule, nom
                        prénom, note) avec une ligne par étudiant. Téléchargez le modèle pré-rempli avec la liste des inscrits, à faire compléter par
                        l'enseignant.
                    </p>
                    <div class="flex items-center gap-3">
                        <input #fileInput type="file" accept=".xlsx" hidden (change)="onFileSelected($event)" />
                        <p-button
                            label="Télécharger le modèle"
                            icon="pi pi-download"
                            severity="secondary"
                            outlined
                            [loading]="telechargementModele()"
                            (onClick)="telechargerModele()"
                        />
                        <p-button label="Importer un fichier Excel" icon="pi pi-upload" severity="secondary" outlined [loading]="importing()" (onClick)="fileInput.click()" />
                    </div>
                </p-card>
            }

            <p-card>
                <p-table [value]="rows.controls" dataKey="etudiantId">
                    <ng-template #header>
                        <tr>
                            <th>Matricule</th>
                            <th>Étudiant</th>
                            <th style="width: 10rem">Note</th>
                            <th style="width: 12rem">Statut</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-row>
                        <tr [formGroup]="row">
                            <td>{{ row.controls.matricule.value }}</td>
                            <td>{{ row.controls.nom.value }} {{ row.controls.prenom.value }}</td>
                            <td>
                                <p-inputnumber
                                    [formControl]="row.controls.note"
                                    [min]="0"
                                    [max]="matiere()?.noteMaximale ?? 20"
                                    mode="decimal"
                                    [minFractionDigits]="0"
                                    [maxFractionDigits]="2"
                                    fluid
                                />
                            </td>
                            <td><p-select [formControl]="row.controls.statut" [options]="statutOptions" optionLabel="label" optionValue="value" fluid /></td>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="4" class="text-center py-6">Aucun étudiant inscrit sur ce cycle.</td>
                        </tr>
                    </ng-template>
                </p-table>
                @if (!matiere()?.cycleCloture) {
                    <div class="flex justify-end mt-4">
                        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="enregistrer()" />
                    </div>
                }
            </p-card>
        </div>
    `
})
export class SaisieNotes {
    private readonly api = inject(SaisieApi);
    private readonly notification = inject(NotificationService);
    private readonly fb = inject(NonNullableFormBuilder);

    evaluationPrevueId = input.required<string>();

    matiere = signal<SaisieMatiere | null>(null);
    statutOptions = STATUT_OPTIONS;
    importing = signal(false);
    telechargementModele = signal(false);

    rows = this.fb.array<ReturnType<typeof this.buildRow>>([]);

    constructor() {
        effect(() => {
            const id = Number(this.evaluationPrevueId());
            this.chargerGrille(id);
        });
    }

    private chargerGrille(id: number): void {
        this.api.getGrille(id).subscribe((matiere) => {
            this.matiere.set(matiere);
            this.rows.clear();
            for (const ligne of matiere.lignes) {
                this.rows.push(this.buildRow(ligne, matiere.cycleCloture));
            }
        });
    }

    private buildRow(ligne: SaisieLigne, lectureSeule: boolean) {
        const group = this.fb.group({
            etudiantId: this.fb.control(ligne.etudiantId),
            matricule: this.fb.control(ligne.matricule),
            nom: this.fb.control(ligne.nom),
            prenom: this.fb.control(ligne.prenom),
            note: this.fb.control<number | null>(ligne.note),
            statut: this.fb.control<StatutNote>(ligne.statut)
        });
        if (lectureSeule) {
            group.controls.note.disable();
            group.controls.statut.disable();
        }
        return group;
    }

    enregistrer(): void {
        const id = Number(this.evaluationPrevueId());
        const lignes = this.rows.controls.map((row) => ({
            etudiantId: row.controls.etudiantId.value,
            note: row.controls.note.value,
            statut: row.controls.statut.value
        }));
        this.api.enregistrer(id, lignes).subscribe((result) => {
            this.notification.success(`${result.enregistrees} note(s) enregistrée(s).`);
            if (result.erreurs.length > 0) {
                this.notification.error(result.erreurs.slice(0, 5).join(', '));
            }
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const fichier = input.files?.[0];
        if (!fichier) {
            return;
        }
        const id = Number(this.evaluationPrevueId());
        this.importing.set(true);
        this.api.importer(id, fichier).subscribe({
            next: (result) => {
                this.importing.set(false);
                input.value = '';
                this.notification.success(`${result.enregistrees} note(s) importée(s).`);
                if (result.erreurs.length > 0) {
                    this.notification.error(result.erreurs.slice(0, 8).join(' | '));
                }
                this.chargerGrille(id);
            },
            error: () => {
                this.importing.set(false);
                input.value = '';
            }
        });
    }

    telechargerModele(): void {
        const id = Number(this.evaluationPrevueId());
        const m = this.matiere();
        const nomFichier = m ? `modele-notes-${m.cycleAnnee}-${m.intitule}.xlsx`.replace(/[^\w.-]+/g, '_') : `modele-notes-${id}.xlsx`;
        this.telechargementModele.set(true);
        this.api.getTemplate(id).subscribe({
            next: (blob) => {
                this.telechargementModele.set(false);
                const url = window.URL.createObjectURL(blob);
                const lien = document.createElement('a');
                lien.href = url;
                lien.download = nomFichier;
                lien.click();
                window.URL.revokeObjectURL(url);
            },
            error: () => this.telechargementModele.set(false)
        });
    }
}
