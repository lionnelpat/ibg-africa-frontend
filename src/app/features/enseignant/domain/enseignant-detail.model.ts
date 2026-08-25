export interface MatiereDispensee {
    evaluationPrevueId: number;
    coursId: number | null;
    coursIntitule: string | null;
    matiereIntitule: string | null;
    sousMatiereIntitule: string | null;
    enseignantId: number;
    enseignantNom: string;
    enseignantPrenom: string;
}

export interface CycleEnseignement {
    cycleId: number;
    cycleAnnee: number;
    cycleLibelle: string | null;
    matieres: MatiereDispensee[];
}

export interface EnseignantDetail {
    id: number;
    nom: string;
    prenom: string;
    libelleLong: string | null;
    libelleCourt: string | null;
    email: string | null;
    telephone: string | null;
    commentaire: string | null;
    actif: boolean;
    photo: string | null;
    photoContentType: string | null;
    coursParCycle: CycleEnseignement[];
}
