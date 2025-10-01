import React, { useMemo, useState } from 'react';
import { Upload, CheckCircle2, XCircle, FileSpreadsheet, Link as LinkIcon } from 'lucide-react';
import { usePatrimoine } from '../hooks/usePatrimoine';
import { parseCSV, buildComptesFromCsv, buildPlacementsFromCsv } from '../utils/csvImport';

type ImportKind = 'bank' | 'broker';

export const ConnectionsPage: React.FC = () => {
  const {
    addCompte,
    addPlacement
  } = usePatrimoine();

  const [selectedKind, setSelectedKind] = useState<ImportKind>('bank');
  const [fileName, setFileName] = useState<string>('');
  const [rows, setRows] = useState<string[][]>([]);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const preview = useMemo(() => rows.slice(0, 6), [rows]);

  const handleFile = async (file: File) => {
    setError('');
    setSuccessMsg('');
    setFileName(file.name);
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setError('Fichier vide.');
        setRows([]);
        return;
      }
      setRows(parsed);
    } catch (e: any) {
      setError(e?.message || 'Erreur lors de la lecture du fichier.');
      setRows([]);
    }
  };

  const handleImport = () => {
    setError('');
    setSuccessMsg('');
    if (rows.length === 0) {
      setError('Aucun contenu à importer.');
      return;
    }
    try {
      const header = rows[0].map(h => h.trim().toLowerCase());
      if (selectedKind === 'bank') {
        const comptes = buildComptesFromCsv(rows);
        comptes.forEach(c => addCompte({
          nomCompte: c.nomCompte,
          type: c.type,
          banque: c.banque,
          soldeActuel: c.soldeActuel,
          derniereMiseAJour: c.derniereMiseAJour,
          notes: c.notes || ''
        }));
        setSuccessMsg(`${comptes.length} compte(s) importé(s).`);
      } else {
        const placements = buildPlacementsFromCsv(rows);
        placements.forEach(p => addPlacement({
          nom: p.nom,
          type: p.type,
          dateAchat: p.dateAchat,
          montantInvesti: p.montantInvesti,
          valorisationActuelle: p.valorisationActuelle,
          revenusGeneres: p.revenusGeneres || 0,
          notes: p.notes || ''
        }));
        setSuccessMsg(`${placements.length} placement(s) importé(s).`);
      }
      setRows([]);
      setFileName('');
    } catch (e: any) {
      setError(e?.message || 'Import impossible. Vérifiez le format du fichier.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="modern-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <LinkIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Connexions (CSV)</h2>
        </div>
        <p className="text-gray-600 text-sm mb-2">
          Pour un usage personnel et entre amis, vous pouvez lier vos comptes via des fichiers CSV exportés de votre banque ou broker.
        </p>
        <p className="text-gray-600 text-sm">
          Formats supportés:
        </p>
        <ul className="list-disc ml-6 text-sm text-gray-700 mt-1">
          <li><b>Banque</b>: en-têtes requis — <code>nomCompte,banque,type,soldeActuel,derniereMiseAJour,notes</code></li>
          <li><b>Broker</b>: en-têtes requis — <code>nom,type,dateAchat,montantInvesti,valorisationActuelle,revenusGeneres,notes</code></li>
        </ul>
      </div>

      <div className="modern-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileSpreadsheet className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Importer un fichier CSV</h3>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="inline-flex rounded-lg bg-gray-100 p-1 w-fit">
            <button
              onClick={() => setSelectedKind('bank')}
              className={`px-4 py-2 text-sm rounded-md ${selectedKind === 'bank' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
            >Banque</button>
            <button
              onClick={() => setSelectedKind('broker')}
              className={`px-4 py-2 text-sm rounded-md ${selectedKind === 'broker' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
            >Broker</button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors w-fit">
            <Upload className="w-4 h-4" />
            <span>Choisir un fichier</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>

          {fileName && (
            <span className="text-sm text-gray-700">{fileName}</span>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">{successMsg}</span>
          </div>
        )}

        {rows.length > 0 && (
          <div className="mt-2">
            <div className="text-sm text-gray-600 mb-2">Aperçu (6 premières lignes):</div>
            <div className="overflow-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {preview[0]?.map((h, i) => (
                      <th key={i} className="text-left px-3 py-2 font-semibold text-gray-800">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(1).map((r, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-gray-50">
                      {r.map((c, j) => (
                        <td key={j} className="px-3 py-2 text-gray-700">{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={handleImport} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">Importer</button>
              <button onClick={() => { setRows([]); setFileName(''); setError(''); setSuccessMsg(''); }} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors">Annuler</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



