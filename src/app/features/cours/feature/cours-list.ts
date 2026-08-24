import { ChangeDetectionStrategy, Component, OnInit, inject, signal, viewChild, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
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
import { TableModule, Table, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { NotificationService } from '@/app/core/notification/notification.service';
import { Cours } from '../domain/cours.model';
import { CoursApi } from '../data-access/cours.api';

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
    selector: 'app-cours-list',
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
                    <div class="flex flex-wrap gap-3">
                        <input pInputText type="text" [formControl]="intituleControl" placeholder="Intitulé" />
                        <p-select [formControl]="actifControl" [options]="booleanFilterOptions" optionLabel="label" optionValue="value" placeholder="Actif" [showClear]="true" styleClass="min-w-40" />
                    </div>
                </ng-template>
            </p-toolbar>

            <p-table
                #table
                [value]="rows()"
                [lazy]="true"
                (onLazyLoad)="onLazyLoad($event)"
                [totalRecords]="totalRecords()"
                [loading]="loading()"
                [paginator]="true"
                [rows]="10"
                [rowsPerPageOptions]="[10, 20, 50]"
                dataKey="id"
                [rowHover]="true"
                currentPageReportTemplate="{first} à {last} sur {totalRecords}"
                [showCurrentPageReport]="true"
            >
                <ng-template #header>
                    <tr>
                        <th pSortableColumn="intitule">Intitulé<p-sortIcon field="intitule" /></th>
                        <th pSortableColumn="ordreAffichage">Ordre d'affichage<p-sortIcon field="ordreAffichage" /></th>
                        <th pSortableColumn="coefficient">Coefficient<p-sortIcon field="coefficient" /></th>
                        <th pSortableColumn="actif">Actif<p-sortIcon field="actif" /></th>
                        <th style="width: 8rem"></th>
                    </tr>
                </ng-template>
                <ng-template #body let-row>
                    <tr>
                        <td>{{ row.intitule }}</td>
                        <td>{{ row.ordreAffichage }}</td>
                        <td>{{ row.coefficient }}</td>
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

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '640px' }" header="Cours" [modal]="true">
            <ng-template #content>
                <form [formGroup]="form" class="grid grid-cols-12 gap-4 pt-2">
                    <div class="field col-span-12 md:col-span-6">
                        <label for="intitule" class="block font-medium mb-2">Intitulé <span class="text-red-500">*</span></label>
                        <input pInputText id="intitule" [formControl]="form.controls.intitule" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="libelleLong" class="block font-medium mb-2">Libellé long </label>
                        <input pInputText id="libelleLong" [formControl]="form.controls.libelleLong" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="libelleCourt" class="block font-medium mb-2">Libellé court </label>
                        <input pInputText id="libelleCourt" [formControl]="form.controls.libelleCourt" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="ordreAffichage" class="block font-medium mb-2">Ordre d'affichage <span class="text-red-500">*</span></label>
                        <p-inputnumber inputId="ordreAffichage" [formControl]="form.controls.ordreAffichage" [useGrouping]="false" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="nbPeriodes" class="block font-medium mb-2">Nb périodes </label>
                        <p-inputnumber inputId="nbPeriodes" [formControl]="form.controls.nbPeriodes" [useGrouping]="false" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="coefficient" class="block font-medium mb-2">Coefficient <span class="text-red-500">*</span></label>
                        <p-inputnumber inputId="coefficient" [formControl]="form.controls.coefficient" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="dateDebut" class="block font-medium mb-2">Date de début</label>
                        <p-datepicker inputId="dateDebut" [formControl]="form.controls.dateDebut" dateFormat="dd/mm/yy" [showIcon]="true" showButtonBar="true" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="dateFin" class="block font-medium mb-2">Date de fin</label>
                        <p-datepicker inputId="dateFin" [formControl]="form.controls.dateFin" dateFormat="dd/mm/yy" [showIcon]="true" showButtonBar="true" fluid />
                    </div>
                    <div class="field col-span-12">
                        <label for="commentaire" class="block font-medium mb-2">Commentaire</label>
                        <textarea pTextarea id="commentaire" [formControl]="form.controls.commentaire" rows="3" fluid></textarea>
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
export class CoursList implements OnInit {
    private readonly api = inject(CoursApi);
    private readonly notification = inject(NotificationService);
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly destroyRef = inject(DestroyRef);
    private readonly table = viewChild.required<Table>('table');

    rows = signal<Cours[]>([]);
    loading = signal(false);
    totalRecords = signal(0);
    dialogVisible = signal(false);
    editingId: number | null = null;
    intituleControl = this.fb.control<string>('');
    actifControl = this.fb.control<boolean | null>(null);

    booleanFilterOptions = [
        { label: 'Oui', value: true },
        { label: 'Non', value: false }
    ];

    form = this.fb.group({
        intitule: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(150)] }),
        libelleLong: this.fb.control<string | null>(null, { validators: [Validators.maxLength(150)] }),
        libelleCourt: this.fb.control<string | null>(null, { validators: [Validators.maxLength(60)] }),
        ordreAffichage: this.fb.control<number>(0, { validators: [Validators.required] }),
        nbPeriodes: this.fb.control<number | null>(null, { validators: [Validators.min(0)] }),
        coefficient: this.fb.control<number>(1, { validators: [Validators.required, Validators.min(0)] }),
        dateDebut: this.fb.control<Date | null>(null),
        dateFin: this.fb.control<Date | null>(null),
        commentaire: this.fb.control<string | null>(null, { validators: [Validators.maxLength(255)] }),
        actif: this.fb.control<boolean>(true)
    });

    ngOnInit(): void {
        this.intituleControl.valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
        this.actifControl.valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
    }

    onLazyLoad(event: TableLazyLoadEvent): void {
        const page = Math.floor((event.first ?? 0) / (event.rows ?? 10));
        this.loading.set(true);
        this.api
            .query({
                page,
                size: event.rows ?? 10,
                sort: event.sortField ? `${event.sortField},${event.sortOrder === 1 ? 'asc' : 'desc'}` : undefined,
                'intitule.contains': this.intituleControl.value || undefined,
                'actif.equals': this.actifControl.value ?? undefined
            })
            .subscribe({
                next: (result) => {
                    this.rows.set(result.content);
                    this.totalRecords.set(result.totalElements);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
    }

    reload(): void {
        this.onLazyLoad({ first: 0, rows: this.table().rows ?? 10 });
    }

    openNew(): void {
        this.editingId = null;
        this.form.reset({
            intitule: '',
            libelleLong: null,
            libelleCourt: null,
            ordreAffichage: 0,
            nbPeriodes: null,
            coefficient: 1,
            dateDebut: null,
            dateFin: null,
            commentaire: null,
            actif: true
        });

        this.dialogVisible.set(true);
    }

    openEdit(entity: Cours): void {
        this.editingId = entity.id;
        this.form.patchValue({
            intitule: entity.intitule,
            libelleLong: entity.libelleLong,
            libelleCourt: entity.libelleCourt,
            ordreAffichage: entity.ordreAffichage,
            nbPeriodes: entity.nbPeriodes,
            coefficient: entity.coefficient,
            dateDebut: parseIsoDate(entity.dateDebut),
            dateFin: parseIsoDate(entity.dateFin),
            commentaire: entity.commentaire,
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
            intitule: value.intitule,
            libelleLong: value.libelleLong,
            libelleCourt: value.libelleCourt,
            ordreAffichage: value.ordreAffichage,
            nbPeriodes: value.nbPeriodes,
            coefficient: value.coefficient,
            dateDebut: toIsoDate(value.dateDebut),
            dateFin: toIsoDate(value.dateFin),
            commentaire: value.commentaire,
            actif: value.actif
        };

        const request$ = this.editingId ? this.api.update({ id: this.editingId, ...dto } as Cours) : this.api.create(dto as Omit<Cours, 'id'>);

        request$.subscribe(() => {
            this.notification.success(this.editingId ? 'Modification enregistrée.' : 'Élément ajouté.');
            this.dialogVisible.set(false);
            this.reload();
        });
    }

    remove(entity: Cours): void {
        this.notification.confirmDelete('Supprimer cet élément ?', () => {
            this.api.delete(entity.id).subscribe(() => {
                this.notification.success('Élément supprimé.');
                this.reload();
            });
        });
    }
}
