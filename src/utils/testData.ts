import { PatrimoineData } from '../types';

/** Jeu de données vide, utilisé comme base dans les tests. */
export const emptyData = (): PatrimoineData => ({
  placements: [],
  immobilier: [],
  comptes: [],
  credits: [],
  historique: [],
  objectifs: [],
  notifications: [],
  calculsFiscaux: []
});
