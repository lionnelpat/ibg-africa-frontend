import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
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
    imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonModule, CardModule, InputNumberModule, SelectModule, TableModule],
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
                    <p-button label="Retour au cycle" icon="pi pi-arrow-left" text [routerLink]="['/cycle', matiere()?.cycleId]" />
                </div>
            </p-card>

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
                <div class="flex justify-end mt-4">
                    <p-button label="Enregistrer" icon="pi pi-check" (onClick)="enregistrer()" />
                </div>
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

    rows = this.fb.array<ReturnType<typeof this.buildRow>>([]);

    constructor() {
        effect(() => {
            const id = Number(this.evaluationPrevueId());
            this.api.getGrille(id).subscribe((matiere) => {
                this.matiere.set(matiere);
                this.rows.clear();
                for (const ligne of matiere.lignes) {
                    this.rows.push(this.buildRow(ligne));
                }
            });
        });
    }

    private buildRow(ligne: SaisieLigne) {
        return this.fb.group({
            etudiantId: this.fb.control(ligne.etudiantId),
            matricule: this.fb.control(ligne.matricule),
            nom: this.fb.control(ligne.nom),
            prenom: this.fb.control(ligne.prenom),
            note: this.fb.control<number | null>(ligne.note),
            statut: this.fb.control<StatutNote>(ligne.statut)
        });
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
}
