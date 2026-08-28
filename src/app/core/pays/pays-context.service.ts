import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'forbidec.paysActif';
export const VALEUR_TOUS = 'TOUS';

/**
 * Contexte pays actif pour la session de navigateur en cours (onglet). Se
 * réinitialise à la fermeture de l'onglet ou à la déconnexion — jamais
 * mémorisé d'une connexion à l'autre (choix produit explicite : un admin qui
 * change de pays doit re-choisir à chaque connexion, pas juste au premier
 * lancement de l'app).
 *
 * La valeur stockée est soit un code ISO pays (ex. "SN"), soit VALEUR_TOUS
 * pour un admin qui a choisi la vue globale.
 */
@Injectable({ providedIn: 'root' })
export class PaysContextService {
    private readonly _codeActif = signal<string | null>(sessionStorage.getItem(STORAGE_KEY));

    readonly codeActif = this._codeActif.asReadonly();

    setActif(code: string): void {
        sessionStorage.setItem(STORAGE_KEY, code);
        this._codeActif.set(code);
    }

    clear(): void {
        sessionStorage.removeItem(STORAGE_KEY);
        this._codeActif.set(null);
    }

    isResolved(): boolean {
        return this._codeActif() !== null;
    }
}
