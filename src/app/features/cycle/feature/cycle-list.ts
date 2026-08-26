import { ChangeDetectionStrategy, Component, OnInit, inject, signal, viewChild, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
import { Cycle } from '../domain/cycle.model';
import { CycleApi } from '../data-access/cycle.api';
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
    selector: 'app-cycle-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
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
                        <p-inputnumber [formControl]="anneeControl" [useGrouping]="false" placeholder="Année" styleClass="min-w-32" />
                        <p-select [formControl]="clotureControl" [options]="booleanFilterOptions" optionLabel="label" optionValue="value" placeholder="Clôturé" [showClear]="true" styleClass="min-w-40" />
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
                styleClass="cursor-pointer"
                sortField="annee"
                [sortOrder]="-1"
                currentPageReportTemplate="{first} à {last} sur {totalRecords}"
                [showCurrentPageReport]="true"
            >
                <ng-template #header>
                    <tr>
                        <th pSortableColumn="annee">Année<p-sortIcon field="annee" /></th>
                        <th pSortableColumn="libelle">Libellé<p-sortIcon field="libelle" /></th>
                        <th>Inscrits</th>
                        <th pSortableColumn="cloture">Clôturé<p-sortIcon field="cloture" /></th>
                        <th style="width: 10rem"></th>
                    </tr>
                </ng-template>
                <ng-template #body let-row>
                    <tr [routerLink]="['/cycle', row.id]">
                        <td>{{ row.annee }}</td>
                        <td>{{ row.libelle }}</td>
                        <td>{{ inscriptionsCounts()[row.id] ?? 0 }}</td>
                        <td><p-tag [value]="row.cloture ? 'Oui' : 'Non'" [severity]="row.cloture ? 'success' : 'danger'" /></td>
                        <td (click)="$event.stopPropagation()">
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

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '640px' }" header="Cycle" [modal]="true">
            <ng-template #content>
                <form [formGroup]="form" class="grid grid-cols-12 gap-4 pt-2">
                    <div class="field col-span-12 md:col-span-6">
                        <label for="annee" class="block font-medium mb-2">Année <span class="text-red-500">*</span></label>
                        <p-inputnumber inputId="annee" [formControl]="form.controls.annee" [useGrouping]="false" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="libelle" class="block font-medium mb-2">Libellé </label>
                        <input pInputText id="libelle" [formControl]="form.controls.libelle" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="dateDebut" class="block font-medium mb-2">Date de début</label>
                        <p-datepicker inputId="dateDebut" [formControl]="form.controls.dateDebut" dateFormat="dd/mm/yy" [showIcon]="true" showButtonBar="true" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="dateFin" class="block font-medium mb-2">Date de fin</label>
                        <p-datepicker inputId="dateFin" [formControl]="form.controls.dateFin" dateFormat="dd/mm/yy" [showIcon]="true" showButtonBar="true" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6 flex items-center gap-2 pt-6">
                        <p-checkbox inputId="cloture" [formControl]="form.controls.cloture" [binary]="true" />
                        <label for="cloture" class="font-medium">Clôturé</label>
                    </div>
                    <div class="field col-span-12">
                        <label for="commentaire" class="block font-medium mb-2">Commentaire</label>
                        <textarea pTextarea id="commentaire" [formControl]="form.controls.commentaire" rows="3" fluid></textarea>
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="centre" class="block font-medium mb-2">Centre <span class="text-red-500">*</span></label>
                        <p-select inputId="centre" [formControl]="form.controls.centre" [options]="centreOptions()" optionLabel="code" dataKey="id" [showClear]="false" placeholder="Sélectionner" fluid />
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
export class CycleList implements OnInit {
    private readonly api = inject(CycleApi);
    private readonly notification = inject(NotificationService);
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly destroyRef = inject(DestroyRef);
    private readonly table = viewChild.required<Table>('table');
    private readonly centreApi = inject(CentreFormationApi);
    centreOptions = signal<CentreFormation[]>([]);

    rows = signal<Cycle[]>([]);
    loading = signal(false);
    totalRecords = signal(0);
    inscriptionsCounts = signal<Record<number, number>>({});
    dialogVisible = signal(false);
    editingId: number | null = null;
    anneeControl = this.fb.control<number | null>(null);
    clotureControl = this.fb.control<boolean | null>(null);

    booleanFilterOptions = [
        { label: 'Oui', value: true },
        { label: 'Non', value: false }
    ];

    form = this.fb.group({
        annee: this.fb.control<number>(0, { validators: [Validators.required, Validators.min(1900), Validators.max(2200)] }),
        libelle: this.fb.control<string | null>(null, { validators: [Validators.maxLength(100)] }),
        dateDebut: this.fb.control<Date | null>(null),
        dateFin: this.fb.control<Date | null>(null),
        cloture: this.fb.control<boolean>(false),
        commentaire: this.fb.control<string | null>(null, { validators: [Validators.maxLength(255)] }),
        centre: this.fb.control<CentreFormation | null>(null, { validators: [Validators.required] })
    });

    ngOnInit(): void {
        this.centreApi.query({ size: 2000 }).subscribe((page) => this.centreOptions.set(page.content));
        this.anneeControl.valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
        this.clotureControl.valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
    }

    onLazyLoad(event: TableLazyLoadEvent): void {
        const page = Math.floor((event.first ?? 0) / (event.rows ?? 10));
        this.loading.set(true);
        this.api
            .query({
                page,
                size: event.rows ?? 10,
                sort: event.sortField ? `${event.sortField},${event.sortOrder === 1 ? 'asc' : 'desc'}` : undefined,
                'annee.equals': this.anneeControl.value ?? undefined,
                'cloture.equals': this.clotureControl.value ?? undefined
            })
            .subscribe({
                next: (result) => {
                    this.rows.set(result.content);
                    this.totalRecords.set(result.totalElements);
                    this.loading.set(false);
                    this.chargerInscriptionsCounts(result.content);
                },
                error: () => this.loading.set(false)
            });
    }

    private chargerInscriptionsCounts(rows: Cycle[]): void {
        if (rows.length === 0) {
            this.inscriptionsCounts.set({});
            return;
        }
        this.api.nombreInscrits(rows.map((r) => r.id)).subscribe((counts) => {
            const map: Record<number, number> = {};
            for (const c of counts) {
                map[c.cycleId] = c.total;
            }
            this.inscriptionsCounts.set(map);
        });
    }

    reload(): void {
        this.onLazyLoad({ first: 0, rows: this.table().rows ?? 10 });
    }

    openNew(): void {
        this.editingId = null;
        this.form.reset({
            annee: 0,
            libelle: null,
            dateDebut: null,
            dateFin: null,
            cloture: false,
            commentaire: null
        });
        this.form.controls.centre.setValue(null);
        this.dialogVisible.set(true);
    }

    openEdit(entity: Cycle): void {
        this.editingId = entity.id;
        this.form.patchValue({
            annee: entity.annee,
            libelle: entity.libelle,
            dateDebut: parseIsoDate(entity.dateDebut),
            dateFin: parseIsoDate(entity.dateFin),
            cloture: entity.cloture,
            commentaire: entity.commentaire,
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
            annee: value.annee,
            libelle: value.libelle,
            dateDebut: toIsoDate(value.dateDebut),
            dateFin: toIsoDate(value.dateFin),
            cloture: value.cloture,
            commentaire: value.commentaire,
            centre: value.centre!
        };

        const request$ = this.editingId ? this.api.update({ id: this.editingId, ...dto } as Cycle) : this.api.create(dto as Omit<Cycle, 'id'>);

        request$.subscribe(() => {
            this.notification.success(this.editingId ? 'Modification enregistrée.' : 'Élément ajouté.');
            this.dialogVisible.set(false);
            this.reload();
        });
    }

    remove(entity: Cycle): void {
        this.notification.confirmDelete('Supprimer cet élément ?', () => {
            this.api.delete(entity.id).subscribe(() => {
                this.notification.success('Élément supprimé.');
                this.reload();
            });
        });
    }
}
