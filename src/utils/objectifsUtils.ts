import { ObjectifFinancier, PatrimoineData } from '../types';
import { calculateTotalActifs, calculateTotalPassif, calculatePatrimoineNet } from './calculations';

export const calculateObjectifProgression = (objectif: ObjectifFinancier, data: PatrimoineData): number => {
  let montantActuel = 0;

  switch (objectif.type) {
    case 'epargne':
      // Calcul basé sur les comptes épargne
      montantActuel = data.comptes.reduce((sum, compte) => sum + compte.soldeActuel, 0);
      break;

    case 'investissement':
      // Calcul basé sur les placements
      montantActuel = data.placements.reduce((sum, placement) => sum + placement.valorisationActuelle, 0);
      break;

    case 'remboursement': {
      // Calcul basé sur la réduction des crédits
      const totalInitial = data.credits.reduce((sum, credit) => sum + credit.montantInitial, 0);
      const totalRestant = data.credits.reduce((sum, credit) => sum + credit.capitalRestantDu, 0);
      const rembourse = totalInitial - totalRestant;
      montantActuel = rembourse;
      break;
    }

    case 'patrimoine':
      // Calcul basé sur le patrimoine net total
      montantActuel = calculatePatrimoineNet(data);
      break;

    case 'revenu': {
      // Calcul basé sur les revenus passifs
      const revenusPlacements = data.placements.reduce((sum, p) => sum + p.revenusGeneres, 0);
      const revenusImmobilier = data.immobilier.reduce((sum, i) => sum + (i.revenusLocatifsMensuels * 12), 0);
      montantActuel = revenusPlacements + revenusImmobilier;
      break;
    }
  }

  if (objectif.montantCible <= 0) {
    return 0;
  }

  const progression = Math.min(100, (montantActuel / objectif.montantCible) * 100);
  return Math.max(0, progression);
};

export const getObjectifStatut = (objectif: ObjectifFinancier, progression: number): ObjectifFinancier['statut'] => {
  const dateLimite = new Date(objectif.dateLimite);
  const aujourdhui = new Date();
  const joursRestants = Math.ceil((dateLimite.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24));

  if (progression >= 100) {
    return 'atteint';
  } else if (joursRestants < 0) {
    return 'en_retard';
  } else if (joursRestants < 30 && progression < 50) {
    return 'en_retard';
  } else {
    return 'en_cours';
  }
};

export const getObjectifCouleur = (type: ObjectifFinancier['type']): string => {
  const couleurs = {
    epargne: '#10B981', // green
    investissement: '#3B82F6', // blue
    remboursement: '#F59E0B', // amber
    patrimoine: '#8B5CF6', // purple
    revenu: '#EF4444' // red
  };
  return couleurs[type];
};

export const getObjectifIcone = (type: ObjectifFinancier['type']): string => {
  const icones = {
    epargne: 'PiggyBank',
    investissement: 'TrendingUp',
    remboursement: 'CreditCard',
    patrimoine: 'Home',
    revenu: 'DollarSign'
  };
  return icones[type];
};

export const generateObjectifSuggestions = (data: PatrimoineData): Partial<ObjectifFinancier>[] => {
  const suggestions: Partial<ObjectifFinancier>[] = [];
  const patrimoineNet = calculatePatrimoineNet(data);
  const totalActifs = calculateTotalActifs(data);
  const totalPassif = calculateTotalPassif(data);

  // Suggestion d'épargne d'urgence
  if (data.comptes.reduce((sum, c) => sum + c.soldeActuel, 0) < 10000) {
    suggestions.push({
      titre: 'Épargne de précaution',
      description: 'Constituer une épargne de sécurité de 3 mois de revenus',
      type: 'epargne',
      montantCible: 15000,
      priorite: 'haute',
      couleur: getObjectifCouleur('epargne'),
      icone: getObjectifIcone('epargne')
    });
  }

  // Suggestion de diversification
  if (data.placements.length < 3) {
    suggestions.push({
      titre: 'Diversification des placements',
      description: 'Répartir les investissements sur différents types d\'actifs',
      type: 'investissement',
      montantCible: totalActifs * 0.3,
      priorite: 'moyenne',
      couleur: getObjectifCouleur('investissement'),
      icone: getObjectifIcone('investissement')
    });
  }

  // Suggestion de réduction d'endettement
  if (totalPassif > patrimoineNet * 0.5) {
    suggestions.push({
      titre: 'Réduction de l\'endettement',
      description: 'Réduire le ratio d\'endettement à moins de 50%',
      type: 'remboursement',
      montantCible: totalPassif * 0.2,
      priorite: 'haute',
      couleur: getObjectifCouleur('remboursement'),
      icone: getObjectifIcone('remboursement')
    });
  }

  // Suggestion de patrimoine
  if (patrimoineNet < 100000) {
    suggestions.push({
      titre: 'Patrimoine de 100k€',
      description: 'Atteindre un patrimoine net de 100 000€',
      type: 'patrimoine',
      montantCible: 100000,
      priorite: 'moyenne',
      couleur: getObjectifCouleur('patrimoine'),
      icone: getObjectifIcone('patrimoine')
    });
  }

  return suggestions;
};

export const getObjectifAlertes = (objectif: ObjectifFinancier): string[] => {
  const alertes: string[] = [];
  const dateLimite = new Date(objectif.dateLimite);
  const aujourdhui = new Date();
  const joursRestants = Math.ceil((dateLimite.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24));

  if (joursRestants < 30) {
    alertes.push(`⚠️ Échéance dans ${joursRestants} jours`);
  }

  if (objectif.progression < 25 && joursRestants < 90) {
    alertes.push('🚨 Progression faible, action requise');
  }

  if (objectif.priorite === 'critique' && objectif.progression < 50) {
    alertes.push('🔥 Objectif critique en retard');
  }

  return alertes;
}; 