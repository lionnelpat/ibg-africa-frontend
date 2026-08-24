import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { NotificationService } from '@/app/core/notification/notification.service';
import { Etudiant } from '@/app/features/etudiant/domain/etudiant.model';
import { EtudiantApi } from '@/app/features/etudiant/data-access/etudiant.api';
import { CycleDetail as CycleDetailModel, EtudiantResume } from '../domain/cycle-detail.model';
import { CycleDetailApi } from '../data-access/cycle-detail.api';
import { InscriptionCycleApi } from '../data-access/inscription-cycle.api';
import { CycleApi } from '../data-access/cycle.api';

interface EtudiantSuggestion extends Etudiant {
    nomAffiche: string;
}

@Component({
    selector: 'app-cycle-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, AutoCompleteModule, ButtonModule, CardModule, DialogModule, TableModule, TagModule],
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
                    <div class="flex items-center gap-3">
                        <p-tag [value]="detail()?.cloture ? 'Clôturé' : 'En cours'" [severity]="detail()?.cloture ? 'success' : 'info'" />
                        @if (!detail()?.cloture) {
                            <p-button label="Clôturer le cycle" icon="pi pi-lock" severity="danger" outlined size="small" (onClick)="cloturerCycle()" />
                        }
                    </div>
                </div>
            </p-card>

            <p-card header="Matières dispensées">
                <p class="text-muted-color mt-0 mb-4">Cliquez sur une matière pour saisir les notes des étudiants inscrits.</p>
                <p-table [value]="detail()?.matieresDispensees ?? []" dataKey="evaluationPrevueId" styleClass="cursor-pointer">
                    <ng-template #header>
                        <tr>
                            <th>Cours</th>
                            <th>Matière</th>
                            <th>Sous-matière</th>
                            <th>Enseignant</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-row>
                        <tr [routerLink]="['/cycle', id(), 'matiere', row.evaluationPrevueId]">
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

            <p-card>
                <ng-template #header>
                    <div class="flex items-center justify-between px-4 pt-4">
                        <span class="font-semibold text-xl">Étudiants inscrits</span>
                        <p-button label="Ajouter un étudiant" icon="pi pi-plus" size="small" (onClick)="openAdd()" />
                    </div>
                </ng-template>
                <p-table [value]="detail()?.etudiants ?? []" dataKey="id" [paginator]="true" [rows]="15">
                    <ng-template #header>
                        <tr>
                            <th>Matricule</th>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Actif</th>
                            <th style="width: 14rem"></th>
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
                                @if (!detail()?.cloture) {
                                    <p-button icon="pi pi-user-minus" severity="danger" size="small" [text]="true" (onClick)="retirer(row)" />
                                }
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

        <p-dialog [(visible)]="addDialogVisible" [style]="{ width: '480px' }" header="Ajouter un étudiant au cycle" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4 pt-2">
                    <div>
                        <label for="etudiant" class="block font-medium mb-2">Étudiant <span class="text-red-500">*</span></label>
                        <p-autocomplete
                            inputId="etudiant"
                            [formControl]="form.controls.etudiant"
                            [suggestions]="suggestions()"
                            (completeMethod)="search($event)"
                            optionLabel="nomAffiche"
                            [dropdown]="false"
                            fluid
                            placeholder="Rechercher par nom..."
                        >
                            <ng-template let-etudiant #item>
                                <div>{{ etudiant.nom }} {{ etudiant.prenom }} <span class="text-muted-color">{{ etudiant.matricule }}</span></div>
                            </ng-template>
                        </p-autocomplete>
                        @if (dejaInscrit()) {
                            <small class="text-red-500">Cet étudiant est déjà inscrit sur ce cycle.</small>
                        }
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" text (onClick)="addDialogVisible.set(false)" />
                <p-button label="Inscrire" icon="pi pi-check" [disabled]="form.invalid || dejaInscrit()" (onClick)="confirmAdd()" />
            </ng-template>
        </p-dialog>
    `
})
export class CycleDetail {
    private readonly api = inject(CycleDetailApi);
    private readonly etudiantApi = inject(EtudiantApi);
    private readonly inscriptionCycleApi = inject(InscriptionCycleApi);
    private readonly cycleApi = inject(CycleApi);
    private readonly notification = inject(NotificationService);
    private readonly fb = inject(NonNullableFormBuilder);

    id = input.required<string>();

    detail = signal<CycleDetailModel | null>(null);
    suggestions = signal<EtudiantSuggestion[]>([]);
    addDialogVisible = signal(false);

    form = this.fb.group({
        etudiant: this.fb.control<EtudiantSuggestion | null>(null, { validators: [Validators.required] })
    });

    constructor() {
        effect(() => {
            this.detail.set(null);
            this.reload();
        });
    }

    private reload(): void {
        this.api.get(Number(this.id())).subscribe((detail) => this.detail.set(detail));
    }

    dejaInscrit(): boolean {
        const selection = this.form.controls.etudiant.value;
        if (!selection) {
            return false;
        }
        return (this.detail()?.etudiants ?? []).some((e) => e.id === selection.id);
    }

    openAdd(): void {
        this.form.reset({ etudiant: null });
        this.suggestions.set([]);
        this.addDialogVisible.set(true);
    }

    search(event: AutoCompleteCompleteEvent): void {
        this.etudiantApi.query({ 'nom.contains': event.query, size: 20 }).subscribe((page) =>
            this.suggestions.set(
                page.content.map((etudiant) => ({
                    ...etudiant,
                    nomAffiche: `${etudiant.nom} ${etudiant.prenom}${etudiant.matricule ? ' — ' + etudiant.matricule : ''}`
                }))
            )
        );
    }

    confirmAdd(): void {
        const etudiant = this.form.controls.etudiant.value;
        const cycleId = Number(this.id());
        if (!etudiant || this.form.invalid) {
            return;
        }
        this.inscriptionCycleApi
            .create({
                dateInscription: new Date().toISOString().slice(0, 10),
                cycleTermine: false,
                groupe: null,
                cycle: { id: cycleId },
                etudiant: { id: etudiant.id }
            })
            .subscribe(() => {
                this.notification.success('Étudiant inscrit.');
                this.addDialogVisible.set(false);
                this.reload();
            });
    }

    retirer(row: EtudiantResume): void {
        this.notification.confirmDelete(`Retirer ${row.nom} ${row.prenom} de ce cycle ?`, () => {
            this.inscriptionCycleApi.delete(row.inscriptionCycleId).subscribe(() => {
                this.notification.success('Étudiant retiré du cycle.');
                this.reload();
            });
        });
    }

    cloturerCycle(): void {
        const cycleId = Number(this.id());
        this.notification.confirm('Clôturer ce cycle ? Les notes ne pourront plus être modifiées ni saisies en masse.', 'Clôturer', () => {
            this.cycleApi.partialUpdate({ id: cycleId, cloture: true }).subscribe(() => {
                this.notification.success('Cycle clôturé.');
                this.reload();
            });
        });
    }
}
