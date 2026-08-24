import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Page } from '@/app/shared/models/page.model';

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

function toHttpParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params ?? {})) {
        if (value !== undefined && value !== null && value !== '') {
            httpParams = httpParams.set(key, value);
        }
    }
    return httpParams;
}

/**
 * Base HTTP CRUD, une instance par feature (voir <feature>.api.ts).
 * Absorbe la convention JHipster (corps = tableau + en-tête X-Total-Count)
 * derrière le contrat Page<T> générique du projet (docs/ANGULAR-GUIDELINES.md §6).
 */
export abstract class RestCrudService<T extends { id: number }> {
    protected readonly http = inject(HttpClient);

    protected constructor(protected readonly resourceUrl: string) {}

    query(params?: QueryParams): Observable<Page<T>> {
        return this.http.get<T[]>(this.resourceUrl, { params: toHttpParams(params), observe: 'response' }).pipe(
            map((response) => {
                const content = response.body ?? [];
                const totalCount = response.headers.get('X-Total-Count');
                return {
                    content,
                    totalElements: totalCount ? Number(totalCount) : content.length,
                    page: Number(params?.['page'] ?? 0),
                    size: Number(params?.['size'] ?? content.length)
                };
            })
        );
    }

    find(id: number): Observable<T> {
        return this.http.get<T>(`${this.resourceUrl}/${id}`);
    }

    create(entity: Omit<T, 'id'>): Observable<T> {
        return this.http.post<T>(this.resourceUrl, entity);
    }

    update(entity: T): Observable<T> {
        return this.http.put<T>(`${this.resourceUrl}/${entity.id}`, entity);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.resourceUrl}/${id}`);
    }
}
