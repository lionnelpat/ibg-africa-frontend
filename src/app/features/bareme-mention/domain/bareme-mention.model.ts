import { CentreFormation } from '@/app/features/centre-formation/domain/centre-formation.model';

export interface BaremeMention {
    id: number;
    libelleLong: string;
    libelleCourt: string;
    borneMin: number | null;
    minInclus: boolean;
    borneMax: number | null;
    maxInclus: boolean;
    ordreAffichage: number;
    commentaire: string | null;
    actif: boolean;
    centre: CentreFormation | null;
}
