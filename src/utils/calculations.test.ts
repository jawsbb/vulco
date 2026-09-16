import { describe, it, expect } from 'vitest';
import {
  calculateTotalActifs,
  calculateTotalPassif,
  calculatePatrimoineNet,
  getRepartitionActifs,
  calculatePlusValuePercentage,
  formatCurrency
} from './calculations';
import { emptyData } from './testData';
import { Placement, Immobilier, CompteEpargne, Credit } from '../types';

const placement = (valorisationActuelle: number): Placement => ({
  id: 'p', nom: 'p', type: 'ETF', dateAchat: '2024-01-01',
  montantInvesti: 0, valorisationActuelle, revenusGeneres: 0, notes: ''
});

const immobilier = (valorisationActuelle: number): Immobilier => ({
  id: 'i', nomAdresse: 'i', typeBien: 'Appartement', prixAchat: 0, fraisAcquisition: 0,
  valorisationActuelle, revenusLocatifsMensuels: 0, chargesMensuelles: 0, notes: ''
});

const compte = (soldeActuel: number): CompteEpargne => ({
  id: 'c', nomCompte: 'c', type: 'Livret', banque: 'b',
  soldeActuel, derniereMiseAJour: '2024-01-01', notes: ''
});

const credit = (capitalRestantDu: number): Credit => ({
  id: 'cr', nomPret: 'cr', type: 'Immo', montantInitial: 0, capitalRestantDu,
  taux: 1, dureeRestante: 12, mensualite: 100, dateSouscription: '2020-01-01', notes: ''
});

/** Espaces insécables (fines ou non) ramenés à un espace ordinaire. */
const normalize = (s: string) => s.replace(/[\u00A0\u202F]/g, ' ');

describe('calculateTotalActifs', () => {
  it('vaut 0 sur un patrimoine vide', () => {
    expect(calculateTotalActifs(emptyData())).toBe(0);
  });

  it('somme placements, immobilier et comptes', () => {
    const data = { ...emptyData(), placements: [placement(1000)], immobilier: [immobilier(200000)], comptes: [compte(500)] };
    expect(calculateTotalActifs(data)).toBe(201500);
  });
});

describe('calculateTotalPassif', () => {
  it('vaut 0 sans crédit', () => {
    expect(calculateTotalPassif(emptyData())).toBe(0);
  });

  it('somme le capital restant dû des crédits', () => {
    const data = { ...emptyData(), credits: [credit(80000), credit(5000)] };
    expect(calculateTotalPassif(data)).toBe(85000);
  });
});

describe('calculatePatrimoineNet', () => {
  it('soustrait le passif des actifs', () => {
    const data = { ...emptyData(), immobilier: [immobilier(200000)], credits: [credit(150000)] };
    expect(calculatePatrimoineNet(data)).toBe(50000);
  });

  it('peut être négatif', () => {
    const data = { ...emptyData(), comptes: [compte(1000)], credits: [credit(4000)] };
    expect(calculatePatrimoineNet(data)).toBe(-3000);
  });
});

describe('getRepartitionActifs', () => {
  it('retourne [] quand le total est nul', () => {
    expect(getRepartitionActifs(emptyData())).toEqual([]);
  });

  it('calcule les pourcentages des trois catégories', () => {
    const data = { ...emptyData(), placements: [placement(250)], immobilier: [immobilier(500)], comptes: [compte(250)] };
    expect(getRepartitionActifs(data)).toEqual([
      { name: 'Placements', value: 250, percentage: 25 },
      { name: 'Immobilier', value: 500, percentage: 50 },
      { name: 'Comptes & Épargne', value: 250, percentage: 25 }
    ]);
  });

  it('filtre les catégories de valeur nulle', () => {
    const data = { ...emptyData(), comptes: [compte(800)] };
    expect(getRepartitionActifs(data)).toEqual([
      { name: 'Comptes & Épargne', value: 800, percentage: 100 }
    ]);
  });
});

describe('calculatePlusValuePercentage', () => {
  it('retourne 0 quand le montant investi est nul', () => {
    expect(calculatePlusValuePercentage(500, 0)).toBe(0);
  });

  it('calcule une plus-value en pourcentage', () => {
    expect(calculatePlusValuePercentage(1250, 1000)).toBe(25);
  });

  it('calcule une moins-value en pourcentage', () => {
    expect(calculatePlusValuePercentage(800, 1000)).toBe(-20);
  });
});

describe('formatCurrency', () => {
  it('formate en euros au format fr-FR', () => {
    expect(normalize(formatCurrency(1234.5))).toBe('1 234,50 €');
  });

  it('formate zéro', () => {
    expect(normalize(formatCurrency(0))).toBe('0,00 €');
  });

  it('formate un montant négatif', () => {
    expect(normalize(formatCurrency(-42))).toBe('-42,00 €');
  });
});
