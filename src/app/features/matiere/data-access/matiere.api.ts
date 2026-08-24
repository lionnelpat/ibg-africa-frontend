import { Injectable } from '@angular/core';
import { RestCrudService } from '@/app/core/http/rest-crud.service';
import { Matiere } from '../domain/matiere.model';

@Injectable({ providedIn: 'root' })
export class MatiereApi extends RestCrudService<Matiere> {
    constructor() {
        super('/api/matieres');
    }
}
