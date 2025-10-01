export interface Placement {
  id: string;
  nom: string;
  type: string;
  dateAchat: string;
  montantInvesti: number;
  valorisationActuelle: number;
  revenusGeneres: number;
  notes: string;
}

export interface Immobilier {
  id: string;
  nomAdresse: string;
  typeBien: string;
  prixAchat: number;
  fraisAcquisition: number;
  valorisationActuelle: number;
  revenusLocatifsMensuels: number;
  chargesMensuelles: number;
  pretAssocie?: string;
  notes: string;
}

export interface CompteEpargne {
  id: string;
  nomCompte: string;
  type: string;
  banque: string;
  soldeActuel: number;
  derniereMiseAJour: string;
  notes: string;
}

export interface Credit {
  id: string;
  nomPret: string;
  type: string;
  montantInitial: number;
  capitalRestantDu: number;
  taux: number;
  dureeRestante: number;
  mensualite: number;
  bienAssocie?: string;
  dateSouscription: string;
  notes: string;
}

export interface HistoriqueMensuel {
  id: string;
  moisAnnee: string;
  valeurTotaleActifs: number;
  totalPassif: number;
  revenuPassifMois: number;
  variationPatrimoine: number;
  notes: string;
}

// Nouveaux types pour la Phase 1
export interface ObjectifFinancier {
  id: string;
  titre: string;
  description: string;
  type: 'epargne' | 'investissement' | 'remboursement' | 'patrimoine' | 'revenu';
  montantCible: number;
  montantActuel: number;
  dateLimite: string;
  dateCreation: string;
  statut: 'en_cours' | 'atteint' | 'en_retard' | 'abandonne';
  priorite: 'basse' | 'moyenne' | 'haute' | 'critique';
  couleur: string;
  icone: string;
  notes: string;
  progression: number; // 0-100
}

export interface Notification {
  id: string;
  titre: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'objectif' | 'alerte';
  dateCreation: string;
  dateLecture?: string;
  lue: boolean;
  action?: {
    type: 'lien' | 'modal' | 'page';
    destination: string;
    label: string;
  };
}

export interface CalculFiscal {
  id: string;
  annee: number;
  ifi: {
    valeurImposable: number;
    montantImpot: number;
    seuil: number;
    exonere: boolean;
  };
  plusValues: {
    immobiliere: number;
    mobiliere: number;
    totale: number;
    imposition: number;
  };
  revenus: {
    fonciers: number;
    mobiliers: number;
    autres: number;
    total: number;
  };
  deductions: {
    charges: number;
    abattements: number;
    total: number;
  };
  impotTotal: number;
  dateCalcul: string;
}

export interface PatrimoineData {
  placements: Placement[];
  immobilier: Immobilier[];
  comptes: CompteEpargne[];
  credits: Credit[];
  historique: HistoriqueMensuel[];
  objectifs: ObjectifFinancier[];
  notifications: Notification[];
  calculsFiscaux: CalculFiscal[];
}