import { PatrimoineData, CalculFiscal } from '../types';

// Seuils IFI 2024
const SEUIL_IFI = 1300000; // 1.3M€
const TAUX_IFI = 0.5; // 0.5% à 1.7% selon la valeur

// Seuils plus-values 2024
const SEUIL_PLUS_VALUE_IMMOBILIERE = 15000; // 15k€ par an
const SEUIL_PLUS_VALUE_MOBILIERE = 5000; // 5k€ par an

export const calculateIFI = (data: PatrimoineData): CalculFiscal['ifi'] => {
  // Calcul de la valeur imposable (immobilier + placements)
  const valeurImmobilier = data.immobilier.reduce((sum, bien) => {
    return sum + bien.valorisationActuelle;
  }, 0);

  const valeurPlacements = data.placements.reduce((sum, placement) => {
    return sum + placement.valorisationActuelle;
  }, 0);

  const valeurImposable = valeurImmobilier + valeurPlacements;
  const exonere = valeurImposable < SEUIL_IFI;

  if (exonere) {
    return {
      valeurImposable,
      montantImpot: 0,
      seuil: SEUIL_IFI,
      exonere: true
    };
  }

  // Calcul de l'impôt (simplifié)
  const baseImposable = valeurImposable - SEUIL_IFI;
  const montantImpot = baseImposable * TAUX_IFI;

  return {
    valeurImposable,
    montantImpot,
    seuil: SEUIL_IFI,
    exonere: false
  };
};

export const calculatePlusValues = (data: PatrimoineData): CalculFiscal['plusValues'] => {
  // Plus-values immobilières
  const plusValueImmobiliere = data.immobilier.reduce((sum, bien) => {
    const plusValue = bien.valorisationActuelle - bien.prixAchat - bien.fraisAcquisition;
    return sum + Math.max(0, plusValue);
  }, 0);

  // Plus-values mobilières
  const plusValueMobiliere = data.placements.reduce((sum, placement) => {
    const plusValue = placement.valorisationActuelle - placement.montantInvesti + placement.revenusGeneres;
    return sum + Math.max(0, plusValue);
  }, 0);

  const totale = plusValueImmobiliere + plusValueMobiliere;

  // Calcul de l'imposition (simplifié)
  let imposition = 0;
  if (plusValueImmobiliere > SEUIL_PLUS_VALUE_IMMOBILIERE) {
    imposition += (plusValueImmobiliere - SEUIL_PLUS_VALUE_IMMOBILIERE) * 0.19; // 19% + prélèvements sociaux
  }
  if (plusValueMobiliere > SEUIL_PLUS_VALUE_MOBILIERE) {
    imposition += (plusValueMobiliere - SEUIL_PLUS_VALUE_MOBILIERE) * 0.30; // 30% flat tax
  }

  return {
    immobiliere: plusValueImmobiliere,
    mobiliere: plusValueMobiliere,
    totale,
    imposition
  };
};

export const calculateRevenus = (data: PatrimoineData): CalculFiscal['revenus'] => {
  // Revenus fonciers
  const revenusFonciers = data.immobilier.reduce((sum, bien) => {
    return sum + (bien.revenusLocatifsMensuels * 12);
  }, 0);

  // Revenus mobiliers
  const revenusMobiliers = data.placements.reduce((sum, placement) => {
    return sum + placement.revenusGeneres;
  }, 0);

  // Autres revenus (comptes épargne)
  const autresRevenus = data.comptes.reduce((sum, compte) => {
    // Estimation des intérêts (simplifié)
    return sum + (compte.soldeActuel * 0.02); // 2% par an
  }, 0);

  return {
    fonciers: revenusFonciers,
    mobiliers: revenusMobiliers,
    autres: autresRevenus,
    total: revenusFonciers + revenusMobiliers + autresRevenus
  };
};

export const calculateDeductions = (data: PatrimoineData): CalculFiscal['deductions'] => {
  // Charges déductibles
  const charges = data.immobilier.reduce((sum, bien) => {
    return sum + (bien.chargesMensuelles * 12);
  }, 0);

  // Abattements (simplifié)
  const abattements = 0; // À calculer selon la situation

  return {
    charges,
    abattements,
    total: charges + abattements
  };
};

export const calculateFiscalYear = (data: PatrimoineData, annee: number = new Date().getFullYear()): CalculFiscal => {
  const ifi = calculateIFI(data);
  const plusValues = calculatePlusValues(data);
  const revenus = calculateRevenus(data);
  const deductions = calculateDeductions(data);

  // Calcul de l'impôt total (simplifié)
  const baseImposable = revenus.total - deductions.total;
  const impotRevenus = Math.max(0, baseImposable * 0.14); // Taux simplifié
  const impotTotal = impotRevenus + plusValues.imposition + ifi.montantImpot;

  return {
    id: `fiscal-${annee}`,
    annee,
    ifi,
    plusValues,
    revenus,
    deductions,
    impotTotal,
    dateCalcul: new Date().toISOString()
  };
};

// Utilitaires pour les optimisations fiscales
export const getFiscalOptimizations = (calcul: CalculFiscal): string[] => {
  const optimizations: string[] = [];

  if (calcul.ifi.montantImpot > 0) {
    optimizations.push("Considérez une donation pour réduire l'IFI");
  }

  if (calcul.plusValues.imposition > 0) {
    optimizations.push("Étalez vos plus-values sur plusieurs années");
  }

  if (calcul.revenus.total > 50000) {
    optimizations.push("Optimisez votre fiscalité avec un PEA ou une AV");
  }

  return optimizations;
}; 