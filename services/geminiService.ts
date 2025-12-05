import { GoogleGenAI } from "@google/genai";
import { SearchCriteria, SearchResult, Lead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchLeads = async (criteria: SearchCriteria): Promise<SearchResult> => {
  const { niche, country, areaCode, quantity } = criteria;
  
  const locationString = areaCode ? `${country} (DDD/Área ${areaCode})` : country;

  const prompt = `
    Atue como um especialista em prospecção de leads (Lead Generation Specialist).
    
    Tarefa: Encontre ${quantity} contatos comerciais REAIS e públicos para o nicho "${niche}" na localização: "${locationString}".
    
    Regras Críticas:
    1. Use a ferramenta Google Search para encontrar dados reais. Não invente números.
    2. Priorize empresas que tenham telefone listado publicamente.
    3. Formate a saída ESTRITAMENTE como uma Tabela Markdown.
    4. As colunas da tabela devem ser: "Nome", "Telefone", "Endereço/Região", "Website" (se houver, senão coloque N/A).
    5. Não adicione texto introdutório ou conclusivo antes ou depois da tabela. Apenas a tabela.
    6. Se encontrar menos que ${quantity}, liste todos que encontrar.

    Exemplo de formato de saída esperado:
    | Nome | Telefone | Endereço/Região | Website |
    | Empresa X | (11) 9999-9999 | Rua Tal, SP | www.exemplo.com |
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are NOT allowed with googleSearch
      },
    });

    const text = response.text || "";
    
    // Handle potential type inference issues with groundingChunks
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceUrls: string[] = chunks
      .map((c: any) => c.web?.uri)
      .filter((uri: any): uri is string => typeof uri === "string");

    const leads = parseMarkdownTableToLeads(text);

    return {
      leads,
      rawText: text,
      sourceUrls: [...new Set(sourceUrls)], // remove duplicates
    };

  } catch (error) {
    console.error("Erro na busca Gemini:", error);
    throw error;
  }
};

// Helper to parse the markdown table string into objects
const parseMarkdownTableToLeads = (markdown: string): Lead[] => {
  const lines = markdown.split('\n').filter(line => line.trim() !== '');
  const leads: Lead[] = [];
  
  // Find the separator line (usually |---|---|...)
  const separatorIndex = lines.findIndex(line => line.includes('---'));
  
  if (separatorIndex === -1) return [];

  // Data starts after the separator
  for (let i = separatorIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes('|')) continue;

    const cols = line.split('|').map(c => c.trim()).filter(c => c !== '');
    
    // Check if we have enough columns (expecting 4 based on prompt)
    if (cols.length >= 3) {
      leads.push({
        id: crypto.randomUUID(),
        name: cols[0] || 'Desconhecido',
        phone: cols[1] || 'N/A',
        address: cols[2] || 'N/A',
        website: cols[3] || 'N/A'
      });
    }
  }

  return leads;
};