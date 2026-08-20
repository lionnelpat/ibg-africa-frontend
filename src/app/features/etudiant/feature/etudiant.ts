import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-etudiant',
    standalone: true,
    imports: [CardModule],
    template: `
        <p-card header="Étudiant">
            <p class="m-0">Page de test — la liste des étudiants sera implémentée ici.</p>
        </p-card>
    `
})
export class Etudiant {}
