import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SaisieMatiere, SaisieNoteRequest, SaisieResult } from '../domain/saisie.model';

@Injectable({ providedIn: 'root' })
export class SaisieApi {
    private readonly http = inject(HttpClient);

    getGrille(evaluationPrevueId: number): Observable<SaisieMatiere> {
        return this.http.get<SaisieMatiere>(`/api/evaluation-prevues/${evaluationPrevueId}/saisie`);
    }

    enregistrer(evaluationPrevueId: number, lignes: SaisieNoteRequest[]): Observable<SaisieResult> {
        return this.http.put<SaisieResult>(`/api/evaluation-prevues/${evaluationPrevueId}/saisie`, lignes);
    }

    importer(evaluationPrevueId: number, fichier: File): Observable<SaisieResult> {
        const formData = new FormData();
        formData.append('fichier', fichier);
        return this.http.post<SaisieResult>(`/api/evaluation-prevues/${evaluationPrevueId}/saisie/import`, formData);
    }
}
