import { PatrimoineData } from '../types';
import {
  formatCurrency,
  calculateTotalActifs,
  calculateTotalPassif,
  calculatePatrimoineNet
} from './calculations';

export const exportToJSON = (data: PatrimoineData) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

  const exportFileDefaultName = `patrimoine-${new Date().toISOString().split('T')[0]}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

/**
 * Sérialise une ligne CSV (RFC 4180) : une cellule contenant un séparateur, un
 * guillemet ou un retour à la ligne est encadrée de guillemets, les guillemets
 * internes sont doublés.
 */
export const toCsvRow = (cells: (string | number)[]): string =>
  cells
    .map(cell => {
      const value = String(cell ?? '');
      return /[",;\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    })
    .join(',');

const csvSection = (title: string, header: string[], rows: (string | number)[][]): string =>
  rows.length === 0
    ? ''
    : `${title}\n${toCsvRow(header)}\n${rows.map(toCsvRow).join('\n')}\n\n`;

export const exportToCSV = (data: PatrimoineData) => {
  const csvContent = [
    csvSection(
      'PLACEMENTS',
      ['Nom', 'Type', 'Date Achat', 'Montant Investi', 'Valorisation Actuelle', 'Revenus Générés', 'Notes'],
      data.placements.map(p => [p.nom, p.type, p.dateAchat, p.montantInvesti, p.valorisationActuelle, p.revenusGeneres, p.notes])
    ),
    csvSection(
      'IMMOBILIER',
      ['Nom/Adresse', 'Type', 'Prix Achat', 'Frais Acquisition', 'Valorisation Actuelle', 'Revenus Mensuels', 'Charges Mensuelles', 'Notes'],
      data.immobilier.map(i => [i.nomAdresse, i.typeBien, i.prixAchat, i.fraisAcquisition, i.valorisationActuelle, i.revenusLocatifsMensuels, i.chargesMensuelles, i.notes])
    ),
    csvSection(
      'COMPTES & ÉPARGNE',
      ['Nom Compte', 'Type', 'Banque', 'Solde Actuel', 'Dernière MAJ', 'Notes'],
      data.comptes.map(c => [c.nomCompte, c.type, c.banque, c.soldeActuel, c.derniereMiseAJour, c.notes])
    ),
    csvSection(
      'CRÉDITS',
      ['Nom Prêt', 'Type', 'Montant Initial', 'Capital Restant', 'Taux', 'Durée Restante', 'Mensualité', 'Date Souscription', 'Notes'],
      data.credits.map(c => [c.nomPret, c.type, c.montantInitial, c.capitalRestantDu, c.taux, c.dureeRestante, c.mensualite, c.dateSouscription, c.notes])
    ),
    csvSection(
      'HISTORIQUE',
      ['Mois/Année', 'Valeur Totale Actifs', 'Total Passif', 'Revenus Passifs Mois', 'Variation Patrimoine', 'Notes'],
      data.historique.map(h => [h.moisAnnee, h.valeurTotaleActifs, h.totalPassif, h.revenuPassifMois, h.variationPatrimoine, h.notes])
    )
  ].join('');

  const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
  const exportFileDefaultName = `patrimoine-${new Date().toISOString().split('T')[0]}.csv`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const generateSummaryReport = (data: PatrimoineData): string => {
  const totalActifs = calculateTotalActifs(data);
  const totalPassif = calculateTotalPassif(data);
  const patrimoineNet = calculatePatrimoineNet(data);

  const dernierMois = [...data.historique]
    .sort((a, b) => new Date(b.moisAnnee).getTime() - new Date(a.moisAnnee).getTime())[0];

  return `RAPPORT DE PATRIMOINE - ${new Date().toLocaleDateString('fr-FR')}

═══════════════════════════════════════════

📊 RÉSUMÉ FINANCIER
• Total des Actifs: ${formatCurrency(totalActifs)}
• Total du Passif: ${formatCurrency(totalPassif)}
• Patrimoine Net: ${formatCurrency(patrimoineNet)}

💰 RÉPARTITION DES ACTIFS
• Placements: ${data.placements.length} positions (${formatCurrency(data.placements.reduce((sum, p) => sum + p.valorisationActuelle, 0))})
• Immobilier: ${data.immobilier.length} biens (${formatCurrency(data.immobilier.reduce((sum, i) => sum + i.valorisationActuelle, 0))})
• Comptes & Épargne: ${data.comptes.length} comptes (${formatCurrency(data.comptes.reduce((sum, c) => sum + c.soldeActuel, 0))})

🏦 ENDETTEMENT
• Nombre de crédits: ${data.credits.length}
• Capital restant dû: ${formatCurrency(totalPassif)}
• Mensualités totales: ${formatCurrency(data.credits.reduce((sum, c) => sum + c.mensualite, 0))}

📈 ÉVOLUTION
• Historique disponible: ${data.historique.length} mois
${dernierMois ? `• Dernière variation: ${formatCurrency(dernierMois.variationPatrimoine)}` : ''}

═══════════════════════════════════════════

Généré automatiquement par l'application de suivi de patrimoine.
`;
};
