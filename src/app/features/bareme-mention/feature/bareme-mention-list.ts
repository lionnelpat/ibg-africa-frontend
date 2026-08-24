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
import { BaremeMention } from '../domain/bareme-mention.model';
import { BaremeMentionApi } from '../data-access/bareme-mention.api';
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
    selector: 'app-bareme-mention-list',
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
                [globalFilterFields]="['libelleLong', 'libelleCourt']"
                dataKey="id"
                [rowHover]="true"
                currentPageReportTemplate="{first} à {last} sur {totalRecords}"
                [showCurrentPageReport]="true"
            >
                <ng-template #header>
                    <tr>
                        <th pSortableColumn="libelleLong">Libellé long<p-sortIcon field="libelleLong" /></th>
                        <th pSortableColumn="libelleCourt">Libellé court<p-sortIcon field="libelleCourt" /></th>
                        <th pSortableColumn="bornes">Bornes</th>
                        <th pSortableColumn="ordreAffichage">Ordre d'affichage<p-sortIcon field="ordreAffichage" /></th>
                        <th pSortableColumn="actif">Actif<p-sortIcon field="actif" /></th>
                        <th style="width: 8rem"></th>
                    </tr>
                </ng-template>
                <ng-template #body let-row>
                    <tr>
                        <td>{{ row.libelleLong }}</td>
                        <td>{{ row.libelleCourt }}</td>
                        <td>[ {{ row.borneMin }} - {{ row.borneMax }}]</td>
                        <td>{{ row.ordreAffichage }}</td>
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

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '640px' }" header="BaremeMention" [modal]="true">
            <ng-template #content>
                <form [formGroup]="form" class="grid grid-cols-12 gap-4 pt-2">
                    <div class="field col-span-12 md:col-span-6">
                        <label for="libelleLong" class="block font-medium mb-2">Libellé long <span class="text-red-500">*</span></label>
                        <input pInputText id="libelleLong" [formControl]="form.controls.libelleLong" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="libelleCourt" class="block font-medium mb-2">Libellé court <span class="text-red-500">*</span></label>
                        <input pInputText id="libelleCourt" [formControl]="form.controls.libelleCourt" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="borneMin" class="block font-medium mb-2">Borne min </label>
                        <p-inputnumber inputId="borneMin" [formControl]="form.controls.borneMin" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6 flex items-center gap-2 pt-6">
                        <p-checkbox inputId="minInclus" [formControl]="form.controls.minInclus" [binary]="true" />
                        <label for="minInclus" class="font-medium">Borne min incluse</label>
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="borneMax" class="block font-medium mb-2">Borne max </label>
                        <p-inputnumber inputId="borneMax" [formControl]="form.controls.borneMax" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6 flex items-center gap-2 pt-6">
                        <p-checkbox inputId="maxInclus" [formControl]="form.controls.maxInclus" [binary]="true" />
                        <label for="maxInclus" class="font-medium">Borne max incluse</label>
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="ordreAffichage" class="block font-medium mb-2">Ordre d'affichage <span class="text-red-500">*</span></label>
                        <p-inputnumber inputId="ordreAffichage" [formControl]="form.controls.ordreAffichage" [useGrouping]="false" fluid />
                    </div>
                    <div class="field col-span-12">
                        <label for="commentaire" class="block font-medium mb-2">Commentaire</label>
                        <textarea pTextarea id="commentaire" [formControl]="form.controls.commentaire" rows="3" fluid></textarea>
                    </div>
                    <div class="field col-span-12 md:col-span-6 flex items-center gap-2 pt-6">
                        <p-checkbox inputId="actif" [formControl]="form.controls.actif" [binary]="true" />
                        <label for="actif" class="font-medium">Actif</label>
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
export class BaremeMentionList implements OnInit {
    private readonly api = inject(BaremeMentionApi);
    private readonly notification = inject(NotificationService);
    private readonly fb = inject(NonNullableFormBuilder);

    private readonly centreApi = inject(CentreFormationApi);
    centreOptions = signal<CentreFormation[]>([]);

    rows = signal<BaremeMention[]>([]);
    loading = signal(false);

    dialogVisible = signal(false);
    editingId: number | null = null;

    booleanFilterOptions = [
        { label: 'Oui', value: true },
        { label: 'Non', value: false }
    ];

    form = this.fb.group({
        libelleLong: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(100)] }),
        libelleCourt: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(50)] }),
        borneMin: this.fb.control<number | null>(null, { validators: [Validators.min(0)] }),
        minInclus: this.fb.control<boolean>(true),
        borneMax: this.fb.control<number | null>(null, { validators: [Validators.min(0)] }),
        maxInclus: this.fb.control<boolean>(false),
        ordreAffichage: this.fb.control<number>(0, { validators: [Validators.required] }),
        commentaire: this.fb.control<string | null>(null, { validators: [Validators.maxLength(255)] }),
        actif: this.fb.control<boolean>(true),
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
            libelleLong: '',
            libelleCourt: '',
            borneMin: null,
            minInclus: true,
            borneMax: null,
            maxInclus: false,
            ordreAffichage: 0,
            commentaire: null,
            actif: true
        });
        this.form.controls.centre.setValue(null);
        this.dialogVisible.set(true);
    }

    openEdit(entity: BaremeMention): void {
        this.editingId = entity.id;
        this.form.patchValue({
            libelleLong: entity.libelleLong,
            libelleCourt: entity.libelleCourt,
            borneMin: entity.borneMin,
            minInclus: entity.minInclus,
            borneMax: entity.borneMax,
            maxInclus: entity.maxInclus,
            ordreAffichage: entity.ordreAffichage,
            commentaire: entity.commentaire,
            actif: entity.actif,
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
            libelleLong: value.libelleLong,
            libelleCourt: value.libelleCourt,
            borneMin: value.borneMin,
            minInclus: value.minInclus,
            borneMax: value.borneMax,
            maxInclus: value.maxInclus,
            ordreAffichage: value.ordreAffichage,
            commentaire: value.commentaire,
            actif: value.actif,
            centre: value.centre
        };

        const request$ = this.editingId ? this.api.update({ id: this.editingId, ...dto } as BaremeMention) : this.api.create(dto as Omit<BaremeMention, 'id'>);

        request$.subscribe(() => {
            this.notification.success(this.editingId ? 'Modification enregistrée.' : 'Élément ajouté.');
            this.dialogVisible.set(false);
            this.load();
        });
    }

    remove(entity: BaremeMention): void {
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
