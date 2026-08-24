export interface TypeTache {
    id: number;
    code: string;
    intitule: string;
    libelleLong: string | null;
    libelleCourt: string | null;
    entreDansMoyenne: boolean;
    commentaire: string | null;
    actif: boolean;
}
