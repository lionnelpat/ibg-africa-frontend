import { Injectable } from '@angular/core';
import { RestCrudService } from '@/app/core/http/rest-crud.service';
import { SousMatiere } from '../domain/sous-matiere.model';

@Injectable({ providedIn: 'root' })
export class SousMatiereApi extends RestCrudService<SousMatiere> {
    constructor() {
        super('/api/sous-matieres');
    }
}
