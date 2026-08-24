import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NewInscriptionCycle } from '../domain/inscription-cycle.model';

@Injectable({ providedIn: 'root' })
export class InscriptionCycleApi {
    private readonly http = inject(HttpClient);
    private readonly resourceUrl = '/api/inscription-cycles';

    create(inscription: NewInscriptionCycle): Observable<unknown> {
        return this.http.post(this.resourceUrl, inscription);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.resourceUrl}/${id}`);
    }
}
