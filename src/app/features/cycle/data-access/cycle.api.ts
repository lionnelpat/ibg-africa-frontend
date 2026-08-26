import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestCrudService } from '@/app/core/http/rest-crud.service';
import { Cycle } from '../domain/cycle.model';

export interface CycleInscriptionCount {
    cycleId: number;
    total: number;
}

@Injectable({ providedIn: 'root' })
export class CycleApi extends RestCrudService<Cycle> {
    constructor() {
        super('/api/cycles');
    }

    nombreInscrits(cycleIds: number[]): Observable<CycleInscriptionCount[]> {
        const params = { cycleIds: cycleIds.join(',') };
        return this.http.get<CycleInscriptionCount[]>(`${this.resourceUrl}/nombre-inscrits`, { params });
    }
}
