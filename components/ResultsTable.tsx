import React from 'react';
import { Lead } from '../types';

interface ResultsTableProps {
  leads: Lead[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ leads }) => {
  if (leads.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-800/50 rounded-lg border border-slate-700 border-dashed">
        <p>Nenhum dado estruturado encontrado. Tente refinar a busca.</p>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-slate-700 custom-scrollbar">
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="text-xs text-slate-200 uppercase bg-slate-800">
          <tr>
            <th scope="col" className="px-6 py-3">Nome</th>
            <th scope="col" className="px-6 py-3">Telefone</th>
            <th scope="col" className="px-6 py-3">Localização</th>
            <th scope="col" className="px-6 py-3">Website</th>
            <th scope="col" className="px-6 py-3 text-right">Ação</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="bg-slate-900 border-b border-slate-700 hover:bg-slate-800 transition-colors">
              <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                {lead.name}
              </th>
              <td className="px-6 py-4 text-blue-300 font-mono">
                {lead.phone}
              </td>
              <td className="px-6 py-4">
                {lead.address}
              </td>
              <td className="px-6 py-4 text-blue-400 underline truncate max-w-[200px]">
                {lead.website !== 'N/A' && (
                    <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer">
                        {lead.website}
                    </a>
                )}
                {lead.website === 'N/A' && <span className="text-slate-500">N/A</span>}
              </td>
              <td className="px-6 py-4 text-right">
                 <button 
                   onClick={() => copyToClipboard(`${lead.name}\t${lead.phone}\t${lead.address}`)}
                   className="font-medium text-blue-500 hover:underline hover:text-blue-400"
                 >
                   Copiar
                 </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
