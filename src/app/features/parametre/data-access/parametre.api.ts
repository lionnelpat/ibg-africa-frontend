import { Injectable } from '@angular/core';
import { RestCrudService } from '@/app/core/http/rest-crud.service';
import { Parametre } from '../domain/parametre.model';

@Injectable({ providedIn: 'root' })
export class ParametreApi extends RestCrudService<Parametre> {
    constructor() {
        super('/api/parametres');
    }
}
