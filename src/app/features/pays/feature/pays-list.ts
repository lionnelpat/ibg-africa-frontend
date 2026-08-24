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
import { Pays } from '../domain/pays.model';
import { PaysApi } from '../data-access/pays.api';

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
    selector: 'app-pays-list',
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
                [globalFilterFields]="['codeIso', 'nom', 'langue']"
                dataKey="id"
                [rowHover]="true"
                currentPageReportTemplate="{first} à {last} sur {totalRecords}"
                [showCurrentPageReport]="true"
            >
                <ng-template #header>
                    <tr>
                        <th pSortableColumn="codeIso">Code ISO<p-sortIcon field="codeIso" /></th>
                        <th pSortableColumn="nom">Nom<p-sortIcon field="nom" /></th>
                        <th pSortableColumn="langue">Langue<p-sortIcon field="langue" /></th>
                        <th pSortableColumn="actif">Actif<p-sortIcon field="actif" /></th>
                        <th style="width: 8rem"></th>
                    </tr>
                </ng-template>
                <ng-template #body let-row>
                    <tr>
                        <td>{{ row.codeIso }}</td>
                        <td>{{ row.nom }}</td>
                        <td>{{ row.langue }}</td>
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

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '640px' }" header="Pays" [modal]="true">
            <ng-template #content>
                <form [formGroup]="form" class="grid grid-cols-12 gap-4 pt-2">
                    <div class="field col-span-12 md:col-span-6">
                        <label for="codeIso" class="block font-medium mb-2">Code ISO <span class="text-red-500">*</span></label>
                        <input pInputText id="codeIso" [formControl]="form.controls.codeIso" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="nom" class="block font-medium mb-2">Nom <span class="text-red-500">*</span></label>
                        <input pInputText id="nom" [formControl]="form.controls.nom" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="langue" class="block font-medium mb-2">Langue <span class="text-red-500">*</span></label>
                        <input pInputText id="langue" [formControl]="form.controls.langue" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="fuseau" class="block font-medium mb-2">Fuseau </label>
                        <input pInputText id="fuseau" [formControl]="form.controls.fuseau" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6 flex items-center gap-2 pt-6">
                        <p-checkbox inputId="actif" [formControl]="form.controls.actif" [binary]="true" />
                        <label for="actif" class="font-medium">Actif</label>
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
export class PaysList implements OnInit {
    private readonly api = inject(PaysApi);
    private readonly notification = inject(NotificationService);
    private readonly fb = inject(NonNullableFormBuilder);

    rows = signal<Pays[]>([]);
    loading = signal(false);

    dialogVisible = signal(false);
    editingId: number | null = null;

    booleanFilterOptions = [
        { label: 'Oui', value: true },
        { label: 'Non', value: false }
    ];

    form = this.fb.group({
        codeIso: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(2)] }),
        nom: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(100)] }),
        langue: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(5)] }),
        fuseau: this.fb.control<string | null>(null, { validators: [Validators.maxLength(50)] }),
        actif: this.fb.control<boolean>(true)
    });

    ngOnInit(): void {
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
            codeIso: '',
            nom: '',
            langue: '',
            fuseau: null,
            actif: true
        });

        this.dialogVisible.set(true);
    }

    openEdit(entity: Pays): void {
        this.editingId = entity.id;
        this.form.patchValue({
            codeIso: entity.codeIso,
            nom: entity.nom,
            langue: entity.langue,
            fuseau: entity.fuseau,
            actif: entity.actif
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
            codeIso: value.codeIso,
            nom: value.nom,
            langue: value.langue,
            fuseau: value.fuseau,
            actif: value.actif
        };

        const request$ = this.editingId ? this.api.update({ id: this.editingId, ...dto } as Pays) : this.api.create(dto as Omit<Pays, 'id'>);

        request$.subscribe(() => {
            this.notification.success(this.editingId ? 'Modification enregistrée.' : 'Élément ajouté.');
            this.dialogVisible.set(false);
            this.load();
        });
    }

    remove(entity: Pays): void {
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
