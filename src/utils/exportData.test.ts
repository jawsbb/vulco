import { describe, it, expect } from 'vitest';
import { toCsvRow, generateSummaryReport } from './exportData';
import { parseCSV } from './csvImport';
import { emptyData } from './testData';
import { HistoriqueMensuel } from '../types';

describe('toCsvRow', () => {
  it('laisse les cellules simples sans guillemets', () => {
    expect(toCsvRow(['Livret A', 1500.5])).toBe('Livret A,1500.5');
  });

  it('protège une cellule contenant le séparateur', () => {
    expect(toCsvRow(['Fonds, euro', 'AV'])).toBe('"Fonds, euro",AV');
  });

  it('protège une cellule contenant un point-virgule', () => {
    expect(toCsvRow(['a;b'])).toBe('"a;b"');
  });

  it('double les guillemets internes', () => {
    expect(toCsvRow(['note "importante"'])).toBe('"note ""importante"""');
  });

  it('protège une cellule contenant un retour à la ligne', () => {
    expect(toCsvRow(['ligne1\nligne2'])).toBe('"ligne1\nligne2"');
  });

  it('rend une cellule vide sans guillemets', () => {
    expect(toCsvRow(['', 0])).toBe(',0');
  });
});

describe('round-trip export puis import', () => {
  it('restitue une note contenant guillemets et virgule', () => {
    const notes = 'compte joint, dit "le bleu"';
    const line = toCsvRow(['Livret A', 'BNP', 1500.5, notes]);
    expect(parseCSV(line)).toEqual([['Livret A', 'BNP', '1500.5', notes]]);
  });
});

describe('generateSummaryReport', () => {
  const historique = (moisAnnee: string, variationPatrimoine: number): HistoriqueMensuel => ({
    id: moisAnnee,
    moisAnnee,
    valeurTotaleActifs: 0,
    totalPassif: 0,
    revenuPassifMois: 0,
    variationPatrimoine,
    notes: ''
  });

  it('ne réordonne pas data.historique', () => {
    const data = { ...emptyData(), historique: [historique('2024-01-01', 10), historique('2024-03-01', 30)] };
    generateSummaryReport(data);
    expect(data.historique.map(h => h.moisAnnee)).toEqual(['2024-01-01', '2024-03-01']);
  });

  it('rapporte la variation du mois le plus récent', () => {
    const data = { ...emptyData(), historique: [historique('2024-01-01', 10), historique('2024-03-01', 30)] };
    expect(generateSummaryReport(data)).toContain('Dernière variation');
    expect(generateSummaryReport(data)).toMatch(/Dernière variation.*30/);
  });
});
