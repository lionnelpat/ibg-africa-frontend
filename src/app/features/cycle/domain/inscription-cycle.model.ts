export interface NewInscriptionCycle {
    dateInscription: string | null;
    cycleTermine: boolean;
    groupe: string | null;
    cycle: { id: number };
    etudiant: { id: number };
}
