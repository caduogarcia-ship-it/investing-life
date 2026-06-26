export interface RankedStock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  dy: number;           // Dividend Yield %
  ebitdaVP: number;     // EBITDA / Valor Patrimonial ratio
  revenueGrowth: number; // Revenue growth % YoY
  marketCap: number;    // in BRL billions
  analystBuys?: number; // count of BUY recommendations (B3 stocks)
  isIntl?: boolean;     // is it an international fund / ETF / BDR
  intlBuys?: number;    // count of BUY recommendations (international funds)
  roe?: number;         // Return on Equity %
  pl?: number;          // P/L ratio (Price/Earnings)
  margemLiquida?: number; // Margem Líquida %
  netDebtEbitda?: number; // Dívida Líquida / EBITDA ratio
}

export const RANKED_STOCKS: RankedStock[] = [
  // Bancos (12)
  { symbol: "ITUB4", name: "Itaú Unibanco", sector: "Bancos", price: 34.50, dy: 6.80, ebitdaVP: 1.45, revenueGrowth: 8.5, marketCap: 310.2, analystBuys: 22, roe: 18.4, pl: 7.8, margemLiquida: 22.5, netDebtEbitda: 0.8 },
  { symbol: "BBAS3", name: "Banco do Brasil", sector: "Bancos", price: 27.80, dy: 9.50, ebitdaVP: 1.10, revenueGrowth: 11.2, marketCap: 158.4, analystBuys: 19, roe: 20.8, pl: 5.2, margemLiquida: 24.1, netDebtEbitda: 0.6 },
  { symbol: "BBDC4", name: "Bradesco", sector: "Bancos", price: 13.90, dy: 5.20, ebitdaVP: 0.95, revenueGrowth: 4.8, marketCap: 148.5, analystBuys: 8, roe: 14.5, pl: 9.8, margemLiquida: 17.2, netDebtEbitda: 1.2 },
  { symbol: "SANB11", name: "Santander Brasil", sector: "Bancos", price: 29.10, dy: 7.10, ebitdaVP: 1.05, revenueGrowth: 6.2, marketCap: 109.8, analystBuys: 6, roe: 21.1, pl: 10.9, margemLiquida: 25.5, netDebtEbitda: 0.8 },
  { symbol: "BPAC11", name: "BTG Pactual", sector: "Bancos", price: 36.20, dy: 4.10, ebitdaVP: 1.85, revenueGrowth: 18.4, marketCap: 135.6, analystBuys: 15, roe: 22.1, pl: 10.2, margemLiquida: 26.8, netDebtEbitda: 0.4 },
  { symbol: "ABCB4", name: "ABC Brasil", sector: "Bancos", price: 22.40, dy: 8.20, ebitdaVP: 0.90, revenueGrowth: 7.9, marketCap: 5.1, analystBuys: 11, roe: 21.6, pl: 6, margemLiquida: 22.2, netDebtEbitda: 1.7 },
  { symbol: "BRSR6", name: "Banrisul", sector: "Bancos", price: 12.10, dy: 8.80, ebitdaVP: 0.75, revenueGrowth: 5.1, marketCap: 4.9, analystBuys: 4, roe: 14.8, pl: 6.5, margemLiquida: 16.4, netDebtEbitda: 1.7 },
  { symbol: "BMGB4", name: "Banco BMG", sector: "Bancos", price: 3.20, dy: 9.10, ebitdaVP: 0.60, revenueGrowth: 3.8, marketCap: 1.9, analystBuys: 3, roe: 17.6, pl: 5.4, margemLiquida: 16.7, netDebtEbitda: 1.9 },
  { symbol: "B3SA3", name: "B3 S.A.", sector: "Bancos", price: 11.80, dy: 4.80, ebitdaVP: 2.10, revenueGrowth: 6.5, marketCap: 66.8, analystBuys: 12, roe: 19.6, pl: 15.8, margemLiquida: 42.5, netDebtEbitda: 1.4 },
  { symbol: "ITSA4", name: "Itaúsa", sector: "Bancos", price: 10.10, dy: 7.40, ebitdaVP: 1.15, revenueGrowth: 7.2, marketCap: 104.2, analystBuys: 16, roe: 17.2, pl: 7.4, margemLiquida: 20.8, netDebtEbitda: 0.7 },
  { symbol: "WIZC3", name: "Wiz Co", sector: "Bancos", price: 6.40, dy: 9.80, ebitdaVP: 1.25, revenueGrowth: 8.9, marketCap: 1.0, analystBuys: 5, roe: 17.1, pl: 9.3, margemLiquida: 24.4, netDebtEbitda: 1.6 },
  { symbol: "CIEL3", name: "Cielo", sector: "Bancos", price: 5.60, dy: 6.10, ebitdaVP: 0.80, revenueGrowth: -2.5, marketCap: 15.2, analystBuys: 2, roe: 20.6, pl: 10.4, margemLiquida: 17.3, netDebtEbitda: 1.8 },

  // Petróleo & Gás (8)
  { symbol: "PETR4", name: "Petrobras PN", sector: "Petróleo & Gás", price: 38.50, dy: 16.40, ebitdaVP: 2.45, revenueGrowth: 9.8, marketCap: 502.4, analystBuys: 18, roe: 28.4, pl: 4.8, margemLiquida: 22.1, netDebtEbitda: 1.1 },
  { symbol: "PETR3", name: "Petrobras ON", sector: "Petróleo & Gás", price: 41.20, dy: 16.10, ebitdaVP: 2.50, revenueGrowth: 9.5, marketCap: 502.4, analystBuys: 17, roe: 28.4, pl: 4.9, margemLiquida: 22, netDebtEbitda: 1.1 },
  { symbol: "PRIO3", name: "PetroRio", sector: "Petróleo & Gás", price: 46.80, dy: 0.80, ebitdaVP: 3.80, revenueGrowth: 32.4, marketCap: 41.5, analystBuys: 24, roe: 26.5, pl: 6.8, margemLiquida: 28.4, netDebtEbitda: 1.2 },
  { symbol: "RECV3", name: "PetroRecôncavo", sector: "Petróleo & Gás", price: 19.50, dy: 7.80, ebitdaVP: 2.10, revenueGrowth: 14.5, marketCap: 5.7, analystBuys: 14, roe: 23.4, pl: 9.3, margemLiquida: 17.3, netDebtEbitda: 0.7 },
  { symbol: "CSAN3", name: "Cosan", sector: "Petróleo & Gás", price: 14.20, dy: 3.50, ebitdaVP: 1.20, revenueGrowth: 11.8, marketCap: 26.6, analystBuys: 16, roe: 27.1, pl: 4.6, margemLiquida: 23.5, netDebtEbitda: 2.6 },
  { symbol: "UGPA3", name: "Ultrapar", sector: "Petróleo & Gás", price: 25.60, dy: 4.20, ebitdaVP: 1.40, revenueGrowth: 6.8, marketCap: 28.5, analystBuys: 13, roe: 28.6, pl: 6.8, margemLiquida: 22.1, netDebtEbitda: 1.9 },
  { symbol: "VBBR3", name: "Vibra Energia", sector: "Petróleo & Gás", price: 24.10, dy: 5.60, ebitdaVP: 1.65, revenueGrowth: 8.2, marketCap: 28.1, analystBuys: 15, roe: 20.3, pl: 5.3, margemLiquida: 18.2, netDebtEbitda: 2.1 },
  { symbol: "RAIZ4", name: "Raízen", sector: "Petróleo & Gás", price: 3.40, dy: 6.20, ebitdaVP: 0.95, revenueGrowth: 5.4, marketCap: 35.1, analystBuys: 10, roe: 20.7, pl: 9.4, margemLiquida: 20.7, netDebtEbitda: 1.3 },

  // Energia Elétrica (10)
  { symbol: "ELET3", name: "Eletrobras ON", sector: "Energia Elétrica", price: 39.80, dy: 3.20, ebitdaVP: 0.85, revenueGrowth: 6.1, marketCap: 91.6, analystBuys: 20, roe: 11.8, pl: 8.2, margemLiquida: 18.5, netDebtEbitda: 2.8 },
  { symbol: "ELET6", name: "Eletrobras PNB", sector: "Energia Elétrica", price: 44.10, dy: 3.50, ebitdaVP: 0.90, revenueGrowth: 5.9, marketCap: 91.6, analystBuys: 19, roe: 11.8, pl: 8.4, margemLiquida: 18.5, netDebtEbitda: 2.8 },
  { symbol: "CPFE3", name: "CPFL Energia", sector: "Energia Elétrica", price: 33.90, dy: 9.80, ebitdaVP: 1.35, revenueGrowth: 7.2, marketCap: 39.1, analystBuys: 11, roe: 17.2, pl: 7.6, margemLiquida: 14.8, netDebtEbitda: 2.2 },
  { symbol: "CMIG4", name: "Cemig", sector: "Energia Elétrica", price: 11.20, dy: 8.70, ebitdaVP: 1.10, revenueGrowth: 8.4, marketCap: 24.6, analystBuys: 13, roe: 11, pl: 11.9, margemLiquida: 18.5, netDebtEbitda: 2.2 },
  { symbol: "CPLE6", name: "Copel", sector: "Energia Elétrica", price: 9.40, dy: 7.50, ebitdaVP: 0.80, revenueGrowth: 6.5, marketCap: 26.8, analystBuys: 15, roe: 10.8, pl: 8.8, margemLiquida: 20.6, netDebtEbitda: 3.4 },
  { symbol: "EGIE3", name: "Engie Brasil", sector: "Energia Elétrica", price: 42.60, dy: 8.10, ebitdaVP: 1.50, revenueGrowth: 4.8, marketCap: 34.8, analystBuys: 14, roe: 12, pl: 7.2, margemLiquida: 23.2, netDebtEbitda: 2.1 },
  { symbol: "TAEE11", name: "Taesa", sector: "Energia Elétrica", price: 34.90, dy: 10.40, ebitdaVP: 1.05, revenueGrowth: 3.5, marketCap: 12.0, analystBuys: 5, roe: 17.5, pl: 13.8, margemLiquida: 19.4, netDebtEbitda: 2.1 },
  { symbol: "TRPL4", name: "Transmissão Paulista", sector: "Energia Elétrica", price: 25.10, dy: 9.20, ebitdaVP: 1.15, revenueGrowth: 5.2, marketCap: 16.5, analystBuys: 12, roe: 14.4, pl: 13.1, margemLiquida: 26.2, netDebtEbitda: 3.1 },
  { symbol: "ENGI11", name: "Energisa", sector: "Energia Elétrica", price: 45.30, dy: 6.40, ebitdaVP: 1.25, revenueGrowth: 11.5, marketCap: 18.2, analystBuys: 17, roe: 15.2, pl: 7.9, margemLiquida: 13.8, netDebtEbitda: 1.6 },
  { symbol: "NEOE3", name: "Neoenergia", sector: "Energia Elétrica", price: 20.20, dy: 6.80, ebitdaVP: 0.95, revenueGrowth: 9.1, marketCap: 24.5, analystBuys: 13, roe: 14.3, pl: 11.6, margemLiquida: 21.7, netDebtEbitda: 3.3 },

  // Mineração & Siderurgia (6)
  { symbol: "VALE3", name: "Vale", sector: "Mineração & Siderurgia", price: 61.80, dy: 11.20, ebitdaVP: 2.10, revenueGrowth: -3.2, marketCap: 278.4, analystBuys: 21, roe: 25.2, pl: 5.8, margemLiquida: 18.6, netDebtEbitda: 0.5 },
  { symbol: "CSNA3", name: "CSN", sector: "Mineração & Siderurgia", price: 14.80, dy: 7.40, ebitdaVP: 1.60, revenueGrowth: 2.5, marketCap: 19.6, analystBuys: 8, roe: 12.1, pl: 10.9, margemLiquida: 14.7, netDebtEbitda: 1.9 },
  { symbol: "GGBR4", name: "Gerdau", sector: "Mineração & Siderurgia", price: 18.90, dy: 6.50, ebitdaVP: 1.30, revenueGrowth: -1.8, marketCap: 32.4, analystBuys: 15, roe: 12.8, pl: 8.3, margemLiquida: 16.4, netDebtEbitda: 1.1 },
  { symbol: "GOAU4", name: "Metalúrgica Gerdau", sector: "Mineração & Siderurgia", price: 10.20, dy: 8.90, ebitdaVP: 1.20, revenueGrowth: -2.0, marketCap: 10.9, analystBuys: 12, roe: 15.8, pl: 10.3, margemLiquida: 9, netDebtEbitda: 1.7 },
  { symbol: "USIM5", name: "Usiminas", sector: "Mineração & Siderurgia", price: 7.20, dy: 4.50, ebitdaVP: 0.70, revenueGrowth: -5.4, marketCap: 9.2, analystBuys: 6, roe: 14.6, pl: 11.5, margemLiquida: 8.3, netDebtEbitda: 0.6 },
  { symbol: "CMIN3", name: "CSN Mineração", sector: "Mineração & Siderurgia", price: 5.40, dy: 12.50, ebitdaVP: 2.80, revenueGrowth: 8.6, marketCap: 29.6, analystBuys: 10, roe: 14.6, pl: 9.8, margemLiquida: 10.6, netDebtEbitda: 1.7 },

  // Seguros & Financeiras (5)
  { symbol: "BBSE3", name: "BB Seguridade", sector: "Seguros & Financeiras", price: 33.10, dy: 9.60, ebitdaVP: 1.90, revenueGrowth: 10.2, marketCap: 66.2, analystBuys: 18, roe: 18.5, pl: 8.4, margemLiquida: 16.2, netDebtEbitda: 0.2 },
  { symbol: "CXSE3", name: "Caixa Seguridade", sector: "Seguros & Financeiras", price: 14.20, dy: 8.80, ebitdaVP: 1.70, revenueGrowth: 12.8, marketCap: 42.6, analystBuys: 16, roe: 16, pl: 13.1, margemLiquida: 15.4, netDebtEbitda: 0.4 },
  { symbol: "PSSA3", name: "Porto Seguro", sector: "Seguros & Financeiras", price: 29.50, dy: 6.20, ebitdaVP: 1.40, revenueGrowth: 14.1, marketCap: 19.0, analystBuys: 14, roe: 17.3, pl: 11.8, margemLiquida: 16.4, netDebtEbitda: 1.2 },
  { symbol: "SULA11", name: "SulAmérica", sector: "Seguros & Financeiras", price: 18.20, dy: 4.80, ebitdaVP: 0.90, revenueGrowth: 8.5, marketCap: 7.2, analystBuys: 9, roe: 16.4, pl: 9.1, margemLiquida: 17.9, netDebtEbitda: 0.4 },
  { symbol: "IRBR3", name: "IRB Brasil Re", sector: "Seguros & Financeiras", price: 38.60, dy: 0.00, ebitdaVP: 0.45, revenueGrowth: 1.2, marketCap: 3.1, analystBuys: 2, roe: 15.8, pl: 8.9, margemLiquida: 18, netDebtEbitda: 1.3 },

  // Construção (7)
  { symbol: "CURY3", name: "Cury Construtora", sector: "Construção", price: 18.40, dy: 8.20, ebitdaVP: 3.10, revenueGrowth: 24.5, marketCap: 5.4, analystBuys: 16, roe: 18.6, pl: 8.2, margemLiquida: 15.4, netDebtEbitda: 0.8 },
  { symbol: "TEND3", name: "Tenda", sector: "Construção", price: 11.50, dy: 0.00, ebitdaVP: 0.85, revenueGrowth: 15.6, marketCap: 1.3, analystBuys: 8, roe: 18.3, pl: 9.2, margemLiquida: 14.8, netDebtEbitda: 1.4 },
  { symbol: "MRVE3", name: "MRV Engenharia", sector: "Construção", price: 7.40, dy: 1.50, ebitdaVP: 0.65, revenueGrowth: 9.8, marketCap: 4.1, analystBuys: 9, roe: 15.4, pl: 6.1, margemLiquida: 9.7, netDebtEbitda: 1.7 },
  { symbol: "EZTC3", name: "EZTec", sector: "Construção", price: 14.90, dy: 4.20, ebitdaVP: 0.75, revenueGrowth: -2.1, marketCap: 3.3, analystBuys: 5, roe: 18.4, pl: 10.9, margemLiquida: 11.9, netDebtEbitda: 1 },
  { symbol: "DIRR3", name: "Direcional", sector: "Construção", price: 22.80, dy: 7.60, ebitdaVP: 2.25, revenueGrowth: 21.2, marketCap: 4.0, analystBuys: 15, roe: 9.8, pl: 13.7, margemLiquida: 5.7, netDebtEbitda: 2.3 },
  { symbol: "LAVV3", name: "Lavvi", sector: "Construção", price: 8.10, dy: 6.90, ebitdaVP: 1.45, revenueGrowth: 18.4, marketCap: 1.6, analystBuys: 11, roe: 17.6, pl: 8.5, margemLiquida: 5.1, netDebtEbitda: 3.8 },
  { symbol: "EVEN3", name: "Even", sector: "Construção", price: 6.20, dy: 5.80, ebitdaVP: 0.80, revenueGrowth: 4.5, marketCap: 1.2, analystBuys: 6, roe: 12.3, pl: 10.2, margemLiquida: 15.6, netDebtEbitda: 3.2 },

  // Varejo (8)
  { symbol: "MGLU3", name: "Magazine Luiza", sector: "Varejo", price: 1.95, dy: 0.00, ebitdaVP: 0.55, revenueGrowth: 2.1, marketCap: 13.8, analystBuys: 4, roe: -8.2, pl: -12.5, margemLiquida: -3.8, netDebtEbitda: 4.2 },
  { symbol: "LREN3", name: "Lojas Renner", sector: "Varejo", price: 16.50, dy: 4.10, ebitdaVP: 1.10, revenueGrowth: 5.4, marketCap: 15.8, analystBuys: 12, roe: 12.5, pl: 14.8, margemLiquida: 8.2, netDebtEbitda: 1.5 },
  { symbol: "ARZZ3", name: "Arezzo&Co", sector: "Varejo", price: 54.20, dy: 2.80, ebitdaVP: 1.75, revenueGrowth: 14.8, marketCap: 6.0, analystBuys: 14, roe: 14.8, pl: 18.5, margemLiquida: 9.4, netDebtEbitda: 0.8 },
  { symbol: "PETZ3", name: "Petz", sector: "Varejo", price: 3.80, dy: 1.20, ebitdaVP: 0.60, revenueGrowth: 3.5, marketCap: 1.8, analystBuys: 5, roe: 2.3, pl: 14.6, margemLiquida: 8.1, netDebtEbitda: 2.9 },
  { symbol: "ALPA4", name: "Alpargatas", sector: "Varejo", price: 9.10, dy: 0.80, ebitdaVP: 0.50, revenueGrowth: -6.8, marketCap: 6.1, analystBuys: 3, roe: 4.4, pl: 17.3, margemLiquida: 1.8, netDebtEbitda: 2.2 },
  { symbol: "GRND3", name: "Grendene", sector: "Varejo", price: 6.20, dy: 7.20, ebitdaVP: 0.95, revenueGrowth: 1.5, marketCap: 5.6, analystBuys: 8, roe: -1.4, pl: 11.5, margemLiquida: 6.1, netDebtEbitda: 4.4 },
  { symbol: "SOMA3", name: "Grupo Soma", sector: "Varejo", price: 6.50, dy: 1.40, ebitdaVP: 1.05, revenueGrowth: 8.9, marketCap: 5.1, analystBuys: 11, roe: 8.6, pl: 12, margemLiquida: 1.9, netDebtEbitda: 1.7 },
  { symbol: "VULC3", name: "Vulcabras", sector: "Varejo", price: 18.20, dy: 6.40, ebitdaVP: 1.90, revenueGrowth: 16.2, marketCap: 4.5, analystBuys: 13, roe: -3, pl: 22.7, margemLiquida: 1.5, netDebtEbitda: 2.4 },

  // Alimentos & Bebidas (8)
  { symbol: "ABEV3", name: "Ambev", sector: "Alimentos & Bebidas", price: 12.30, dy: 6.10, ebitdaVP: 1.80, revenueGrowth: 3.4, marketCap: 194.2, analystBuys: 10, roe: 18.4, pl: 14.2, margemLiquida: 16.5, netDebtEbitda: -0.2 },
  { symbol: "JBSS3", name: "JBS", sector: "Alimentos & Bebidas", price: 23.40, dy: 5.50, ebitdaVP: 1.40, revenueGrowth: 8.2, marketCap: 51.9, analystBuys: 21, roe: 15.8, pl: 6.5, margemLiquida: 5.8, netDebtEbitda: 2.4 },
  { symbol: "BRFS3", name: "BRF", sector: "Alimentos & Bebidas", price: 15.60, dy: 0.00, ebitdaVP: 1.15, revenueGrowth: 12.4, marketCap: 26.5, analystBuys: 14, roe: 20.9, pl: 6.5, margemLiquida: 15.6, netDebtEbitda: 1.8 },
  { symbol: "MDIA3", name: "M. Dias Branco", sector: "Alimentos & Bebidas", price: 36.10, dy: 3.80, ebitdaVP: 1.25, revenueGrowth: 6.1, marketCap: 12.2, analystBuys: 11, roe: 20, pl: 9.5, margemLiquida: 16.7, netDebtEbitda: 1.4 },
  { symbol: "SMTO3", name: "São Martinho", sector: "Alimentos & Bebidas", price: 29.80, dy: 5.10, ebitdaVP: 1.35, revenueGrowth: 9.5, marketCap: 10.4, analystBuys: 15, roe: 18.4, pl: 9.4, margemLiquida: 12.9, netDebtEbitda: 1.6 },
  { symbol: "BEEF3", name: "Minerva Foods", sector: "Alimentos & Bebidas", price: 6.90, dy: 6.80, ebitdaVP: 1.60, revenueGrowth: 11.2, marketCap: 4.2, analystBuys: 8, roe: 8.6, pl: 11.1, margemLiquida: 11.6, netDebtEbitda: 3.4 },
  { symbol: "CAML3", name: "Camil Alimentos", sector: "Alimentos & Bebidas", price: 8.40, dy: 5.40, ebitdaVP: 1.10, revenueGrowth: 7.6, marketCap: 3.0, analystBuys: 9, roe: 18.6, pl: 14.8, margemLiquida: 6.7, netDebtEbitda: 2 },
  { symbol: "SLCE3", name: "SLC Agrícola", sector: "Alimentos & Bebidas", price: 18.90, dy: 7.10, ebitdaVP: 1.30, revenueGrowth: 4.2, marketCap: 8.5, analystBuys: 13, roe: 13.5, pl: 13.9, margemLiquida: 11.9, netDebtEbitda: 1.2 },

  // Saúde (7)
  { symbol: "HAPV3", name: "Hapvida", sector: "Saúde", price: 3.90, dy: 0.00, ebitdaVP: 0.85, revenueGrowth: 12.1, marketCap: 29.5, analystBuys: 17, roe: 6.2, pl: 22.5, margemLiquida: 4.8, netDebtEbitda: 2.1 },
  { symbol: "RDOR3", name: "Rede D'Or", sector: "Saúde", price: 27.50, dy: 3.10, ebitdaVP: 2.10, revenueGrowth: 10.8, marketCap: 62.4, analystBuys: 18, roe: 12.4, pl: 28.6, margemLiquida: 8.2, netDebtEbitda: 2.5 },
  { symbol: "FLRY3", name: "Fleury", sector: "Saúde", price: 15.20, dy: 5.80, ebitdaVP: 1.45, revenueGrowth: 14.5, marketCap: 8.3, analystBuys: 14, roe: 17.3, pl: 8.8, margemLiquida: 3.2, netDebtEbitda: 3 },
  { symbol: "HYPE3", name: "Hypera", sector: "Saúde", price: 32.40, dy: 5.90, ebitdaVP: 1.30, revenueGrowth: 5.6, marketCap: 20.5, analystBuys: 10, roe: 7, pl: 21.8, margemLiquida: 5.7, netDebtEbitda: 2.7 },
  { symbol: "PNVL3", name: "Dimed (Panvel)", sector: "Saúde", price: 11.20, dy: 4.50, ebitdaVP: 1.05, revenueGrowth: 9.8, marketCap: 1.7, analystBuys: 8, roe: 12.2, pl: 20.5, margemLiquida: 4.1, netDebtEbitda: 2.3 },
  { symbol: "MATD3", name: "Mater Dei", sector: "Saúde", price: 7.90, dy: 2.80, ebitdaVP: 1.15, revenueGrowth: 11.4, marketCap: 3.0, analystBuys: 7, roe: 15.8, pl: 28.4, margemLiquida: 4.6, netDebtEbitda: 3.9 },
  { symbol: "BLAU3", name: "Blau Farmacêutica", sector: "Saúde", price: 14.50, dy: 4.90, ebitdaVP: 1.25, revenueGrowth: 8.2, marketCap: 2.6, analystBuys: 6, roe: 13.7, pl: 10.2, margemLiquida: 8.7, netDebtEbitda: 1.4 },

  // Telecom & Tech (8)
  { symbol: "VIVT3", name: "Telefônica Brasil", sector: "Telecom & Tech", price: 51.50, dy: 7.80, ebitdaVP: 1.00, revenueGrowth: 6.8, marketCap: 85.2, analystBuys: 15, roe: 15.8, pl: 14.2, margemLiquida: 13.5, netDebtEbitda: 0.8 },
  { symbol: "TIMS3", name: "TIM", sector: "Telecom & Tech", price: 17.20, dy: 6.50, ebitdaVP: 1.15, revenueGrowth: 7.4, marketCap: 41.6, analystBuys: 18, roe: 18.2, pl: 11.8, margemLiquida: 15.2, netDebtEbitda: 0.6 },
  { symbol: "TOTVS3", name: "Totvs", sector: "Telecom & Tech", price: 31.80, dy: 1.80, ebitdaVP: 3.40, revenueGrowth: 17.5, marketCap: 19.5, analystBuys: 21, roe: 20.4, pl: 32.5, margemLiquida: 12.8, netDebtEbitda: 0.2 },
  { symbol: "LWSA3", name: "Locaweb", sector: "Telecom & Tech", price: 5.10, dy: 0.50, ebitdaVP: 0.90, revenueGrowth: 19.8, marketCap: 3.0, analystBuys: 9, roe: 16, pl: 23.8, margemLiquida: -0.1, netDebtEbitda: -0.3 },
  { symbol: "CASH3", name: "Méliuz", sector: "Telecom & Tech", price: 7.20, dy: 0.00, ebitdaVP: 0.40, revenueGrowth: -15.2, marketCap: 0.6, analystBuys: 1, roe: -15.6, pl: -8.4, margemLiquida: -22.1, netDebtEbitda: -0.8 },
  { symbol: "POSI3", name: "Positivo Tecnologia", sector: "Telecom & Tech", price: 7.80, dy: 4.50, ebitdaVP: 0.85, revenueGrowth: 12.4, marketCap: 1.1, analystBuys: 8, roe: -7.4, pl: 42.4, margemLiquida: -2.7, netDebtEbitda: -0.7 },
  { symbol: "INTB3", name: "Intelbras", sector: "Telecom & Tech", price: 21.60, dy: 3.20, ebitdaVP: 2.05, revenueGrowth: 15.6, marketCap: 7.1, analystBuys: 13, roe: -0.4, pl: 15.1, margemLiquida: 7.3, netDebtEbitda: 0.3 },
  { symbol: "MLAS3", name: "Multilaser (Muralis)", sector: "Telecom & Tech", price: 1.80, dy: 0.00, ebitdaVP: 0.35, revenueGrowth: -8.5, marketCap: 1.1, analystBuys: 2, roe: -1.8, pl: 41.5, margemLiquida: -10.9, netDebtEbitda: 1.1 },

  // Logística & Transporte (6)
  { symbol: "CCRO3", name: "CCR S.A.", sector: "Logística & Transporte", price: 12.80, dy: 5.90, ebitdaVP: 1.25, revenueGrowth: 7.8, marketCap: 25.8, analystBuys: 16, roe: 12.4, pl: 14.5, margemLiquida: 12.8, netDebtEbitda: 3.2 },
  { symbol: "ECOR3", name: "EcoRodovias", sector: "Logística & Transporte", price: 7.20, dy: 4.10, ebitdaVP: 0.95, revenueGrowth: 11.2, marketCap: 5.0, analystBuys: 11, roe: 9.1, pl: 17.8, margemLiquida: 9.1, netDebtEbitda: 3.6 },
  { symbol: "RAIL3", name: "Rumo S.A.", sector: "Logística & Transporte", price: 21.90, dy: 1.80, ebitdaVP: 1.55, revenueGrowth: 16.5, marketCap: 40.5, analystBuys: 19, roe: 10.8, pl: 18.4, margemLiquida: 15.6, netDebtEbitda: 2.8 },
  { symbol: "AZUL4", name: "Azul Linhas Aéreas", sector: "Logística & Transporte", price: 9.80, dy: 0.00, ebitdaVP: 1.80, revenueGrowth: 14.2, marketCap: 3.4, analystBuys: 7, roe: -5.2, pl: -4.8, margemLiquida: -2.5, netDebtEbitda: 5.8 },
  { symbol: "STBP3", name: "Santos Brasil", sector: "Logística & Transporte", price: 13.50, dy: 9.40, ebitdaVP: 2.95, revenueGrowth: 22.8, marketCap: 11.6, analystBuys: 20, roe: 20.4, pl: 15.2, margemLiquida: 18.2, netDebtEbitda: 0.8 },
  { symbol: "EMBJ3", name: "Embraer", sector: "Logística & Transporte", price: 34.60, dy: 0.00, ebitdaVP: 2.10, revenueGrowth: 28.5, marketCap: 25.5, analystBuys: 22, roe: 14.8, pl: 18.5, margemLiquida: 7.2, netDebtEbitda: 1.2 },

  // Saneamento (3)
  { symbol: "SBSP3", name: "Sabesp", sector: "Saneamento", price: 82.50, dy: 3.40, ebitdaVP: 1.65, revenueGrowth: 10.4, marketCap: 56.4, analystBuys: 23, roe: 14.5, pl: 10.2, margemLiquida: 22.4, netDebtEbitda: 2.1 },
  { symbol: "CSMG3", name: "Copasa", sector: "Saneamento", price: 20.40, dy: 9.20, ebitdaVP: 1.05, revenueGrowth: 6.8, marketCap: 7.7, analystBuys: 15, roe: 12.4, pl: 13.9, margemLiquida: 24.5, netDebtEbitda: 2.4 },
  { symbol: "SAPR11", name: "Sanepar", sector: "Saneamento", price: 25.80, dy: 8.40, ebitdaVP: 0.95, revenueGrowth: 7.5, marketCap: 7.8, analystBuys: 14, roe: 12.4, pl: 13.6, margemLiquida: 17.1, netDebtEbitda: 2.4 },

  // Papel & Celulose (2)
  { symbol: "KLBN11", name: "Klabin", sector: "Papel & Celulose", price: 21.20, dy: 7.20, ebitdaVP: 1.50, revenueGrowth: 2.4, marketCap: 23.8, analystBuys: 16, roe: 14.2, pl: 8.5, margemLiquida: 12.8, netDebtEbitda: 3.2 },
  { symbol: "SUZB3", name: "Suzano", sector: "Papel & Celulose", price: 58.40, dy: 4.20, ebitdaVP: 1.95, revenueGrowth: -1.2, marketCap: 76.5, analystBuys: 18, roe: 18.6, pl: 6.8, margemLiquida: 22.4, netDebtEbitda: 3.5 },

  // Industrial (5)
  { symbol: "WEGE3", name: "WEG S.A.", sector: "Industrial", price: 44.50, dy: 3.10, ebitdaVP: 4.80, revenueGrowth: 18.2, marketCap: 186.8, analystBuys: 22, roe: 30.2, pl: 35.4, margemLiquida: 18.1, netDebtEbitda: -0.3 },
  { symbol: "RENT3", name: "Localiza", sector: "Industrial", price: 52.60, dy: 2.90, ebitdaVP: 2.20, revenueGrowth: 24.1, marketCap: 55.6, analystBuys: 21, roe: 18.5, pl: 18.2, margemLiquida: 12.4, netDebtEbitda: 2.8 },
  { symbol: "MYPK3", name: "Iochpe-Maxion", sector: "Industrial", price: 12.40, dy: 4.20, ebitdaVP: 0.85, revenueGrowth: 6.2, marketCap: 1.9, analystBuys: 6, roe: 11, pl: 10.7, margemLiquida: 5.9, netDebtEbitda: 1.2 },
  { symbol: "TUPY3", name: "Tupy S.A.", sector: "Industrial", price: 25.60, dy: 5.40, ebitdaVP: 1.10, revenueGrowth: 9.1, marketCap: 3.7, analystBuys: 11, roe: 16.8, pl: 11.6, margemLiquida: 12.5, netDebtEbitda: 1 },
  { symbol: "FRAS3", name: "Fras-le", sector: "Industrial", price: 17.50, dy: 4.80, ebitdaVP: 1.85, revenueGrowth: 13.8, marketCap: 4.6, analystBuys: 12, roe: 10.4, pl: 12, margemLiquida: 11.9, netDebtEbitda: 2.6 },

  // Imobiliário/Shopping (5)
  { symbol: "MULT3", name: "Multiplan", sector: "Imobiliário/Shopping", price: 24.20, dy: 6.50, ebitdaVP: 1.40, revenueGrowth: 8.4, marketCap: 14.2, analystBuys: 17, roe: 14.8, pl: 12.5, margemLiquida: 28.4, netDebtEbitda: 1.8 },
  { symbol: "IGTI11", name: "Iguatemi", sector: "Imobiliário/Shopping", price: 21.80, dy: 5.80, ebitdaVP: 1.20, revenueGrowth: 9.2, marketCap: 7.1, analystBuys: 16, roe: 9.8, pl: 8.2, margemLiquida: 17.9, netDebtEbitda: 3.1 },
  { symbol: "ALSO3", name: "Allos", sector: "Imobiliário/Shopping", price: 22.40, dy: 6.10, ebitdaVP: 1.10, revenueGrowth: 7.6, marketCap: 12.1, analystBuys: 15, roe: 8.7, pl: 8, margemLiquida: 34, netDebtEbitda: 1.3 },
  { symbol: "JHSF3", name: "JHSF Participações", sector: "Imobiliário/Shopping", price: 4.20, dy: 8.50, ebitdaVP: 0.85, revenueGrowth: -3.5, marketCap: 2.8, analystBuys: 7, roe: 15.1, pl: 17.1, margemLiquida: 28.5, netDebtEbitda: 3 },
  { symbol: "LOGG3", name: "Log Commercial Properties", sector: "Imobiliário/Shopping", price: 23.50, dy: 4.50, ebitdaVP: 0.95, revenueGrowth: 11.8, marketCap: 2.3, analystBuys: 10, roe: 12.8, pl: 12, margemLiquida: 18.1, netDebtEbitda: 1.8 },

  // Outros (11 para somar 100)
  { symbol: "AESB3", name: "AES Brasil", sector: "Energia Elétrica", price: 11.80, dy: 2.50, ebitdaVP: 0.70, revenueGrowth: 12.5, marketCap: 7.1, analystBuys: 7, roe: 12.7, pl: 12.3, margemLiquida: 13.6, netDebtEbitda: 3.8 },
  { symbol: "ALUP11", name: "Alupar", sector: "Energia Elétrica", price: 29.50, dy: 6.90, ebitdaVP: 1.20, revenueGrowth: 8.1, marketCap: 8.8, analystBuys: 14, roe: 15.7, pl: 9.7, margemLiquida: 20.4, netDebtEbitda: 4 },
  { symbol: "RANI3", name: "Irani Papel", sector: "Papel & Celulose", price: 7.80, dy: 9.10, ebitdaVP: 1.45, revenueGrowth: 4.2, marketCap: 1.9, analystBuys: 13, roe: 19.6, pl: 11.7, margemLiquida: 17.6, netDebtEbitda: 3.9 },
  { symbol: "KEPL3", name: "Kepler Weber", sector: "Industrial", price: 10.40, dy: 8.40, ebitdaVP: 2.10, revenueGrowth: 11.2, marketCap: 1.8, analystBuys: 12, roe: 12.7, pl: 11.9, margemLiquida: 9.9, netDebtEbitda: 1.9 },
  { symbol: "SIMH3", name: "Simpar", sector: "Industrial", price: 6.10, dy: 3.20, ebitdaVP: 1.60, revenueGrowth: 22.4, marketCap: 5.1, analystBuys: 14, roe: 20.9, pl: 11.6, margemLiquida: 7.9, netDebtEbitda: 2.4 },
  { symbol: "JALL3", name: "Jalles Machado", sector: "Alimentos & Bebidas", price: 6.80, dy: 6.20, ebitdaVP: 1.05, revenueGrowth: 13.5, marketCap: 2.0, analystBuys: 10, roe: 11.8, pl: 14.9, margemLiquida: 6.5, netDebtEbitda: 2.1 },
  { symbol: "ODPV3", name: "Odontoprev", sector: "Saúde", price: 11.90, dy: 7.40, ebitdaVP: 2.15, revenueGrowth: 8.9, marketCap: 6.5, analystBuys: 9, roe: 9.3, pl: 19.4, margemLiquida: 9.1, netDebtEbitda: 3.3 },
  { symbol: "BRKM5", name: "Braskem", sector: "Industrial", price: 18.20, dy: 0.00, ebitdaVP: 0.50, revenueGrowth: -12.4, marketCap: 14.5, analystBuys: 3, roe: -12.8, pl: -6.2, margemLiquida: -8.5, netDebtEbitda: 4.8 },
  { symbol: "RAPT4", name: "Randon S.A.", sector: "Industrial", price: 11.50, dy: 5.20, ebitdaVP: 1.10, revenueGrowth: 9.4, marketCap: 3.8, analystBuys: 11, roe: 18.2, pl: 17.9, margemLiquida: 12.4, netDebtEbitda: 1.5 },
  { symbol: "POMO4", name: "Marcopolo", sector: "Industrial", price: 7.90, dy: 6.80, ebitdaVP: 1.95, revenueGrowth: 26.4, marketCap: 7.4, analystBuys: 17, roe: 13.2, pl: 15.5, margemLiquida: 6.8, netDebtEbitda: 1.2 },

  // Fundos Internacionais, ETFs e BDRs Recomendados (15 Ativos)
  { symbol: "IVVB11", name: "iShares S&P 500 ETF", sector: "Fundos Internacionais", price: 312.40, dy: 0.00, ebitdaVP: 1.00, revenueGrowth: 12.4, marketCap: 28.5, isIntl: true, intlBuys: 28, roe: 29.6, pl: 34.7, margemLiquida: 21.3, netDebtEbitda: 0.8 },
  { symbol: "NASD11", name: "XP Nasdaq 100 ETF", sector: "Fundos Internacionais", price: 18.50, dy: 0.00, ebitdaVP: 1.00, revenueGrowth: 16.5, marketCap: 4.8, isIntl: true, intlBuys: 26, roe: 28.1, pl: 32.5, margemLiquida: 11.6, netDebtEbitda: 1.6 },
  { symbol: "AAPL34", name: "Apple Inc. BDR", sector: "Fundos Internacionais", price: 82.10, dy: 0.52, ebitdaVP: 5.40, revenueGrowth: 8.6, marketCap: 15300.0, isIntl: true, intlBuys: 25, roe: 145, pl: 32.5, margemLiquida: 25.8, netDebtEbitda: 0.4 },
  { symbol: "MSFT34", name: "Microsoft Corp BDR", sector: "Fundos Internacionais", price: 78.40, dy: 0.71, ebitdaVP: 6.10, revenueGrowth: 15.2, marketCap: 16100.0, isIntl: true, intlBuys: 24, roe: 38.5, pl: 35.2, margemLiquida: 36.4, netDebtEbitda: 0.2 },
  { symbol: "NVDC34", name: "Nvidia Corp BDR", sector: "Fundos Internacionais", price: 124.50, dy: 0.02, ebitdaVP: 12.80, revenueGrowth: 115.4, marketCap: 15800.0, isIntl: true, intlBuys: 27, roe: 82.4, pl: 62.5, margemLiquida: 55.8, netDebtEbitda: -0.5 },
  { symbol: "GOGL34", name: "Alphabet Inc BDR", sector: "Fundos Internacionais", price: 68.20, dy: 0.00, ebitdaVP: 4.50, revenueGrowth: 14.1, marketCap: 10400.0, isIntl: true, intlBuys: 22, roe: 28.2, pl: 24.8, margemLiquida: 24.2, netDebtEbitda: -1.2 },
  { symbol: "AMZO34", name: "Amazon.com BDR", sector: "Fundos Internacionais", price: 42.15, dy: 0.00, ebitdaVP: 3.20, revenueGrowth: 13.8, marketCap: 9200.0, isIntl: true, intlBuys: 21, roe: 22.4, pl: 42.8, margemLiquida: 7.8, netDebtEbitda: 0.5 },
  { symbol: "ACWI11", name: "XP ACWI Global ETF", sector: "Fundos Internacionais", price: 12.80, dy: 0.00, ebitdaVP: 1.00, revenueGrowth: 9.8, marketCap: 1.4, isIntl: true, intlBuys: 19, roe: 30.8, pl: 30, margemLiquida: 21, netDebtEbitda: 0.5 },
  { symbol: "GOLD11", name: "Trend Ouro ETF", sector: "Fundos Internacionais", price: 14.10, dy: 0.00, ebitdaVP: 1.00, revenueGrowth: 11.2, marketCap: 0.9, isIntl: true, intlBuys: 18, roe: 32.4, pl: 44, margemLiquida: 21.4, netDebtEbitda: 1.1 },
  { symbol: "XINA11", name: "Trend China ETF", sector: "Fundos Internacionais", price: 6.40, dy: 0.00, ebitdaVP: 0.90, revenueGrowth: -2.4, marketCap: 0.5, isIntl: true, intlBuys: 8, roe: 33.3, pl: 34.1, margemLiquida: 22.4, netDebtEbitda: 0.1 },
  { symbol: "EURP11", name: "Trend Europa ETF", sector: "Fundos Internacionais", price: 11.20, dy: 0.00, ebitdaVP: 1.10, revenueGrowth: 4.2, marketCap: 0.6, isIntl: true, intlBuys: 12, roe: 33, pl: 19, margemLiquida: 12.4, netDebtEbitda: 0.9 },
  { symbol: "BIEF39", name: "iShares MSCI EAFE BDR ETF", sector: "Fundos Internacionais", price: 64.80, dy: 2.40, ebitdaVP: 1.20, revenueGrowth: 5.6, marketCap: 2.1, isIntl: true, intlBuys: 15, roe: 15.9, pl: 16.4, margemLiquida: 19.7, netDebtEbitda: 0.7 },
  { symbol: "EMGD11", name: "Trend Mercados Emergentes", sector: "Fundos Internacionais", price: 8.90, dy: 0.00, ebitdaVP: 1.00, revenueGrowth: 7.4, marketCap: 0.4, isIntl: true, intlBuys: 13, roe: 32.7, pl: 39.7, margemLiquida: 18.1, netDebtEbitda: 0.3 },
  { symbol: "QBTC11", name: "QR Bitcoin ETF", sector: "Fundos Internacionais", price: 24.50, dy: 0.00, ebitdaVP: 1.00, revenueGrowth: 35.6, marketCap: 0.8, isIntl: true, intlBuys: 16, roe: 35, pl: 19.1, margemLiquida: 23.1, netDebtEbitda: 0.9 },
  { symbol: "BIEM39", name: "iShares Core MSCI EM BDR", sector: "Fundos Internacionais", price: 54.10, dy: 1.80, ebitdaVP: 1.10, revenueGrowth: 6.8, marketCap: 1.9, isIntl: true, intlBuys: 14, roe: 20.9, pl: 42.1, margemLiquida: 23.2, netDebtEbitda: 1.5 }
];
