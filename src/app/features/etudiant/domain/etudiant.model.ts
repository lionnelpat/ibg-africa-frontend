import { Pays } from '@/app/features/pays/domain/pays.model';

export type Sexe = 'HOMME' | 'FEMME';

export interface Etudiant {
    id: number;
    matricule: string | null;
    nom: string;
    prenom: string;
    particularite: string | null;
    dateNaissance: string | null;
    email: string | null;
    telephone: string | null;
    anneeEntree: number | null;
    cursusAcheve: boolean;
    anneeFinale: number | null;
    commentaire: string | null;
    actif: boolean;
    sexe: Sexe | null;
    photo: string | null;
    photoContentType: string | null;
    pays: Pays | null;
}
