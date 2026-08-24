import { Injectable } from '@angular/core';
import { RestCrudService } from '@/app/core/http/rest-crud.service';
import { BaremeMention } from '../domain/bareme-mention.model';

@Injectable({ providedIn: 'root' })
export class BaremeMentionApi extends RestCrudService<BaremeMention> {
    constructor() {
        super('/api/bareme-mentions');
    }
}
