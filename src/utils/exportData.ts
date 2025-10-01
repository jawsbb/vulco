import { PatrimoineData } from '../types';

export const exportToJSON = (data: PatrimoineData) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `patrimoine-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const exportToCSV = (data: PatrimoineData) => {
  let csvContent = '';
  
  // Export des placements
  if (data.placements.length > 0) {
    csvContent += 'PLACEMENTS\n';
    csvContent += 'Nom,Type,Date Achat,Montant Investi,Valorisation Actuelle,Revenus Générés,Notes\n';
    data.placements.forEach(p => {
      csvContent += `"${p.nom}","${p.type}","${p.dateAchat}",${p.montantInvesti},${p.valorisationActuelle},${p.revenusGeneres},"${p.notes}"\n`;
    });
    csvContent += '\n';
  }
  
  // Export de l'immobilier
  if (data.immobilier.length > 0) {
    csvContent += 'IMMOBILIER\n';
    csvContent += 'Nom/Adresse,Type,Prix Achat,Frais Acquisition,Valorisation Actuelle,Revenus Mensuels,Charges Mensuelles,Notes\n';
    data.immobilier.forEach(i => {
      csvContent += `"${i.nomAdresse}","${i.typeBien}",${i.prixAchat},${i.fraisAcquisition},${i.valorisationActuelle},${i.revenusLocatifsMensuels},${i.chargesMensuelles},"${i.notes}"\n`;
    });
    csvContent += '\n';
  }
  
  // Export des comptes
  if (data.comptes.length > 0) {
    csvContent += 'COMPTES & ÉPARGNE\n';
    csvContent += 'Nom Compte,Type,Banque,Solde Actuel,Dernière MAJ,Notes\n';
    data.comptes.forEach(c => {
      csvContent += `"${c.nomCompte}","${c.type}","${c.banque}",${c.soldeActuel},"${c.derniereMiseAJour}","${c.notes}"\n`;
    });
    csvContent += '\n';
  }
  
  // Export des crédits
  if (data.credits.length > 0) {
    csvContent += 'CRÉDITS\n';
    csvContent += 'Nom Prêt,Type,Montant Initial,Capital Restant,Taux,Durée Restante,Mensualité,Date Souscription,Notes\n';
    data.credits.forEach(c => {
      csvContent += `"${c.nomPret}","${c.type}",${c.montantInitial},${c.capitalRestantDu},${c.taux},${c.dureeRestante},${c.mensualite},"${c.dateSouscription}","${c.notes}"\n`;
    });
    csvContent += '\n';
  }
  
  // Export de l'historique
  if (data.historique.length > 0) {
    csvContent += 'HISTORIQUE\n';
    csvContent += 'Mois/Année,Valeur Totale Actifs,Total Passif,Revenus Passifs Mois,Variation Patrimoine,Notes\n';
    data.historique.forEach(h => {
      csvContent += `"${h.moisAnnee}",${h.valeurTotaleActifs},${h.totalPassif},${h.revenuPassifMois},${h.variationPatrimoine},"${h.notes}"\n`;
    });
  }
  
  const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
  const exportFileDefaultName = `patrimoine-${new Date().toISOString().split('T')[0]}.csv`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const generateSummaryReport = (data: PatrimoineData): string => {
  const totalActifs = data.placements.reduce((sum, p) => sum + p.valorisationActuelle, 0) +
                     data.immobilier.reduce((sum, i) => sum + i.valorisationActuelle, 0) +
                     data.comptes.reduce((sum, c) => sum + c.soldeActuel, 0);
  
  const totalPassif = data.credits.reduce((sum, c) => sum + c.capitalRestantDu, 0);
  const patrimoineNet = totalActifs - totalPassif;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  
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
${data.historique.length > 0 ? `• Dernière variation: ${formatCurrency(data.historique.sort((a, b) => new Date(b.moisAnnee).getTime() - new Date(a.moisAnnee).getTime())[0].variationPatrimoine)}` : ''}

═══════════════════════════════════════════

Généré automatiquement par l'application de suivi de patrimoine.
`;
}; 