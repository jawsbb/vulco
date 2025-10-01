import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Home,
  DollarSign,
  Calendar,
  BarChart3
} from 'lucide-react';
import { usePatrimoine } from '../hooks/usePatrimoine';
import { ObjectifFinancier } from '../types';
import { 
  calculateObjectifProgression, 
  getObjectifStatut, 
  getObjectifCouleur, 
  getObjectifIcone,
  generateObjectifSuggestions,
  getObjectifAlertes
} from '../utils/objectifsUtils';
import { formatCurrency } from '../utils/calculations';

// Fonction utilitaire pour obtenir le composant icône
const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: React.ComponentType<any> } = {
    TrendingUp,
    PiggyBank,
    CreditCard,
    Home,
    DollarSign,
    Target
  };
  return icons[iconName] || Target;
};

export const ObjectifsPage: React.FC = () => {
  const { data, addObjectif, updateObjectif, deleteObjectif } = usePatrimoine();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingObjectif, setEditingObjectif] = useState<ObjectifFinancier | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = generateObjectifSuggestions(data);

  const handleAddObjectif = (objectifData: Omit<ObjectifFinancier, 'id' | 'dateCreation' | 'progression'>) => {
    addObjectif(objectifData);
    setShowAddModal(false);
  };

  const handleEditObjectif = (objectif: ObjectifFinancier) => {
    setEditingObjectif(objectif);
    setShowAddModal(true);
  };

  const handleUpdateObjectif = (objectifData: Partial<ObjectifFinancier>) => {
    if (editingObjectif) {
      updateObjectif(editingObjectif.id, objectifData);
      setEditingObjectif(null);
      setShowAddModal(false);
    }
  };

  const handleDeleteObjectif = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
      deleteObjectif(id);
    }
  };

  const getStatutIcon = (statut: ObjectifFinancier['statut']) => {
    switch (statut) {
      case 'atteint':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'en_retard':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'en_cours':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPrioriteColor = (priorite: ObjectifFinancier['priorite']) => {
    switch (priorite) {
      case 'critique':
        return 'bg-red-100 text-red-800';
      case 'haute':
        return 'bg-orange-100 text-orange-800';
      case 'moyenne':
        return 'bg-blue-100 text-blue-800';
      case 'basse':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Objectifs Financiers</h1>
          <p className="text-gray-600 mt-1">Définissez et suivez vos objectifs patrimoniaux</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSuggestions(true)}
            className="btn-secondary"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Suggestions
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel objectif
          </button>
        </div>
      </div>

      {/* Statistiques des objectifs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total', value: data.objectifs.length, color: 'bg-blue-500' },
          { label: 'En cours', value: data.objectifs.filter(o => o.statut === 'en_cours').length, color: 'bg-blue-500' },
          { label: 'Atteints', value: data.objectifs.filter(o => o.statut === 'atteint').length, color: 'bg-green-500' },
          { label: 'En retard', value: data.objectifs.filter(o => o.statut === 'en_retard').length, color: 'bg-red-500' }
        ].map((stat, index) => (
          <div key={index} className="modern-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Liste des objectifs */}
      <div className="space-y-6">
        {data.objectifs.length === 0 ? (
          <div className="modern-card p-8 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun objectif défini</h3>
            <p className="text-gray-600 mb-6">
              Commencez par créer votre premier objectif financier ou consultez nos suggestions.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowSuggestions(true)}
                className="btn-secondary"
              >
                Voir les suggestions
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Créer un objectif
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.objectifs.map((objectif) => {
              const progression = calculateObjectifProgression(objectif, data);
              const statut = getObjectifStatut(objectif, progression);
              const alertes = getObjectifAlertes(objectif);
              const IconComponent = getIconComponent(objectif.icone);

              return (
                <div key={objectif.id} className="modern-card p-6 slide-up">
                  {/* Header de l'objectif */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: objectif.couleur + '20' }}
                      >
                        <IconComponent className="w-6 h-6" style={{ color: objectif.couleur }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{objectif.titre}</h3>
                        <p className="text-sm text-gray-600">{objectif.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatutIcon(statut)}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditObjectif(objectif)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-smooth"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteObjectif(objectif.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-smooth"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progression */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progression</span>
                      <span className="text-sm font-semibold text-gray-900">{progression.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${progression}%`,
                          backgroundColor: objectif.couleur
                        }}
                      />
                    </div>
                  </div>

                  {/* Détails */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Montant cible</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(objectif.montantCible)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Échéance</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(objectif.dateLimite).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Priorité et alertes */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioriteColor(objectif.priorite)}`}>
                      {objectif.priorite}
                    </span>
                    {alertes.length > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-orange-600">{alertes[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal d'ajout/édition */}
      {showAddModal && (
        <ObjectifModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingObjectif(null);
          }}
          onSubmit={editingObjectif ? handleUpdateObjectif : handleAddObjectif}
          objectif={editingObjectif}
        />
      )}

      {/* Modal des suggestions */}
      {showSuggestions && (
        <SuggestionsModal
          isOpen={showSuggestions}
          onClose={() => setShowSuggestions(false)}
          suggestions={suggestions}
          onAddObjectif={handleAddObjectif}
        />
      )}
    </div>
  );
};

// Composant Modal pour ajouter/éditer un objectif
interface ObjectifModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  objectif?: ObjectifFinancier | null;
}

const ObjectifModal: React.FC<ObjectifModalProps> = ({ isOpen, onClose, onSubmit, objectif }) => {
  const [formData, setFormData] = useState({
    titre: objectif?.titre || '',
    description: objectif?.description || '',
    type: objectif?.type || 'epargne',
    montantCible: objectif?.montantCible || 0,
    dateLimite: objectif?.dateLimite || '',
    priorite: objectif?.priorite || 'moyenne',
    notes: objectif?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {objectif ? 'Modifier l\'objectif' : 'Nouvel objectif'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Plus className="w-6 h-6 transform rotate-45" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
            <input
              type="text"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="epargne">Épargne</option>
                <option value="investissement">Investissement</option>
                <option value="remboursement">Remboursement</option>
                <option value="patrimoine">Patrimoine</option>
                <option value="revenu">Revenu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
              <select
                value={formData.priorite}
                onChange={(e) => setFormData({ ...formData, priorite: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="basse">Basse</option>
                <option value="moyenne">Moyenne</option>
                <option value="haute">Haute</option>
                <option value="critique">Critique</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Montant cible</label>
              <input
                type="number"
                value={formData.montantCible}
                onChange={(e) => setFormData({ ...formData, montantCible: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date limite</label>
              <input
                type="date"
                value={formData.dateLimite}
                onChange={(e) => setFormData({ ...formData, dateLimite: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {objectif ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant Modal pour les suggestions
interface SuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: Partial<ObjectifFinancier>[];
  onAddObjectif: (data: any) => void;
}

const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ isOpen, onClose, suggestions, onAddObjectif }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Suggestions d'objectifs</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Plus className="w-6 h-6 transform rotate-45" />
          </button>
        </div>
        
        <div className="p-6">
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune suggestion</h3>
              <p className="text-gray-600">Ajoutez plus de données pour recevoir des suggestions personnalisées.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => {
                const IconComponent = getIconComponent(suggestion.icone || 'Target');
                
                return (
                  <div key={index} className="modern-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: (suggestion.couleur || '#6B7280') + '20' }}
                        >
                          <IconComponent className="w-5 h-5" style={{ color: suggestion.couleur }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{suggestion.titre}</h3>
                          <p className="text-sm text-gray-600">{suggestion.description}</p>
                          <p className="text-xs text-gray-500">
                            Montant cible: {formatCurrency(suggestion.montantCible || 0)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onAddObjectif({
                            ...suggestion,
                            dateLimite: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            notes: ''
                          });
                          onClose();
                        }}
                        className="btn-primary"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 