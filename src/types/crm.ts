export interface PortfolioItem {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  longName: string;
  change30d?: number;
  change60d?: number;
  
  // CRM Macro/Micro Allocations
  macroCategory?: 'Renda Fixa' | 'Renda Variável';
  location?: 'Brasil' | 'Exterior';
  microCategory?: string; // 'Segurança', 'Dividendo', 'Crescimento', 'High Yield', etc.
}

export interface Client {
  id: string;
  name: string;
  strategy: string;
  assetLocation: string;
  portfolio: PortfolioItem[];
  created_at?: string;
}
