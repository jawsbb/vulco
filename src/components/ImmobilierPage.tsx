import React, { useState } from 'react';
import { Plus, Edit, Trash2, Building } from 'lucide-react';
import { usePatrimoine } from '../hooks/usePatrimoine';
import { Immobilier } from '../types';
import { 
  formatCurrency, 
  formatPercentage, 
  calculateRendementBrut, 
  calculateRendementNet 
} from '../utils/calculations';

export const ImmobilierPage: React.FC = () => {
  const { data, addImmobilier, updateImmobilier, deleteImmobilier } = usePatrimoine();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Immobilier, 'id'>>({
    nomAdresse: '',
    typeBien: '',
    prixAchat: 0,
    fraisAcquisition: 0,
    valorisationActuelle: 0,
    revenusLocatifsMensuels: 0,
    chargesMensuelles: 0,
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      nomAdresse: '',
      typeBien: '',
      prixAchat: 0,
      fraisAcquisition: 0,
      valorisationActuelle: 0,
      revenusLocatifsMensuels: 0,
      chargesMensuelles: 0,
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateImmobilier(editingId, formData);
    } else {
      addImmobilier(formData);
    }
    resetForm();
  };

  const handleEdit = (immobilier: Immobilier) => {
    setFormData(immobilier);
    setEditingId(immobilier.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bien immobilier ?')) {
      deleteImmobilier(id);
    }
  };

  const totalValeur = data.immobilier.reduce((sum, i) => sum + i.valorisationActuelle, 0);
  const totalRevenus = data.immobilier.reduce((sum, i) => sum + i.revenusLocatifsMensuels, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Immobilier</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Ajouter un bien</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600">Valeur Totale</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalValeur)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600">Revenus Mensuels</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenus)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600">Nombre de Biens</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.immobilier.length}</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Modifier le bien' : 'Ajouter un bien'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom / Adresse</label>
              <input
                type="text"
                value={formData.nomAdresse}
                onChange={(e) => setFormData({ ...formData, nomAdresse: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de bien</label>
              <input
                type="text"
                value={formData.typeBien}
                onChange={(e) => setFormData({ ...formData, typeBien: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Appartement, Maison, Parking..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix d'achat (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.prixAchat}
                onChange={(e) => setFormData({ ...formData, prixAchat: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais d'acquisition (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.fraisAcquisition}
                onChange={(e) => setFormData({ ...formData, fraisAcquisition: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Revenus locatifs mensuels (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.revenusLocatifsMensuels}
                onChange={(e) => setFormData({ ...formData, revenusLocatifsMensuels: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Charges mensuelles (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.chargesMensuelles}
                onChange={(e) => setFormData({ ...formData, chargesMensuelles: parseFloat(e.target.value) || 0 })}
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
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Bien</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Prix d'achat</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Valorisation</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Revenus</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Rendement</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.immobilier.map((bien) => {
                const rendementBrut = calculateRendementBrut(bien.revenusLocatifsMensuels * 12, bien.prixAchat);
                const rendementNet = calculateRendementNet(
                  bien.revenusLocatifsMensuels * 12, 
                  bien.chargesMensuelles * 12, 
                  bien.prixAchat
                );
                return (
                  <tr key={bien.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{bien.nomAdresse}</div>
                        <div className="text-sm text-gray-500">{bien.typeBien}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{formatCurrency(bien.prixAchat)}</td>
                    <td className="py-4 px-6">{formatCurrency(bien.valorisationActuelle)}</td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium">{formatCurrency(bien.revenusLocatifsMensuels)}/mois</div>
                        <div className="text-sm text-gray-500">Charges: {formatCurrency(bien.chargesMensuelles)}/mois</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-green-600">Brut: {formatPercentage(rendementBrut)}</div>
                        <div className="text-sm text-green-700">Net: {formatPercentage(rendementNet)}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(bien)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(bien.id)}
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
        {data.immobilier.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun bien immobilier</h3>
            <p className="text-gray-500">Commencez par ajouter votre premier bien</p>
          </div>
        )}
      </div>
    </div>
  );
};