import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { PaysContextService } from './pays-context.service';

/** Ajoute le pays actif de la session à chaque appel API, pour le cloisonnement backend. */
export const paysInterceptor: HttpInterceptorFn = (req, next) => {
    if (!req.url.startsWith('/api/')) {
        return next(req);
    }

    const codeActif = inject(PaysContextService).codeActif();
    if (!codeActif) {
        return next(req);
    }

    return next(req.clone({ setHeaders: { 'X-Pays-Actif': codeActif } }));
};
