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
import { Parametre } from '../domain/parametre.model';
import { ParametreApi } from '../data-access/parametre.api';
import { CentreFormation } from '@/app/features/centre-formation/domain/centre-formation.model';
import { CentreFormationApi } from '@/app/features/centre-formation/data-access/centre-formation.api';

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
    selector: 'app-parametre-list',
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
                [globalFilterFields]="['cle', 'libelle', 'valeur']"
                dataKey="id"
                [rowHover]="true"
                currentPageReportTemplate="{first} à {last} sur {totalRecords}"
                [showCurrentPageReport]="true"
            >
                <ng-template #header>
                    <tr>
                        <th pSortableColumn="cle">Clé<p-sortIcon field="cle" /></th>
                        <th pSortableColumn="libelle">Libellé<p-sortIcon field="libelle" /></th>
                        <th pSortableColumn="typeValeur">Type de valeur<p-sortIcon field="typeValeur" /></th>
                        <th pSortableColumn="modifiableUi">Modifiable depuis l’UI<p-sortIcon field="modifiableUi" /></th>
                        <th style="width: 8rem"></th>
                    </tr>
                </ng-template>
                <ng-template #body let-row>
                    <tr>
                        <td>{{ row.cle }}</td>
                        <td>{{ row.libelle }}</td>
                        <td>{{ row.typeValeur }}</td>
                        <td><p-tag [value]="row.modifiableUi ? 'Oui' : 'Non'" [severity]="row.modifiableUi ? 'success' : 'danger'" /></td>
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

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '640px' }" header="Parametre" [modal]="true">
            <ng-template #content>
                <form [formGroup]="form" class="grid grid-cols-12 gap-4 pt-2">
                    <div class="field col-span-12 md:col-span-6">
                        <label for="cle" class="block font-medium mb-2">Clé <span class="text-red-500">*</span></label>
                        <input pInputText id="cle" [formControl]="form.controls.cle" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="libelle" class="block font-medium mb-2">Libellé </label>
                        <input pInputText id="libelle" [formControl]="form.controls.libelle" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="valeur" class="block font-medium mb-2">Valeur </label>
                        <input pInputText id="valeur" [formControl]="form.controls.valeur" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="typeValeur" class="block font-medium mb-2">Type de valeur <span class="text-red-500">*</span></label>
                        <p-select inputId="typeValeur" [formControl]="form.controls.typeValeur" [options]="typeValeurOptions" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6 flex items-center gap-2 pt-6">
                        <p-checkbox inputId="modifiableUi" [formControl]="form.controls.modifiableUi" [binary]="true" />
                        <label for="modifiableUi" class="font-medium">Modifiable depuis l’UI</label>
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="centre" class="block font-medium mb-2">Centre </label>
                        <p-select inputId="centre" [formControl]="form.controls.centre" [options]="centreOptions()" optionLabel="code" dataKey="id" [showClear]="true" placeholder="Sélectionner" fluid />
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
export class ParametreList implements OnInit {
    private readonly api = inject(ParametreApi);
    private readonly notification = inject(NotificationService);
    private readonly fb = inject(NonNullableFormBuilder);

    private readonly centreApi = inject(CentreFormationApi);
    centreOptions = signal<CentreFormation[]>([]);

    rows = signal<Parametre[]>([]);
    loading = signal(false);

    dialogVisible = signal(false);
    editingId: number | null = null;

    typeValeurOptions = ['TEXTE', 'NOMBRE', 'DATE', 'BOOLEEN'];
    booleanFilterOptions = [
        { label: 'Oui', value: true },
        { label: 'Non', value: false }
    ];

    form = this.fb.group({
        cle: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(80)] }),
        libelle: this.fb.control<string | null>(null, { validators: [Validators.maxLength(255)] }),
        valeur: this.fb.control<string | null>(null, { validators: [Validators.maxLength(500)] }),
        typeValeur: this.fb.control<'TEXTE' | 'NOMBRE' | 'DATE' | 'BOOLEEN'>('TEXTE', { validators: [Validators.required] }),
        modifiableUi: this.fb.control<boolean>(true),
        centre: this.fb.control<CentreFormation | null>(null)
    });

    ngOnInit(): void {
        this.centreApi.query({ size: 2000 }).subscribe((page) => this.centreOptions.set(page.content));
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
            cle: '',
            libelle: null,
            valeur: null,
            typeValeur: 'TEXTE',
            modifiableUi: true
        });
        this.form.controls.centre.setValue(null);
        this.dialogVisible.set(true);
    }

    openEdit(entity: Parametre): void {
        this.editingId = entity.id;
        this.form.patchValue({
            cle: entity.cle,
            libelle: entity.libelle,
            valeur: entity.valeur,
            typeValeur: entity.typeValeur,
            modifiableUi: entity.modifiableUi,
            centre: entity.centre
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
            cle: value.cle,
            libelle: value.libelle,
            valeur: value.valeur,
            typeValeur: value.typeValeur,
            modifiableUi: value.modifiableUi,
            centre: value.centre
        };

        const request$ = this.editingId ? this.api.update({ id: this.editingId, ...dto } as Parametre) : this.api.create(dto as Omit<Parametre, 'id'>);

        request$.subscribe(() => {
            this.notification.success(this.editingId ? 'Modification enregistrée.' : 'Élément ajouté.');
            this.dialogVisible.set(false);
            this.load();
        });
    }

    remove(entity: Parametre): void {
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
