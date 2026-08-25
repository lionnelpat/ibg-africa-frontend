export interface Enseignant {
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
}
