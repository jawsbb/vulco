import { PatrimoineData } from '../types';

/** Séparateur de colonnes : `,` (défaut) ou `;` (export Excel FR). */
type Separator = ',' | ';';

/** Compte les séparateurs candidats sur la première ligne, hors guillemets. */
const detectSeparator = (text: string): Separator => {
  let commas = 0;
  let semicolons = 0;
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') i++;
      else inQuotes = !inQuotes;
      continue;
    }
    if (inQuotes) continue;
    if (ch === '\n' || ch === '\r') break;
    if (ch === ',') commas++;
    else if (ch === ';') semicolons++;
  }
  return semicolons > commas ? ';' : ',';
};

/**
 * Parseur CSV (RFC 4180 sur les points utiles) : guillemets doublés, séparateur
 * et retour à la ligne protégés par des guillemets, CRLF/CR/LF, lignes vides
 * ignorées. Les espaces ne sont retirés que sur les cellules non protégées.
 */
export function parseCSV(text: string): string[][] {
  const separator = detectSeparator(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let fieldWasQuoted = false;
  let inQuotes = false;

  const endField = () => {
    row.push(fieldWasQuoted ? field : field.trim());
    field = '';
    fieldWasQuoted = false;
  };
  const endRow = () => {
    endField();
    if (row.some(cell => cell !== '')) rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch !== '"') field += ch;
      else if (text[i + 1] === '"') { field += '"'; i++; }
      else inQuotes = false;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      fieldWasQuoted = true;
    } else if (ch === separator) {
      endField();
    } else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      endRow();
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) endRow();
  return rows;
}

/**
 * Lit un nombre au format français (`1 234,56`, espaces insécables compris :
 * `\s` couvre U+00A0 et U+202F) ou anglais (`1234.56`). Valeur illisible = 0.
 */
export function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isNaN(n) ? 0 : n;
}

const DATA_KEYS = [
  'placements', 'immobilier', 'comptes', 'credits',
  'historique', 'objectifs', 'notifications', 'calculsFiscaux'
] as const;

/**
 * Valide une sauvegarde JSON : objet dont chaque clé connue est absente ou un
 * tableau. Les clés inconnues sont ignorées.
 */
export function normalizeData(raw: unknown): PatrimoineData {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Le fichier ne contient pas un objet de sauvegarde.');
  }
  const source = raw as Record<string, unknown>;
  const result: Record<string, unknown[]> = {};
  for (const key of DATA_KEYS) {
    const value = source[key];
    if (value === undefined || value === null) result[key] = [];
    else if (Array.isArray(value)) {
      const invalid = value.findIndex(el => el === null || typeof el !== 'object' || typeof (el as { id?: unknown }).id !== 'string');
      if (invalid >= 0) throw new Error(`Champ « ${key} » invalide : l'élément ${invalid + 1} n'est pas un enregistrement avec un id.`);
      result[key] = value;
    }
    else throw new Error(`Champ « ${key} » invalide : un tableau est attendu.`);
  }
  return result as unknown as PatrimoineData;
}

export function requireHeaders(rows: string[][], required: string[]): void {
  if (rows.length === 0) throw new Error('CSV vide');
  const header = rows[0].map(h => h.trim().toLowerCase());
  const missing = required.filter(r => !header.includes(r.toLowerCase()));
  if (missing.length) throw new Error(`En-têtes manquants: ${missing.join(', ')}`);
}

export function buildComptesFromCsv(rows: string[][]) {
  // headers: nomCompte, banque, type, soldeActuel, derniereMiseAJour, notes
  requireHeaders(rows, ['nomcompte','banque','type','soldeactuel','dernieremiseajour']);
  const header = rows[0].map(h => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name.toLowerCase());
  return rows.slice(1).map(r => ({
    nomCompte: r[idx('nomcompte')] || 'Compte',
    banque: r[idx('banque')] || '',
    type: r[idx('type')] || 'Courant',
    soldeActuel: parseNumber(r[idx('soldeactuel')]),
    derniereMiseAJour: r[idx('dernieremiseajour')] || new Date().toISOString().substring(0,10),
    notes: idx('notes') >= 0 ? r[idx('notes')] : ''
  }));
}

export function buildPlacementsFromCsv(rows: string[][]) {
  // headers: nom, type, dateAchat, montantInvesti, valorisationActuelle, revenusGeneres, notes
  requireHeaders(rows, ['nom','type','dateachat','montantinvesti','valorisationactuelle']);
  const header = rows[0].map(h => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name.toLowerCase());
  return rows.slice(1).map(r => ({
    nom: r[idx('nom')] || 'Position',
    type: r[idx('type')] || 'Autre',
    dateAchat: r[idx('dateachat')] || new Date().toISOString().substring(0,10),
    montantInvesti: parseNumber(r[idx('montantinvesti')]),
    valorisationActuelle: parseNumber(r[idx('valorisationactuelle')]),
    revenusGeneres: idx('revenusgeneres') >= 0 ? parseNumber(r[idx('revenusgeneres')]) : 0,
    notes: idx('notes') >= 0 ? r[idx('notes')] : ''
  }));
}
