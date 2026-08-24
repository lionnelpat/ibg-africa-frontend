import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CycleDetail as CycleDetailModel } from '../domain/cycle-detail.model';
import { CycleDetailApi } from '../data-access/cycle-detail.api';

@Component({
    selector: 'app-cycle-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, RouterModule, ButtonModule, CardModule, TableModule, TagModule],
    template: `
        <div class="flex flex-col gap-4">
            <p-card>
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h5 class="m-0">Cycle {{ detail()?.annee }} {{ detail()?.libelle ? '– ' + detail()?.libelle : '' }}</h5>
                        <div class="text-muted-color mt-1">
                            {{ detail()?.centreNom }} ({{ detail()?.centreCode }}) — {{ detail()?.paysNom }}
                        </div>
                    </div>
                    <p-tag [value]="detail()?.cloture ? 'Clôturé' : 'En cours'" [severity]="detail()?.cloture ? 'success' : 'info'" />
                </div>
            </p-card>

            <p-card header="Matières dispensées">
                <p-table [value]="detail()?.matieresDispensees ?? []" dataKey="coursId">
                    <ng-template #header>
                        <tr>
                            <th>Cours</th>
                            <th>Matière</th>
                            <th>Sous-matière</th>
                            <th>Enseignant</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-row>
                        <tr>
                            <td>{{ row.coursIntitule }}</td>
                            <td>{{ row.matiereIntitule }}</td>
                            <td>{{ row.sousMatiereIntitule }}</td>
                            <td>{{ row.enseignantNom }} {{ row.enseignantPrenom }}</td>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="4" class="text-center py-6">Aucune matière planifiée sur ce cycle.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>

            <p-card header="Étudiants inscrits">
                <p-table [value]="detail()?.etudiants ?? []" dataKey="id" [paginator]="true" [rows]="15">
                    <ng-template #header>
                        <tr>
                            <th>Matricule</th>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Actif</th>
                            <th style="width: 10rem"></th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-row>
                        <tr>
                            <td>{{ row.matricule }}</td>
                            <td>{{ row.nom }}</td>
                            <td>{{ row.prenom }}</td>
                            <td><p-tag [value]="row.actif ? 'Oui' : 'Non'" [severity]="row.actif ? 'success' : 'danger'" /></td>
                            <td>
                                <p-button label="Bulletin" icon="pi pi-file-pdf" size="small" [text]="true" [routerLink]="['/etudiant', row.id, 'bulletin']" />
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="5" class="text-center py-6">Aucun étudiant inscrit sur ce cycle.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>
    `
})
export class CycleDetail {
    private readonly api = inject(CycleDetailApi);

    id = input.required<string>();

    detail = signal<CycleDetailModel | null>(null);

    constructor() {
        effect(() => {
            this.detail.set(null);
            this.api.get(Number(this.id())).subscribe((detail) => this.detail.set(detail));
        });
    }
}
