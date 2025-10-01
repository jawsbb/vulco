import React from 'react';
import { X, Download, FileText, Database } from 'lucide-react';
import { PatrimoineData } from '../types';
import { exportToJSON, exportToCSV, generateSummaryReport } from '../utils/exportData';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PatrimoineData;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const handleExportJSON = () => {
    exportToJSON(data);
    onClose();
  };

  const handleExportCSV = () => {
    exportToCSV(data);
    onClose();
  };

  const handleExportReport = () => {
    const report = generateSummaryReport(data);
    const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(report);
    const exportFileDefaultName = `rapport-patrimoine-${new Date().toISOString().split('T')[0]}.txt`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Exporter vos données</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600 mb-6">
            Choisissez le format d'export qui vous convient le mieux :
          </div>
          
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Données complètes (JSON)</div>
              <div className="text-sm text-gray-600">Format technique pour sauvegarde ou migration</div>
            </div>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Tableur (CSV)</div>
              <div className="text-sm text-gray-600">Compatible Excel, Google Sheets, etc.</div>
            </div>
          </button>
          
          <button
            onClick={handleExportReport}
            className="w-full flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Rapport de synthèse</div>
              <div className="text-sm text-gray-600">Résumé lisible de votre patrimoine</div>
            </div>
          </button>
        </div>
        
        <div className="p-6 border-t bg-gray-50 rounded-b-xl">
          <div className="text-xs text-gray-500 text-center">
            Vos données restent privées et ne sont jamais envoyées sur internet
          </div>
        </div>
      </div>
    </div>
  );
}; 