import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestCrudService } from '@/app/core/http/rest-crud.service';
import { Etudiant } from '../domain/etudiant.model';
import { MatriculeGenerationResult } from '../domain/matricule-generation-result.model';

@Injectable({ providedIn: 'root' })
export class EtudiantApi extends RestCrudService<Etudiant> {
    constructor() {
        super('/api/etudiants');
    }

    genererMatriculesManquants(): Observable<MatriculeGenerationResult> {
        return this.http.post<MatriculeGenerationResult>(`${this.resourceUrl}/generer-matricules`, {});
    }
}
