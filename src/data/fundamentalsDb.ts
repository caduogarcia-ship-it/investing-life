export interface QuarterlyFundamentals {
  symbol: string;
  lpa: number; // Lucro por Ação
  vpa: number; // Valor Patrimonial por Ação
  margemLiquida: number; // Margem Líquida (%)
  roe: number; // ROE (%)
  dy: number; // Dividend Yield (%)
  pl?: number; // P/L (geralmente calculado com a cotação, mas pode ser travado)
  pvp?: number; // P/VP (geralmente calculado com a cotação)
  lastUpdated: string;
}

// Banco de dados base "Embutido" no código (como um seed)
// Esses são dados reais do 1T24 ou 4T23 para as principais empresas para servir de fallback.
const BASE_FUNDAMENTALS: Record<string, QuarterlyFundamentals> = {
  'PETR4': { symbol: 'PETR4', lpa: 2.85, vpa: 28.50, margemLiquida: 24.5, roe: 35.0, dy: 18.5, lastUpdated: '2024-05-15' },
  'VALE3': { symbol: 'VALE3', lpa: 8.50, vpa: 85.00, margemLiquida: 30.0, roe: 18.5, dy: 12.0, lastUpdated: '2024-05-15' },
  'ITUB4': { symbol: 'ITUB4', lpa: 3.50, vpa: 17.50, margemLiquida: 18.0, roe: 21.0, dy: 6.5, lastUpdated: '2024-05-15' },
  'BBAS3': { symbol: 'BBAS3', lpa: 11.50, vpa: 58.50, margemLiquida: 15.0, roe: 20.5, dy: 9.5, lastUpdated: '2024-05-15' },
  'WEGE3': { symbol: 'WEGE3', lpa: 1.20, vpa: 4.50, margemLiquida: 16.5, roe: 28.0, dy: 2.0, lastUpdated: '2024-05-15' },
  'ELET3': { symbol: 'ELET3', lpa: 2.10, vpa: 48.00, margemLiquida: 12.0, roe: 4.5, dy: 1.5, lastUpdated: '2024-05-15' },
  'BBDC4': { symbol: 'BBDC4', lpa: 1.50, vpa: 14.80, margemLiquida: 10.0, roe: 10.5, dy: 7.0, lastUpdated: '2024-05-15' },
  'RENT3': { symbol: 'RENT3', lpa: 2.20, vpa: 22.00, margemLiquida: 8.5, roe: 11.0, dy: 3.5, lastUpdated: '2024-05-15' },
  'SUZB3': { symbol: 'SUZB3', lpa: 18.50, vpa: 35.00, margemLiquida: 35.0, roe: 45.0, dy: 5.5, lastUpdated: '2024-05-15' },
  'RADL3': { symbol: 'RADL3', lpa: 0.60, vpa: 3.20, margemLiquida: 4.0, roe: 16.0, dy: 1.2, lastUpdated: '2024-05-15' }
};

const DB_KEY = 'crm_fundamentals_db';

// Retorna o banco de dados mesclado (Base Fixa + Edições do Usuário)
export function getFundamentalsDb(): Record<string, QuarterlyFundamentals> {
  let userDb: Record<string, QuarterlyFundamentals> = {};
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      userDb = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Erro ao ler DB de fundamentos:', e);
  }

  // O DB do usuário sobrescreve a base fixa
  return { ...BASE_FUNDAMENTALS, ...userDb };
}

// Salva ou atualiza os dados trimestrais de um ativo
export function saveFundamentalData(symbol: string, data: Partial<QuarterlyFundamentals>) {
  const cleanSymbol = symbol.toUpperCase().trim();
  const db = getFundamentalsDb();
  
  const existing = db[cleanSymbol] || { 
    symbol: cleanSymbol, 
    lpa: 0, vpa: 0, margemLiquida: 0, roe: 0, dy: 0, 
    lastUpdated: new Date().toISOString().split('T')[0] 
  };

  db[cleanSymbol] = {
    ...existing,
    ...data,
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  try {
    // Salva apenas as edições feitas pelo usuário no LocalStorage para não duplicar a base
    let userDb: Record<string, QuarterlyFundamentals> = {};
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      userDb = JSON.parse(raw);
    }
    userDb[cleanSymbol] = db[cleanSymbol];
    localStorage.setItem(DB_KEY, JSON.stringify(userDb));
  } catch (e) {
    console.warn('Erro ao salvar DB de fundamentos:', e);
  }
}

// Retorna os fundamentos para um ticker específico
export function getFundamentalForTicker(symbol: string): QuarterlyFundamentals | null {
  const cleanSymbol = symbol.toUpperCase().trim();
  const db = getFundamentalsDb();
  return db[cleanSymbol] || null;
}
