import React, { useState } from 'react';
import { Input } from './components/Input';
import { ResultsTable } from './components/ResultsTable';
import { searchLeads } from './services/geminiService';
import { SearchCriteria, SearchResult } from './types';

// Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function App() {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    niche: '',
    country: 'Brasil',
    areaCode: '',
    quantity: 10
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCriteria(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!criteria.niche) {
      setError('Por favor, informe um nicho de mercado.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await searchLeads(criteria);
      setResult(data);
    } catch (err) {
      setError('Falha ao buscar dados. Verifique sua chave API ou tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    if (!result || result.leads.length === 0) return;

    const headers = ['Nome,Telefone,Endereço,Website'];
    const rows = result.leads.map(lead => 
      `"${lead.name}","${lead.phone}","${lead.address}","${lead.website}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_${criteria.niche.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-4">
            LeadHunter Pro
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Busque números e contatos comerciais em tempo real utilizando Inteligência Artificial conectada ao Google Search.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            
            <div className="md:col-span-4">
              <Input
                label="Nicho de Mercado"
                name="niche"
                placeholder="Ex: Restaurantes, Dentistas, Imobiliárias..."
                value={criteria.niche}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="md:col-span-3">
              <Input
                label="País"
                name="country"
                placeholder="Ex: Brasil, Portugal"
                value={criteria.country}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="DDD / Código Área"
                name="areaCode"
                placeholder="Ex: 11, 21 (Opcional)"
                value={criteria.areaCode}
                onChange={handleInputChange}
              />
            </div>

            <div className="md:col-span-1">
               <Input
                label="Qtd."
                name="quantity"
                type="number"
                min={1}
                max={30}
                value={criteria.quantity}
                onChange={handleInputChange}
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 focus:ring-4 focus:ring-blue-900 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? <LoadingSpinner /> : <SearchIcon />}
                {isLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Resultados Encontrados
                <span className="bg-slate-800 text-blue-400 text-xs font-mono py-1 px-2 rounded-full border border-slate-700">
                  {result.leads.length} leads
                </span>
              </h2>
              
              <button
                onClick={exportCSV}
                disabled={result.leads.length === 0}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DownloadIcon />
                Exportar CSV
              </button>
            </div>

            <ResultsTable leads={result.leads} />

            {/* Sources Footnote */}
            {result.sourceUrls.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Fontes Pesquisadas:</p>
                <div className="flex flex-wrap gap-2">
                  {result.sourceUrls.slice(0, 5).map((url, idx) => (
                    <a 
                      key={idx} 
                      href={url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-blue-500/60 hover:text-blue-400 truncate max-w-[200px] hover:underline"
                    >
                      {new URL(url).hostname}
                    </a>
                  ))}
                  {result.sourceUrls.length > 5 && (
                    <span className="text-xs text-slate-600">e mais {result.sourceUrls.length - 5}...</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
