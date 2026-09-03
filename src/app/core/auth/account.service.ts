import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { PaysContextService } from '@/app/core/pays/pays-context.service';
import { Account } from './account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private readonly http = inject(HttpClient);
    private readonly paysContext = inject(PaysContextService);

    private readonly _account = signal<Account | null>(null);
    private readonly _loaded = signal(false);

    readonly account = this._account.asReadonly();
    readonly loaded = this._loaded.asReadonly();
    readonly authenticated = computed(() => this._account() !== null);

    async load(): Promise<void> {
        if (this._loaded()) {
            return;
        }
        await firstValueFrom(
            this.http.get<Account>('/api/account').pipe(
                tap((account) => this._account.set(account)),
                catchError(() => {
                    this._account.set(null);
                    return of(null);
                })
            )
        );
        this._loaded.set(true);
    }

    login(): void {
        window.location.href = '/oauth2/authorization/oidc';
    }

    async logout(): Promise<void> {
        const response = await firstValueFrom(this.http.post<{ logoutUrl: string }>('/api/logout', {}));
        this._account.set(null);
        this.paysContext.clear();
        window.location.href = response.logoutUrl;
    }
}
