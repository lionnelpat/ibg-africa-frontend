import { ChangeDetectionStrategy, Component, afterNextRender, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { LayoutService } from '@/app/layout/service/layout.service';
import { Dashboard as DashboardData } from '../domain/dashboard.model';
import { DashboardApi } from '../data-access/dashboard.api';

@Component({
    selector: 'app-dashboard',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, RouterModule, CardModule, ChartModule, TableModule, TagModule],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Étudiants</span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ data()?.totalEtudiants ?? '—' }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-users text-blue-500 text-xl!"></i>
                        </div>
                    </div>
                    <span class="text-primary font-medium">{{ data()?.totalEtudiantsActifs ?? '—' }} </span>
                    <span class="text-muted-color">actifs</span>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Cycles</span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ data()?.totalCycles ?? '—' }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-calendar text-orange-500 text-xl!"></i>
                        </div>
                    </div>
                    <span class="text-muted-color">sessions au total</span>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Enseignants</span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ data()?.totalEnseignants ?? '—' }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-user text-cyan-500 text-xl!"></i>
                        </div>
                    </div>
                    <span class="text-muted-color">intervenants</span>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Taux de réussite</span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ data()?.tauxReussite ?? '—' }}%</div>
                        </div>
                        <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-graduation-cap text-purple-500 text-xl!"></i>
                        </div>
                    </div>
                    <span class="text-primary font-medium">{{ data()?.totalFinissants ?? '—' }} </span>
                    <span class="text-muted-color">finissants / {{ data()?.totalEtudiants ?? '—' }} inscrits</span>
                </div>
            </div>

            <div class="col-span-12 xl:col-span-6">
                <p-card header="Évolution des inscriptions par année">
                    <p-chart type="line" [data]="evolutionData()" [options]="evolutionOptions()" class="h-80 block" />
                </p-card>
            </div>
            <div class="col-span-12 xl:col-span-6">
                <p-card header="Répartition des mentions">
                    <p-chart type="bar" [data]="mentionsData()" [options]="mentionsOptions()" class="h-80 block" />
                </p-card>
            </div>

            <div class="col-span-12">
                <p-card header="5 dernières sessions">
                    <p-table [value]="data()?.dernieresSessions ?? []" dataKey="id" [rowHover]="true" styleClass="cursor-pointer">
                        <ng-template #header>
                            <tr>
                                <th>Année</th>
                                <th>Libellé</th>
                                <th>Centre</th>
                                <th>Étudiants inscrits</th>
                                <th>Statut</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-row>
                            <tr [routerLink]="['/cycle', row.id]">
                                <td>{{ row.annee }}</td>
                                <td>{{ row.libelle }}</td>
                                <td>{{ row.centreNom }} ({{ row.centreCode }})</td>
                                <td>{{ row.nbEtudiants }}</td>
                                <td><p-tag [value]="row.cloture ? 'Clôturé' : 'En cours'" [severity]="row.cloture ? 'success' : 'info'" /></td>
                            </tr>
                        </ng-template>
                        <ng-template #emptymessage>
                            <tr>
                                <td colspan="5" class="text-center py-6">Aucune session.</td>
                            </tr>
                        </ng-template>
                    </p-table>
                </p-card>
            </div>
        </div>
    `
})
export class Dashboard {
    private readonly api = inject(DashboardApi);
    private readonly layoutService = inject(LayoutService);

    data = signal<DashboardData | null>(null);

    evolutionData = signal<ChartData<'line'> | undefined>(undefined);
    evolutionOptions = signal<ChartOptions<'line'> | undefined>(undefined);
    mentionsData = signal<ChartData<'bar'> | undefined>(undefined);
    mentionsOptions = signal<ChartOptions<'bar'> | undefined>(undefined);

    constructor() {
        this.api.get().subscribe((data) => this.data.set(data));

        afterNextRender(() => setTimeout(() => this.buildCharts(), 150));
        effect(() => {
            this.layoutService.layoutConfig().darkTheme;
            this.data();
            setTimeout(() => this.buildCharts(), 150);
        });
    }

    private buildCharts(): void {
        const data = this.data();
        if (!data) {
            return;
        }

        const style = getComputedStyle(document.documentElement);
        const primary = style.getPropertyValue('--p-primary-500');
        const textColor = style.getPropertyValue('--text-color');
        const textMutedColor = style.getPropertyValue('--text-color-secondary');
        const borderColor = style.getPropertyValue('--surface-border');

        this.evolutionData.set({
            labels: data.evolutionInscriptions.map((e) => String(e.annee)),
            datasets: [
                {
                    label: 'Étudiants inscrits',
                    data: data.evolutionInscriptions.map((e) => e.nombre),
                    borderColor: primary,
                    backgroundColor: primary,
                    tension: 0.3,
                    fill: false
                }
            ]
        });
        this.evolutionOptions.set({
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: textMutedColor }, grid: { color: 'transparent' } },
                y: { beginAtZero: true, ticks: { color: textMutedColor, stepSize: 1 }, grid: { color: borderColor } }
            }
        });

        this.mentionsData.set({
            labels: data.repartitionMentions.map((m) => m.mentionCourte),
            datasets: [
                {
                    label: 'Notes',
                    data: data.repartitionMentions.map((m) => m.nombre),
                    backgroundColor: primary,
                    borderRadius: 4,
                    barThickness: 20
                }
            ]
        });
        this.mentionsOptions.set({
            indexAxis: 'y',
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, ticks: { color: textMutedColor }, grid: { color: borderColor } },
                y: { ticks: { color: textColor }, grid: { color: 'transparent' } }
            }
        });
    }
}
