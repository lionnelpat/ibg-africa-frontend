import { Injectable } from '@angular/core';
import { RestCrudService } from '@/app/core/http/rest-crud.service';
import { Cycle } from '../domain/cycle.model';

@Injectable({ providedIn: 'root' })
export class CycleApi extends RestCrudService<Cycle> {
    constructor() {
        super('/api/cycles');
    }
}
