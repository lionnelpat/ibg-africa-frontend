import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Bulletin } from '../domain/bulletin.model';

@Injectable({ providedIn: 'root' })
export class BulletinApi {
    private readonly http = inject(HttpClient);

    get(etudiantId: number): Observable<Bulletin> {
        return this.http.get<Bulletin>(`/api/etudiants/${etudiantId}/bulletin`);
    }

    getPdf(etudiantId: number): Observable<Blob> {
        return this.http.get(`/api/etudiants/${etudiantId}/bulletin/pdf`, { responseType: 'blob' });
    }
}
