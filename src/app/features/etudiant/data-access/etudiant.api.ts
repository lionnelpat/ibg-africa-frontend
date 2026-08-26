import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestCrudService } from '@/app/core/http/rest-crud.service';
import { Etudiant } from '../domain/etudiant.model';
import { MatriculeGenerationResult } from '../domain/matricule-generation-result.model';

export interface EtudiantCycleCount {
    etudiantId: number;
    total: number;
}

@Injectable({ providedIn: 'root' })
export class EtudiantApi extends RestCrudService<Etudiant> {
    constructor() {
        super('/api/etudiants');
    }

    genererMatriculesManquants(): Observable<MatriculeGenerationResult> {
        return this.http.post<MatriculeGenerationResult>(`${this.resourceUrl}/generer-matricules`, {});
    }

    nombreCycles(etudiantIds: number[]): Observable<EtudiantCycleCount[]> {
        const params = { etudiantIds: etudiantIds.join(',') };
        return this.http.get<EtudiantCycleCount[]>(`${this.resourceUrl}/nombre-cycles`, { params });
    }
}
