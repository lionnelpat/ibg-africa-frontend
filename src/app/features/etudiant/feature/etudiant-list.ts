import { ChangeDetectionStrategy, Component, OnInit, inject, signal, viewChild, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { Etudiant, Sexe } from '../domain/etudiant.model';
import { EtudiantApi } from '../data-access/etudiant.api';

const NOMS_ANNEE = ['1re année', '2e année', '3e année', '4e année', '5e année'];
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
    selector: 'app-etudiant-list',
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
                    <p-button label="Générer les matricules manquants" icon="pi pi-hashtag" severity="secondary" outlined class="ml-2" (onClick)="genererMatricules()" />
                </ng-template>
                <ng-template #end>
                    <div class="flex flex-wrap gap-3">
                        <input pInputText type="text" [formControl]="matriculeControl" placeholder="Matricule" />
                        <input pInputText type="text" [formControl]="nomControl" placeholder="Nom" />
                        <input pInputText type="text" [formControl]="prenomControl" placeholder="Prénom" />
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
                        <th pSortableColumn="matricule">Matricule<p-sortIcon field="matricule" /></th>
                        <th pSortableColumn="nom">Nom<p-sortIcon field="nom" /></th>
                        <th pSortableColumn="prenom">Prénom<p-sortIcon field="prenom" /></th>
                        <th>Année</th>
                        <th pSortableColumn="actif">Actif<p-sortIcon field="actif" /></th>
                        <th style="width: 8rem"></th>
                    </tr>
                </ng-template>
                <ng-template #body let-row>
                    <tr [routerLink]="['/etudiant', row.id]" class="cursor-pointer">
                        <td>{{ row.matricule }}</td>
                        <td>{{ row.nom }}</td>
                        <td>{{ row.prenom }}</td>
                        <td>{{ anneeLabel(cyclesCounts()[row.id]) }}</td>
                        <td><p-tag [value]="row.actif ? 'Oui' : 'Non'" [severity]="row.actif ? 'success' : 'danger'" /></td>
                        <td (click)="$event.stopPropagation()">
                            <p-button icon="pi pi-file-pdf" [rounded]="true" [text]="true" [routerLink]="['/etudiant', row.id, 'bulletin']" />
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" (onClick)="openEdit(row)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [text]="true" (onClick)="remove(row)" />
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr>
                        <td colspan="6" class="text-center py-6">Aucune donnée.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>

        <p-dialog [(visible)]="dialogVisible" [style]="{ width: '640px' }" header="Etudiant" [modal]="true">
            <ng-template #content>
                <form [formGroup]="form" class="grid grid-cols-12 gap-4 pt-2">
                    <div class="field col-span-12 md:col-span-6">
                        <label for="nom" class="block font-medium mb-2">Nom <span class="text-red-500">*</span></label>
                        <input pInputText id="nom" [formControl]="form.controls.nom" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="prenom" class="block font-medium mb-2">Prénom <span class="text-red-500">*</span></label>
                        <input pInputText id="prenom" [formControl]="form.controls.prenom" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="dateNaissance" class="block font-medium mb-2">Date de naissance</label>
                        <p-datepicker inputId="dateNaissance" [formControl]="form.controls.dateNaissance" dateFormat="dd/mm/yy" [showIcon]="true" showButtonBar="true" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="sexe" class="block font-medium mb-2">Sexe </label>
                        <p-select inputId="sexe" [formControl]="form.controls.sexe" [options]="sexeOptions" optionLabel="label" optionValue="value" [showClear]="true" placeholder="Non renseigné" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="anneeEntree" class="block font-medium mb-2">Année d'entrée (1re inscription) </label>
                        <p-inputnumber inputId="anneeEntree" [formControl]="form.controls.anneeEntree" [useGrouping]="false" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="email" class="block font-medium mb-2">Email </label>
                        <input pInputText id="email" [formControl]="form.controls.email" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="telephone" class="block font-medium mb-2">Téléphone </label>
                        <input pInputText id="telephone" [formControl]="form.controls.telephone" fluid />
                    </div>
                    <div class="field col-span-12 md:col-span-6">
                        <label for="pays" class="block font-medium mb-2">Pays </label>
                        <p-select inputId="pays" [formControl]="form.controls.pays" [options]="paysOptions()" optionLabel="nom" dataKey="id" [showClear]="true" placeholder="Sélectionner" fluid />
                    </div>

                    @if (editingId !== null) {
                        <div class="field col-span-12 md:col-span-6">
                            <label for="matricule" class="block font-medium mb-2">Matricule </label>
                            <input pInputText id="matricule" [formControl]="form.controls.matricule" fluid />
                        </div>
                        <div class="field col-span-12 md:col-span-6">
                            <label for="particularite" class="block font-medium mb-2">Particularité </label>
                            <input pInputText id="particularite" [formControl]="form.controls.particularite" fluid />
                        </div>
                        <div class="field col-span-12 md:col-span-4 flex items-center gap-2 pt-6">
                            <p-checkbox inputId="cursusAcheve" [formControl]="form.controls.cursusAcheve" [binary]="true" />
                            <label for="cursusAcheve" class="font-medium">Cursus achevé</label>
                        </div>
                        <div class="field col-span-12 md:col-span-4">
                            <label for="anneeFinale" class="block font-medium mb-2">Année finale </label>
                            <p-inputnumber inputId="anneeFinale" [formControl]="form.controls.anneeFinale" [useGrouping]="false" fluid />
                        </div>
                        <div class="field col-span-12 md:col-span-4 flex items-center gap-2 pt-6">
                            <p-checkbox inputId="actif" [formControl]="form.controls.actif" [binary]="true" />
                            <label for="actif" class="font-medium">Actif</label>
                        </div>
                    }

                    <div class="field col-span-12">
                        <label for="commentaire" class="block font-medium mb-2">Commentaire</label>
                        <textarea pTextarea id="commentaire" [formControl]="form.controls.commentaire" rows="2" fluid></textarea>
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
export class EtudiantList implements OnInit {
    private readonly api = inject(EtudiantApi);
    private readonly notification = inject(NotificationService);
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly destroyRef = inject(DestroyRef);
    private readonly table = viewChild.required<Table>('table');
    private readonly paysApi = inject(PaysApi);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    paysOptions = signal<Pays[]>([]);

    rows = signal<Etudiant[]>([]);
    loading = signal(false);
    totalRecords = signal(0);
    cyclesCounts = signal<Record<number, number>>({});
    dialogVisible = signal(false);
    editingId: number | null = null;
    private editingEntity: Etudiant | null = null;
    matriculeControl = this.fb.control<string>('');
    nomControl = this.fb.control<string>('');
    prenomControl = this.fb.control<string>('');
    actifControl = this.fb.control<boolean | null>(null);

    booleanFilterOptions = [
        { label: 'Oui', value: true },
        { label: 'Non', value: false }
    ];

    sexeOptions: { label: string; value: Sexe }[] = [
        { label: 'Homme', value: 'HOMME' },
        { label: 'Femme', value: 'FEMME' }
    ];

    form = this.fb.group({
        matricule: this.fb.control<string | null>(null, { validators: [Validators.maxLength(30)] }),
        nom: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(80)] }),
        prenom: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(80)] }),
        particularite: this.fb.control<string | null>(null, { validators: [Validators.maxLength(80)] }),
        dateNaissance: this.fb.control<Date | null>(null),
        sexe: this.fb.control<Sexe | null>(null),
        email: this.fb.control<string | null>(null, { validators: [Validators.maxLength(150)] }),
        telephone: this.fb.control<string | null>(null, { validators: [Validators.maxLength(30)] }),
        anneeEntree: this.fb.control<number | null>(null, { validators: [Validators.min(1900), Validators.max(2200)] }),
        cursusAcheve: this.fb.control<boolean>(false),
        anneeFinale: this.fb.control<number | null>(null, { validators: [Validators.min(1900), Validators.max(2200)] }),
        commentaire: this.fb.control<string | null>(null, { validators: [Validators.maxLength(255)] }),
        actif: this.fb.control<boolean>(true),
        pays: this.fb.control<Pays | null>(null)
    });

    ngOnInit(): void {
        this.paysApi.query({ size: 2000 }).subscribe((page) => this.paysOptions.set(page.content));
        this.matriculeControl.valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
        this.nomControl.valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
        this.prenomControl.valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
        this.actifControl.valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());

        const editId = this.route.snapshot.queryParamMap.get('edit');
        if (editId) {
            this.api.find(Number(editId)).subscribe((entity) => this.openEdit(entity));
            this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
        }
    }

    onLazyLoad(event: TableLazyLoadEvent): void {
        const page = Math.floor((event.first ?? 0) / (event.rows ?? 10));
        this.loading.set(true);
        this.api
            .query({
                page,
                size: event.rows ?? 10,
                sort: event.sortField ? `${event.sortField},${event.sortOrder === 1 ? 'asc' : 'desc'}` : undefined,
                'matricule.contains': this.matriculeControl.value || undefined,
                'nom.contains': this.nomControl.value || undefined,
                'prenom.contains': this.prenomControl.value || undefined,
                'actif.equals': this.actifControl.value ?? undefined
            })
            .subscribe({
                next: (result) => {
                    this.rows.set(result.content);
                    this.totalRecords.set(result.totalElements);
                    this.loading.set(false);
                    this.chargerCyclesCounts(result.content);
                },
                error: () => this.loading.set(false)
            });
    }

    private chargerCyclesCounts(rows: Etudiant[]): void {
        if (rows.length === 0) {
            this.cyclesCounts.set({});
            return;
        }
        this.api.nombreCycles(rows.map((r) => r.id)).subscribe((counts) => {
            const map: Record<number, number> = {};
            for (const c of counts) {
                map[c.etudiantId] = c.total;
            }
            this.cyclesCounts.set(map);
        });
    }

    anneeLabel(nombreCycles: number | undefined): string {
        if (!nombreCycles || nombreCycles < 1) {
            return '—';
        }
        const index = Math.min(nombreCycles, NOMS_ANNEE.length) - 1;
        return NOMS_ANNEE[index];
    }

    reload(): void {
        this.onLazyLoad({ first: 0, rows: this.table().rows ?? 10 });
    }

    openNew(): void {
        this.editingId = null;
        this.editingEntity = null;
        this.form.reset({
            matricule: null,
            nom: '',
            prenom: '',
            particularite: null,
            dateNaissance: null,
            sexe: null,
            email: null,
            telephone: null,
            anneeEntree: null,
            cursusAcheve: false,
            anneeFinale: null,
            commentaire: null,
            actif: true
        });
        this.form.controls.pays.setValue(null);
        this.dialogVisible.set(true);
    }

    openEdit(entity: Etudiant): void {
        this.editingId = entity.id;
        this.editingEntity = entity;
        this.form.patchValue({
            matricule: entity.matricule,
            nom: entity.nom,
            prenom: entity.prenom,
            particularite: entity.particularite,
            dateNaissance: parseIsoDate(entity.dateNaissance),
            sexe: entity.sexe,
            email: entity.email,
            telephone: entity.telephone,
            anneeEntree: entity.anneeEntree,
            cursusAcheve: entity.cursusAcheve,
            anneeFinale: entity.anneeFinale,
            commentaire: entity.commentaire,
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
            matricule: value.matricule,
            nom: value.nom,
            prenom: value.prenom,
            particularite: value.particularite,
            dateNaissance: toIsoDate(value.dateNaissance),
            sexe: value.sexe,
            email: value.email,
            telephone: value.telephone,
            anneeEntree: value.anneeEntree,
            cursusAcheve: value.cursusAcheve,
            anneeFinale: value.anneeFinale,
            commentaire: value.commentaire,
            actif: value.actif,
            pays: value.pays,
            // Le formulaire ne gère pas la photo (page détail dédiée) : on la
            // reporte telle quelle pour ne pas l'effacer lors d'un PUT complet.
            photo: this.editingEntity?.photo ?? null,
            photoContentType: this.editingEntity?.photoContentType ?? null
        };

        const request$ = this.editingId ? this.api.update({ id: this.editingId, ...dto } as Etudiant) : this.api.create(dto as Omit<Etudiant, 'id'>);

        request$.subscribe(() => {
            this.notification.success(this.editingId ? 'Modification enregistrée.' : 'Élément ajouté.');
            this.dialogVisible.set(false);
            this.reload();
        });
    }

    remove(entity: Etudiant): void {
        this.notification.confirmDelete('Supprimer cet élément ?', () => {
            this.api.delete(entity.id).subscribe(() => {
                this.notification.success('Élément supprimé.');
                this.reload();
            });
        });
    }

    genererMatricules(): void {
        this.api.genererMatriculesManquants().subscribe((result) => {
            if (result.genere > 0) {
                this.notification.success(`${result.genere} matricule(s) généré(s).`);
                this.reload();
            } else {
                this.notification.success('Aucun matricule à générer.');
            }
            if (result.ignoresSansAnneeEntree.length > 0) {
                this.notification.error(
                    `${result.ignoresSansAnneeEntree.length} étudiant(s) sans année d'entrée n'ont pas pu être traités : ${result.ignoresSansAnneeEntree.slice(0, 5).join(', ')}${result.ignoresSansAnneeEntree.length > 5 ? '…' : ''}`
                );
            }
        });
    }
}
