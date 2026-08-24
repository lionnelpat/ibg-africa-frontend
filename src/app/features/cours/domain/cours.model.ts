export interface Cours {
    id: number;
    intitule: string;
    libelleLong: string | null;
    libelleCourt: string | null;
    ordreAffichage: number;
    nbPeriodes: number | null;
    coefficient: number;
    dateDebut: string | null;
    dateFin: string | null;
    commentaire: string | null;
    actif: boolean;
}
