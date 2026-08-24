import { Injectable } from '@angular/core';
import { RestCrudService } from '@/app/core/http/rest-crud.service';
import { Pays } from '../domain/pays.model';

@Injectable({ providedIn: 'root' })
export class PaysApi extends RestCrudService<Pays> {
    constructor() {
        super('/api/pays');
    }
}
