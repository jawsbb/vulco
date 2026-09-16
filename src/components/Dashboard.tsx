import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Database, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { usePatrimoine } from '../hooks/usePatrimoine';
import { PieChart, LineChart, BarChart } from './charts';
import { ExportModal } from './ExportModal';
import {
  calculateTotalActifs,
  calculatePatrimoineNet,
  getRepartitionActifs,
  formatCurrency
} from '../utils/calculations';
import { calculateObjectifProgression } from '../utils/objectifsUtils';

export const Dashboard: React.FC = () => {
  const { data, loadSampleData } = usePatrimoine();
  const [showExportModal, setShowExportModal] = useState(false);

  const totalActifs = calculateTotalActifs(data);
  const patrimoineNet = calculatePatrimoineNet(data);
  const repartition = getRepartitionActifs(data);

  const lastHistorique = data.historique
    .sort((a, b) => new Date(b.moisAnnee).getTime() - new Date(a.moisAnnee).getTime())[0];

  const previousHistorique = data.historique
    .sort((a, b) => new Date(b.moisAnnee).getTime() - new Date(a.moisAnnee).getTime())[1];

  // Calculer les variations
  const getVariationPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const actifVariation = previousHistorique ? getVariationPercentage(totalActifs, previousHistorique.valeurTotaleActifs) : 0;
  const patrimoineVariation = previousHistorique ? getVariationPercentage(patrimoineNet, previousHistorique.valeurTotaleActifs - previousHistorique.totalPassif) : 0;

  // Objectifs en cours
  const objectifsEnCours = data.objectifs.filter(obj => obj.statut === 'en_cours').slice(0, 3);
  const notificationsRecentes = data.notifications.filter(n => !n.lue).slice(0, 3);

  const stats = [
    {
      title: 'Solde total',
      subtitle: 'Total des actifs',
      value: formatCurrency(totalActifs),
      variation: actifVariation,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Transactions',
      subtitle: 'Non catégorisées',
      value: data.historique.length.toString(),
      variation: 12.5,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Placements',
      subtitle: 'Actifs aujourd\'hui',
      value: data.placements.length.toString(),
      variation: -2.1,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Cette semaine',
      subtitle: 'Dépenses cartes',
      value: formatCurrency(Math.abs(lastHistorique?.variationPatrimoine || 0)),
      variation: patrimoineVariation,
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const hasData = data.placements.length > 0 || data.immobilier.length > 0 || data.comptes.length > 0;

  return (
    <div className="space-y-6 fade-in">
      {/* Header with greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-responsive-lg font-bold text-gray-900">Bonjour, Jules!</h1>
          <p className="text-gray-600 mt-1">Voici un aperçu de votre patrimoine</p>
        </div>
        <div className="flex items-center gap-3">
          {!hasData && (
            <button
              onClick={loadSampleData}
              className="btn-primary"
            >
              <Database className="w-4 h-4 mr-2" />
              Données d'exemple
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full notification-dot"></div>
            <span className="text-sm text-gray-600">En cours</span>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 text-center slide-up">
          <Database className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue dans votre suivi de patrimoine !</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Commencez par ajouter vos premiers actifs ou chargez des données d'exemple pour découvrir toutes les fonctionnalités.
          </p>
          <button
            onClick={loadSampleData}
            className="btn-primary"
          >
            <Database className="w-5 h-5 mr-2" />
            Charger des données d'exemple
          </button>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const isPositive = stat.variation >= 0;
              return (
                <div key={index} className="stat-card modern-card p-6 slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor} transition-smooth`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 transition-smooth">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                  <div className="flex items-center mt-4">
                    {isPositive ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}{stat.variation.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Revenue chart */}
              {data.historique.length > 0 && (
                <div className="modern-card p-6 slide-up">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Évolution</h3>
                      <p className="text-sm text-gray-600">7 derniers jours vs semaine précédente</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 transition-smooth">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  <LineChart data={data.historique} />
                </div>
              )}

              {/* Performance chart */}
              <div className="modern-card p-6 slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Performance par Type</h3>
                  <button className="text-gray-400 hover:text-gray-600 transition-smooth">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                <BarChart data={data.placements} />
              </div>
            </div>

            {/* Right column - Sidebar content */}
            <div className="space-y-6">
              {/* Objectifs en cours */}
              {objectifsEnCours.length > 0 && (
                <div className="modern-card p-6 slide-up">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Objectifs en cours</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-smooth">
                      Voir tout
                    </button>
                  </div>
                  <div className="space-y-4">
                    {objectifsEnCours.map((objectif) => {
                      const progression = calculateObjectifProgression(objectif, data);
                      return (
                        <div key={objectif.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">{objectif.titre}</h4>
                            <span className="text-xs font-semibold text-gray-600">{progression.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${progression}%`,
                                backgroundColor: objectif.couleur
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">{objectif.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notifications récentes */}
              {notificationsRecentes.length > 0 && (
                <div className="modern-card p-6 slide-up">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-smooth">
                      Voir tout
                    </button>
                  </div>
                  <div className="space-y-3">
                    {notificationsRecentes.map((notification) => (
                      <div key={notification.id} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">{notification.titre}</h4>
                        <p className="text-xs text-gray-600">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white slide-up">
                <h3 className="text-lg font-semibold mb-2">Statut formation</h3>
                <p className="text-gray-300 text-sm mb-4">En cours</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                </div>
                <p className="text-sm text-gray-300 mb-4">Temps de traitement estimé<br />4-5 jours ouvrables</p>
                <button className="w-full bg-white text-gray-900 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-100 transition-smooth">
                  Voir le statut
                </button>
              </div>

              {/* Pie chart */}
              <div className="modern-card p-6 slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Répartition</h3>
                  <button className="text-gray-400 hover:text-gray-600 transition-smooth">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                <PieChart data={repartition} />
              </div>

              {/* To-do list */}
              <div className="modern-card p-6 slide-up">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Votre to-do list</h3>
                <div className="space-y-3">
                  {[
                    { task: 'Mettre à jour les placements', date: 'Mar 4 à 6:00 pm', urgent: true },
                    { task: 'Réviser les objectifs', date: 'Mar 7 à 6:00 pm', urgent: false },
                    { task: 'Analyser la performance', date: 'Mar 12 à 6:00 pm', urgent: false },
                    { task: 'Exporter les données', date: 'Mar 12 à 6:00 pm', urgent: false }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-smooth">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-smooth ${item.urgent ? 'bg-red-100' : 'bg-gray-200'}`}>
                        <div className={`w-2 h-2 rounded-full ${item.urgent ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.task}</p>
                        <p className="text-xs text-gray-500">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meeting card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white slide-up">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full notification-dot"></div>
                  <span className="text-sm">Fév 22 à 6:00 PM</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Réunion conseil</h3>
                <p className="text-gray-300 text-sm">
                  Vous avez été invité à une réunion du conseil de direction.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom section - Recent activity */}
          {data.historique.length > 0 && (
            <div className="modern-card p-6 slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-smooth"
                >
                  Exporter tout
                </button>
              </div>
              <div className="space-y-4">
                {data.historique
                  .sort((a, b) => new Date(b.moisAnnee).getTime() - new Date(a.moisAnnee).getTime())
                  .slice(0, 4)
                  .map((h) => (
                    <div key={h.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-smooth">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center transition-smooth">
                        <Activity className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Mise à jour patrimoine - {new Date(h.moisAnnee).toLocaleDateString('fr-FR', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-600">{h.notes}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${h.variationPatrimoine >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {h.variationPatrimoine >= 0 ? '+' : ''}{formatCurrency(h.variationPatrimoine)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(h.valeurTotaleActifs - h.totalPassif)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
      />
    </div>
  );
};