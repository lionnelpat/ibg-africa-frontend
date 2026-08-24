export interface EvolutionAnnee {
    annee: number;
    nombre: number;
}

export interface RepartitionMention {
    mentionCourte: string;
    mentionLongue: string;
    nombre: number;
}

export interface SessionRecente {
    id: number;
    annee: number;
    libelle: string | null;
    cloture: boolean;
    centreCode: string | null;
    centreNom: string | null;
    nbEtudiants: number;
}

export interface Dashboard {
    totalEtudiants: number;
    totalEtudiantsActifs: number;
    totalCycles: number;
    totalEnseignants: number;
    totalFinissants: number;
    tauxReussite: number;
    evolutionInscriptions: EvolutionAnnee[];
    repartitionMentions: RepartitionMention[];
    dernieresSessions: SessionRecente[];
}
