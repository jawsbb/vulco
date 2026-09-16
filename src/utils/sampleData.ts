import { PatrimoineData } from '../types';

export const generateSampleData = (): PatrimoineData => {

  return {
    placements: [
      {
        id: '1',
        nom: 'Actions Apple',
        type: 'Actions',
        dateAchat: '2023-01-15',
        montantInvesti: 5000,
        valorisationActuelle: 6500,
        revenusGeneres: 150,
        notes: 'Actions technologiques'
      },
      {
        id: '2',
        nom: 'SCPI Pierre',
        type: 'SCPI',
        dateAchat: '2022-06-20',
        montantInvesti: 10000,
        valorisationActuelle: 10500,
        revenusGeneres: 600,
        notes: 'Immobilier papier'
      },
      {
        id: '3',
        nom: 'PEA ETF World',
        type: 'PEA',
        dateAchat: '2021-03-10',
        montantInvesti: 15000,
        valorisationActuelle: 16500,
        revenusGeneres: 450,
        notes: 'Diversification mondiale'
      }
    ],
    immobilier: [
      {
        id: '1',
        nomAdresse: 'Appartement Paris 16e',
        typeBien: 'Appartement',
        prixAchat: 450000,
        fraisAcquisition: 25000,
        valorisationActuelle: 520000,
        revenusLocatifsMensuels: 2500,
        chargesMensuelles: 800,
        notes: 'Résidence principale'
      },
      {
        id: '2',
        nomAdresse: 'Studio Lyon Centre',
        typeBien: 'Studio',
        prixAchat: 180000,
        fraisAcquisition: 12000,
        valorisationActuelle: 195000,
        revenusLocatifsMensuels: 1200,
        chargesMensuelles: 300,
        pretAssocie: '1',
        notes: 'Investissement locatif'
      }
    ],
    comptes: [
      {
        id: '1',
        nomCompte: 'Compte Courant Principal',
        type: 'Courant',
        banque: 'BNP Paribas',
        soldeActuel: 8500,
        derniereMiseAJour: '2024-01-15',
        notes: 'Compte principal'
      },
      {
        id: '2',
        nomCompte: 'Livret A',
        type: 'Épargne',
        banque: 'La Banque Postale',
        soldeActuel: 22950,
        derniereMiseAJour: '2024-01-15',
        notes: 'Épargne de précaution'
      },
      {
        id: '3',
        nomCompte: 'LDDS',
        type: 'Épargne',
        banque: 'BNP Paribas',
        soldeActuel: 12000,
        derniereMiseAJour: '2024-01-15',
        notes: 'Épargne à court terme'
      }
    ],
    credits: [
      {
        id: '1',
        nomPret: 'Prêt immobilier Lyon',
        type: 'Immobilier',
        montantInitial: 150000,
        capitalRestantDu: 120000,
        taux: 1.2,
        dureeRestante: 18,
        mensualite: 850,
        bienAssocie: '2',
        dateSouscription: '2022-06-15',
        notes: 'Prêt pour l\'achat du studio'
      }
    ],
    historique: [
      {
        id: '1',
        moisAnnee: '2024-01',
        valeurTotaleActifs: 750000,
        totalPassif: 120000,
        revenuPassifMois: 4300,
        variationPatrimoine: 2500,
        notes: 'Bonne performance en janvier'
      },
      {
        id: '2',
        moisAnnee: '2023-12',
        valeurTotaleActifs: 747500,
        totalPassif: 120850,
        revenuPassifMois: 4200,
        variationPatrimoine: 1800,
        notes: 'Fin d\'année stable'
      },
      {
        id: '3',
        moisAnnee: '2023-11',
        valeurTotaleActifs: 745700,
        totalPassif: 121000,
        revenuPassifMois: 4100,
        variationPatrimoine: 1200,
        notes: 'Progression continue'
      },
      {
        id: '4',
        moisAnnee: '2023-10',
        valeurTotaleActifs: 744500,
        totalPassif: 121200,
        revenuPassifMois: 4000,
        variationPatrimoine: 800,
        notes: 'Octobre calme'
      }
    ],
    objectifs: [
      {
        id: '1',
        titre: 'Épargne de précaution',
        description: 'Constituer une épargne de sécurité de 6 mois de revenus',
        type: 'epargne',
        montantCible: 50000,
        montantActuel: 43450,
        dateLimite: '2024-12-31',
        dateCreation: '2023-01-01',
        statut: 'en_cours',
        priorite: 'haute',
        couleur: '#10B981',
        icone: 'PiggyBank',
        notes: 'Objectif prioritaire pour la sécurité financière',
        progression: 86.9
      },
      {
        id: '2',
        titre: 'Patrimoine 1M€',
        description: 'Atteindre un patrimoine net de 1 million d\'euros',
        type: 'patrimoine',
        montantCible: 1000000,
        montantActuel: 630000,
        dateLimite: '2030-12-31',
        dateCreation: '2023-01-01',
        statut: 'en_cours',
        priorite: 'moyenne',
        couleur: '#8B5CF6',
        icone: 'Home',
        notes: 'Objectif long terme',
        progression: 63.0
      },
      {
        id: '3',
        titre: 'Remboursement crédit',
        description: 'Rembourser 50% du crédit immobilier',
        type: 'remboursement',
        montantCible: 75000,
        montantActuel: 30000,
        dateLimite: '2025-12-31',
        dateCreation: '2023-06-01',
        statut: 'en_cours',
        priorite: 'haute',
        couleur: '#F59E0B',
        icone: 'CreditCard',
        notes: 'Réduire l\'endettement',
        progression: 40.0
      }
    ],
    notifications: [
      {
        id: '1',
        titre: '🎉 Objectif atteint !',
        message: 'Félicitations ! Vous avez atteint votre objectif "Épargne de précaution"',
        type: 'success',
        dateCreation: '2024-01-15T10:30:00Z',
        lue: false,
        action: {
          type: 'page',
          destination: 'objectifs',
          label: 'Voir les objectifs'
        }
      },
      {
        id: '2',
        titre: '⚠️ Alerte objectif',
        message: 'Remboursement crédit : Échéance dans 30 jours',
        type: 'warning',
        dateCreation: '2024-01-14T14:20:00Z',
        lue: false,
        action: {
          type: 'page',
          destination: 'objectifs',
          label: 'Voir l\'objectif'
        }
      },
      {
        id: '3',
        titre: '💰 Impôt IFI',
        message: 'Vous êtes assujetti à l\'IFI pour 2 500€',
        type: 'info',
        dateCreation: '2024-01-13T09:15:00Z',
        lue: true,
        action: {
          type: 'page',
          destination: 'fiscal',
          label: 'Voir les calculs fiscaux'
        }
      },
      {
        id: '4',
        titre: '📈 Excellente performance',
        message: 'Félicitations ! Vos placements ont une performance de 25.3%',
        type: 'success',
        dateCreation: '2024-01-12T16:45:00Z',
        lue: true,
        action: {
          type: 'page',
          destination: 'placements',
          label: 'Voir les placements'
        }
      }
    ],
    calculsFiscaux: [
      {
        id: 'fiscal-2024',
        annee: 2024,
        ifi: {
          valeurImposable: 1400000,
          montantImpot: 2500,
          seuil: 1300000,
          exonere: false
        },
        plusValues: {
          immobiliere: 85000,
          mobiliere: 12000,
          totale: 97000,
          imposition: 8500
        },
        revenus: {
          fonciers: 44400,
          mobiliers: 1200,
          autres: 800,
          total: 46400
        },
        deductions: {
          charges: 13200,
          abattements: 0,
          total: 13200
        },
        impotTotal: 18500,
        dateCalcul: '2024-01-15T10:00:00Z'
      },
      {
        id: 'fiscal-2023',
        annee: 2023,
        ifi: {
          valeurImposable: 1350000,
          montantImpot: 2000,
          seuil: 1300000,
          exonere: false
        },
        plusValues: {
          immobiliere: 75000,
          mobiliere: 8000,
          totale: 83000,
          imposition: 7000
        },
        revenus: {
          fonciers: 42000,
          mobiliers: 1000,
          autres: 600,
          total: 43600
        },
        deductions: {
          charges: 12000,
          abattements: 0,
          total: 12000
        },
        impotTotal: 15000,
        dateCalcul: '2023-12-31T23:59:59Z'
      }
    ]
  };
}; 