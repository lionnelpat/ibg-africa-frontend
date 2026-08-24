import { Injectable } from '@angular/core';
import { RestCrudService } from '@/app/core/http/rest-crud.service';
import { Cours } from '../domain/cours.model';

@Injectable({ providedIn: 'root' })
export class CoursApi extends RestCrudService<Cours> {
    constructor() {
        super('/api/cours');
    }
}
