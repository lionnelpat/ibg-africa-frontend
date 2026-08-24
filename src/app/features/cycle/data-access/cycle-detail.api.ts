import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CycleDetail } from '../domain/cycle-detail.model';

@Injectable({ providedIn: 'root' })
export class CycleDetailApi {
    private readonly http = inject(HttpClient);

    get(id: number): Observable<CycleDetail> {
        return this.http.get<CycleDetail>(`/api/cycles/${id}/detail`);
    }
}
