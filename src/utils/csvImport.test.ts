import { describe, it, expect } from 'vitest';
import { parseCSV, parseNumber, normalizeData, requireHeaders, buildComptesFromCsv, buildPlacementsFromCsv } from './csvImport';
import { emptyData } from './testData';

describe('parseCSV', () => {
  it('gère les fins de ligne CRLF', () => {
    expect(parseCSV('a,b\r\nc,d')).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('gère les fins de ligne CR seules', () => {
    expect(parseCSV('a,b\rc,d')).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('ignore les lignes vides ou blanches', () => {
    expect(parseCSV('a,b\n\n   \nc,d\n')).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('retourne un tableau vide pour un texte vide', () => {
    expect(parseCSV('')).toEqual([]);
  });

  it('retire les guillemets encadrant une cellule', () => {
    expect(parseCSV('"a","b"')).toEqual([['a', 'b']]);
  });

  it('conserve une virgule à l\'intérieur de guillemets', () => {
    expect(parseCSV('a,"b,c",d')).toEqual([['a', 'b,c', 'd']]);
  });

  it('coupe les espaces autour des cellules', () => {
    expect(parseCSV(' a , b ')).toEqual([['a', 'b']]);
  });

  it('conserve les espaces significatifs protégés par des guillemets', () => {
    expect(parseCSV('" a "')).toEqual([[' a ']]);
  });

  it('restitue un guillemet échappé ""', () => {
    expect(parseCSV('"a""b"')).toEqual([['a"b']]);
  });

  it('détecte le point-virgule comme séparateur (Excel FR)', () => {
    expect(parseCSV('a;b\r\nc;d')).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('conserve un point-virgule protégé par des guillemets', () => {
    expect(parseCSV('a;"b;c";d')).toEqual([['a', 'b;c', 'd']]);
  });

  it('ne coupe pas sur une virgule quand le séparateur détecté est le point-virgule', () => {
    expect(parseCSV('nom;montant\nFonds, euro;1 234,56')).toEqual([
      ['nom', 'montant'],
      ['Fonds, euro', '1 234,56']
    ]);
  });

  it('accepte un retour à la ligne à l\'intérieur de guillemets', () => {
    expect(parseCSV('a,"ligne1\nligne2",c')).toEqual([['a', 'ligne1\nligne2', 'c']]);
  });
});

describe('parseNumber', () => {
  it('lit un nombre au format anglais', () => {
    expect(parseNumber('1234.56')).toBe(1234.56);
  });

  it('lit un nombre au format français avec espaces de groupement', () => {
    expect(parseNumber('1 234,56')).toBe(1234.56);
  });

  it('accepte les espaces insécables comme séparateur de milliers', () => {
    expect(parseNumber('1\u00A0234\u202F567,5')).toBe(1234567.5);
  });

  it('retourne 0 pour une valeur vide, absente ou non numérique', () => {
    expect(parseNumber('')).toBe(0);
    expect(parseNumber(undefined)).toBe(0);
    expect(parseNumber('abc')).toBe(0);
  });

  it('accepte un nombre négatif', () => {
    expect(parseNumber('-1 000,5')).toBe(-1000.5);
  });
});

describe('requireHeaders', () => {
  it('lève une erreur sur un CSV vide', () => {
    expect(() => requireHeaders([], ['nom'])).toThrowError('CSV vide');
  });

  it('accepte des en-têtes présents quelle que soit la casse ou les espaces', () => {
    expect(() => requireHeaders([[' Nom ', 'TYPE']], ['nom', 'type'])).not.toThrow();
  });

  it('nomme les en-têtes manquants dans le message d\'erreur', () => {
    expect(() => requireHeaders([['nom']], ['nom', 'type', 'dateAchat']))
      .toThrowError('En-têtes manquants: type, dateAchat');
  });
});

describe('buildComptesFromCsv', () => {
  const header = ['nomCompte', 'banque', 'type', 'soldeActuel', 'derniereMiseAJour', 'notes'];

  it('mappe une ligne complète', () => {
    const rows = [header, ['Livret A', 'BNP', 'Épargne', '1500.5', '2024-01-31', 'perso']];
    expect(buildComptesFromCsv(rows)).toEqual([{
      nomCompte: 'Livret A',
      banque: 'BNP',
      type: 'Épargne',
      soldeActuel: 1500.5,
      derniereMiseAJour: '2024-01-31',
      notes: 'perso'
    }]);
  });

  it('est insensible à la casse des en-têtes', () => {
    const rows = [
      ['NOMCOMPTE', 'BANQUE', 'TYPE', 'SOLDEACTUEL', 'DERNIEREMISEAJOUR'],
      ['PEL', 'CIC', 'Épargne', '200', '2024-02-01']
    ];
    expect(buildComptesFromCsv(rows)[0]).toMatchObject({ nomCompte: 'PEL', soldeActuel: 200, notes: '' });
  });

  it('applique les valeurs par défaut sur les cellules vides', () => {
    const rows = [header, ['', '', '', '', '', '']];
    const compte = buildComptesFromCsv(rows)[0];
    expect(compte).toMatchObject({ nomCompte: 'Compte', banque: '', type: 'Courant', soldeActuel: 0, notes: '' });
    expect(compte.derniereMiseAJour).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('lève une erreur si un en-tête requis manque', () => {
    expect(() => buildComptesFromCsv([['nomCompte', 'banque']]))
      .toThrowError(/En-têtes manquants: type, soldeactuel, dernieremiseajour/);
  });
});

describe('buildPlacementsFromCsv', () => {
  const header = ['nom', 'type', 'dateAchat', 'montantInvesti', 'valorisationActuelle', 'revenusGeneres', 'notes'];

  it('mappe une ligne complète', () => {
    const rows = [header, ['PEA', 'Actions', '2023-05-02', '1000', '1250', '30', 'ok']];
    expect(buildPlacementsFromCsv(rows)).toEqual([{
      nom: 'PEA',
      type: 'Actions',
      dateAchat: '2023-05-02',
      montantInvesti: 1000,
      valorisationActuelle: 1250,
      revenusGeneres: 30,
      notes: 'ok'
    }]);
  });

  it('est insensible à la casse des en-têtes', () => {
    const rows = [
      ['NOM', 'TYPE', 'DATEACHAT', 'MONTANTINVESTI', 'VALORISATIONACTUELLE'],
      ['ETF', 'ETF', '2024-01-01', '500', '520']
    ];
    expect(buildPlacementsFromCsv(rows)[0]).toMatchObject({ nom: 'ETF', montantInvesti: 500, revenusGeneres: 0, notes: '' });
  });

  it('applique les valeurs par défaut sur les cellules vides', () => {
    const rows = [header, ['', '', '', '', '', '', '']];
    const placement = buildPlacementsFromCsv(rows)[0];
    expect(placement).toMatchObject({
      nom: 'Position',
      type: 'Autre',
      montantInvesti: 0,
      valorisationActuelle: 0,
      revenusGeneres: 0,
      notes: ''
    });
    expect(placement.dateAchat).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('accepte un CSV complet parsé de bout en bout', () => {
    const csv = 'nom,type,dateAchat,montantInvesti,valorisationActuelle\r\n"Fonds, euro",AV,2022-03-01,100,110\r\n';
    expect(buildPlacementsFromCsv(parseCSV(csv))[0].nom).toBe('Fonds, euro');
  });
});

describe('nombres au format français dans les imports', () => {
  it('buildComptesFromCsv accepte un solde au format français', () => {
    const rows = [
      ['nomCompte', 'banque', 'type', 'soldeActuel', 'derniereMiseAJour'],
      ['Livret A', 'BNP', 'Épargne', '1 234,56', '2024-01-31']
    ];
    expect(buildComptesFromCsv(rows)[0].soldeActuel).toBe(1234.56);
  });

  it('buildPlacementsFromCsv accepte des montants au format français', () => {
    const rows = [
      ['nom', 'type', 'dateAchat', 'montantInvesti', 'valorisationActuelle', 'revenusGeneres'],
      ['PEA', 'Actions', '2023-05-02', '10 000,50', '12 500,25', '1 000,10']
    ];
    expect(buildPlacementsFromCsv(rows)[0]).toMatchObject({
      montantInvesti: 10000.5,
      valorisationActuelle: 12500.25,
      revenusGeneres: 1000.1
    });
  });

  it('remplace une valeur non numérique par 0', () => {
    const rows = [
      ['nomCompte', 'banque', 'type', 'soldeActuel', 'derniereMiseAJour'],
      ['Livret A', 'BNP', 'Épargne', 'n/a', '2024-01-31']
    ];
    expect(buildComptesFromCsv(rows)[0].soldeActuel).toBe(0);
  });
});

describe('normalizeData', () => {
  it('rejette un élément null ou sans id dans un tableau', () => {
    expect(() => normalizeData({ placements: [null] })).toThrowError(/placements.*élément 1/);
    expect(() => normalizeData({ comptes: [{ nomCompte: 'x' }] })).toThrowError(/comptes/);
  });
  it('complète les clés absentes par des tableaux vides', () => {
    expect(normalizeData({})).toEqual(emptyData());
  });

  it('conserve les tableaux fournis', () => {
    const compte = { id: '1', nomCompte: 'Livret A' };
    expect(normalizeData({ comptes: [compte] }).comptes).toEqual([compte]);
  });

  it('ignore les clés inconnues', () => {
    expect(normalizeData({ inconnu: 42 })).toEqual(emptyData());
  });

  it('rejette une valeur qui n\'est pas un objet', () => {
    expect(() => normalizeData([])).toThrowError(/objet/);
    expect(() => normalizeData('texte')).toThrowError(/objet/);
    expect(() => normalizeData(null)).toThrowError(/objet/);
  });

  it('rejette une clé connue qui n\'est pas un tableau', () => {
    expect(() => normalizeData({ comptes: 'oups' })).toThrowError(/comptes/);
  });
});
