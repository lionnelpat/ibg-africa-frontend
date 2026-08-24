export interface Pays {
    id: number;
    codeIso: string;
    nom: string;
    langue: string;
    fuseau: string | null;
    actif: boolean;
}
