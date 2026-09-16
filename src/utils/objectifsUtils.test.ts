import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateObjectifProgression, getObjectifStatut } from './objectifsUtils';
import { emptyData } from './testData';
import { ObjectifFinancier, PatrimoineData } from '../types';

const objectif = (overrides: Partial<ObjectifFinancier> = {}): ObjectifFinancier => ({
  id: 'o',
  titre: 'Objectif',
  description: '',
  type: 'epargne',
  montantCible: 1000,
  montantActuel: 0,
  dateLimite: '2026-12-31',
  dateCreation: '2026-01-01',
  statut: 'en_cours',
  priorite: 'moyenne',
  couleur: '#000',
  icone: 'PiggyBank',
  notes: '',
  progression: 0,
  ...overrides
});

const dataWith = (overrides: Partial<PatrimoineData>): PatrimoineData => ({ ...emptyData(), ...overrides });

describe('calculateObjectifProgression', () => {
  it('epargne : basé sur le solde des comptes', () => {
    const data = dataWith({
      comptes: [
        { id: 'c1', nomCompte: 'A', type: 'Livret', banque: 'b', soldeActuel: 300, derniereMiseAJour: '2026-01-01', notes: '' },
        { id: 'c2', nomCompte: 'B', type: 'Livret', banque: 'b', soldeActuel: 200, derniereMiseAJour: '2026-01-01', notes: '' }
      ]
    });
    expect(calculateObjectifProgression(objectif({ type: 'epargne', montantCible: 1000 }), data)).toBe(50);
  });

  it('investissement : basé sur la valorisation des placements', () => {
    const data = dataWith({
      placements: [{ id: 'p', nom: 'p', type: 'ETF', dateAchat: '2025-01-01', montantInvesti: 100, valorisationActuelle: 250, revenusGeneres: 0, notes: '' }]
    });
    expect(calculateObjectifProgression(objectif({ type: 'investissement', montantCible: 1000 }), data)).toBe(25);
  });

  it('remboursement : basé sur le capital déjà remboursé', () => {
    const data = dataWith({
      credits: [{ id: 'cr', nomPret: 'cr', type: 'Immo', montantInitial: 100000, capitalRestantDu: 70000, taux: 1, dureeRestante: 120, mensualite: 500, dateSouscription: '2020-01-01', notes: '' }]
    });
    expect(calculateObjectifProgression(objectif({ type: 'remboursement', montantCible: 60000 }), data)).toBe(50);
  });

  it('patrimoine : basé sur le patrimoine net', () => {
    const data = dataWith({
      comptes: [{ id: 'c', nomCompte: 'A', type: 'Livret', banque: 'b', soldeActuel: 5000, derniereMiseAJour: '2026-01-01', notes: '' }],
      credits: [{ id: 'cr', nomPret: 'cr', type: 'Conso', montantInitial: 3000, capitalRestantDu: 3000, taux: 1, dureeRestante: 12, mensualite: 100, dateSouscription: '2025-01-01', notes: '' }]
    });
    expect(calculateObjectifProgression(objectif({ type: 'patrimoine', montantCible: 4000 }), data)).toBe(50);
  });

  it('revenu : revenus des placements + loyers annualisés', () => {
    const data = dataWith({
      placements: [{ id: 'p', nom: 'p', type: 'AV', dateAchat: '2025-01-01', montantInvesti: 0, valorisationActuelle: 0, revenusGeneres: 400, notes: '' }],
      immobilier: [{ id: 'i', nomAdresse: 'i', typeBien: 'Studio', prixAchat: 0, fraisAcquisition: 0, valorisationActuelle: 0, revenusLocatifsMensuels: 100, chargesMensuelles: 0, notes: '' }]
    });
    expect(calculateObjectifProgression(objectif({ type: 'revenu', montantCible: 3200 }), data)).toBe(50);
  });

  it('plafonne la progression à 100', () => {
    const data = dataWith({
      comptes: [{ id: 'c', nomCompte: 'A', type: 'Livret', banque: 'b', soldeActuel: 5000, derniereMiseAJour: '2026-01-01', notes: '' }]
    });
    expect(calculateObjectifProgression(objectif({ montantCible: 1000 }), data)).toBe(100);
  });

  it('plancher à 0 quand le montant actuel est négatif', () => {
    const data = dataWith({
      credits: [{ id: 'cr', nomPret: 'cr', type: 'Conso', montantInitial: 0, capitalRestantDu: 5000, taux: 1, dureeRestante: 12, mensualite: 100, dateSouscription: '2025-01-01', notes: '' }]
    });
    expect(calculateObjectifProgression(objectif({ type: 'patrimoine', montantCible: 1000 }), data)).toBe(0);
  });

  it('renvoie 0 sur un objectif à montant cible nul', () => {
    expect(calculateObjectifProgression(objectif({ montantCible: 0 }), emptyData())).toBe(0);
  });

  it('renvoie 0 sur un montant cible nul même avec un montant actuel positif', () => {
    const data = dataWith({
      comptes: [{ id: 'c', nomCompte: 'A', type: 'Livret', banque: 'b', soldeActuel: 5000, derniereMiseAJour: '2026-01-01', notes: '' }]
    });
    expect(calculateObjectifProgression(objectif({ montantCible: 0 }), data)).toBe(0);
  });

  it('renvoie 0 sur un montant cible négatif', () => {
    expect(calculateObjectifProgression(objectif({ montantCible: -100 }), emptyData())).toBe(0);
  });
});

describe('getObjectifStatut', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('atteint dès 100% de progression', () => {
    expect(getObjectifStatut(objectif({ dateLimite: '2026-12-31' }), 100)).toBe('atteint');
  });

  it('atteint même si la date limite est dépassée', () => {
    expect(getObjectifStatut(objectif({ dateLimite: '2025-01-01' }), 100)).toBe('atteint');
  });

  it('en_retard quand la date limite est dépassée', () => {
    expect(getObjectifStatut(objectif({ dateLimite: '2026-05-01' }), 80)).toBe('en_retard');
  });

  it('en_retard à moins de 30 jours avec une progression sous 50%', () => {
    expect(getObjectifStatut(objectif({ dateLimite: '2026-06-10' }), 40)).toBe('en_retard');
  });

  it('en_cours à moins de 30 jours avec une progression au-dessus de 50%', () => {
    expect(getObjectifStatut(objectif({ dateLimite: '2026-06-10' }), 60)).toBe('en_cours');
  });

  it('en_cours quand la date limite est lointaine', () => {
    expect(getObjectifStatut(objectif({ dateLimite: '2027-01-01' }), 10)).toBe('en_cours');
  });
});
