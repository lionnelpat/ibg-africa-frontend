import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { NotificationService } from '@/app/core/notification/notification.service';
import { Etudiant } from '../domain/etudiant.model';
import { EtudiantApi } from '../data-access/etudiant.api';
import { Bulletin } from '../domain/bulletin.model';
import { BulletinApi } from '../data-access/bulletin.api';

const MAX_PHOTO_SIZE = 3 * 1024 * 1024;

const SEXE_LABELS: Record<string, string> = {
    HOMME: 'Homme',
    FEMME: 'Femme'
};

@Component({
    selector: 'app-etudiant-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, RouterModule, ButtonModule, CardModule, TableModule, TagModule],
    template: `
        <div class="flex flex-col gap-4">
            <p-card>
                <div class="flex items-start gap-6 flex-wrap">
                    <div class="flex flex-col items-center gap-3">
                        @if (etudiant()?.photo) {
                            <img
                                [src]="'data:' + etudiant()!.photoContentType + ';base64,' + etudiant()!.photo"
                                class="w-32 h-32 rounded-full object-cover border border-surface-200"
                                alt="Photo de l'étudiant"
                            />
                        } @else {
                            <div class="w-32 h-32 rounded-full bg-surface-100 border border-surface-200 flex items-center justify-center">
                                <i class="pi pi-user text-5xl text-muted-color"></i>
                            </div>
                        }
                        <input #fileInput type="file" accept="image/*" hidden (change)="onPhotoSelected($event)" />
                        <p-button label="Changer la photo" icon="pi pi-camera" size="small" text [loading]="uploading()" (onClick)="fileInput.click()" />
                    </div>

                    <div class="flex-1 min-w-64">
                        <div class="flex items-center gap-3 flex-wrap">
                            <h5 class="m-0">{{ etudiant()?.nom }} {{ etudiant()?.prenom }}</h5>
                            <p-tag [value]="etudiant()?.actif ? 'Actif' : 'Inactif'" [severity]="etudiant()?.actif ? 'success' : 'danger'" />
                            <p-tag
                                [value]="etudiant()?.cursusAcheve ? 'Cursus terminé' : 'Cursus en cours'"
                                [severity]="etudiant()?.cursusAcheve ? 'info' : 'warn'"
                            />
                        </div>
                        <div class="text-muted-color mt-1">Matricule : {{ etudiant()?.matricule ?? 'n/a' }}</div>

                        <div class="grid grid-cols-12 gap-4 mt-4">
                            <div class="col-span-12 md:col-span-6">
                                <span class="font-medium">Sexe : </span>{{ sexeLabel() }}
                            </div>
                            <div class="col-span-12 md:col-span-6">
                                <span class="font-medium">Date de naissance : </span>{{ (etudiant()?.dateNaissance | date: 'dd/MM/yyyy') ?? 'n/a' }}
                            </div>
                            <div class="col-span-12 md:col-span-6">
                                <span class="font-medium">Email : </span>{{ etudiant()?.email ?? 'n/a' }}
                            </div>
                            <div class="col-span-12 md:col-span-6">
                                <span class="font-medium">Téléphone : </span>{{ etudiant()?.telephone ?? 'n/a' }}
                            </div>
                            <div class="col-span-12 md:col-span-6">
                                <span class="font-medium">Pays : </span>{{ etudiant()?.pays?.nom ?? 'n/a' }}
                            </div>
                            <div class="col-span-12 md:col-span-6">
                                <span class="font-medium">Année d'entrée : </span>{{ etudiant()?.anneeEntree ?? 'n/a' }}
                            </div>
                            @if (etudiant()?.cursusAcheve) {
                                <div class="col-span-12 md:col-span-6">
                                    <span class="font-medium">Année finale : </span>{{ etudiant()?.anneeFinale ?? 'n/a' }}
                                </div>
                            }
                            @if (etudiant()?.commentaire) {
                                <div class="col-span-12">
                                    <span class="font-medium">Commentaire : </span>{{ etudiant()?.commentaire }}
                                </div>
                            }
                        </div>

                        <div class="flex gap-2 mt-4">
                            <p-button label="Modifier" icon="pi pi-pencil" text [routerLink]="['/etudiant']" [queryParams]="{ edit: id() }" />
                            <p-button label="Télécharger le bulletin" icon="pi pi-file-pdf" text [loading]="telechargementEnCours()" (onClick)="telechargerPdf()" />
                        </div>
                    </div>
                </div>
            </p-card>

            <p-card header="Parcours">
                <p-table [value]="bulletin()?.lignes ?? []">
                    <ng-template #header>
                        <tr>
                            <th>Cycle</th>
                            <th>Cours</th>
                            <th>Moyenne</th>
                            <th>Mention</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-row>
                        <tr>
                            <td>{{ row.cycleAnnee }}</td>
                            <td>{{ row.coursIntitule }}</td>
                            <td>{{ row.moyenneCours }}</td>
                            <td>{{ row.mentionLongue }}</td>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="4" class="text-center py-6">Aucune note comptant dans la moyenne pour cet étudiant.</td>
                        </tr>
                    </ng-template>
                </p-table>
                @if (bulletin()?.moyenneGenerale !== null && bulletin()?.moyenneGenerale !== undefined) {
                    <div class="flex gap-8 mt-4">
                        <div><span class="font-bold">Moyenne générale : </span>{{ bulletin()?.moyenneGenerale }}</div>
                        <div><span class="font-bold">Mention : </span>{{ bulletin()?.mentionGeneraleLongue }}</div>
                    </div>
                }
            </p-card>
        </div>
    `
})
export class EtudiantDetail {
    private readonly api = inject(EtudiantApi);
    private readonly bulletinApi = inject(BulletinApi);
    private readonly notification = inject(NotificationService);

    id = input.required<string>();

    etudiant = signal<Etudiant | null>(null);
    bulletin = signal<Bulletin | null>(null);
    uploading = signal(false);
    telechargementEnCours = signal(false);

    constructor() {
        effect(() => {
            const id = Number(this.id());
            this.etudiant.set(null);
            this.bulletin.set(null);
            this.api.find(id).subscribe((etudiant) => this.etudiant.set(etudiant));
            this.bulletinApi.get(id).subscribe((bulletin) => this.bulletin.set(bulletin));
        });
    }

    sexeLabel(): string {
        const sexe = this.etudiant()?.sexe;
        return sexe ? (SEXE_LABELS[sexe] ?? sexe) : 'Non renseigné';
    }

    onPhotoSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) {
            return;
        }
        if (file.size > MAX_PHOTO_SIZE) {
            this.notification.error('La photo dépasse la taille maximale autorisée (3 Mo).');
            input.value = '';
            return;
        }
        const etudiant = this.etudiant();
        if (!etudiant) {
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
            this.uploading.set(true);
            this.api.partialUpdate({ id: etudiant.id, photo: base64, photoContentType: file.type }).subscribe({
                next: (updated) => {
                    this.uploading.set(false);
                    this.etudiant.set(updated);
                    this.notification.success('Photo mise à jour.');
                },
                error: () => this.uploading.set(false)
            });
            input.value = '';
        };
        reader.readAsDataURL(file);
    }

    telechargerPdf(): void {
        const etudiant = this.etudiant();
        if (!etudiant) {
            return;
        }
        this.telechargementEnCours.set(true);
        this.bulletinApi.getPdf(etudiant.id).subscribe({
            next: (blob) => {
                this.telechargementEnCours.set(false);
                const url = window.URL.createObjectURL(blob);
                const lien = document.createElement('a');
                lien.href = url;
                lien.download = `bulletin-${etudiant.matricule ?? etudiant.id}.pdf`;
                lien.click();
                window.URL.revokeObjectURL(url);
            },
            error: () => this.telechargementEnCours.set(false)
        });
    }
}
