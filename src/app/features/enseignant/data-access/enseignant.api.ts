import { Injectable } from '@angular/core';
import { RestCrudService } from '@/app/core/http/rest-crud.service';
import { Enseignant } from '../domain/enseignant.model';

@Injectable({ providedIn: 'root' })
export class EnseignantApi extends RestCrudService<Enseignant> {
    constructor() {
        super('/api/enseignants');
    }
}
