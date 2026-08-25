import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EnseignantDetail } from '../domain/enseignant-detail.model';

@Injectable({ providedIn: 'root' })
export class EnseignantDetailApi {
    private readonly http = inject(HttpClient);

    get(enseignantId: number): Observable<EnseignantDetail> {
        return this.http.get<EnseignantDetail>(`/api/enseignants/${enseignantId}/detail`);
    }
}
