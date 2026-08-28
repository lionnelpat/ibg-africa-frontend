import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PaysActifApi } from './pays-actif.api';
import { PaysContextService } from './pays-context.service';

/**
 * Bloque l'accès à l'app tant que le pays actif de la session n'est pas
 * résolu. Un utilisateur à un seul pays est résolu automatiquement (aucun
 * écran affiché) ; les autres (admin, multi-pays) sont redirigés vers
 * /choix-pays pour choisir.
 */
export const paysGuard: CanActivateFn = async () => {
    const paysContext = inject(PaysContextService);
    if (paysContext.isResolved()) {
        return true;
    }

    const router = inject(Router);
    const paysActifApi = inject(PaysActifApi);
    const contexte = await firstValueFrom(paysActifApi.get());

    if (contexte.sautEcran && contexte.paysSelectionnables.length === 1) {
        paysContext.setActif(contexte.paysSelectionnables[0].codeIso);
        return true;
    }

    return router.parseUrl('/choix-pays');
};
