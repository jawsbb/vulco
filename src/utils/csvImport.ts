// Very small CSV parser (no quotes escape for simplicity). For personal use.
export function parseCSV(text: string): string[][] {
  const lines = text\n    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter(l => l.trim().length > 0);
  return lines.map(line => {
    // naive split; supports simple quoted cells
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === ',' && !inQuotes) {
        cells.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(current);
    return cells.map(c => c.trim());
  });
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
    soldeActuel: Number(r[idx('soldeactuel')] || 0),
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
    montantInvesti: Number(r[idx('montantinvesti')] || 0),
    valorisationActuelle: Number(r[idx('valorisationactuelle')] || 0),
    revenusGeneres: idx('revenusgeneres') >= 0 ? Number(r[idx('revenusgeneres')] || 0) : 0,
    notes: idx('notes') >= 0 ? r[idx('notes')] : ''
  }));
}



