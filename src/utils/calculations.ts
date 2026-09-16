import { PatrimoineData } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const calculatePlusValue = (valorisation: number, investi: number): number => {
  return valorisation - investi;
};

export const calculatePlusValuePercentage = (valorisation: number, investi: number): number => {
  if (investi === 0) return 0;
  return ((valorisation - investi) / investi) * 100;
};

export const calculateRendementBrut = (revenusAnnuels: number, prixAchat: number): number => {
  if (prixAchat === 0) return 0;
  return (revenusAnnuels / prixAchat) * 100;
};

export const calculateRendementNet = (revenusAnnuels: number, chargesAnnuelles: number, prixAchat: number): number => {
  if (prixAchat === 0) return 0;
  return ((revenusAnnuels - chargesAnnuelles) / prixAchat) * 100;
};

export const calculateTotalActifs = (data: PatrimoineData): number => {
  const totalPlacements = data.placements.reduce((sum, p) => sum + p.valorisationActuelle, 0);
  const totalImmobilier = data.immobilier.reduce((sum, i) => sum + i.valorisationActuelle, 0);
  const totalComptes = data.comptes.reduce((sum, c) => sum + c.soldeActuel, 0);
  return totalPlacements + totalImmobilier + totalComptes;
};

export const calculateTotalPassif = (data: PatrimoineData): number => {
  return data.credits.reduce((sum, c) => sum + c.capitalRestantDu, 0);
};

export const calculatePatrimoineNet = (data: PatrimoineData): number => {
  return calculateTotalActifs(data) - calculateTotalPassif(data);
};

export const getRepartitionActifs = (data: PatrimoineData) => {
  const totalPlacements = data.placements.reduce((sum, p) => sum + p.valorisationActuelle, 0);
  const totalImmobilier = data.immobilier.reduce((sum, i) => sum + i.valorisationActuelle, 0);
  const totalComptes = data.comptes.reduce((sum, c) => sum + c.soldeActuel, 0);
  const total = totalPlacements + totalImmobilier + totalComptes;

  if (total === 0) return [];

  return [
    { name: 'Placements', value: totalPlacements, percentage: (totalPlacements / total) * 100 },
    { name: 'Immobilier', value: totalImmobilier, percentage: (totalImmobilier / total) * 100 },
    { name: 'Comptes & Épargne', value: totalComptes, percentage: (totalComptes / total) * 100 }
  ].filter(item => item.value > 0);
};