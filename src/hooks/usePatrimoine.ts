import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PatrimoineData, Placement, Immobilier, CompteEpargne, Credit, HistoriqueMensuel, ObjectifFinancier, Notification, CalculFiscal } from '../types';
import { generateSampleData } from '../utils/sampleData';
import { generateNotifications } from '../utils/notificationsUtils';
import { calculateObjectifProgression, getObjectifStatut } from '../utils/objectifsUtils';

const STORAGE_KEY = 'patrimoine-data';

const emptyData = (): PatrimoineData => ({
  placements: [],
  immobilier: [],
  comptes: [],
  credits: [],
  historique: [],
  objectifs: [],
  notifications: [],
  calculsFiscaux: []
});

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const loadData = (): PatrimoineData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return emptyData();
    const parsed = JSON.parse(saved) as Partial<PatrimoineData>;
    return {
      placements: asArray<Placement>(parsed.placements),
      immobilier: asArray<Immobilier>(parsed.immobilier),
      comptes: asArray<CompteEpargne>(parsed.comptes),
      credits: asArray<Credit>(parsed.credits),
      historique: asArray<HistoriqueMensuel>(parsed.historique),
      objectifs: asArray<ObjectifFinancier>(parsed.objectifs),
      notifications: asArray<Notification>(parsed.notifications),
      calculsFiscaux: asArray<CalculFiscal>(parsed.calculsFiscaux)
    };
  } catch (e) {
    console.warn('Données patrimoine illisibles, réinitialisation :', e);
    return emptyData();
  }
};

type Item<K extends keyof PatrimoineData> = PatrimoineData[K][number];

/**
 * État partagé du patrimoine. Instancié une seule fois par <PatrimoineProvider>.
 */
export const usePatrimoineState = () => {
  const [data, setData] = useState<PatrimoineData>(loadData);

  // Persistance unique : toute mutation de l'état est écrite ici.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Mise à jour automatique des objectifs et notifications.
  useEffect(() => {
    if (data.placements.length === 0 && data.immobilier.length === 0 && data.comptes.length === 0) return;

    setData(prev => {
      const objectifs = prev.objectifs.map(objectif => {
        const progression = calculateObjectifProgression(objectif, prev);
        const statut = getObjectifStatut(objectif, progression);
        return objectif.progression === progression && objectif.statut === statut
          ? objectif
          : { ...objectif, progression, statut };
      });

      const existingIds = new Set(prev.notifications.map(n => n.id));
      const nouvelles = generateNotifications(prev).filter(n => !existingIds.has(n.id));

      const objectifsChanged = objectifs.some((o, i) => o !== prev.objectifs[i]);
      if (!objectifsChanged && nouvelles.length === 0) return prev;

      return { ...prev, objectifs, notifications: [...prev.notifications, ...nouvelles] };
    });
  }, [data.placements, data.immobilier, data.comptes, data.credits, data.historique, data.objectifs]);

  return useMemo(() => {
    const crud = <K extends keyof PatrimoineData>(key: K) => ({
      add: (item: Omit<Item<K>, 'id'>) =>
        setData(prev => ({
          ...prev,
          [key]: [...(prev[key] as { id: string }[]), { ...item, id: crypto.randomUUID() }]
        } as PatrimoineData)),
      update: (id: string, patch: Partial<Item<K>>) =>
        setData(prev => ({
          ...prev,
          [key]: (prev[key] as { id: string }[]).map(e => (e.id === id ? { ...e, ...patch } : e))
        } as PatrimoineData)),
      remove: (id: string) =>
        setData(prev => ({
          ...prev,
          [key]: (prev[key] as { id: string }[]).filter(e => e.id !== id)
        } as PatrimoineData))
    });

    const placements = crud('placements');
    const immobilier = crud('immobilier');
    const comptes = crud('comptes');
    const credits = crud('credits');
    const historique = crud('historique');

    const addObjectif = (objectif: Omit<ObjectifFinancier, 'id' | 'dateCreation' | 'progression'>) =>
      setData(prev => ({
        ...prev,
        objectifs: [...prev.objectifs, {
          ...objectif,
          id: crypto.randomUUID(),
          dateCreation: new Date().toISOString(),
          progression: 0
        }]
      }));

    const updateObjectif = (id: string, objectif: Partial<ObjectifFinancier>) =>
      setData(prev => ({
        ...prev,
        objectifs: prev.objectifs.map(o => {
          if (o.id !== id) return o;
          const updated = { ...o, ...objectif };
          updated.progression = calculateObjectifProgression(updated, prev);
          updated.statut = getObjectifStatut(updated, updated.progression);
          return updated;
        })
      }));

    const deleteObjectif = (id: string) =>
      setData(prev => ({ ...prev, objectifs: prev.objectifs.filter(o => o.id !== id) }));

    const addNotification = (notification: Omit<Notification, 'id' | 'dateCreation'>) =>
      setData(prev => ({
        ...prev,
        notifications: [...prev.notifications, {
          ...notification,
          id: crypto.randomUUID(),
          dateCreation: new Date().toISOString(),
          lue: false
        }]
      }));

    const markNotificationAsRead = (notificationId: string) =>
      setData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === notificationId ? { ...n, lue: true, dateLecture: new Date().toISOString() } : n
        )
      }));

    const deleteNotification = (notificationId: string) =>
      setData(prev => ({ ...prev, notifications: prev.notifications.filter(n => n.id !== notificationId) }));

    const markAllNotificationsAsRead = () =>
      setData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, lue: true, dateLecture: new Date().toISOString() }))
      }));

    const addCalculFiscal = (calcul: Omit<CalculFiscal, 'id' | 'dateCalcul'>) =>
      setData(prev => ({
        ...prev,
        calculsFiscaux: [...prev.calculsFiscaux, {
          ...calcul,
          id: `fiscal-${calcul.annee}`,
          dateCalcul: new Date().toISOString()
        }]
      }));

    const updateCalculFiscal = (id: string, calcul: Partial<CalculFiscal>) =>
      setData(prev => ({
        ...prev,
        calculsFiscaux: prev.calculsFiscaux.map(c => (c.id === id ? { ...c, ...calcul } : c))
      }));

    const deleteCalculFiscal = (id: string) =>
      setData(prev => ({ ...prev, calculsFiscaux: prev.calculsFiscaux.filter(c => c.id !== id) }));

    const generateAutoNotifications = () =>
      setData(prev => {
        const existingIds = new Set(prev.notifications.map(n => n.id));
        const nouvelles = generateNotifications(prev).filter(n => !existingIds.has(n.id));
        return nouvelles.length === 0
          ? prev
          : { ...prev, notifications: [...prev.notifications, ...nouvelles] };
      });

    const updateObjectifsProgressions = () =>
      setData(prev => ({
        ...prev,
        objectifs: prev.objectifs.map(objectif => {
          const progression = calculateObjectifProgression(objectif, prev);
          return { ...objectif, progression, statut: getObjectifStatut(objectif, progression) };
        })
      }));

    const loadSampleData = () => setData(generateSampleData());

    /** Remplace intégralement l'état (restauration d'une sauvegarde JSON). */
    const replaceAllData = (next: PatrimoineData) => setData(next);

    return {
      data,
      addPlacement: placements.add,
      updatePlacement: placements.update,
      deletePlacement: placements.remove,
      addImmobilier: immobilier.add,
      updateImmobilier: immobilier.update,
      deleteImmobilier: immobilier.remove,
      addCompte: comptes.add,
      updateCompte: comptes.update,
      deleteCompte: comptes.remove,
      addCredit: credits.add,
      updateCredit: credits.update,
      deleteCredit: credits.remove,
      addHistorique: historique.add,
      updateHistorique: historique.update,
      deleteHistorique: historique.remove,
      loadSampleData,
      replaceAllData,
      addObjectif,
      updateObjectif,
      deleteObjectif,
      addNotification,
      markNotificationAsRead,
      deleteNotification,
      markAllNotificationsAsRead,
      addCalculFiscal,
      updateCalculFiscal,
      deleteCalculFiscal,
      generateAutoNotifications,
      updateObjectifsProgressions
    };
  }, [data]);
};

export type PatrimoineContextValue = ReturnType<typeof usePatrimoineState>;

export const PatrimoineContext = createContext<PatrimoineContextValue | null>(null);

export const usePatrimoine = (): PatrimoineContextValue => {
  const ctx = useContext(PatrimoineContext);
  if (!ctx) throw new Error('usePatrimoine doit être utilisé à l\'intérieur d\'un <PatrimoineProvider>.');
  return ctx;
};
