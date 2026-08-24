export interface BulletinLigne {
    cycleAnnee: number;
    coursIntitule: string;
    moyenneCours: number;
    mentionLongue: string | null;
    mentionCourte: string | null;
}

export interface Bulletin {
    etudiantId: number;
    matricule: string | null;
    nom: string;
    prenom: string;
    centreCode: string | null;
    centreNom: string | null;
    centreVille: string | null;
    centreSignataire: string | null;
    centreEnteteDocument: string | null;
    premiereAnnee: number | null;
    derniereAnnee: number | null;
    lignes: BulletinLigne[];
    moyenneGenerale: number | null;
    mentionGeneraleLongue: string | null;
    mentionGeneraleCourte: string | null;
    dateEdition: string;
}
