import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Trash2,
  Check,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { usePatrimoine } from '../hooks/usePatrimoine';
import { Notification } from '../types';

export const NotificationsPage: React.FC = () => {
  const { data, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead } = usePatrimoine();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<Notification['type'] | 'all'>('all');

  const filteredNotifications = data.notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.lue) || 
      (filter === 'read' && notification.lue);
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesFilter && matchesType;
  });

  const unreadCount = data.notifications.filter(n => !n.lue).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'objectif':
        return <CheckCircle className="w-5 h-5 text-purple-500" />;
      case 'alerte':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-orange-500 bg-orange-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
      case 'objectif':
        return 'border-l-purple-500 bg-purple-50';
      case 'alerte':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleNotificationAction = (notification: Notification) => {
    if (notification.action) {
      // Ici on pourrait implémenter la navigation vers la page ou l'ouverture du modal
      console.log('Action:', notification.action);
    }
    if (!notification.lue) {
      markNotificationAsRead(notification.id);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Restez informé de l'état de votre patrimoine</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="btn-secondary"
            >
              <Check className="w-4 h-4 mr-2" />
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total', value: data.notifications.length, color: 'bg-blue-500' },
          { label: 'Non lues', value: unreadCount, color: 'bg-orange-500' },
          { label: 'Lues', value: data.notifications.filter(n => n.lue).length, color: 'bg-green-500' },
          { label: 'Aujourd\'hui', value: data.notifications.filter(n => {
            const today = new Date().toDateString();
            return new Date(n.dateCreation).toDateString() === today;
          }).length, color: 'bg-purple-500' }
        ].map((stat, index) => (
          <div key={index} className="modern-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <Bell className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="modern-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtres:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-smooth ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-smooth ${
                filter === 'unread' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Non lues ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-smooth ${
                filter === 'read' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Lues
            </button>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="info">Information</option>
              <option value="success">Succès</option>
              <option value="warning">Avertissement</option>
              <option value="error">Erreur</option>
              <option value="objectif">Objectif</option>
              <option value="alerte">Alerte</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="modern-card p-8 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'Aucune notification' : 'Aucune notification correspondante'}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Vous n\'avez pas encore de notifications.' 
                : 'Aucune notification ne correspond aux filtres sélectionnés.'
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`modern-card p-6 border-l-4 ${getNotificationColor(notification.type)} slide-up ${
                !notification.lue ? 'ring-2 ring-blue-200' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{notification.titre}</h3>
                      {!notification.lue && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Nouveau
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatDate(notification.dateCreation)}</span>
                      {notification.action && (
                        <button
                          onClick={() => handleNotificationAction(notification)}
                          className="text-blue-600 hover:text-blue-800 font-medium transition-smooth"
                        >
                          {notification.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {!notification.lue ? (
                    <button
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-smooth"
                      title="Marquer comme lue"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="p-1 text-green-600 transition-smooth"
                      title="Déjà lue"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-smooth"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination ou "Charger plus" si nécessaire */}
      {filteredNotifications.length > 10 && (
        <div className="text-center">
          <button className="btn-secondary">
            Charger plus de notifications
          </button>
        </div>
      )}
    </div>
  );
}; 