export type StatutNote = 'NON_SAISIE' | 'SAISIE' | 'ABSENT' | 'DISPENSE' | 'VALIDEE';

export interface SaisieLigne {
    etudiantId: number;
    matricule: string | null;
    nom: string;
    prenom: string;
    evaluationRealiseeId: number | null;
    note: number | null;
    statut: StatutNote;
}

export interface SaisieMatiere {
    evaluationPrevueId: number;
    intitule: string;
    coursIntitule: string | null;
    coefficient: number;
    noteMaximale: number;
    cycleId: number;
    cycleAnnee: number;
    cycleCloture: boolean;
    lignes: SaisieLigne[];
}

export interface SaisieNoteRequest {
    etudiantId: number;
    note: number | null;
    statut: StatutNote;
}

export interface SaisieResult {
    enregistrees: number;
    erreurs: string[];
}
