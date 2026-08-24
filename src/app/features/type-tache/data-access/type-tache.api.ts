import { Injectable } from '@angular/core';
import { RestCrudService } from '@/app/core/http/rest-crud.service';
import { TypeTache } from '../domain/type-tache.model';

@Injectable({ providedIn: 'root' })
export class TypeTacheApi extends RestCrudService<TypeTache> {
    constructor() {
        super('/api/type-taches');
    }
}
