import React, { useState } from 'react';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { usePatrimoine } from '../hooks/usePatrimoine';
import { Placement } from '../types';
import { 
  formatCurrency, 
  formatPercentage, 
  calculatePlusValue, 
  calculatePlusValuePercentage 
} from '../utils/calculations';

export const PlacementsPage: React.FC = () => {
  const { data, addPlacement, updatePlacement, deletePlacement } = usePatrimoine();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Placement, 'id'>>({
    nom: '',
    type: 'Actions',
    dateAchat: '',
    montantInvesti: 0,
    valorisationActuelle: 0,
    revenusGeneres: 0,
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      nom: '',
      type: 'Actions',
      dateAchat: '',
      montantInvesti: 0,
      valorisationActuelle: 0,
      revenusGeneres: 0,
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updatePlacement(editingId, formData);
    } else {
      addPlacement(formData);
    }
    resetForm();
  };

  const handleEdit = (placement: Placement) => {
    setFormData(placement);
    setEditingId(placement.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce placement ?')) {
      deletePlacement(id);
    }
  };

  const totalInvesti = data.placements.reduce((sum, p) => sum + p.montantInvesti, 0);
  const totalValorisation = data.placements.reduce((sum, p) => sum + p.valorisationActuelle, 0);
  const totalPlusValue = calculatePlusValue(totalValorisation, totalInvesti);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Placements</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Ajouter un placement</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Investi</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalInvesti)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600">Valorisation Actuelle</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalValorisation)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-600">Plus-value</h3>
            {totalPlusValue >= 0 ? 
              <TrendingUp className="w-4 h-4 text-green-600" /> : 
              <TrendingDown className="w-4 h-4 text-red-600" />
            }
          </div>
          <p className={`text-2xl font-bold mt-1 ${totalPlusValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalPlusValue)}
          </p>
          <p className={`text-sm ${totalPlusValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(calculatePlusValuePercentage(totalValorisation, totalInvesti))}
          </p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Modifier le placement' : 'Ajouter un placement'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du placement</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Placement['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Actions">Actions</option>
                <option value="Crypto">Crypto</option>
                <option value="SCPI">SCPI</option>
                <option value="PEA">PEA</option>
                <option value="AV">Assurance Vie</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'achat</label>
              <input
                type="date"
                value={formData.dateAchat}
                onChange={(e) => setFormData({ ...formData, dateAchat: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant investi (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.montantInvesti}
                onChange={(e) => setFormData({ ...formData, montantInvesti: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valorisation actuelle (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.valorisationActuelle}
                onChange={(e) => setFormData({ ...formData, valorisationActuelle: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Revenus générés (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.revenusGeneres}
                onChange={(e) => setFormData({ ...formData, revenusGeneres: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Nom</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Investi</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Valorisation</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Plus-value</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.placements.map((placement) => {
                const plusValue = calculatePlusValue(placement.valorisationActuelle, placement.montantInvesti);
                const plusValuePct = calculatePlusValuePercentage(placement.valorisationActuelle, placement.montantInvesti);
                return (
                  <tr key={placement.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{placement.nom}</div>
                        <div className="text-sm text-gray-500">{new Date(placement.dateAchat).toLocaleDateString('fr-FR')}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {placement.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">{formatCurrency(placement.montantInvesti)}</td>
                    <td className="py-4 px-6">{formatCurrency(placement.valorisationActuelle)}</td>
                    <td className="py-4 px-6">
                      <div className={plusValue >= 0 ? 'text-green-600' : 'text-red-600'}>
                        <div className="font-medium">{formatCurrency(plusValue)}</div>
                        <div className="text-sm">{formatPercentage(plusValuePct)}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(placement)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(placement.id)}
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
        {data.placements.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun placement</h3>
            <p className="text-gray-500">Commencez par ajouter votre premier placement</p>
          </div>
        )}
      </div>
    </div>
  );
};