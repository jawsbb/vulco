import { useState, useEffect } from 'react';
import { PatrimoineData, Placement, Immobilier, CompteEpargne, Credit, HistoriqueMensuel, ObjectifFinancier, Notification, CalculFiscal } from '../types';
import { generateSampleData } from '../utils/sampleData';
import { generateNotifications } from '../utils/notificationsUtils';
import { calculateObjectifProgression, getObjectifStatut } from '../utils/objectifsUtils';
import { calculateFiscalYear } from '../utils/fiscalCalculations';

const initialData: PatrimoineData = {
  placements: [],
  immobilier: [],
  comptes: [],
  credits: [],
  historique: [],
  objectifs: [],
  notifications: [],
  calculsFiscaux: []
};

export const usePatrimoine = () => {
  const [data, setData] = useState<PatrimoineData>(initialData);

  useEffect(() => {
    const savedData = localStorage.getItem('patrimoine-data');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Assurer la compatibilité avec les anciennes données
      const updatedData = {
        ...parsedData,
        objectifs: parsedData.objectifs || [],
        notifications: parsedData.notifications || [],
        calculsFiscaux: parsedData.calculsFiscaux || []
      };
      setData(updatedData);
    }
  }, []);

  const saveData = (newData: PatrimoineData) => {
    setData(newData);
    localStorage.setItem('patrimoine-data', JSON.stringify(newData));
  };

  // Fonctions existantes pour les placements
  const addPlacement = (placement: Omit<Placement, 'id'>) => {
    const newPlacement = { ...placement, id: Date.now().toString() };
    const newData = { ...data, placements: [...data.placements, newPlacement] };
    saveData(newData);
  };

  const updatePlacement = (id: string, placement: Partial<Placement>) => {
    const newData = {
      ...data,
      placements: data.placements.map(p => p.id === id ? { ...p, ...placement } : p)
    };
    saveData(newData);
  };

  const deletePlacement = (id: string) => {
    const newData = { ...data, placements: data.placements.filter(p => p.id !== id) };
    saveData(newData);
  };

  // Fonctions existantes pour l'immobilier
  const addImmobilier = (immobilier: Omit<Immobilier, 'id'>) => {
    const newImmobilier = { ...immobilier, id: Date.now().toString() };
    const newData = { ...data, immobilier: [...data.immobilier, newImmobilier] };
    saveData(newData);
  };

  const updateImmobilier = (id: string, immobilier: Partial<Immobilier>) => {
    const newData = {
      ...data,
      immobilier: data.immobilier.map(i => i.id === id ? { ...i, ...immobilier } : i)
    };
    saveData(newData);
  };

  const deleteImmobilier = (id: string) => {
    const newData = { ...data, immobilier: data.immobilier.filter(i => i.id !== id) };
    saveData(newData);
  };

  // Fonctions existantes pour les comptes
  const addCompte = (compte: Omit<CompteEpargne, 'id'>) => {
    const newCompte = { ...compte, id: Date.now().toString() };
    const newData = { ...data, comptes: [...data.comptes, newCompte] };
    saveData(newData);
  };

  const updateCompte = (id: string, compte: Partial<CompteEpargne>) => {
    const newData = {
      ...data,
      comptes: data.comptes.map(c => c.id === id ? { ...c, ...compte } : c)
    };
    saveData(newData);
  };

  const deleteCompte = (id: string) => {
    const newData = { ...data, comptes: data.comptes.filter(c => c.id !== id) };
    saveData(newData);
  };

  // Fonctions existantes pour les crédits
  const addCredit = (credit: Omit<Credit, 'id'>) => {
    const newCredit = { ...credit, id: Date.now().toString() };
    const newData = { ...data, credits: [...data.credits, newCredit] };
    saveData(newData);
  };

  const updateCredit = (id: string, credit: Partial<Credit>) => {
    const newData = {
      ...data,
      credits: data.credits.map(c => c.id === id ? { ...c, ...credit } : c)
    };
    saveData(newData);
  };

  const deleteCredit = (id: string) => {
    const newData = { ...data, credits: data.credits.filter(c => c.id !== id) };
    saveData(newData);
  };

  // Fonctions existantes pour l'historique
  const addHistorique = (historique: Omit<HistoriqueMensuel, 'id'>) => {
    const newHistorique = { ...historique, id: Date.now().toString() };
    const newData = { ...data, historique: [...data.historique, newHistorique] };
    saveData(newData);
  };

  const updateHistorique = (id: string, historique: Partial<HistoriqueMensuel>) => {
    const newData = {
      ...data,
      historique: data.historique.map(h => h.id === id ? { ...h, ...historique } : h)
    };
    saveData(newData);
  };

  const deleteHistorique = (id: string) => {
    const newData = { ...data, historique: data.historique.filter(h => h.id !== id) };
    saveData(newData);
  };

  // Nouvelles fonctions pour les objectifs financiers
  const addObjectif = (objectif: Omit<ObjectifFinancier, 'id' | 'dateCreation' | 'progression'>) => {
    const newObjectif: ObjectifFinancier = {
      ...objectif,
      id: Date.now().toString(),
      dateCreation: new Date().toISOString(),
      progression: 0
    };
    const newData = { ...data, objectifs: [...data.objectifs, newObjectif] };
    saveData(newData);
  };

  const updateObjectif = (id: string, objectif: Partial<ObjectifFinancier>) => {
    const newData = {
      ...data,
      objectifs: data.objectifs.map(o => {
        if (o.id === id) {
          const updated = { ...o, ...objectif };
          // Recalculer la progression
          updated.progression = calculateObjectifProgression(updated, data);
          updated.statut = getObjectifStatut(updated, updated.progression);
          return updated;
        }
        return o;
      })
    };
    saveData(newData);
  };

  const deleteObjectif = (id: string) => {
    const newData = { ...data, objectifs: data.objectifs.filter(o => o.id !== id) };
    saveData(newData);
  };

  // Nouvelles fonctions pour les notifications
  const addNotification = (notification: Omit<Notification, 'id' | 'dateCreation'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      dateCreation: new Date().toISOString(),
      lue: false
    };
    const newData = { ...data, notifications: [...data.notifications, newNotification] };
    saveData(newData);
  };

  const markNotificationAsRead = (notificationId: string) => {
    const newData = {
      ...data,
      notifications: data.notifications.map(n => 
        n.id === notificationId 
          ? { ...n, lue: true, dateLecture: new Date().toISOString() }
          : n
      )
    };
    saveData(newData);
  };

  const deleteNotification = (notificationId: string) => {
    const newData = { ...data, notifications: data.notifications.filter(n => n.id !== notificationId) };
    saveData(newData);
  };

  const markAllNotificationsAsRead = () => {
    const newData = {
      ...data,
      notifications: data.notifications.map(n => ({
        ...n,
        lue: true,
        dateLecture: new Date().toISOString()
      }))
    };
    saveData(newData);
  };

  // Nouvelles fonctions pour les calculs fiscaux
  const addCalculFiscal = (calcul: Omit<CalculFiscal, 'id' | 'dateCalcul'>) => {
    const newCalcul: CalculFiscal = {
      ...calcul,
      id: `fiscal-${calcul.annee}`,
      dateCalcul: new Date().toISOString()
    };
    const newData = { ...data, calculsFiscaux: [...data.calculsFiscaux, newCalcul] };
    saveData(newData);
  };

  const updateCalculFiscal = (id: string, calcul: Partial<CalculFiscal>) => {
    const newData = {
      ...data,
      calculsFiscaux: data.calculsFiscaux.map(c => c.id === id ? { ...c, ...calcul } : c)
    };
    saveData(newData);
  };

  const deleteCalculFiscal = (id: string) => {
    const newData = { ...data, calculsFiscaux: data.calculsFiscaux.filter(c => c.id !== id) };
    saveData(newData);
  };

  // Fonction pour générer automatiquement les notifications
  const generateAutoNotifications = () => {
    const newNotifications = generateNotifications(data);
    const existingIds = new Set(data.notifications.map(n => n.id));
    const uniqueNotifications = newNotifications.filter(n => !existingIds.has(n.id));
    
    if (uniqueNotifications.length > 0) {
      const newData = { ...data, notifications: [...data.notifications, ...uniqueNotifications] };
      saveData(newData);
    }
  };

  // Fonction pour mettre à jour les progressions des objectifs
  const updateObjectifsProgressions = () => {
    const newData = {
      ...data,
      objectifs: data.objectifs.map(objectif => {
        const progression = calculateObjectifProgression(objectif, data);
        const statut = getObjectifStatut(objectif, progression);
        return { ...objectif, progression, statut };
      })
    };
    saveData(newData);
  };

  // Fonction pour charger les données d'exemple
  const loadSampleData = () => {
    const sampleData = generateSampleData();
    saveData(sampleData);
  };

  // Mise à jour automatique des objectifs et notifications
  useEffect(() => {
    if (data.placements.length > 0 || data.immobilier.length > 0 || data.comptes.length > 0) {
      updateObjectifsProgressions();
      generateAutoNotifications();
    }
  }, [data.placements, data.immobilier, data.comptes, data.credits, data.historique]);

  return {
    data,
    // Fonctions existantes
    addPlacement,
    updatePlacement,
    deletePlacement,
    addImmobilier,
    updateImmobilier,
    deleteImmobilier,
    addCompte,
    updateCompte,
    deleteCompte,
    addCredit,
    updateCredit,
    deleteCredit,
    addHistorique,
    updateHistorique,
    deleteHistorique,
    loadSampleData,
    // Nouvelles fonctions
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
};