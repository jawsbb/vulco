import { Notification, PatrimoineData } from '../types';
import { calculateObjectifProgression, getObjectifStatut, getObjectifAlertes } from './objectifsUtils';
import { calculateFiscalYear } from './fiscalCalculations';

export const generateNotifications = (data: PatrimoineData): Notification[] => {
  const notifications: Notification[] = [];
  const aujourdhui = new Date();

  // Notifications pour les objectifs
  data.objectifs.forEach(objectif => {
    const progression = calculateObjectifProgression(objectif, data);
    const statut = getObjectifStatut(objectif, progression);
    const alertes = getObjectifAlertes(objectif);

    // Notification si objectif atteint
    if (statut === 'atteint' && !notifications.some(n => n.message.includes(objectif.titre))) {
      notifications.push({
        id: `objectif-${objectif.id}-atteint`,
        titre: '🎉 Objectif atteint !',
        message: `Félicitations ! Vous avez atteint votre objectif "${objectif.titre}"`,
        type: 'success',
        dateCreation: aujourdhui.toISOString(),
        lue: false,
        action: {
          type: 'page',
          destination: 'objectifs',
          label: 'Voir les objectifs'
        }
      });
    }

    // Notifications d'alerte pour les objectifs
    alertes.forEach((alerte, index) => {
      if (!notifications.some(n => n.message.includes(alerte))) {
        notifications.push({
          id: `objectif-${objectif.id}-alerte-${index}`,
          titre: '⚠️ Alerte objectif',
          message: `${objectif.titre} : ${alerte}`,
          type: 'warning',
          dateCreation: aujourdhui.toISOString(),
          lue: false,
          action: {
            type: 'page',
            destination: 'objectifs',
            label: 'Voir l\'objectif'
          }
        });
      }
    });
  });

  // Notifications pour les échéances de crédits
  data.credits.forEach(credit => {
    const dateEcheance = new Date(credit.dateSouscription);
    dateEcheance.setFullYear(dateEcheance.getFullYear() + credit.dureeRestante);
    const joursRestants = Math.ceil((dateEcheance.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24));

    if (joursRestants <= 365 && joursRestants > 0) {
      notifications.push({
        id: `credit-${credit.id}-echeance`,
        titre: '📅 Échéance de crédit',
        message: `Votre crédit "${credit.nomPret}" arrive à échéance dans ${joursRestants} jours`,
        type: 'info',
        dateCreation: aujourdhui.toISOString(),
        lue: false,
        action: {
          type: 'page',
          destination: 'credits',
          label: 'Voir le crédit'
        }
      });
    }
  });

  // Notifications fiscales
  const calculFiscal = calculateFiscalYear(data);
  if (calculFiscal.ifi.montantImpot > 0) {
    notifications.push({
      id: 'fiscal-ifi',
      titre: '💰 Impôt IFI',
      message: `Vous êtes assujetti à l'IFI pour ${calculFiscal.ifi.montantImpot.toLocaleString('fr-FR')}€`,
      type: 'info',
      dateCreation: aujourdhui.toISOString(),
      lue: false,
      action: {
        type: 'page',
        destination: 'fiscal',
        label: 'Voir les calculs fiscaux'
      }
    });
  }

  // Notifications de performance
  const totalActifs = data.placements.reduce((sum, p) => sum + p.valorisationActuelle, 0);
  const totalInvesti = data.placements.reduce((sum, p) => sum + p.montantInvesti, 0);
  const performance = totalInvesti > 0 ? ((totalActifs - totalInvesti) / totalInvesti) * 100 : 0;

  if (performance < -10) {
    notifications.push({
      id: 'performance-negative',
      titre: '📉 Performance négative',
      message: `Vos placements ont une performance de ${performance.toFixed(1)}%. Considérez une révision.`,
      type: 'warning',
      dateCreation: aujourdhui.toISOString(),
      lue: false,
      action: {
        type: 'page',
        destination: 'placements',
        label: 'Voir les placements'
      }
    });
  } else if (performance > 20) {
    notifications.push({
      id: 'performance-positive',
      titre: '📈 Excellente performance',
      message: `Félicitations ! Vos placements ont une performance de ${performance.toFixed(1)}%`,
      type: 'success',
      dateCreation: aujourdhui.toISOString(),
      lue: false,
      action: {
        type: 'page',
        destination: 'placements',
        label: 'Voir les placements'
      }
    });
  }

  // Notifications de mise à jour
  const derniereMAJ = data.historique
    .sort((a, b) => new Date(b.moisAnnee).getTime() - new Date(a.moisAnnee).getTime())[0];

  if (derniereMAJ) {
    const derniereDate = new Date(derniereMAJ.moisAnnee);
    const joursDepuisMAJ = Math.ceil((aujourdhui.getTime() - derniereDate.getTime()) / (1000 * 60 * 60 * 24));

    if (joursDepuisMAJ > 30) {
      notifications.push({
        id: 'maj-requise',
        titre: '🔄 Mise à jour requise',
        message: 'Il est temps de mettre à jour vos données patrimoniales',
        type: 'info',
        dateCreation: aujourdhui.toISOString(),
        lue: false,
        action: {
          type: 'modal',
          destination: 'update-data',
          label: 'Mettre à jour'
        }
      });
    }
  }

  return notifications.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
};

export const markNotificationAsRead = (notifications: Notification[], notificationId: string): Notification[] => {
  return notifications.map(notification => 
    notification.id === notificationId 
      ? { ...notification, lue: true, dateLecture: new Date().toISOString() }
      : notification
  );
};

export const markAllNotificationsAsRead = (notifications: Notification[]): Notification[] => {
  return notifications.map(notification => ({
    ...notification,
    lue: true,
    dateLecture: new Date().toISOString()
  }));
};

export const getUnreadNotificationsCount = (notifications: Notification[]): number => {
  return notifications.filter(notification => !notification.lue).length;
};

export const getNotificationsByType = (notifications: Notification[], type: Notification['type']): Notification[] => {
  return notifications.filter(notification => notification.type === type);
};

export const deleteNotification = (notifications: Notification[], notificationId: string): Notification[] => {
  return notifications.filter(notification => notification.id !== notificationId);
}; 