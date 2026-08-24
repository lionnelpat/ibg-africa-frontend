import { Injectable } from '@angular/core';
import { RestCrudService } from '@/app/core/http/rest-crud.service';
import { Etudiant } from '../domain/etudiant.model';

@Injectable({ providedIn: 'root' })
export class EtudiantApi extends RestCrudService<Etudiant> {
    constructor() {
        super('/api/etudiants');
    }
}
