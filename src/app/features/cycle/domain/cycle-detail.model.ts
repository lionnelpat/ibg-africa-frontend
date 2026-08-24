export interface MatiereDispensee {
    evaluationPrevueId: number;
    coursId: number;
    coursIntitule: string;
    matiereIntitule: string | null;
    sousMatiereIntitule: string | null;
    enseignantId: number | null;
    enseignantNom: string | null;
    enseignantPrenom: string | null;
}

export interface EtudiantResume {
    id: number;
    matricule: string | null;
    nom: string;
    prenom: string;
    actif: boolean;
}

export interface CycleDetail {
    id: number;
    annee: number;
    libelle: string | null;
    dateDebut: string | null;
    dateFin: string | null;
    cloture: boolean;
    centreId: number | null;
    centreCode: string | null;
    centreNom: string | null;
    centreVille: string | null;
    paysNom: string | null;
    matieresDispensees: MatiereDispensee[];
    etudiants: EtudiantResume[];
}
