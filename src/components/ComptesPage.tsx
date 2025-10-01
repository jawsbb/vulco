import React, { useState } from 'react';
import { Plus, Edit, Trash2, Wallet } from 'lucide-react';
import { usePatrimoine } from '../hooks/usePatrimoine';
import { CompteEpargne } from '../types';
import { formatCurrency } from '../utils/calculations';

export const ComptesPage: React.FC = () => {
  const { data, addCompte, updateCompte, deleteCompte } = usePatrimoine();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<CompteEpargne, 'id'>>({
    nomCompte: '',
    type: '',
    banque: '',
    soldeActuel: 0,
    derniereMiseAJour: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      nomCompte: '',
      type: '',
      banque: '',
      soldeActuel: 0,
      derniereMiseAJour: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCompte(editingId, formData);
    } else {
      addCompte(formData);
    }
    resetForm();
  };

  const handleEdit = (compte: CompteEpargne) => {
    setFormData(compte);
    setEditingId(compte.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      deleteCompte(id);
    }
  };

  const totalSolde = data.comptes.reduce((sum, c) => sum + c.soldeActuel, 0);

  const typesComptes = ['Compte courant', 'Livret A', 'LDD', 'LEP', 'Assurance Vie', 'PEL', 'CEL', 'Autre'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Comptes & Épargne</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Ajouter un compte</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600">Solde Total</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalSolde)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600">Nombre de Comptes</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.comptes.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600">Solde Moyen</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(data.comptes.length > 0 ? totalSolde / data.comptes.length : 0)}
          </p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Modifier le compte' : 'Ajouter un compte'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du compte</label>
              <input
                type="text"
                value={formData.nomCompte}
                onChange={(e) => setFormData({ ...formData, nomCompte: e.target.value })}
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
                {typesComptes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banque</label>
              <input
                type="text"
                value={formData.banque}
                onChange={(e) => setFormData({ ...formData, banque: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Solde actuel (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.soldeActuel}
                onChange={(e) => setFormData({ ...formData, soldeActuel: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dernière mise à jour</label>
              <input
                type="date"
                value={formData.derniereMiseAJour}
                onChange={(e) => setFormData({ ...formData, derniereMiseAJour: e.target.value })}
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
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Compte</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Banque</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Solde</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Mise à jour</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.comptes.map((compte) => (
                <tr key={compte.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{compte.nomCompte}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      {compte.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-700">{compte.banque}</td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">{formatCurrency(compte.soldeActuel)}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-500">
                    {new Date(compte.derniereMiseAJour).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(compte)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(compte.id)}
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
        {data.comptes.length === 0 && (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun compte</h3>
            <p className="text-gray-500">Commencez par ajouter votre premier compte</p>
          </div>
        )}
      </div>
    </div>
  );
};