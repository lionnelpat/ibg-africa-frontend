export interface PaysActif {
    id: number;
    codeIso: string;
    nom: string;
}

export interface ContextePays {
    admin: boolean;
    paysSelectionnables: PaysActif[];
    sautEcran: boolean;
    paysUnique: number | null;
}
