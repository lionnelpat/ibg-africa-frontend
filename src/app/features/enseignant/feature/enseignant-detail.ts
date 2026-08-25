import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { NotificationService } from '@/app/core/notification/notification.service';
import { Enseignant } from '../domain/enseignant.model';
import { EnseignantApi } from '../data-access/enseignant.api';
import { EnseignantDetail as EnseignantDetailModel } from '../domain/enseignant-detail.model';
import { EnseignantDetailApi } from '../data-access/enseignant-detail.api';

const MAX_PHOTO_SIZE = 3 * 1024 * 1024;

@Component({
    selector: 'app-enseignant-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, RouterModule, ButtonModule, CardModule, TableModule, TagModule],
    template: `
        <div class="flex flex-col gap-4">
            <p-card>
                <div class="flex items-start gap-6 flex-wrap">
                    <div class="flex flex-col items-center gap-3">
                        @if (detail()?.photo) {
                            <img
                                [src]="'data:' + detail()!.photoContentType + ';base64,' + detail()!.photo"
                                class="w-32 h-32 rounded-full object-cover border border-surface-200"
                                alt="Photo de l'enseignant"
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
                            <h5 class="m-0">{{ detail()?.nom }} {{ detail()?.prenom }}</h5>
                            <p-tag [value]="detail()?.actif ? 'Actif' : 'Inactif'" [severity]="detail()?.actif ? 'success' : 'danger'" />
                        </div>
                        @if (detail()?.libelleLong) {
                            <div class="text-muted-color mt-1">{{ detail()?.libelleLong }}</div>
                        }

                        <div class="grid grid-cols-12 gap-4 mt-4">
                            <div class="col-span-12 md:col-span-6">
                                <span class="font-medium">Email : </span>{{ detail()?.email ?? 'n/a' }}
                            </div>
                            <div class="col-span-12 md:col-span-6">
                                <span class="font-medium">Téléphone : </span>{{ detail()?.telephone ?? 'n/a' }}
                            </div>
                            @if (detail()?.commentaire) {
                                <div class="col-span-12">
                                    <span class="font-medium">Commentaire : </span>{{ detail()?.commentaire }}
                                </div>
                            }
                        </div>

                        <div class="flex gap-2 mt-4">
                            <p-button label="Modifier" icon="pi pi-pencil" text [routerLink]="['/enseignant']" />
                        </div>
                    </div>
                </div>
            </p-card>

            <p-card header="Cours dispensés par cycle">
                @for (cycle of detail()?.coursParCycle ?? []; track cycle.cycleId) {
                    <div class="mb-4">
                        <div class="font-semibold mb-2">Cycle {{ cycle.cycleAnnee }} {{ cycle.cycleLibelle ? '– ' + cycle.cycleLibelle : '' }}</div>
                        <p-table [value]="cycle.matieres" dataKey="evaluationPrevueId">
                            <ng-template #header>
                                <tr>
                                    <th>Cours</th>
                                    <th>Matière</th>
                                    <th>Sous-matière</th>
                                </tr>
                            </ng-template>
                            <ng-template #body let-row>
                                <tr>
                                    <td>{{ row.coursIntitule }}</td>
                                    <td>{{ row.matiereIntitule }}</td>
                                    <td>{{ row.sousMatiereIntitule }}</td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>
                } @empty {
                    <p class="text-muted-color">Aucune matière dispensée pour le moment.</p>
                }
            </p-card>
        </div>
    `
})
export class EnseignantDetail {
    private readonly api = inject(EnseignantApi);
    private readonly detailApi = inject(EnseignantDetailApi);
    private readonly notification = inject(NotificationService);

    id = input.required<string>();

    detail = signal<EnseignantDetailModel | null>(null);
    uploading = signal(false);

    constructor() {
        effect(() => {
            const id = Number(this.id());
            this.detail.set(null);
            this.chargerDetail(id);
        });
    }

    private chargerDetail(id: number): void {
        this.detailApi.get(id).subscribe((detail) => this.detail.set(detail));
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
        const detail = this.detail();
        if (!detail) {
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
            this.uploading.set(true);
            this.api.partialUpdate({ id: detail.id, photo: base64, photoContentType: file.type } as Partial<Enseignant> & { id: number }).subscribe({
                next: () => {
                    this.uploading.set(false);
                    this.chargerDetail(detail.id);
                    this.notification.success('Photo mise à jour.');
                },
                error: () => this.uploading.set(false)
            });
            input.value = '';
        };
        reader.readAsDataURL(file);
    }
}
