import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { usePatrimoine } from '../hooks/usePatrimoine';
import { HistoriqueMensuel } from '../types';
import { formatCurrency } from '../utils/calculations';

export const HistoriquePage: React.FC = () => {
  const { data, addHistorique, updateHistorique, deleteHistorique } = usePatrimoine();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<HistoriqueMensuel, 'id'>>({
    moisAnnee: new Date().toISOString().slice(0, 7),
    valeurTotaleActifs: 0,
    totalPassif: 0,
    revenuPassifMois: 0,
    variationPatrimoine: 0,
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      moisAnnee: new Date().toISOString().slice(0, 7),
      valeurTotaleActifs: 0,
      totalPassif: 0,
      revenuPassifMois: 0,
      variationPatrimoine: 0,
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateHistorique(editingId, formData);
    } else {
      addHistorique(formData);
    }
    resetForm();
  };

  const handleEdit = (historique: HistoriqueMensuel) => {
    setFormData({
      ...historique,
      moisAnnee: historique.moisAnnee.slice(0, 7)
    });
    setEditingId(historique.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet historique ?')) {
      deleteHistorique(id);
    }
  };

  const sortedHistorique = data.historique.sort((a, b) => 
    new Date(b.moisAnnee).getTime() - new Date(a.moisAnnee).getTime()
  );

  const totalVariation = data.historique.reduce((sum, h) => sum + h.variationPatrimoine, 0);
  const moyenneVariation = data.historique.length > 0 ? totalVariation / data.historique.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Historique Mensuel</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Ajouter un mois</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600">Nombre de Mois</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.historique.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600">Variation Totale</h3>
          <p className={`text-2xl font-bold mt-1 ${totalVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalVariation)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600">Variation Moyenne</h3>
          <p className={`text-2xl font-bold mt-1 ${moyenneVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(moyenneVariation)}
          </p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Modifier l\'historique' : 'Ajouter un mois'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mois / Année</label>
              <input
                type="month"
                value={formData.moisAnnee}
                onChange={(e) => setFormData({ ...formData, moisAnnee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valeur totale actifs (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.valeurTotaleActifs}
                onChange={(e) => setFormData({ ...formData, valeurTotaleActifs: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total passif (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.totalPassif}
                onChange={(e) => setFormData({ ...formData, totalPassif: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Revenu passif du mois (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.revenuPassifMois}
                onChange={(e) => setFormData({ ...formData, revenuPassifMois: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variation patrimoine (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.variationPatrimoine}
                onChange={(e) => setFormData({ ...formData, variationPatrimoine: parseFloat(e.target.value) || 0 })}
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
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Mois</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Actifs</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Passif</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Patrimoine Net</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Variation</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Revenus</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistorique.map((mois) => {
                const patrimoineNet = mois.valeurTotaleActifs - mois.totalPassif;
                return (
                  <tr key={mois.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">
                        {new Date(mois.moisAnnee).toLocaleDateString('fr-FR', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-6">{formatCurrency(mois.valeurTotaleActifs)}</td>
                    <td className="py-4 px-6 text-red-600">{formatCurrency(mois.totalPassif)}</td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${patrimoineNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(patrimoineNet)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${mois.variationPatrimoine >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(mois.variationPatrimoine)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-blue-600">
                      {formatCurrency(mois.revenuPassifMois)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(mois)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(mois.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data.historique.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun historique</h3>
            <p className="text-gray-500">Commencez à suivre l'évolution mensuelle de votre patrimoine</p>
          </div>
        )}
      </div>
    </div>
  );
};