export interface SearchCriteria {
  niche: string;
  country: string;
  areaCode: string;
  quantity: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  address: string;
  website?: string;
}

export interface SearchResult {
  leads: Lead[];
  rawText: string;
  sourceUrls: string[];
}
