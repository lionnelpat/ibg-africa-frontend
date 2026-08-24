import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { NotificationService } from '@/app/core/notification/notification.service';
import { CentreFormation } from '../domain/centre-formation.model';
import { CentreFormationApi } from '../data-access/centre-formation.api';
import { Pays } from '@/app/features/pays/domain/pays.model';
import { PaysApi } from '@/app/features/pays/data-access/pays.api';

function parseIsoDate(value: string | null): Date | null {
    return value ? new Date(value + 'T00:00:00') : null;
}

function toIsoDate(value: Date | null): string | null {
    if (!value) return null;
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

@Component({
    selector: 'app-centre-formation-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        CardModule,
        CheckboxModule,
        DatePickerModule,
        DialogModule,
        IconFieldModule,
        InputIconModule,
        InputNumberModule,
        InputTextModule,
        SelectModule,
        TableModule,
        TagModule,
        TextareaModule,
        ToolbarModule
    ],
    template: `
        <p-card>
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-button label="Ajouter" icon="pi pi-plus" (onClick)="openNew()" />
                </ng-template>
                <ng-template #end>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(table, $event)" placeholder="Rechercher..." />
                    </p-iconfield>
                </ng-template>
            </p-toolbar>

            <p-table
                #table
                [value]="rows()"
                [loading]="loading()"
                [paginator]="true"
                [rows]="10"
                [rowsPerPageOptions]="[10, 20, 50]"
                [globalFilterFields]="['code', 'nom', 'ville']"
                dataKey="id"
                [rowHover]="true"
                currentPageReportTemplate="{first} à {last} sur {totalRecords}"
                [showCurrentPageReport]="true"
            >
                <ng-template #header>
                    <tr>
                        <th pSortableColumn="code">Code<p-sortIcon field="code" /></th>
                        <th pSortableColumn="nom">Nom<p-sortIcon field="nom" /></th>
                        <th pSortableColumn="ville">Ville<p-sortIcon field="ville" /></th>
                        <th pSortableColumn="actif">Actif<p-sortIcon field="actif" /></th>
                        <th style="width: 8rem"></th>
                    </tr>
                </ng-template>
                <ng-template #body let-row>
                    <tr>
                        <td>{{ row.code }}</td>
                        <td>{{ row.nom }}</td>
                        <td>{{ row.ville }}</td>
                        <td><p-tag [value]="row.actif ? 'Oui' : 'Non'" [severity]="row.actif ? 'success' : 'danger'" /></td>
                        <td>
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" (onClick)="openEdit(row)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [text]="true" (onClick)="remove(row)" />
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr>
                        <td colspan="5" class="text-center py-6">Aucune donnée.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '640px' }" header="CentreFormation" [modal]="true">
            <ng-template #content>
                <form [formGroup]="form" class="grid grid-cols-12 gap-4 pt-2">
                    <div class="field col-span-12 md:col-span-6">
                        <label for="code" class="block font-medium mb-2">Code <span class="text-red-500">*</span></label>
                        <input pInputText id="code" [formControl]="form.controls.code" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="nom" class="block font-medium mb-2">Nom <span class="text-red-500">*</span></label>
                        <input pInputText id="nom" [formControl]="form.controls.nom" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="ville" class="block font-medium mb-2">Ville <span class="text-red-500">*</span></label>
                        <input pInputText id="ville" [formControl]="form.controls.ville" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="adresse" class="block font-medium mb-2">Adresse </label>
                        <input pInputText id="adresse" [formControl]="form.controls.adresse" fluid />
                    </div>
                    <div class="field col-span-12">
                        <label for="enteteDocument" class="block font-medium mb-2">En-tête document</label>
                        <textarea pTextarea id="enteteDocument" [formControl]="form.controls.enteteDocument" rows="3" fluid></textarea>
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="signataire" class="block font-medium mb-2">Signataire <span class="text-red-500">*</span></label>
                        <input pInputText id="signataire" [formControl]="form.controls.signataire" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="logoUrl" class="block font-medium mb-2">URL du logo </label>
                        <input pInputText id="logoUrl" [formControl]="form.controls.logoUrl" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="nbCyclesCursus" class="block font-medium mb-2">Nb cycles du cursus <span class="text-red-500">*</span></label>
                        <p-inputnumber inputId="nbCyclesCursus" [formControl]="form.controls.nbCyclesCursus" [useGrouping]="false" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="noteMaximale" class="block font-medium mb-2">Note maximale <span class="text-red-500">*</span></label>
                        <p-inputnumber inputId="noteMaximale" [formControl]="form.controls.noteMaximale" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6 flex items-center gap-2 pt-6">
                        <p-checkbox inputId="actif" [formControl]="form.controls.actif" [binary]="true" />
                        <label for="actif" class="font-medium">Actif</label>
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="pays" class="block font-medium mb-2">Pays <span class="text-red-500">*</span></label>
                        <p-select inputId="pays" [formControl]="form.controls.pays" [options]="paysOptions()" optionLabel="nom" dataKey="id" [showClear]="false" placeholder="Sélectionner" fluid />
                    </div>
                </form>
            </ng-template>
            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" text (onClick)="dialogVisible.set(false)" />
                <p-button label="Enregistrer" icon="pi pi-check" [disabled]="form.invalid" (onClick)="save()" />
            </ng-template>
        </p-dialog>
    `
})
export class CentreFormationList implements OnInit {
    private readonly api = inject(CentreFormationApi);
    private readonly notification = inject(NotificationService);
    private readonly fb = inject(NonNullableFormBuilder);

    private readonly paysApi = inject(PaysApi);
    paysOptions = signal<Pays[]>([]);

    rows = signal<CentreFormation[]>([]);
    loading = signal(false);

    dialogVisible = signal(false);
    editingId: number | null = null;

    booleanFilterOptions = [
        { label: 'Oui', value: true },
        { label: 'Non', value: false }
    ];

    form = this.fb.group({
        code: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(20)] }),
        nom: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(150)] }),
        ville: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(100)] }),
        adresse: this.fb.control<string | null>(null, { validators: [Validators.maxLength(255)] }),
        enteteDocument: this.fb.control<string | null>(null),
        signataire: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(100)] }),
        logoUrl: this.fb.control<string | null>(null, { validators: [Validators.maxLength(255)] }),
        nbCyclesCursus: this.fb.control<number>(1, { validators: [Validators.required, Validators.min(1), Validators.max(20)] }),
        noteMaximale: this.fb.control<number>(20, { validators: [Validators.required, Validators.min(1)] }),
        actif: this.fb.control<boolean>(true),
        pays: this.fb.control<Pays | null>(null, { validators: [Validators.required] })
    });

    ngOnInit(): void {
        this.paysApi.query({ size: 2000 }).subscribe((page) => this.paysOptions.set(page.content));
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.api.query({ size: 2000 }).subscribe({
            next: (result) => {
                this.rows.set(result.content);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    openNew(): void {
        this.editingId = null;
        this.form.reset({
            code: '',
            nom: '',
            ville: '',
            adresse: null,
            enteteDocument: null,
            signataire: '',
            logoUrl: null,
            nbCyclesCursus: 1,
            noteMaximale: 20,
            actif: true
        });
        this.form.controls.pays.setValue(null);
        this.dialogVisible.set(true);
    }

    openEdit(entity: CentreFormation): void {
        this.editingId = entity.id;
        this.form.patchValue({
            code: entity.code,
            nom: entity.nom,
            ville: entity.ville,
            adresse: entity.adresse,
            enteteDocument: entity.enteteDocument,
            signataire: entity.signataire,
            logoUrl: entity.logoUrl,
            nbCyclesCursus: entity.nbCyclesCursus,
            noteMaximale: entity.noteMaximale,
            actif: entity.actif,
            pays: entity.pays
        });
        this.dialogVisible.set(true);
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const value = this.form.getRawValue();
        const dto = {
            code: value.code,
            nom: value.nom,
            ville: value.ville,
            adresse: value.adresse,
            enteteDocument: value.enteteDocument,
            signataire: value.signataire,
            logoUrl: value.logoUrl,
            nbCyclesCursus: value.nbCyclesCursus,
            noteMaximale: value.noteMaximale,
            actif: value.actif,
            pays: value.pays!
        };

        const request$ = this.editingId ? this.api.update({ id: this.editingId, ...dto } as CentreFormation) : this.api.create(dto as Omit<CentreFormation, 'id'>);

        request$.subscribe(() => {
            this.notification.success(this.editingId ? 'Modification enregistrée.' : 'Élément ajouté.');
            this.dialogVisible.set(false);
            this.load();
        });
    }

    remove(entity: CentreFormation): void {
        this.notification.confirmDelete('Supprimer cet élément ?', () => {
            this.api.delete(entity.id).subscribe(() => {
                this.notification.success('Élément supprimé.');
                this.load();
            });
        });
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
