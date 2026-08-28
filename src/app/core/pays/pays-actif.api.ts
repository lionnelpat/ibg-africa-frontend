import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ContextePays } from './pays-actif.model';

@Injectable({ providedIn: 'root' })
export class PaysActifApi {
    private readonly http = inject(HttpClient);

    get(): Observable<ContextePays> {
        return this.http.get<ContextePays>('/api/pays-actifs');
    }
}
