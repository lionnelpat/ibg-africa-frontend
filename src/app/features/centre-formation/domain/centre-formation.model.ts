import { Pays } from '@/app/features/pays/domain/pays.model';

export interface CentreFormation {
    id: number;
    code: string;
    nom: string;
    ville: string;
    adresse: string | null;
    enteteDocument: string | null;
    signataire: string;
    logoUrl: string | null;
    nbCyclesCursus: number;
    noteMaximale: number;
    actif: boolean;
    pays: Pays;
}
