import { Injectable } from '@angular/core';
import { RestCrudService } from '@/app/core/http/rest-crud.service';
import { CentreFormation } from '../domain/centre-formation.model';

@Injectable({ providedIn: 'root' })
export class CentreFormationApi extends RestCrudService<CentreFormation> {
    constructor() {
        super('/api/centre-formations');
    }
}
