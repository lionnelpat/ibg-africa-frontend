import { CentreFormation } from '@/app/features/centre-formation/domain/centre-formation.model';

export interface Cycle {
    id: number;
    annee: number;
    libelle: string | null;
    dateDebut: string | null;
    dateFin: string | null;
    cloture: boolean;
    commentaire: string | null;
    centre: CentreFormation;
}
