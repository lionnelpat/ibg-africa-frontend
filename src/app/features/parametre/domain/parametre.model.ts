import { CentreFormation } from '@/app/features/centre-formation/domain/centre-formation.model';

export interface Parametre {
    id: number;
    cle: string;
    libelle: string | null;
    valeur: string | null;
    typeValeur: 'TEXTE' | 'NOMBRE' | 'DATE' | 'BOOLEEN';
    modifiableUi: boolean;
    centre: CentreFormation | null;
}
