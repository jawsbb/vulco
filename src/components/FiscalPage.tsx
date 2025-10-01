import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  BarChart3,
  DollarSign,
  Home,
  CreditCard
} from 'lucide-react';
import { usePatrimoine } from '../hooks/usePatrimoine';
import { CalculFiscal } from '../types';
import { calculateFiscalYear, getFiscalOptimizations } from '../utils/fiscalCalculations';
import { formatCurrency } from '../utils/calculations';

export const FiscalPage: React.FC = () => {
  const { data, addCalculFiscal, updateCalculFiscal, deleteCalculFiscal } = usePatrimoine();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDetails, setShowDetails] = useState(false);

  // Calculer les données fiscales pour l'année sélectionnée
  const currentFiscalData = calculateFiscalYear(data, selectedYear);
  const optimizations = getFiscalOptimizations(currentFiscalData);

  const handleCalculateFiscal = () => {
    const fiscalData = calculateFiscalYear(data, selectedYear);
    addCalculFiscal(fiscalData);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getTaxColor = (amount: number) => {
    if (amount === 0) return 'text-green-600';
    if (amount < 1000) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTaxSeverity = (amount: number) => {
    if (amount === 0) return 'success';
    if (amount < 1000) return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calculs Fiscaux</h1>
          <p className="text-gray-600 mt-1">Analysez votre situation fiscale et optimisez votre patrimoine</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="btn-secondary"
          >
            {showDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showDetails ? 'Masquer détails' : 'Voir détails'}
          </button>
          <button
            onClick={handleCalculateFiscal}
            className="btn-primary"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculer {selectedYear}
          </button>
        </div>
      </div>

      {/* Sélecteur d'année */}
      <div className="modern-card p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Année fiscale:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Résumé fiscal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'IFI',
            value: currentFiscalData.ifi.montantImpot,
            icon: Home,
            color: currentFiscalData.ifi.exonere ? 'text-green-600' : 'text-red-600',
            bgColor: currentFiscalData.ifi.exonere ? 'bg-green-50' : 'bg-red-50',
            subtitle: currentFiscalData.ifi.exonere ? 'Exonéré' : 'Assujetti'
          },
          {
            label: 'Plus-values',
            value: currentFiscalData.plusValues.imposition,
            icon: TrendingUp,
            color: getTaxColor(currentFiscalData.plusValues.imposition),
            bgColor: currentFiscalData.plusValues.imposition === 0 ? 'bg-green-50' : 'bg-orange-50',
            subtitle: `${formatCurrency(currentFiscalData.plusValues.totale)} total`
          },
          {
            label: 'Revenus',
            value: currentFiscalData.revenus.total,
            icon: DollarSign,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            subtitle: 'Annuel'
          },
          {
            label: 'Impôt total',
            value: currentFiscalData.impotTotal,
            icon: Calculator,
            color: getTaxColor(currentFiscalData.impotTotal),
            bgColor: currentFiscalData.impotTotal === 0 ? 'bg-green-50' : 'bg-red-50',
            subtitle: 'Tous impôts confondus'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="modern-card p-6 slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} transition-smooth`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stat.value)}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Détails IFI */}
      <div className="modern-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Impôt sur la Fortune Immobilière (IFI)</h3>
          {currentFiscalData.ifi.exonere ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1" />
              Exonéré
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Assujetti
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Valeur imposable</p>
            <p className="text-xl font-semibold text-gray-900">{formatCurrency(currentFiscalData.ifi.valeurImposable)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Seuil d'exonération</p>
            <p className="text-xl font-semibold text-gray-900">{formatCurrency(currentFiscalData.ifi.seuil)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Montant IFI</p>
            <p className={`text-xl font-semibold ${currentFiscalData.ifi.exonere ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(currentFiscalData.ifi.montantImpot)}
            </p>
          </div>
        </div>
      </div>

      {/* Détails Plus-values */}
      <div className="modern-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Plus-values</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Immobilières</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plus-value</span>
                <span className="font-semibold">{formatCurrency(currentFiscalData.plusValues.immobiliere)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Seuil d'exonération</span>
                <span className="text-sm">15 000€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Imposition</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(currentFiscalData.plusValues.imposition)}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Mobilières</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plus-value</span>
                <span className="font-semibold">{formatCurrency(currentFiscalData.plusValues.mobiliere)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Seuil d'exonération</span>
                <span className="text-sm">5 000€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Imposition (Flat Tax)</span>
                <span className="font-semibold text-orange-600">30%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenus et déductions */}
      {showDetails && (
        <>
          <div className="modern-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenus</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Fonciers</h4>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(currentFiscalData.revenus.fonciers)}</p>
                <p className="text-sm text-gray-500">Revenus locatifs annuels</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Mobiliers</h4>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(currentFiscalData.revenus.mobiliers)}</p>
                <p className="text-sm text-gray-500">Dividendes et intérêts</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Autres</h4>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(currentFiscalData.revenus.autres)}</p>
                <p className="text-sm text-gray-500">Intérêts épargne</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total revenus</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(currentFiscalData.revenus.total)}</span>
              </div>
            </div>
          </div>

          <div className="modern-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Déductions et charges</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Charges déductibles</h4>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(currentFiscalData.deductions.charges)}</p>
                <p className="text-sm text-gray-500">Charges immobilières</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Abattements</h4>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(currentFiscalData.deductions.abattements)}</p>
                <p className="text-sm text-gray-500">Abattements fiscaux</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total déductions</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(currentFiscalData.deductions.total)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Optimisations fiscales */}
      {optimizations.length > 0 && (
        <div className="modern-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Suggestions d'optimisation</h3>
          </div>
          
          <div className="space-y-3">
            {optimizations.map((optimization, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">{optimization}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique des calculs */}
      {data.calculsFiscaux.length > 0 && (
        <div className="modern-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Historique des calculs</h3>
          
          <div className="space-y-4">
            {data.calculsFiscaux
              .sort((a, b) => b.annee - a.annee)
              .map((calcul) => (
                <div key={calcul.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">Année {calcul.annee}</h4>
                    <p className="text-sm text-gray-600">
                      Calculé le {new Date(calcul.dateCalcul).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(calcul.impotTotal)}</p>
                    <p className="text-sm text-gray-600">Impôt total</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <button className="btn-secondary">
          <Download className="w-4 h-4 mr-2" />
          Exporter le rapport
        </button>
        <button className="btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Recalculer
        </button>
      </div>
    </div>
  );
}; 