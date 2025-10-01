import React, { useState } from 'react';
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import { usePatrimoine } from '../hooks/usePatrimoine';
import { Credit } from '../types';
import { formatCurrency, formatPercentage } from '../utils/calculations';

export const CreditsPage: React.FC = () => {
  const { data, addCredit, updateCredit, deleteCredit } = usePatrimoine();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Credit, 'id'>>({
    nomPret: '',
    type: '',
    montantInitial: 0,
    capitalRestantDu: 0,
    taux: 0,
    dureeRestante: 0,
    mensualite: 0,
    dateSouscription: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      nomPret: '',
      type: '',
      montantInitial: 0,
      capitalRestantDu: 0,
      taux: 0,
      dureeRestante: 0,
      mensualite: 0,
      dateSouscription: '',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCredit(editingId, formData);
    } else {
      addCredit(formData);
    }
    resetForm();
  };

  const handleEdit = (credit: Credit) => {
    setFormData(credit);
    setEditingId(credit.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce crédit ?')) {
      deleteCredit(id);
    }
  };

  const totalCapitalRestant = data.credits.reduce((sum, c) => sum + c.capitalRestantDu, 0);
  const totalMensualites = data.credits.reduce((sum, c) => sum + c.mensualite, 0);

  const typesCredits = ['Immobilier', 'Consommation', 'Professionnel', 'Auto', 'Travaux', 'Autre'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Crédits</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Ajouter un crédit</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600">Capital Restant Dû</h3>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalCapitalRestant)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600">Mensualités Totales</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalMensualites)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600">Nombre de Crédits</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.credits.length}</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Modifier le crédit' : 'Ajouter un crédit'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du prêt</label>
              <input
                type="text"
                value={formData.nomPret}
                onChange={(e) => setFormData({ ...formData, nomPret: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Sélectionner un type</option>
                {typesCredits.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant initial (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.montantInitial}
                onChange={(e) => setFormData({ ...formData, montantInitial: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capital restant dû (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.capitalRestantDu}
                onChange={(e) => setFormData({ ...formData, capitalRestantDu: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taux (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.taux}
                onChange={(e) => setFormData({ ...formData, taux: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée restante (mois)</label>
              <input
                type="number"
                value={formData.dureeRestante}
                onChange={(e) => setFormData({ ...formData, dureeRestante: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensualité (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.mensualite}
                onChange={(e) => setFormData({ ...formData, mensualite: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de souscription</label>
              <input
                type="date"
                value={formData.dateSouscription}
                onChange={(e) => setFormData({ ...formData, dateSouscription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Prêt</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Capital restant</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Taux</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Mensualité</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Durée restante</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.credits.map((credit) => (
                <tr key={credit.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{credit.nomPret}</div>
                      <div className="text-sm text-gray-500">
                        Souscrit le {new Date(credit.dateSouscription).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                      {credit.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-red-600">{formatCurrency(credit.capitalRestantDu)}</div>
                      <div className="text-sm text-gray-500">
                        sur {formatCurrency(credit.montantInitial)} initial
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">{formatPercentage(credit.taux)}</td>
                  <td className="py-4 px-6 font-medium">{formatCurrency(credit.mensualite)}</td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium">{credit.dureeRestante} mois</div>
                      <div className="text-sm text-gray-500">
                        {Math.round(credit.dureeRestante / 12)} an{credit.dureeRestante > 12 ? 's' : ''}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(credit)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(credit.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.credits.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun crédit</h3>
            <p className="text-gray-500">Ajoutez vos crédits en cours pour un suivi complet</p>
          </div>
        )}
      </div>
    </div>
  );
};