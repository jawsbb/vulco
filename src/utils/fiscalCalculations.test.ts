import { describe, it, expect } from 'vitest';
import { calculateIFI, calculatePlusValues } from './fiscalCalculations';
import { emptyData } from './testData';
import { Immobilier, Placement } from '../types';

const bien = (overrides: Partial<Immobilier> = {}): Immobilier => ({
  id: 'i', nomAdresse: 'i', typeBien: 'Appartement', prixAchat: 0, fraisAcquisition: 0,
  valorisationActuelle: 0, revenusLocatifsMensuels: 0, chargesMensuelles: 0, notes: '', ...overrides
});

const placement = (overrides: Partial<Placement> = {}): Placement => ({
  id: 'p', nom: 'p', type: 'ETF', dateAchat: '2024-01-01',
  montantInvesti: 0, valorisationActuelle: 0, revenusGeneres: 0, notes: '', ...overrides
});

describe('calculateIFI', () => {
  it('exonère un patrimoine vide', () => {
    expect(calculateIFI(emptyData())).toEqual({
      valeurImposable: 0, montantImpot: 0, seuil: 1300000, exonere: true
    });
  });

  it('exonère sous le seuil de 1 300 000 €', () => {
    const data = { ...emptyData(), immobilier: [bien({ valorisationActuelle: 1299999 })] };
    expect(calculateIFI(data)).toMatchObject({ valeurImposable: 1299999, montantImpot: 0, exonere: true });
  });

  it('applique le taux sur la fraction au-dessus du seuil', () => {
    const data = { ...emptyData(), immobilier: [bien({ valorisationActuelle: 2000000 })] };
    expect(calculateIFI(data)).toEqual({
      valeurImposable: 2000000,
      montantImpot: (2000000 - 1300000) * 0.005,
      seuil: 1300000,
      exonere: false
    });
  });

  it('exonère exactement au seuil de 1 300 000 €', () => {
    const data = { ...emptyData(), immobilier: [bien({ valorisationActuelle: 1300000 })] };
    expect(calculateIFI(data)).toMatchObject({ montantImpot: 0, exonere: true });
  });

  it('exclut les placements financiers de la base imposable', () => {
    const data = { ...emptyData(), placements: [placement({ valorisationActuelle: 1400000 })] };
    expect(calculateIFI(data)).toMatchObject({ valeurImposable: 0, montantImpot: 0, exonere: true });
  });

  it('n\'impose que l\'immobilier quand des placements coexistent', () => {
    const data = {
      ...emptyData(),
      immobilier: [bien({ valorisationActuelle: 1400000 })],
      placements: [placement({ valorisationActuelle: 900000 })]
    };
    expect(calculateIFI(data)).toMatchObject({ valeurImposable: 1400000, exonere: false });
  });

  it('applique 0,5 % et non 50 % à la base', () => {
    const data = { ...emptyData(), immobilier: [bien({ valorisationActuelle: 1400000 })] };
    expect(calculateIFI(data).montantImpot).toBe(500);
  });
});

describe('calculatePlusValues', () => {
  it('retourne des plus-values nulles sur un patrimoine vide', () => {
    expect(calculatePlusValues(emptyData())).toEqual({
      immobiliere: 0, mobiliere: 0, totale: 0, imposition: 0
    });
  });

  it('déduit prix d\'achat et frais d\'acquisition de la plus-value immobilière', () => {
    const data = { ...emptyData(), immobilier: [bien({ valorisationActuelle: 300000, prixAchat: 250000, fraisAcquisition: 20000 })] };
    expect(calculatePlusValues(data)).toMatchObject({ immobiliere: 30000, totale: 30000 });
  });

  it('ignore les moins-values (plancher à 0 par ligne)', () => {
    const data = {
      ...emptyData(),
      immobilier: [bien({ valorisationActuelle: 100000, prixAchat: 150000 })],
      placements: [placement({ valorisationActuelle: 500, montantInvesti: 2000 })]
    };
    expect(calculatePlusValues(data)).toEqual({ immobiliere: 0, mobiliere: 0, totale: 0, imposition: 0 });
  });

  it('n\'impose pas une plus-value immobilière sous le seuil de 15 000 €', () => {
    const data = { ...emptyData(), immobilier: [bien({ valorisationActuelle: 110000, prixAchat: 100000 })] };
    expect(calculatePlusValues(data)).toMatchObject({ immobiliere: 10000, imposition: 0 });
  });

  it('impose 19 % sur la fraction immobilière au-dessus de 15 000 €', () => {
    const data = { ...emptyData(), immobilier: [bien({ valorisationActuelle: 130000, prixAchat: 100000 })] };
    expect(calculatePlusValues(data).imposition).toBeCloseTo((30000 - 15000) * 0.19, 6);
  });

  it('n\'impose pas une plus-value mobilière à exactement 5 000 €', () => {
    const data = { ...emptyData(), placements: [placement({ valorisationActuelle: 8000, montantInvesti: 3000 })] };
    expect(calculatePlusValues(data)).toMatchObject({ mobiliere: 5000, imposition: 0 });
  });

  it('impose 30 % sur la fraction mobilière au-dessus de 5 000 €', () => {
    const data = { ...emptyData(), placements: [placement({ valorisationActuelle: 10000, montantInvesti: 3000 })] };
    expect(calculatePlusValues(data).imposition).toBeCloseTo((7000 - 5000) * 0.3, 6);
  });

  it('cumule les impositions immobilière et mobilière', () => {
    const data = {
      ...emptyData(),
      immobilier: [bien({ valorisationActuelle: 130000, prixAchat: 100000 })],
      placements: [placement({ valorisationActuelle: 10000, montantInvesti: 3000 })]
    };
    const result = calculatePlusValues(data);
    expect(result.totale).toBe(37000);
    expect(result.imposition).toBeCloseTo(15000 * 0.19 + 2000 * 0.3, 6);
  });

  it('exclut les revenus déjà perçus de la plus-value mobilière latente', () => {
    const data = { ...emptyData(), placements: [placement({ valorisationActuelle: 1000, montantInvesti: 1000, revenusGeneres: 250 })] };
    expect(calculatePlusValues(data).mobiliere).toBe(0);
  });
});
