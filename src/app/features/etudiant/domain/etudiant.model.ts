import { Pays } from '@/app/features/pays/domain/pays.model';

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
    pays: Pays | null;
}
