// src/services/api.ts

export interface B3Ticker {
  symbol: string;
  name: string;
}

export interface StockData {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  marketCap: number;
  regularMarketVolume: number;
  logourl: string;
  
  // Fundamentalist Indicators
  pl: number;          // P/L (Price to Earnings)
  pvp: number;         // P/VP (Price to Book Value)
  dy: number;          // Dividend Yield (%)
  roe: number;         // Return on Equity (%)
  margemLiquida: number; // Net Margin (%)
  
  // Extra Fundamentalist Indicators
  evEbitda?: number;     // EV/EBITDA
  evEbit?: number;       // EV/EBIT
  pEbit?: number;        // P/EBIT
  psr?: number;          // PSR (Price to Sales)
  pAtivo?: number;       // P/Ativo
  pCapGiro?: number;     // P/Capital de Giro
  roic?: number;         // ROIC (%)
  roa?: number;          // ROA (%)
  margemBruta?: number;  // Margem Bruta (%)
  margemEbitda?: number; // Margem EBITDA (%)
  margemEbit?: number;   // Margem EBIT (%)
  dividaLiquidaPatrimonio?: number; // Dívida Líquida / Patrimônio Líquido
  dividaLiquidaEbitda?: number;     // Dívida Líquida / EBITDA
  dividaBrutaPatrimonio?: number;   // Dívida Bruta / Patrimônio Líquido
  liquidezCorrente?: number;        // Liquidez Corrente
  cagrReceitas5Anos?: number;       // CAGR Receitas 5 Anos (%)
  cagrLucros5Anos?: number;         // CAGR Lucros 5 Anos (%)
  
  // Risk & Valuation
  volatility: number;  // Calculated volatility (%)
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
  lpa: number;         // Earnings Per Share (LPA)
  vpa: number;         // Book Value Per Share (VPA)
  targetPrice: number; // Target price set by user or consensus
  fairPriceManual?: number; // User input fair price if manual
  
  // Strategy & Thesis
  strategy: 'Crescimento/Growth' | 'Dividendos/Value' | 'Turnaround' | 'Setor Cíclico' | 'Outro';
  thesis: string;      // Notes / Investment thesis
  
  // History for charts
  history: Array<{
    date: string;
    price: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
  }>;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  isRelevantFact: boolean; // RI Fato Relevante
  summary?: string;
  sourceCategory: 'ri' | 'investment' | 'general';
}

export interface ConsensusData {
  recommendation: 'Compra Strong' | 'Compra' | 'Neutro' | 'Venda' | 'Venda Strong';
  targetHigh: number;
  targetLow: number;
  targetMean: number;
  buys: number;
  holds: number;
  sells: number;
}

// LocalStorage Keys
const KEYS = {
  API_TOKEN: 'b3_analise_api_token',
  USER_OVERRIDES: 'b3_analise_user_overrides', // store notes, strategy, manual fairPrice, targetPrice, and indicator edits
};

// Popular B3 Ticker Registry (Stocks, FIIs, BDRs, ETFs)
export const ALL_B3_TICKERS: B3Ticker[] = [
  { symbol: 'PETR4', name: 'Petrobras S.A. - Preferenciais' },
  { symbol: 'PETR3', name: 'Petrobras S.A. - Ordinárias' },
  { symbol: 'VALE3', name: 'Vale S.A.' },
  { symbol: 'WEGE3', name: 'WEG S.A.' },
  { symbol: 'ITUB4', name: 'Itaú Unibanco Holding S.A.' },
  { symbol: 'BBDC4', name: 'Banco Bradesco S.A. - Preferenciais' },
  { symbol: 'BBDC3', name: 'Banco Bradesco S.A. - Ordinárias' },
  { symbol: 'BBAS3', name: 'Banco do Brasil S.A.' },
  { symbol: 'ITSA4', name: 'Itaúsa S.A.' },
  { symbol: 'SANB11', name: 'Banco Santander Brasil S.A. - Units' },
  { symbol: 'BPAC11', name: 'BTG Pactual S.A. - Units' },
  { symbol: 'ABCB4', name: 'Banco ABC Brasil S.A. - Preferenciais' },
  { symbol: 'BRSR6', name: 'Banco do Estado do Rio Grande do Sul S.A. - Preferenciais' },
  { symbol: 'B3SA3', name: 'B3 S.A. - Brasil, Bolsa, Balcão' },
  { symbol: 'MGLU3', name: 'Magazine Luiza S.A.' },
  { symbol: 'LREN3', name: 'Lojas Renner S.A.' },
  { symbol: 'ARZZ3', name: 'Arezzo S.A.' },
  { symbol: 'BHIA3', name: 'Casas Bahia Group S.A.' },
  { symbol: 'AMER3', name: 'Americanas S.A.' },
  { symbol: 'CURY3', name: 'Cury Construtora e Incorporadora S.A.' },
  { symbol: 'TEND3', name: 'Construtora Tenda S.A.' },
  { symbol: 'MRVE3', name: 'MRV Engenharia S.A.' },
  { symbol: 'CYRE3', name: 'Cyrela Brazil Realty S.A.' },
  { symbol: 'EZTC3', name: 'EZTEC Empreendimentos S.A.' },
  { symbol: 'DIRR3', name: 'Direcional Engenharia S.A.' },
  { symbol: 'LAVV3', name: 'Lavvi Empreendimentos Imobiliários S.A.' },
  { symbol: 'EVEN3', name: 'Even Construtora e Incorporadora S.A.' },
  { symbol: 'JHSF3', name: 'JHSF Participações S.A.' },
  { symbol: 'ELET3', name: 'Eletrobras S.A. - Ordinárias' },
  { symbol: 'ELET6', name: 'Eletrobras S.A. - Preferenciais' },
  { symbol: 'EGIE3', name: 'Engie Brasil Energia S.A.' },
  { symbol: 'CPLE6', name: 'Copel S.A. - Preferenciais' },
  { symbol: 'EQTL3', name: 'Equatorial Energia S.A.' },
  { symbol: 'CMIG4', name: 'Cemig S.A. - Preferenciais' },
  { symbol: 'TAEE11', name: 'Taesa S.A. - Units' },
  { symbol: 'TRPL4', name: 'ISA CTEEP S.A. - Preferenciais' },
  { symbol: 'ENEV3', name: 'Eneva S.A.' },
  { symbol: 'AURE3', name: 'Auren Energia S.A.' },
  { symbol: 'NEOE3', name: 'Neoenergia S.A.' },
  { symbol: 'ENGI11', name: 'Energisa S.A. - Units' },
  { symbol: 'SBSP3', name: 'Sabesp S.A.' },
  { symbol: 'SAPR4', name: 'Sanepar S.A. - Preferenciais' },
  { symbol: 'SAPR11', name: 'Sanepar S.A. - Units' },
  { symbol: 'SAPR3', name: 'Sanepar S.A. - Ordinárias' },
  { symbol: 'CSMG3', name: 'Copasa S.A.' },
  { symbol: 'CPFE3', name: 'CPFL Energia S.A.' },
  { symbol: 'ALUP11', name: 'Alupar Investimento S.A. - Units' },
  { symbol: 'CSNA3', name: 'Siderúrgica Nacional S.A.' },
  { symbol: 'GGBR4', name: 'Gerdau S.A. - Preferenciais' },
  { symbol: 'GOAU4', name: 'Metalúrgica Gerdau S.A. - Preferenciais' },
  { symbol: 'USIM5', name: 'Usiminas S.A. - Preferenciais' },
  { symbol: 'CMIN3', name: 'CSN Mineração S.A.' },
  { symbol: 'SUZB3', name: 'Suzano S.A.' },
  { symbol: 'KLBN11', name: 'Klabin S.A. - Units' },
  { symbol: 'JBSS3', name: 'JBS S.A.' },
  { symbol: 'BRFS3', name: 'BRF S.A.' },
  { symbol: 'MRFG3', name: 'Marfrig Global Foods S.A.' },
  { symbol: 'BEEF3', name: 'Minerva S.A.' },
  { symbol: 'SLCE3', name: 'SLC Agrícola S.A.' },
  { symbol: 'SMTO3', name: 'São Martinho S.A.' },
  { symbol: 'AGRO3', name: 'BrasilAgro S.A.' },
  { symbol: 'SOJA3', name: 'Boa Safra Sementes S.A.' },
  { symbol: 'MDIA3', name: 'M. Dias Branco S.A.' },
  { symbol: 'CAML3', name: 'Camil Alimentos S.A.' },
  { symbol: 'RENT3', name: 'Localiza Rent a Car S.A.' },
  { symbol: 'MOVI3', name: 'Movida Participações S.A.' },
  { symbol: 'SIMH3', name: 'Simpar S.A.' },
  { symbol: 'JSLG3', name: 'JSL S.A.' },
  { symbol: 'PRIO3', name: 'PetroRio S.A. (PRIO)' },
  { symbol: 'RAIZ4', name: 'Raízen S.A.' },
  { symbol: 'AZUL4', name: 'Azul S.A.' },
  { symbol: 'GOLL4', name: 'Gol Linhas Aéreas S.A.' },
  { symbol: 'EMBJ3', name: 'Embraer S.A. - Ads' },
  { symbol: 'EMBR3', name: 'Embraer S.A.' },
  { symbol: 'COGN3', name: 'Cogna Educação S.A.' },
  { symbol: 'YDUQ3', name: 'YDUQS Participações S.A.' },
  { symbol: 'HAPV3', name: 'Hapvida S.A.' },
  { symbol: 'RDOR3', name: 'Rede D\'Or São Luiz S.A.' },
  { symbol: 'FLRY3', name: 'Fleury S.A.' },
  { symbol: 'RADL3', name: 'Raia Drogasil S.A.' },
  { symbol: 'ONCO3', name: 'Oncoclínicas do Brasil S.A.' },
  { symbol: 'ODPV3', name: 'Odontoprev S.A.' },
  { symbol: 'MATD3', name: 'Hospital Mater Dei S.A.' },
  { symbol: 'ALOS3', name: 'Allos S.A. (Aliansce Sonae)' },
  { symbol: 'MULT3', name: 'Multiplan S.A.' },
  { symbol: 'IGTI11', name: 'Iguatemi S.A. - Units' },
  { symbol: 'CIEL3', name: 'Cielo S.A.' },
  { symbol: 'HYPE3', name: 'Hypera S.A.' },
  { symbol: 'VIVA3', name: 'Vivara Participações S.A.' },
  { symbol: 'SOMA3', name: 'Grupo de Moda Soma S.A.' },
  { symbol: 'CEAB3', name: 'C&A Modas S.A.' },
  { symbol: 'GUAR3', name: 'Guararapes Confecções S.A.' },
  { symbol: 'ALPA4', name: 'Alpargatas S.A. - Preferenciais' },
  { symbol: 'GRND3', name: 'Grendene S.A.' },
  { symbol: 'TFCO4', name: 'Track & Field Co S.A.' },
  { symbol: 'CRFB3', name: 'Carrefour Brasil S.A.' },
  { symbol: 'ASAI3', name: 'Sendas Distribuidora (Assaí) S.A.' },
  { symbol: 'PGMN3', name: 'Empreendimentos Pague Menos S.A.' },
  { symbol: 'TIMS3', name: 'TIM S.A.' },
  { symbol: 'VIVT3', name: 'Telefônica Brasil (Vivo) S.A.' },
  { symbol: 'TOTS3', name: 'Totvs S.A.' },
  { symbol: 'LWSA3', name: 'Locaweb S.A.' },
  { symbol: 'INTB3', name: 'Intelbras S.A.' },
  { symbol: 'POSI3', name: 'Positivo Tecnologia S.A.' },
  { symbol: 'DXCO3', name: 'Dexco S.A. (Duratex)' },
  { symbol: 'POMO4', name: 'Marcopolo S.A.' },
  { symbol: 'RAPT4', name: 'Randon S.A.' },
  { symbol: 'TUPY3', name: 'Tupy S.A.' },
  { symbol: 'KEPL3', name: 'Kepler Weber S.A.' },
  { symbol: 'LEVE3', name: 'Mahle Metal Leve S.A.' },
  { symbol: 'FRAS3', name: 'Fras-le S.A.' },
  { symbol: 'PORT3', name: 'Wilson Sons S.A.' },
  { symbol: 'STBP3', name: 'Santos Brasil Participações S.A.' },
  { symbol: 'LOGG3', name: 'Log Commercial Properties S.A.' },
  { symbol: 'RUMO3', name: 'Rumo S.A.' },
  { symbol: 'CSAN3', name: 'Cosan S.A.' },
  { symbol: 'UGPA3', name: 'Ultrapar Participações S.A.' },
  { symbol: 'IRBR3', name: 'IRB Brasil Re S.A.' },
  { symbol: 'CXSE3', name: 'Caixa Seguridade S.A.' },
  { symbol: 'BBSE3', name: 'BB Seguridade S.A.' },
  { symbol: 'PSSA3', name: 'Porto Seguro S.A.' },
  { symbol: 'WIZC3', name: 'Wiz Co S.A.' },
  { symbol: 'GGPS3', name: 'GPS Empreendimentos S.A.' },
  { symbol: 'AMBP3', name: 'Ambipar Participações S.A.' },
  { symbol: 'ORVR3', name: 'Orizon Valorização de Resíduos S.A.' },
  { symbol: 'SMFT3', name: 'Smart Fit S.A.' },
  { symbol: 'BRAV3', name: 'Brava Energia S.A.' },
  { symbol: 'RECV3', name: 'PetroRecôncavo S.A.' },
  { symbol: 'RANI3', name: 'Irani Papel e Celulose S.A.' },
  { symbol: 'KLBN4', name: 'Klabin S.A. - Preferenciais' },
  { symbol: 'KLBN3', name: 'Klabin S.A. - Ordinárias' },
  { symbol: 'TAEE4', name: 'Taesa S.A. - Preferenciais' },
  { symbol: 'TAEE3', name: 'Taesa S.A. - Ordinárias' },
  { symbol: 'TRPL3', name: 'ISA CTEEP S.A. - Ordinárias' },
  { symbol: 'CMIG3', name: 'Cemig S.A. - Ordinárias' },
  { symbol: 'CPLE3', name: 'Copel S.A. - Ordinárias' },
  { symbol: 'GOAU3', name: 'Metalúrgica Gerdau S.A. - Ordinárias' },
  { symbol: 'GGBR3', name: 'Gerdau S.A. - Ordinárias' },
  { symbol: 'USIM3', name: 'Usiminas S.A. - Ordinárias' },
  { symbol: 'CBAV3', name: 'CBA - Companhia Brasileira de Alumínio' },
  { symbol: 'FESA4', name: 'Ferbasa S.A. - Preferenciais' },
  { symbol: 'NTCO3', name: 'Natura &Co Holding S.A.' },
  { symbol: 'BMGB4', name: 'Banco BMG S.A. - Preferenciais' },
  { symbol: 'VLID3', name: 'Valid Soluções S.A.' },
  { symbol: 'TGMA3', name: 'Tegma Gestão Logística S.A.' },
  { symbol: 'ECOR3', name: 'EcoRodovias Infraestrutura e Logística S.A.' },
  { symbol: 'CCRO3', name: 'CCR S.A.' },
  { symbol: 'HBOR3', name: 'Helbor Empreendimentos S.A.' },
  { symbol: 'PLPL3', name: 'Plano & Plano Desenvolvimento Imobiliário S.A.' },
  { symbol: 'MTRE3', name: 'Mitre Realty Empreendimentos e Participações S.A.' },
  { symbol: 'MELK3', name: 'Melnick Desenvolvimento Imobiliário S.A.' },
  { symbol: 'GFSA3', name: 'Gafisa S.A.' },
  { symbol: 'TRIS3', name: 'Trisul S.A.' },
  { symbol: 'SYNE3', name: 'Syn Prop & Tech S.A.' },
  { symbol: 'DESK3', name: 'Desktop S.A.' },
  { symbol: 'FIQE3', name: 'Unifique Telecomunicações S.A.' },
  { symbol: 'ELMD3', name: 'Eletromidia S.A.' },
  { symbol: 'ZAMP3', name: 'Zamp S.A.' },
  { symbol: 'VSTE3', name: 'Vulcabras Azaleia S.A.' },
  { symbol: 'ALPK3', name: 'Allpark Empreendimentos, Participações e Serviços S.A. - Estapar' },
  { symbol: 'CSED3', name: 'Cruzeiro do Sul Educacional S.A.' },
  { symbol: 'SEER3', name: 'Ser Educacional S.A.' },
  { symbol: 'HBRE3', name: 'HBR Realty Empreendimentos Imobiliários S.A.' },
  { symbol: 'TECN3', name: 'Technos S.A.' },
  { symbol: 'PETZ3', name: 'Petz S.A.' },
  { symbol: 'LJQQ3', name: 'Lojas Quero-Quero S.A.' },
  { symbol: 'SBFG3', name: 'Grupo SBF S.A. - Centauro' },
  { symbol: 'UNIP6', name: 'Unipar Carbocloro S.A. - Preferenciais Class B' },
  { symbol: 'BRKM5', name: 'Braskem S.A. - Preferenciais' },
  
  // Real Estate Funds (FIIs)
  { symbol: 'MXRF11', name: 'Maxi Renda FII' },
  { symbol: 'HGLG11', name: 'CGG Veritude - FII HSI Logística' },
  { symbol: 'XPML11', name: 'XP Malls FII' },
  { symbol: 'KNIP11', name: 'Kinea Índices de Preços FII' },
  { symbol: 'BTLG11', name: 'BTG Pactual Logística FII' },
  { symbol: 'HCTR11', name: 'Hectare CE FII' },
  { symbol: 'VISC11', name: 'Vinci Shopping Centers FII' },
  { symbol: 'TGAR11', name: 'TG Ativa Real Recebíveis FII' },
  { symbol: 'KNCR11', name: 'Kinea Rendimentos Imobiliários FII' },
  { symbol: 'XPLG11', name: 'XP Log FII' },
  { symbol: 'HGRU11', name: 'CSHG Renda Urbana FII' },
  { symbol: 'IRDM11', name: 'Iridium Recebíveis Imobiliários FII' },
  { symbol: 'CPTS11', name: 'Capitânia Securities II FII' },
  { symbol: 'RECT11', name: 'Real Estate Capital FII' },
  { symbol: 'URPR11', name: 'Urca Prime Renda FII' },
  { symbol: 'PVBI11', name: 'Pátria Edifícios Corporativos FII' },
  { symbol: 'LVBI11', name: 'VBI Logística FII' },
  { symbol: 'ALZR11', name: 'Alianza Trust Renda FII' },
  { symbol: 'TRXF11', name: 'TRX Real Estate FII' },
  { symbol: 'BRCO11', name: 'Bresco Logística FII' },
  { symbol: 'JSRE11', name: 'JS Real Estate Multigestão FII' },
  { symbol: 'HGBS11', name: 'Hedge Brasil Shopping FII' },
  { symbol: 'HSML11', name: 'HSI Malls FII' },
  { symbol: 'MALL11', name: 'Malls Brasil Plural FII' },
  { symbol: 'HFOF11', name: 'Hedge Top FOFII FII' },
  { symbol: 'BCFF11', name: 'BTG Pactual Fundo de Fundos FII' },
  { symbol: 'KNSC11', name: 'Kinea Securities FII' },
  { symbol: 'RBRR11', name: 'RBR Rendimento High Grade FII' },
  { symbol: 'RBRY11', name: 'RBR Private Crédito Imobiliário FII' },
  { symbol: 'RBRF11', name: 'RBR Alpha Multiestratégia FII' },
  { symbol: 'GALG11', name: 'Guardian Logística FII' },
  { symbol: 'GGRC11', name: 'GGR Copevi Renda FII' },
  { symbol: 'VINO11', name: 'Vinci Offices FII' },
  { symbol: 'BTCI11', name: 'BTG Pactual Crédito Imobiliário FII' },
  { symbol: 'KNCA11', name: 'Kinea Crédito Agro Fiagro' },
  { symbol: 'RURA11', name: 'Itaú Asset Rural Fiagro' },
  { symbol: 'VGIR11', name: 'Valora Hedge Fund FII' },
  { symbol: 'VGIA11', name: 'Valora Fiagro' },

  // BDRs
  { symbol: 'AAPL34', name: 'Apple Inc. - BDR' },
  { symbol: 'MSFT34', name: 'Microsoft Corporation - BDR' },
  { symbol: 'TSLA34', name: 'Tesla Inc. - BDR' },
  { symbol: 'AMZO34', name: 'Amazon.com Inc. - BDR' },
  { symbol: 'GOGL34', name: 'Alphabet Inc. (Google) - BDR' },
  { symbol: 'META34', name: 'Meta Platforms Inc. (Facebook) - BDR' },
  { symbol: 'NVDC34', name: 'NVIDIA Corporation - BDR' },
  { symbol: 'NFLX34', name: 'Netflix Inc. - BDR' },
  { symbol: 'DISB34', name: 'The Walt Disney Company - BDR' },
  { symbol: 'JPMC34', name: 'JPMorgan Chase & Co. - BDR' },
  { symbol: 'TSMC34', name: 'Taiwan Semiconductor Manufacturing - BDR' },
  { symbol: 'COCA34', name: 'The Coca-Cola Company - BDR' },
  { symbol: 'PEPS34', name: 'PepsiCo, Inc. - BDR' },
  { symbol: 'BOAC34', name: 'Bank of America Corporation - BDR' },
  { symbol: 'HOME34', name: 'The Home Depot, Inc. - BDR' },
  { symbol: 'NKEB34', name: 'Nike, Inc. - BDR' },
  { symbol: 'AMDB34', name: 'Advanced Micro Devices, Inc. - BDR' },
  { symbol: 'PYPL34', name: 'PayPal Holdings, Inc. - BDR' },
  { symbol: 'CSCO34', name: 'Cisco Systems, Inc. - BDR' },
  { symbol: 'INCO34', name: 'Intel Corporation - BDR' },
  { symbol: 'BABA34', name: 'Alibaba Group Holding Ltd - BDR' },
  { symbol: 'BERK34', name: 'Berkshire Hathaway Inc. - BDR' },
  { symbol: 'JNJB34', name: 'Johnson & Johnson - BDR' },
  { symbol: 'PGCO34', name: 'Procter & Gamble Company - BDR' },
  { symbol: 'AVGO34', name: 'Broadcom Inc. - BDR' },
  { symbol: 'LLYB34', name: 'Eli Lilly and Company - BDR' },
  { symbol: 'MRKC34', name: 'Merck & Co., Inc. - BDR' },
  { symbol: 'COST34', name: 'Costco Wholesale Corporation - BDR' },
  { symbol: 'ADBE34', name: 'Adobe Inc. - BDR' },
  { symbol: 'CRMV34', name: 'Salesforce, Inc. - BDR' },
  { symbol: 'QCOM34', name: 'Qualcomm Incorporated - BDR' },

  // ETFs
  { symbol: 'BOVA11', name: 'iShares Ibov Index ETF' },
  { symbol: 'IVVB11', name: 'iShares S&P 500 Index ETF' },
  { symbol: 'SMAL11', name: 'iShares BM&FBOVESPA Small Cap ETF' },
  { symbol: 'HASH11', name: 'Hashdex Nasdaq Crypto Index ETF' },
  { symbol: 'DIVO11', name: 'Itnow IDIV Index ETF' },
  { symbol: 'FIXA11', name: 'Mirae Asset S&P/B3 RF ETF' },
  { symbol: 'IMAB11', name: 'Itnow IMA-B Index ETF' },
  { symbol: 'GOLD11', name: 'Trend Ouro ETF' },
  { symbol: 'LFTS11', name: 'Investo Tesouro Selic ETF' },
  { symbol: 'WRLD11', name: 'Investo MSCI World ETF' },
  { symbol: 'SPXI11', name: 'Itnow S&P 500 ETF' },
  { symbol: 'TECK11', name: 'Itnow Nasdaq-100 Tech ETF' },
  { symbol: 'QBTC11', name: 'QR Bitcoin ETF' },
  { symbol: 'QETH11', name: 'QR Ether ETF' },
  { symbol: 'XINA11', name: 'Trend China ETF' },
  { symbol: 'EURP11', name: 'Trend Europa ETF' },
  { symbol: 'BIEF11', name: 'iShares MSCI EAFE ETF' },

  // American Stocks (US Market - Direct Tickers)
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. Class A' },
  { symbol: 'GOOG', name: 'Alphabet Inc. Class C' },
  { symbol: 'META', name: 'Meta Platforms, Inc.' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.' },
  { symbol: 'LLY', name: 'Eli Lilly and Company' },
  { symbol: 'AVGO', name: 'Broadcom Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'UNH', name: 'UnitedHealth Group Incorporated' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation' },
  { symbol: 'TSM', name: 'Taiwan Semiconductor Manufacturing' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'MA', name: 'Mastercard Incorporated' },
  { symbol: 'PG', name: 'Procter & Gamble Company' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'ASML', name: 'ASML Holding N.V.' },
  { symbol: 'HD', name: 'The Home Depot, Inc.' },
  { symbol: 'MRK', name: 'Merck & Co., Inc.' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation' },
  { symbol: 'ORCL', name: 'Oracle Corporation' },
  { symbol: 'ABBV', name: 'AbbVie Inc.' },
  { symbol: 'CVX', name: 'Chevron Corporation' },
  { symbol: 'AMD', name: 'Advanced Micro Devices, Inc.' },
  { symbol: 'ADBE', name: 'Adobe Inc.' },
  { symbol: 'NFLX', name: 'Netflix, Inc.' },
  { symbol: 'KO', name: 'The Coca-Cola Company' },
  { symbol: 'PEP', name: 'PepsiCo, Inc.' },
  { symbol: 'BAC', name: 'Bank of America Corporation' },
  { symbol: 'CRM', name: 'Salesforce, Inc.' },
  { symbol: 'ACN', name: 'Accenture plc' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.' },
  { symbol: 'QCOM', name: 'Qualcomm Incorporated' },
  { symbol: 'LIN', name: 'Linde plc' },
  { symbol: 'ABT', name: 'Abbott Laboratories' },
  { symbol: 'DIS', name: 'The Walt Disney Company' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'INTU', name: 'Intuit Inc.' },
  { symbol: 'CSCO', name: 'Cisco Systems, Inc.' },
  { symbol: 'TXN', name: 'Texas Instruments Incorporated' },
  { symbol: 'VZ', name: 'Verizon Communications Inc.' },
  { symbol: 'AMAT', name: 'Applied Materials, Inc.' },
  { symbol: 'DHR', name: 'Danaher Corporation' },
  { symbol: 'CAT', name: 'Caterpillar Inc.' },
  { symbol: 'GE', name: 'General Electric Company' },
  { symbol: 'IBM', name: 'International Business Machines' },
  { symbol: 'PFE', name: 'Pfizer Inc.' },
  { symbol: 'AMGN', name: 'Amgen Inc.' },
  { symbol: 'PM', name: 'Philip Morris International' },
  { symbol: 'ISRG', name: 'Intuitive Surgical, Inc.' },
  { symbol: 'UNP', name: 'Union Pacific Corporation' },
  { symbol: 'RTX', name: 'RTX Corporation' },
  { symbol: 'HON', name: 'Honeywell International Inc.' },
  { symbol: 'LOW', name: 'Lowe\'s Companies, Inc.' },
  { symbol: 'SPGI', name: 'S&P Global Inc.' },
  { symbol: 'COP', name: 'ConocoPhillips' },
  { symbol: 'AXP', name: 'American Express Company' },
  { symbol: 'PLTR', name: 'Palantir Technologies Inc.' },
  { symbol: 'GS', name: 'The Goldman Sachs Group, Inc.' },
  { symbol: 'BA', name: 'The Boeing Company' },
  { symbol: 'LMT', name: 'Lockheed Martin Corporation' },
  { symbol: 'MCD', name: 'McDonald\'s Corporation' },
  { symbol: 'SBUX', name: 'Starbucks Corporation' },
  { symbol: 'MDLZ', name: 'Mondelez International, Inc.' },
  { symbol: 'TJX', name: 'The TJX Companies, Inc.' },
  { symbol: 'PGR', name: 'The Progressive Corporation' },
  { symbol: 'SYK', name: 'Stryker Corporation' },
  { symbol: 'REGN', name: 'Regeneron Pharmaceuticals' },
  { symbol: 'CI', name: 'Cigna Group' },
  { symbol: 'VRTX', name: 'Vertex Pharmaceuticals' },
  { symbol: 'ADP', name: 'Automatic Data Processing' },
  { symbol: 'CVS', name: 'CVS Health Corporation' },
  { symbol: 'GILD', name: 'Gilead Sciences, Inc.' },
  { symbol: 'EL', name: 'The Estée Lauder Companies' },
  { symbol: 'MO', name: 'Altria Group, Inc.' },
  { symbol: 'BKNG', name: 'Booking Holdings Inc.' },
  { symbol: 'MMC', name: 'Marsh & McLennan Companies' },
  { symbol: 'HCA', name: 'HCA Healthcare, Inc.' },
  { symbol: 'SO', name: 'The Southern Company' },
  { symbol: 'D', name: 'Dominion Energy, Inc.' },
  { symbol: 'DUK', name: 'Duke Energy Corporation' },
  { symbol: 'AON', name: 'Aon plc' },
  { symbol: 'BSX', name: 'Boston Scientific Corporation' },
  { symbol: 'ZTS', name: 'Zoetis Inc.' },
  { symbol: 'T', name: 'AT&T Inc.' },
  { symbol: 'CMG', name: 'Chipotle Mexican Grill' },
  { symbol: 'PANW', name: 'Palo Alto Networks, Inc.' },
  { symbol: 'SNPS', name: 'Synopsys, Inc.' },
  { symbol: 'CDNS', name: 'Cadence Design Systems' },
  { symbol: 'MU', name: 'Micron Technology, Inc.' },
  { symbol: 'LRCX', name: 'Lam Research Corporation' },
  { symbol: 'KLAC', name: 'KLA Corporation' },
  { symbol: 'ANET', name: 'Arista Networks, Inc.' },
  { symbol: 'EQIX', name: 'Equinix, Inc.' },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings, Inc.' },
  { symbol: 'FTNT', name: 'Fortinet, Inc.' },
  { symbol: 'DE', name: 'Deere & Company' },
  { symbol: 'WM', name: 'Waste Management, Inc.' },
  { symbol: 'FDX', name: 'FedEx Corporation' },
  { symbol: 'UPS', name: 'United Parcel Service, Inc.' },
  { symbol: 'CSX', name: 'CSX Corporation' },
  { symbol: 'NSC', name: 'Norfolk Southern Corporation' },
  { symbol: 'MAR', name: 'Marriott International' },
  { symbol: 'HLT', name: 'Hilton Worldwide Holdings' },
  { symbol: 'YUM', name: 'Yum! Brands, Inc.' },
  { symbol: 'NUE', name: 'Nucor Corporation' },
  { symbol: 'FCX', name: 'Freeport-McMoRan Inc.' },
  { symbol: 'EMR', name: 'Emerson Electric Co.' },
  { symbol: 'ETN', name: 'Eaton Corporation plc' },
  { symbol: 'PH', name: 'Parker-Hannifin Corporation' },
  { symbol: 'ITW', name: 'Illinois Tool Works Inc.' },
  { symbol: 'ROK', name: 'Rockwell Automation, Inc.' },
  { symbol: 'AME', name: 'AMETEK, Inc.' },
  { symbol: 'FAST', name: 'Fastenal Company' },
  { symbol: 'PAYX', name: 'Paychex, Inc.' },
  { symbol: 'CTAS', name: 'Cintas Corporation' },
  { symbol: 'COF', name: 'Capital One Financial Corp.' },
  { symbol: 'DFS', name: 'Discover Financial Services' },
  { symbol: 'MET', name: 'MetLife, Inc.' },
  { symbol: 'PRU', name: 'Prudential Financial, Inc.' },
  { symbol: 'ALL', name: 'The Allstate Corporation' },
  { symbol: 'TRV', name: 'The Travelers Companies' },
  { symbol: 'SPG', name: 'Simon Property Group, Inc.' },
  { symbol: 'PLD', name: 'Prologis, Inc.' },
  { symbol: 'PSA', name: 'Public Storage' },
  { symbol: 'CCI', name: 'Crown Castle Inc.' },
  { symbol: 'AMT', name: 'American Tower Corporation' },
  { symbol: 'WY', name: 'Weyerhaeuser Company' },
  { symbol: 'SBAC', name: 'SBA Communications Corp.' },
  { symbol: 'EXR', name: 'Extra Space Storage Inc.' },
  { symbol: 'DLR', name: 'Digital Realty Trust, Inc.' },
  { symbol: 'AVB', name: 'AvalonBay Communities, Inc.' },
  { symbol: 'EQR', name: 'Equity Residential' },
  { symbol: 'O', name: 'Realty Income Corporation' },
  { symbol: 'VICI', name: 'VICI Properties Inc.' },
  { symbol: 'ARE', name: 'Alexandria Real Estate Equities' },
  { symbol: 'CPT', name: 'Camden Property Trust' },
  { symbol: 'IRM', name: 'Iron Mountain Incorporated' },
  { symbol: 'LEN', name: 'Lennar Corporation' },
  { symbol: 'DHI', name: 'D.R. Horton, Inc.' },
  { symbol: 'NVR', name: 'NVR, Inc.' },
  { symbol: 'PHM', name: 'PulteGroup, Inc.' },
  { symbol: 'TOL', name: 'Toll Brothers, Inc.' },
  { symbol: 'KBH', name: 'KB Home' },
  { symbol: 'MTH', name: 'Meritage Homes Corporation' },
  { symbol: 'CCS', name: 'Century Communities, Inc.' },
  { symbol: 'LGIH', name: 'LGI Homes, Inc.' },
  { symbol: 'SHW', name: 'The Sherwin-Williams Company' },
  { symbol: 'DD', name: 'DuPont de Nemours, Inc.' },
  { symbol: 'ECL', name: 'Ecolab Inc.' },
  { symbol: 'PPG', name: 'PPG Industries, Inc.' },
  { symbol: 'APD', name: 'Air Products and Chemicals' },
  { symbol: 'NEM', name: 'Newmont Corporation' },
  { symbol: 'AA', name: 'Alcoa Corporation' },
  { symbol: 'CTVA', name: 'Corteva, Inc.' },
  { symbol: 'FMC', name: 'FMC Corporation' },
  { symbol: 'MOS', name: 'The Mosaic Company' },
  { symbol: 'CF', name: 'CF Industries Holdings, Inc.' },
  { symbol: 'VMC', name: 'Vulcan Materials Company' },
  { symbol: 'MLM', name: 'Martin Marietta Materials' },
  { symbol: 'EXP', name: 'Eagle Materials Inc.' },
  { symbol: 'ACM', name: 'AECOM' },
  { symbol: 'PWR', name: 'Quanta Services, Inc.' },
  { symbol: 'DY', name: 'Dycom Industries, Inc.' },
  { symbol: 'MTD', name: 'Mettler-Toledo International' },
  { symbol: 'WAT', name: 'Waters Corporation' },
  { symbol: 'A', name: 'Agilent Technologies, Inc.' },
  { symbol: 'ILMN', name: 'Illumina, Inc.' },
  { symbol: 'ALGN', name: 'Align Technology, Inc.' },
  { symbol: 'MDT', name: 'Medtronic plc' },
  { symbol: 'EW', name: 'Edwards Lifesciences Corp.' },
  { symbol: 'DXCM', name: 'DexCom, Inc.' },
  { symbol: 'PODD', name: 'Insulet Corporation' },
  { symbol: 'ZBH', name: 'Zimmer Biomet Holdings' },
  { symbol: 'BAX', name: 'Baxter International Inc.' },
  { symbol: 'BDX', name: 'Becton, Dickinson and Company' },
  { symbol: 'HUM', name: 'Humana Inc.' },
  { symbol: 'ELV', name: 'Elevance Health, Inc.' },
  { symbol: 'CNC', name: 'Centene Corporation' },
  { symbol: 'WBA', name: 'Walgreens Boots Alliance' },
  { symbol: 'MCK', name: 'McKesson Corporation' },
  { symbol: 'CAH', name: 'Cardinal Health, Inc.' },
  { symbol: 'HSIC', name: 'Henry Schein, Inc.' },
  { symbol: 'COR', name: 'Cencora, Inc.' },
  { symbol: 'MOH', name: 'Molina Healthcare, Inc.' },
  { symbol: 'UHS', name: 'Universal Health Services' },
  { symbol: 'STE', name: 'STERIS plc' },
  { symbol: 'COO', name: 'The Cooper Companies, Inc.' },
  { symbol: 'TFX', name: 'Teleflex Incorporated' },
  { symbol: 'WST', name: 'West Pharmaceutical Services' },
  { symbol: 'RMD', name: 'ResMed Inc.' },
  { symbol: 'IQV', name: 'IQVIA Holdings Inc.' },
  { symbol: 'AET', name: 'Aetna Inc.' },
  { symbol: 'SHOP', name: 'Shopify Inc.' },
  { symbol: 'UBER', name: 'Uber Technologies, Inc.' },
  { symbol: 'ABNB', name: 'Airbnb, Inc.' },
  { symbol: 'SNOW', name: 'Snowflake Inc.' },
  { symbol: 'SQ', name: 'Block, Inc.' },
  { symbol: 'PYPL', name: 'PayPal Holdings, Inc.' },
  { symbol: 'COIN', name: 'Coinbase Global, Inc.' },
  { symbol: 'HOOD', name: 'Robinhood Markets, Inc.' },
  { symbol: 'SPOT', name: 'Spotify Technology S.A.' },
  { symbol: 'NET', name: 'Cloudflare, Inc.' },
  { symbol: 'DDOG', name: 'Datadog, Inc.' },
  { symbol: 'SE', name: 'Sea Limited' },
  { symbol: 'BABA', name: 'Alibaba Group Holding' },
  { symbol: 'PDD', name: 'PDD Holdings Inc.' },
  { symbol: 'JD', name: 'JD.com, Inc.' },
  { symbol: 'BIDU', name: 'Baidu, Inc.' },
  { symbol: 'NTES', name: 'NetEase, Inc.' },
  { symbol: 'LI', name: 'Li Auto Inc.' },
  { symbol: 'NIO', name: 'NIO Inc.' },
  { symbol: 'XPEV', name: 'XPeng Inc.' }
];

// Initial high-fidelity fallback data for key tickers
const DEFAULT_MOCK_DATA: Record<string, Partial<StockData>> = {
  PETR4: {
    longName: 'Petróleo Brasileiro S.A. - Petrobras',
    logourl: 'https://icons.brapi.dev/icons/PETR4.svg',
    pl: 4.8,
    pvp: 1.15,
    dy: 14.5,
    roe: 24.8,
    margemLiquida: 22.1,
    lpa: 8.35,
    vpa: 37.45,
    targetPrice: 52.00,
    strategy: 'Dividendos/Value',
    thesis: 'Empresa petrolífera estatal com forte geração de caixa e pagamento de dividendos robustos. A tese é baseada no preço do barril de petróleo estável acima de $75 e manutenção da política de distribuição de proventos de no mínimo 45% do fluxo de caixa livre.',
    riskLevel: 'Médio',
  },
  VALE3: {
    longName: 'Vale S.A.',
    logourl: 'https://icons.brapi.dev/icons/VALE3.svg',
    pl: 6.2,
    pvp: 1.35,
    dy: 8.9,
    roe: 19.5,
    margemLiquida: 18.2,
    lpa: 11.20,
    vpa: 61.40,
    targetPrice: 95.00,
    strategy: 'Setor Cíclico',
    thesis: 'Líder global na produção de minério de ferro premium. Tese baseada na urbanização contínua na Ásia e na demanda por minério de alta qualidade para descarbonização das siderúrgicas. Risco associado à flutuação de preços do minério de ferro em Dalian.',
    riskLevel: 'Médio',
  },
  WEGE3: {
    longName: 'WEG S.A.',
    logourl: 'https://icons.brapi.dev/icons/WEGE3.svg',
    pl: 28.5,
    pvp: 5.8,
    dy: 2.1,
    roe: 30.2,
    margemLiquida: 16.5,
    lpa: 1.45,
    vpa: 7.10,
    targetPrice: 48.00,
    strategy: 'Crescimento/Growth',
    thesis: 'Líder em motores elétricos e automação industrial com excelente histórico de execução, alto ROE e exposição internacional. Tese ancorada na eletrificação global, transição energética e crescimento de energias renováveis (solar e eólica). Valuation esticado, mas justificado pelo crescimento.',
    riskLevel: 'Baixo',
  },
  CURY3: {
    longName: 'Cury Construtora e Incorporadora S.A.',
    logourl: 'https://icons.brapi.dev/icons/CURY3.svg',
    pl: 8.5,
    pvp: 3.2,
    dy: 7.8,
    roe: 38.4,
    margemLiquida: 14.8,
    lpa: 1.98,
    vpa: 5.25,
    targetPrice: 24.50,
    strategy: 'Crescimento/Growth',
    thesis: 'Destaque no segmento de baixa renda (Minha Casa Minha Vida) com excelente velocidade de vendas (VSO) e alto ROE. Tese de investimento focada no repasse rápido de recebíveis, baixa alavancagem financeira e forte demanda habitacional incentivada pelo governo.',
    riskLevel: 'Médio',
  },
  TEND3: {
    longName: 'Construtora Tenda S.A.',
    logourl: 'https://icons.brapi.dev/icons/TEND3.svg',
    pl: -12.4,
    pvp: 1.1,
    dy: 0.0,
    roe: -8.5,
    margemLiquida: -3.2,
    lpa: -1.15,
    vpa: 11.20,
    targetPrice: 16.00,
    strategy: 'Turnaround',
    thesis: 'Construtora com foco no segmento de baixa renda passando por processo de reestruturação operacional. Tese focada na recuperação de margens após estouros de custos em safras antigas de projetos. Risco elevado devido à alavancagem, mas com alto potencial de valorização caso as margens normalizem.',
    riskLevel: 'Alto',
  },
  ITUB4: {
    longName: 'Itaú Unibanco Holding S.A.',
    logourl: 'https://icons.brapi.dev/icons/ITUB4.svg',
    pl: 8.2,
    pvp: 1.6,
    dy: 6.8,
    roe: 21.2,
    margemLiquida: 15.6,
    lpa: 4.10,
    vpa: 21.05,
    targetPrice: 38.00,
    strategy: 'Dividendos/Value',
    thesis: 'O maior banco privado brasileiro, apresentando consistentemente o maior ROE entre os grandes pares. Tese resiliente baseada em solidez de carteira de crédito, expansão de serviços digitais, forte controle de inadimplência e potencial de aumento de dividendos extraordinários.',
    riskLevel: 'Baixo',
  }
};

const getCompanyNameAndRI = (symbol: string): { name: string; riUrl: string; sector: string } => {
  const cleanSymbol = symbol.toUpperCase().replace('.SA', '').trim();
  
  // Try to find in ALL_B3_TICKERS
  const tickerRegistry = ALL_B3_TICKERS.find(t => t.symbol === cleanSymbol);
  let companyName = tickerRegistry ? tickerRegistry.name.split(' - ')[0] : cleanSymbol;
  companyName = companyName.replace(' S.A.', '').replace(' Group', '').replace(' Holding', '').replace(' S/A', '');
  
  let sector = 'general';
  let riUrl = `https://www.google.com/search?q=${cleanSymbol}+Relações+com+Investidores`;
  
  if (cleanSymbol.startsWith('PETR') || cleanSymbol.startsWith('PRIO') || cleanSymbol.startsWith('RAIZ') || cleanSymbol.startsWith('CSAN') || cleanSymbol.startsWith('UGPA') || cleanSymbol.startsWith('RECV') || cleanSymbol.startsWith('ENAT') || cleanSymbol.startsWith('BRAV')) {
    sector = 'oil';
    if (cleanSymbol.startsWith('PETR')) riUrl = 'https://www.investidorpetrobras.com.br/';
    else if (cleanSymbol.startsWith('PRIO')) riUrl = 'https://ri.prio3.com/';
    else if (cleanSymbol.startsWith('RAIZ')) riUrl = 'https://ri.raizen.com.br/';
    else if (cleanSymbol.startsWith('CSAN')) riUrl = 'https://ri.cosan.com.br/';
    else if (cleanSymbol.startsWith('UGPA')) riUrl = 'https://ri.ultrapar.com.br/';
  } else if (cleanSymbol.startsWith('VALE') || cleanSymbol.startsWith('CSNA') || cleanSymbol.startsWith('GGBR') || cleanSymbol.startsWith('USIM') || cleanSymbol.startsWith('CMIN') || cleanSymbol.startsWith('CBAV') || cleanSymbol.startsWith('FESA')) {
    sector = 'mining';
    if (cleanSymbol.startsWith('VALE')) riUrl = 'https://ri.vale.com/';
    else if (cleanSymbol.startsWith('CSNA')) riUrl = 'https://ri.csn.com.br/';
    else if (cleanSymbol.startsWith('GGBR')) riUrl = 'https://ri.gerdau.com/';
    else if (cleanSymbol.startsWith('USIM')) riUrl = 'https://ri.usiminas.com/';
  } else if (cleanSymbol.startsWith('WEGE') || cleanSymbol.startsWith('SUZB') || cleanSymbol.startsWith('KLBN') || cleanSymbol.startsWith('EMBR') || cleanSymbol.startsWith('EMBJ') || cleanSymbol.startsWith('POMO') || cleanSymbol.startsWith('RAPT') || cleanSymbol.startsWith('TUPY') || cleanSymbol.startsWith('KEPL') || cleanSymbol.startsWith('LEVE') || cleanSymbol.startsWith('FRAS') || cleanSymbol.startsWith('PORT') || cleanSymbol.startsWith('STBP') || cleanSymbol.startsWith('LOGG') || cleanSymbol.startsWith('RANI') || cleanSymbol.startsWith('VLID') || cleanSymbol.startsWith('TGMA') || cleanSymbol.startsWith('ECOR') || cleanSymbol.startsWith('CCRO')) {
    sector = 'industrials';
    if (cleanSymbol.startsWith('WEGE')) riUrl = 'https://ri.weg.net/';
    else if (cleanSymbol.startsWith('SUZB')) riUrl = 'https://ri.suzano.com.br/';
    else if (cleanSymbol.startsWith('KLBN')) riUrl = 'https://ri.klabin.com.br/';
    else if (cleanSymbol.startsWith('EMBR') || cleanSymbol.startsWith('EMBJ')) riUrl = 'https://ri.embraer.com.br/';
    else if (cleanSymbol.startsWith('POMO')) riUrl = 'https://ri.marcopolo.com.br/';
  } else if (cleanSymbol.startsWith('ITUB') || cleanSymbol.startsWith('ITSA') || cleanSymbol.startsWith('BBAS') || cleanSymbol.startsWith('BBDC') || cleanSymbol.startsWith('SANB') || cleanSymbol.startsWith('B3SA') || cleanSymbol.startsWith('CIEL') || cleanSymbol.startsWith('IRBR') || cleanSymbol.startsWith('CXSE') || cleanSymbol.startsWith('BBSE') || cleanSymbol.startsWith('PSSA') || cleanSymbol.startsWith('BPAC') || cleanSymbol.startsWith('ABCB') || cleanSymbol.startsWith('BRSR') || cleanSymbol.startsWith('WIZC') || cleanSymbol.startsWith('BMGB')) {
    sector = 'finance';
    if (cleanSymbol.startsWith('ITUB')) riUrl = 'https://www.itau.com.br/relacoes-com-investidores/';
    else if (cleanSymbol.startsWith('BBAS')) riUrl = 'https://ri.bb.com.br/';
    else if (cleanSymbol.startsWith('ITSA')) riUrl = 'https://www.itausa.com.br/';
    else if (cleanSymbol.startsWith('BBDC')) riUrl = 'https://www.bradescori.com.br/';
    else if (cleanSymbol.startsWith('SANB')) riUrl = 'https://www.ri.santander.com.br/';
    else if (cleanSymbol.startsWith('B3SA')) riUrl = 'https://ri.b3.com.br/';
    else if (cleanSymbol.startsWith('CXSE')) riUrl = 'https://ri.caixaseguridade.com.br/';
    else if (cleanSymbol.startsWith('BBSE')) riUrl = 'https://ri.bbseguridade.com.br/';
    else if (cleanSymbol.startsWith('PSSA')) riUrl = 'https://ri.portoseguro.com.br/';
  } else if (cleanSymbol.startsWith('TAEE') || cleanSymbol.startsWith('TRPL') || cleanSymbol.startsWith('EGIE') || cleanSymbol.startsWith('ELET') || cleanSymbol.startsWith('CPLE') || cleanSymbol.startsWith('EQTL') || cleanSymbol.startsWith('CMIG') || cleanSymbol.startsWith('ALUP') || cleanSymbol.startsWith('CPFE') || cleanSymbol.startsWith('ENEV') || cleanSymbol.startsWith('AURE') || cleanSymbol.startsWith('NEOE') || cleanSymbol.startsWith('ENGI')) {
    sector = 'utilities';
    if (cleanSymbol.startsWith('TAEE')) riUrl = 'https://ri.taesa.com.br/';
    else if (cleanSymbol.startsWith('TRPL')) riUrl = 'https://www.isacteep.com.br/ri';
    else if (cleanSymbol.startsWith('EGIE')) riUrl = 'https://ri.engie.com.br/';
    else if (cleanSymbol.startsWith('ELET')) riUrl = 'https://ri.eletrobras.com.br/';
    else if (cleanSymbol.startsWith('CPLE')) riUrl = 'https://ri.copel.com/';
    else if (cleanSymbol.startsWith('EQTL')) riUrl = 'https://ri.equatorialenergia.com.br/';
    else if (cleanSymbol.startsWith('CMIG')) riUrl = 'https://ri.cemig.com.br/';
    else if (cleanSymbol.startsWith('ALUP')) riUrl = 'https://ri.alupar.com.br/';
    else if (cleanSymbol.startsWith('CPFE')) riUrl = 'https://ri.cpfl.com.br/';
  } else if (cleanSymbol.startsWith('SBSP') || cleanSymbol.startsWith('SAPR') || cleanSymbol.startsWith('CSMG')) {
    sector = 'sanitation';
    if (cleanSymbol.startsWith('SBSP')) riUrl = 'https://ri.sabesp.com.br/';
    else if (cleanSymbol.startsWith('SAPR')) riUrl = 'https://ri.sanepar.com.br/';
    else if (cleanSymbol.startsWith('CSMG')) riUrl = 'https://ri.copasa.com.br/';
  } else if (cleanSymbol.startsWith('CURY') || cleanSymbol.startsWith('TEND') || cleanSymbol.startsWith('MRVE') || cleanSymbol.startsWith('CYRE') || cleanSymbol.startsWith('EZTC') || cleanSymbol.startsWith('DIRR') || cleanSymbol.startsWith('DXCO') || cleanSymbol.startsWith('LAVV') || cleanSymbol.startsWith('EVEN') || cleanSymbol.startsWith('JHSF') || cleanSymbol.startsWith('HBOR') || cleanSymbol.startsWith('PLPL') || cleanSymbol.startsWith('MTRE') || cleanSymbol.startsWith('MELK') || cleanSymbol.startsWith('GFSA') || cleanSymbol.startsWith('TRIS') || cleanSymbol.startsWith('SYNE')) {
    sector = 'housing';
    if (cleanSymbol.startsWith('CURY')) riUrl = 'https://ri.cury.net/';
    else if (cleanSymbol.startsWith('TEND')) riUrl = 'https://ri.tenda.com/';
    else if (cleanSymbol.startsWith('MRVE')) riUrl = 'https://ri.mrv.com.br/';
    else if (cleanSymbol.startsWith('CYRE')) riUrl = 'https://ri.cyrela.com.br/';
    else if (cleanSymbol.startsWith('EZTC')) riUrl = 'https://ri.eztec.com.br/';
    else if (cleanSymbol.startsWith('DIRR')) riUrl = 'https://ri.direcional.com.br/';
  } else if (cleanSymbol.startsWith('MGLU') || cleanSymbol.startsWith('LREN') || cleanSymbol.startsWith('ARZZ') || cleanSymbol.startsWith('BHIA') || cleanSymbol.startsWith('AMER') || cleanSymbol.startsWith('VIVA') || cleanSymbol.startsWith('CRFB') || cleanSymbol.startsWith('ASAI') || cleanSymbol.startsWith('SOMA') || cleanSymbol.startsWith('CEAB') || cleanSymbol.startsWith('GUAR') || cleanSymbol.startsWith('ALPA') || cleanSymbol.startsWith('GRND') || cleanSymbol.startsWith('TFCO') || cleanSymbol.startsWith('PGMN') || cleanSymbol.startsWith('RADL') || cleanSymbol.startsWith('PETZ') || cleanSymbol.startsWith('LJQQ') || cleanSymbol.startsWith('SBFG') || cleanSymbol.startsWith('NTCO') || cleanSymbol.startsWith('TECN') || cleanSymbol.startsWith('VSTE')) {
    sector = 'retail';
    if (cleanSymbol.startsWith('LREN')) riUrl = 'https://lojasrenner.riweb.com.br/';
    else if (cleanSymbol.startsWith('MGLU')) riUrl = 'https://ri.magazineluiza.com.br/';
    else if (cleanSymbol.startsWith('ARZZ')) riUrl = 'https://ri.arezzo.com.br/';
    else if (cleanSymbol.startsWith('BHIA')) riUrl = 'https://ri.casasbahia.com.br/';
    else if (cleanSymbol.startsWith('ASAI')) riUrl = 'https://ri.assai.com.br/';
  } else if (cleanSymbol.startsWith('JBSS') || cleanSymbol.startsWith('BRFS') || cleanSymbol.startsWith('MRFG') || cleanSymbol.startsWith('BEEF') || cleanSymbol.startsWith('SLCE') || cleanSymbol.startsWith('SMTO') || cleanSymbol.startsWith('AGRO') || cleanSymbol.startsWith('SOJA') || cleanSymbol.startsWith('MDIA') || cleanSymbol.startsWith('CAML') || cleanSymbol.startsWith('SMFT') || cleanSymbol.startsWith('UNIP') || cleanSymbol.startsWith('BRKM')) {
    sector = 'food';
    if (cleanSymbol.startsWith('JBSS')) riUrl = 'https://ri.jbs.com.br/';
    else if (cleanSymbol.startsWith('BRFS')) riUrl = 'https://ri.brf-global.com/';
  } else if (cleanSymbol.startsWith('HAPV') || cleanSymbol.startsWith('RDOR') || cleanSymbol.startsWith('FLRY') || cleanSymbol.startsWith('HYPE') || cleanSymbol.startsWith('ONCO') || cleanSymbol.startsWith('ODPV') || cleanSymbol.startsWith('MATD')) {
    sector = 'health';
    if (cleanSymbol.startsWith('RDOR')) riUrl = 'https://ri.rededor.com.br/';
    else if (cleanSymbol.startsWith('FLRY')) riUrl = 'https://ri.fleury.com.br/';
  } else if (cleanSymbol.startsWith('COGN') || cleanSymbol.startsWith('YDUQ') || cleanSymbol.startsWith('CSED') || cleanSymbol.startsWith('SEER')) {
    sector = 'education';
  } else if (cleanSymbol.startsWith('TIMS') || cleanSymbol.startsWith('VIVT')) {
    sector = 'telecom';
  } else if (cleanSymbol.startsWith('TOTS') || cleanSymbol.startsWith('LWSA') || cleanSymbol.startsWith('INTB') || cleanSymbol.startsWith('POSI') || cleanSymbol.startsWith('DESK') || cleanSymbol.startsWith('FIQE') || cleanSymbol.startsWith('ELMD') || cleanSymbol.startsWith('CLSA') || cleanSymbol.startsWith('ALPK')) {
    sector = 'tech';
  } else {
    // Dynamic fallback checking using the category helper
    const category = getTickerCategory(cleanSymbol, tickerRegistry?.name || '');
    if (category === 'Fundos Imobiliários (FIIs)') {
      sector = 'fii';
      riUrl = `https://statusinvest.com.br/fundos-imobiliarios/${cleanSymbol.toLowerCase()}`;
    } else if (category === 'ETFs') {
      sector = 'etf';
      riUrl = `https://statusinvest.com.br/etfs/${cleanSymbol.toLowerCase()}`;
    } else if (category === 'Ações Americanas (Stocks)' || (cleanSymbol.length <= 5 && !cleanSymbol.match(/\d/))) {
      sector = 'us';
      riUrl = `https://www.google.com/search?q=${cleanSymbol}+Investor+Relations`;
    }
  }
  
  return { name: companyName, riUrl, sector };
};

export function getTickerSector(symbol: string): string {
  const { sector } = getCompanyNameAndRI(symbol);
  const sectorMap: Record<string, string> = {
    oil: 'Petróleo & Gás',
    mining: 'Mineração & Siderurgia',
    industrials: 'Indústria & Logística',
    finance: 'Setor Financeiro',
    utilities: 'Utilidades Públicas',
    sanitation: 'Saneamento',
    housing: 'Construção Civil',
    retail: 'Consumo & Varejo',
    food: 'Alimentos & Agro',
    health: 'Saúde & Farmácia',
    education: 'Educação',
    telecom: 'Telecomunicações',
    tech: 'Tecnologia',
    fii: 'Fundos Imobiliários (FIIs)',
    etf: 'ETFs',
    us: 'Ações Americanas (Stocks)',
  };
  return sectorMap[sector] || 'Geral/Outros';
}

export function generateDynamicStockNews(symbol: string): NewsItem[] {
  const cleanSymbol = symbol.toUpperCase().replace('.SA', '').trim();
  const { name, riUrl, sector } = getCompanyNameAndRI(cleanSymbol);
  
  const newsItems: NewsItem[] = [];
  
  // Retroactive dates
  const getDateAgo = (days: number): string => {
    return new Date(Date.now() - 86400000 * days).toISOString().split('T')[0];
  };

  // Define some sector-specific values to make text realistic
  let val_div = 'R$ 0,85';
  let val_pct = '8,4%';
  let val_ope = 'expansão de novos projetos de infraestrutura';
  let val_capex = 'R$ 450 milhões';

  if (sector === 'oil') {
    val_div = 'R$ 1,45';
    val_pct = '11,2%';
    val_ope = 'perfuração de novos poços exploratórios em águas profundas';
    val_capex = 'R$ 2,8 bilhões';
  } else if (sector === 'mining') {
    val_div = 'R$ 2,20';
    val_pct = '9,5%';
    val_ope = 'otimização operacional e modernização das malhas ferroviárias';
    val_capex = 'R$ 1,5 bilhão';
  } else if (sector === 'finance') {
    val_div = 'R$ 0,55';
    val_pct = '7,8%';
    val_ope = 'expansão de crédito sustentável e investimento em canais digitais';
    val_capex = 'R$ 900 milhões';
  } else if (sector === 'utilities') {
    val_div = 'R$ 1,12';
    val_pct = '9,8%';
    val_ope = 'construção de novas linhas de transmissão e subestações';
    val_capex = 'R$ 680 milhões';
  } else if (sector === 'sanitation') {
    val_div = 'R$ 0,32';
    val_pct = '6,4%';
    val_ope = 'ampliação de redes de esgoto e estações de tratamento de água';
    val_capex = 'R$ 380 milhões';
  } else if (sector === 'housing') {
    val_div = 'R$ 0,72';
    val_pct = '8,2%';
    val_ope = 'incorporação de novos empreendimentos residenciais de médio padrão';
    val_capex = 'R$ 250 milhões';
  } else if (sector === 'fii') {
    val_div = 'R$ 0,09';
    val_pct = '10,8%';
    val_ope = 'aquisição de novos galpões logísticos classe A no sudeste';
    val_capex = 'R$ 120 milhões';
  } else if (sector === 'us') {
    val_div = 'US$ 0,24';
    val_pct = '2,1%';
    val_ope = 'desenvolvimento de infraestrutura de inteligência artificial e computação em nuvem';
    val_capex = 'US$ 4,5 bilhões';
  }

  // Helper arrays for building sources and urls
  const investmentSources = [
    { name: 'InfoMoney', searchUrl: `https://www.infomoney.com.br/busca/?q=${cleanSymbol}` },
    { name: 'Valor Econômico', searchUrl: `https://valor.globo.com/busca/?q=${cleanSymbol}` },
    { name: 'Bloomberg Línea', searchUrl: `https://www.bloomberglinea.com.br/buscar?q=${cleanSymbol}` },
    { name: 'Brazil Journal', searchUrl: `https://braziljournal.com/?s=${cleanSymbol}` },
    { name: 'Money Times', searchUrl: `https://www.moneytimes.com.br/?s=${cleanSymbol}` },
    { name: 'Suno Notícias', searchUrl: `https://www.suno.com.br/noticias/?s=${cleanSymbol}` }
  ];

  const generalSources = [
    { name: 'Exame', searchUrl: `https://exame.com/busca/?q=${cleanSymbol}` },
    { name: 'Estadão', searchUrl: `https://busca.estadao.com.br/?q=${cleanSymbol}` },
    { name: 'O Globo', searchUrl: `https://g1.globo.com/busca/?q=${cleanSymbol}` },
    { name: 'Reuters', searchUrl: `https://www.reuters.com/site-search/?query=${cleanSymbol}` },
    { name: 'G1 Economia', searchUrl: `https://g1.globo.com/busca/?q=${cleanSymbol}` },
    { name: 'CNBC', searchUrl: `https://www.cnbc.com/search/?query=${cleanSymbol}` }
  ];

  // News item 1 (RI - Dividends)
  newsItems.push({
    id: `${cleanSymbol}-n1`,
    title: sector === 'fii' 
      ? `Aviso de Rendimentos: Fundo ${name} (${symbol}) divulga pagamento mensal de proventos`
      : `Aviso aos Acionistas: ${name} (${symbol}) aprova distribuição de proventos de ${val_div} por ação`,
    source: `RI ${name}`,
    date: getDateAgo(1),
    url: riUrl,
    isRelevantFact: true,
    summary: sector === 'fii'
      ? `O administrador do fundo confirmou que a data-base para recebimento dos rendimentos de ${val_div} por cota será o próximo dia útil.`
      : `O conselho de administração da companhia homologou a proposta de pagamento correspondente ao exercício social recente, assegurando o retorno de dividendos.`,
    sourceCategory: 'ri'
  });

  // News item 2 (RI - Earnings Report)
  newsItems.push({
    id: `${cleanSymbol}-n2`,
    title: `Fato Relevante: Divulgação do relatório operacional consolidado e margens do trimestre`,
    source: `Portal RI ${name}`,
    date: getDateAgo(3),
    url: riUrl,
    isRelevantFact: true,
    summary: `A empresa apresentou evolução em seus indicadores EBITDA e lucro líquido, impulsionados pela captura de sinergias operacionais recentes.`,
    sourceCategory: 'ri'
  });

  // News item 3 (RI - CAPEX Plan)
  newsItems.push({
    id: `${cleanSymbol}-n3`,
    title: `Comunicado ao Mercado: Diretoria homologa plano de investimentos de ${val_capex} para expansão`,
    source: `RI ${name}`,
    date: getDateAgo(6),
    url: riUrl,
    isRelevantFact: true,
    summary: `O projeto estratégico detalha o cronograma físico-financeiro focado em ${val_ope} ao longo dos próximos trimestres.`,
    sourceCategory: 'ri'
  });

  // News item 4 (RI - Corporate Financing / Rating)
  newsItems.push({
    id: `${cleanSymbol}-n4`,
    title: sector === 'fii'
      ? `Fato Relevante: Homologação de subscrição de novas cotas e emissão de lote adicional`
      : `Fato Relevante: Assembleia aprova captação via emissão de debêntures para capital de giro`,
    source: `CVM / RI ${name}`,
    date: getDateAgo(9),
    url: riUrl,
    isRelevantFact: true,
    summary: sector === 'fii'
      ? `A nova emissão visa consolidar a aquisição de ativos logísticos e comerciais estratégicos, mantendo os níveis de alavancagem saudáveis.`
      : `Os recursos captados no mercado local de capitais serão destinados ao reperfilamento do cronograma de amortização de dívidas de curto prazo.`,
    sourceCategory: 'ri'
  });

  // News item 5 (Investment - Valuation)
  const isrc5 = investmentSources[0]; // InfoMoney
  newsItems.push({
    id: `${cleanSymbol}-n5`,
    title: `Valuation: Analistas do mercado elevam preço-alvo de ${cleanSymbol} destacando margem de segurança`,
    source: isrc5.name,
    date: getDateAgo(0),
    url: isrc5.searchUrl,
    isRelevantFact: false,
    summary: `Em relatório divulgado a clientes, analistas ressaltam que o múltiplo de preço/lucro atual da ação negocia abaixo da média histórica setorial.`,
    sourceCategory: 'investment'
  });

  // News item 6 (Investment - Dividends outlook)
  const isrc6 = investmentSources[1]; // Valor Economico
  newsItems.push({
    id: `${cleanSymbol}-n6`,
    title: `Dividendos: Projeções indicam Dividend Yield estimado de ${val_pct} para o papel ${cleanSymbol}`,
    source: isrc6.name,
    date: getDateAgo(2),
    url: isrc6.searchUrl,
    isRelevantFact: false,
    summary: `Estrategistas de dividendos listam a ação como destaque no ranking de renda passiva, amparada pela estabilidade do fluxo de caixa operacional.`,
    sourceCategory: 'investment'
  });

  // News item 7 (Investment - Setorial / Macro)
  const isrc7 = investmentSources[3]; // Brazil Journal
  newsItems.push({
    id: `${cleanSymbol}-n7`,
    title: `Setorial: Perspectiva de oferta e demanda setorial no Brasil traz otimismo aos papéis da ${name}`,
    source: isrc7.name,
    date: getDateAgo(5),
    url: isrc7.searchUrl,
    isRelevantFact: false,
    summary: `A dinâmica recente de preços internacionais e o avanço da demanda de consumo interno favorecem o market share da empresa frente aos pares.`,
    sourceCategory: 'investment'
  });

  // News item 8 (Investment - Flow / Buyback)
  const isrc8 = investmentSources[2]; // Bloomberg Linea
  newsItems.push({
    id: `${cleanSymbol}-n8`,
    title: sector === 'us'
      ? `Fluxo: Fundos globais aumentam exposição em papéis de tecnologia americana como ${cleanSymbol}`
      : `Mercado: Ação ${cleanSymbol} registra forte fluxo comprador impulsionado por fundos estrangeiros`,
    source: isrc8.name,
    date: getDateAgo(8),
    url: isrc8.searchUrl,
    isRelevantFact: false,
    summary: `O interesse de gestores internacionais se deve à solidez operacional demonstrada e ao bom controle do endividamento financeiro líquido.`,
    sourceCategory: 'investment'
  });

  // News item 9 (General news - Juros / Selic)
  const gsrc9 = generalSources[0]; // Exame
  newsItems.push({
    id: `${cleanSymbol}-n9`,
    title: `Cenário: Como a trajetória das taxas de juros futuras influencia a rentabilidade da ${name}`,
    source: gsrc9.name,
    date: getDateAgo(4),
    url: gsrc9.searchUrl,
    isRelevantFact: false,
    summary: `Especialistas analisam os efeitos das oscilações da taxa Selic de curto prazo na rolagem de passivos e custos operacionais da empresa.`,
    sourceCategory: 'general'
  });

  // News item 10 (General news - ESG / Governance)
  const gsrc10 = generalSources[1]; // Estadao
  newsItems.push({
    id: `${cleanSymbol}-n10`,
    title: `ESG: ${name} obtém selo de sustentabilidade e lança novo plano ambiental corporativo`,
    source: gsrc10.name,
    date: getDateAgo(7),
    url: gsrc10.searchUrl,
    isRelevantFact: false,
    summary: `O programa inclui investimentos em eficiência energética e metas de neutralização de carbono em suas instalações administrativas.`,
    sourceCategory: 'general'
  });

  // News item 11 (General news - Regulação / Reforma)
  const gsrc11 = generalSources[3]; // Reuters
  newsItems.push({
    id: `${cleanSymbol}-n11`,
    title: `Análise Legal: Impacto da reforma tributária e do enquadramento fiscal nos ativos da ${name}`,
    source: gsrc11.name,
    date: getDateAgo(11),
    url: gsrc11.searchUrl,
    isRelevantFact: false,
    summary: `Profissionais do direito tributário mapeiam possíveis benefícios e mitigações para a estrutura fiscal consolidada da holding.`,
    sourceCategory: 'general'
  });

  // News item 12 (General news - Executive board / Rating)
  const gsrc12 = generalSources[2]; // O Globo
  newsItems.push({
    id: `${cleanSymbol}-n12`,
    title: `Rating: Agências internacionais elevam nota de crédito da ${name} destacando solidez financeira`,
    source: sector === 'us' ? 'CNBC' : gsrc12.name,
    date: getDateAgo(14),
    url: sector === 'us' ? `https://www.cnbc.com/search/?query=${cleanSymbol}` : gsrc12.searchUrl,
    isRelevantFact: false,
    summary: `O upgrade de rating de crédito reflete a melhora consistente do balanço patrimonial e a excelente liquidez da empresa.`,
    sourceCategory: 'general'
  });

  return newsItems;
}

// Helper to get local overrides
export function getUserOverrides(): Record<string, Partial<StockData>> {
  try {
    const data = localStorage.getItem(KEYS.USER_OVERRIDES);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// Helper to save local overrides
export function saveUserOverride(symbol: string, overrides: Partial<StockData>) {
  try {
    const allOverrides = getUserOverrides();
    const cleanSymbol = symbol.toUpperCase().replace('.SA', '').trim();
    allOverrides[cleanSymbol] = {
      ...(allOverrides[cleanSymbol] || {}),
      ...overrides
    };
    localStorage.setItem(KEYS.USER_OVERRIDES, JSON.stringify(allOverrides));
  } catch (e) {
    console.error('Failed to save overrides to LocalStorage', e);
  }
}

// Helper for API key (legacy, kept for import safety)
export function getApiToken(): string {
  return localStorage.getItem(KEYS.API_TOKEN) || '';
}

export function saveApiToken(token: string) {
  localStorage.setItem(KEYS.API_TOKEN, token);
}

// Calculate volatility (annualized standard deviation of daily log returns)
function calculateVolatility(prices: Array<{ close: number }>): number {
  if (prices.length < 5) return 25.0; // standard default
  
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1].close;
    const curr = prices[i].close;
    if (prev > 0) {
      returns.push(Math.log(curr / prev));
    }
  }
  
  if (returns.length === 0) return 25.0;
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1 || 1);
  const stdDev = Math.sqrt(variance);
  
  const vol = stdDev * Math.sqrt(252) * 100;
  return Number(vol.toFixed(2));
}

// Generate fallback historical price data
function generateHistoricalPrices(basePrice: number, days = 30): Array<{ date: string; price: number; open: number; high: number; low: number; close: number; volume: number }> {
  const list: Array<{ date: string; price: number; open: number; high: number; low: number; close: number; volume: number }> = [];
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  let currentPrice = basePrice * 0.95;
  
  for (let i = 0; i < days; i++) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }
    const change = (Math.random() - 0.49) * 0.02;
    const prevPrice = currentPrice;
    currentPrice = currentPrice * (1 + change);
    
    const close = Number(currentPrice.toFixed(2));
    const open = Number(prevPrice.toFixed(2));
    const high = Number((Math.max(open, close) * (1 + Math.random() * 0.012)).toFixed(2));
    const low = Number((Math.min(open, close) * (1 - Math.random() * 0.012)).toFixed(2));
    
    list.push({
      date: date.toISOString().split('T')[0],
      price: close,
      open,
      high,
      low,
      close,
      volume: Math.floor(1000000 + Math.random() * 5000000) // Random volume between 1M and 6M
    });
  }
  return list;
}

// Scrape fundamentalist indicators from Investidor10 using CORS-bypassing proxy
async function fetchInvestidor10Data(symbol: string): Promise<Partial<StockData> | null> {
  const cleanSymbol = symbol.toUpperCase().replace('.SA', '').trim();
  
  // Decide order based on suffix to optimize and reduce requests
  let categoryOrder = ['acoes', 'fiis', 'bdrs', 'etfs'];
  const isBdr = cleanSymbol.endsWith('34');
  const is11 = cleanSymbol.endsWith('11');
  
  if (isBdr) {
    categoryOrder = ['bdrs', 'acoes', 'etfs', 'fiis'];
  } else if (is11) {
    const knownFii = ALL_B3_TICKERS.some(t => t.symbol === cleanSymbol && t.name.toLowerCase().includes('fii'));
    if (knownFii) {
      categoryOrder = ['fiis', 'etfs', 'acoes', 'bdrs'];
    } else {
      categoryOrder = ['fiis', 'acoes', 'etfs', 'bdrs'];
    }
  }

  // Helper to parse numbers like "5,16" or "21,60%" or "R$ 594,56 Bilhões" to float
  const parseValue = (text: string): number => {
    if (!text) return 0;
    const cleaned = text
      .replace(/\s+/g, '')
      .replace('R$', '')
      .replace('%', '')
      .replace(/\./g, '') // remove thousands dots
      .replace(',', '.');  // replace decimal comma
    const val = parseFloat(cleaned);
    return isNaN(val) ? 0 : val;
  };

  for (const cat of categoryOrder) {
    try {
      const url = `/investidor10/${cat}/${cleanSymbol.toLowerCase()}/`;
      const res = await fetch(url);
      if (res.ok) {
        const htmlText = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        
        // Extract long corporate name
        let longName = '';
        const nameEl = doc.querySelector('.name-company');
        if (nameEl && nameEl.textContent) {
          longName = nameEl.textContent.replace(/\s+/g, ' ').trim();
        }

        const indicators: Partial<StockData> = {};
        if (longName) {
          indicators.longName = longName;
        }

        // Parse _card elements (PL, PVP, DY)
        const cards = doc.querySelectorAll('._card');
        cards.forEach(card => {
          const headerEl = card.querySelector('._card-header');
          const valueEl = card.querySelector('._card-body span');
          if (headerEl && valueEl && headerEl.textContent && valueEl.textContent) {
            const title = headerEl.textContent.trim().toUpperCase();
            const valStr = valueEl.textContent.trim();
            if (title.includes('P/L')) {
              indicators.pl = parseValue(valStr);
            } else if (title.includes('P/VP')) {
              indicators.pvp = parseValue(valStr);
            } else if (title.includes('DY') || title.includes('DIVIDEND YIELD')) {
              indicators.dy = parseValue(valStr);
            }
          }
        });

        // Parse cell elements (ROE, Margem Liquida, VPA, LPA, etc.)
        const cells = doc.querySelectorAll('.cell');
        cells.forEach(cell => {
          const spanName = cell.querySelector('span');
          const valueEl = cell.querySelector('.value span');
          if (spanName && valueEl && spanName.textContent && valueEl.textContent) {
            const title = spanName.textContent.trim().toUpperCase();
            const valStr = valueEl.textContent.trim();
            
            if (title === 'ROE') {
              indicators.roe = parseValue(valStr);
            } else if (title === 'MARGEM LÍQUIDA') {
              indicators.margemLiquida = parseValue(valStr);
            } else if (title === 'VPA') {
              indicators.vpa = parseValue(valStr);
            } else if (title === 'LPA') {
              indicators.lpa = parseValue(valStr);
            } else if (title === 'DIVIDEND YIELD' && indicators.dy === undefined) {
              indicators.dy = parseValue(valStr);
            } else if (title === 'P/L' && indicators.pl === undefined) {
              indicators.pl = parseValue(valStr);
            } else if (title === 'P/VP' && indicators.pvp === undefined) {
              indicators.pvp = parseValue(valStr);
            }
          }
        });

        // If we extracted at least some meaningful fields, consider it a success
        if (Object.keys(indicators).length > 1) {
          return indicators;
        }
      }
    } catch (e) {
      console.warn(`Investidor10 category "${cat}" check failed for ${cleanSymbol}:`, e);
    }
  }

  return null;
}

// Accent normalization helper
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Get asset category based on symbol and name
export function getTickerCategory(symbol: string, name: string): string {
  const sym = symbol.toUpperCase().trim();
  const lowerName = name.toLowerCase();
  
  if (sym.includes('.') || sym.startsWith('^') || /^[A-Z]{1,5}$/.test(sym)) {
    if (sym.startsWith('^')) return 'Índices';
    return 'Ações Americanas (Stocks)';
  }
  if (sym.endsWith('34')) {
    return 'BDRs';
  }
  if (sym.endsWith('11')) {
    if (lowerName.includes('fii') || lowerName.includes('fundo imob') || lowerName.includes('rendimento') || lowerName.includes('fundo de inv')) {
      return 'Fundos Imobiliários (FIIs)';
    }
    if (sym === 'BOVA11' || sym === 'IVVB11' || sym === 'SMAL11' || sym === 'HASH11' || lowerName.includes('etf')) {
      return 'ETFs';
    }
    return 'Ações Brasileiras (Units)';
  }
  return 'Ações Brasileiras';
}

// Get strategy for ticker
export function getTickerStrategy(symbol: string): string {
  const cleanSymbol = symbol.toUpperCase().replace('.SA', '').trim();
  const mock = DEFAULT_MOCK_DATA[cleanSymbol];
  if (mock && mock.strategy) {
    return mock.strategy;
  }
  
  if (cleanSymbol.endsWith('11') && !cleanSymbol.startsWith('BOVA') && !cleanSymbol.startsWith('IVVB')) {
    return 'Dividendos/Value'; // FIIs are mostly dividend-oriented
  }
  return 'Outro';
}

// Smart, categorized and accent-insensitive ticker search
export function searchTickers(query: string, limit: number = 8): B3Ticker[] {
  if (!query.trim()) return [];
  const q = normalizeText(query);

  const matched = ALL_B3_TICKERS.filter(item => {
    const symNorm = normalizeText(item.symbol);
    const nameNorm = normalizeText(item.name);
    return symNorm.includes(q) || nameNorm.includes(q);
  });

  // Score matching for optimal ranking
  const scored = matched.map(item => {
    const symNorm = normalizeText(item.symbol);
    const nameNorm = normalizeText(item.name);
    
    let score = 0;
    if (symNorm === q) {
      score = 100;
    } else if (symNorm.startsWith(q)) {
      score = 80;
    } else if (symNorm.includes(q)) {
      score = 60;
    } else if (nameNorm.startsWith(q)) {
      score = 40;
    } else {
      score = 20;
    }
    return { item, score };
  });

  return scored
    .sort((a, b) => b.score - a.score || a.item.symbol.localeCompare(b.item.symbol))
    .map(x => x.item)
    .slice(0, limit);
}

// Retrieve similar tickers from registry
export function getSimilarTickers(query: string): B3Ticker[] {
  const q = query.toUpperCase().trim();
  if (!q) return [];

  // 1. Direct contains symbol or company name match
  let matches = ALL_B3_TICKERS.filter(t => 
    t.symbol.includes(q) || 
    t.name.toUpperCase().includes(q)
  );

  // 2. If no direct matches, check overlapping characters
  if (matches.length === 0) {
    const scores = ALL_B3_TICKERS.map(t => {
      let score = 0;
      const sym = t.symbol.toUpperCase();
      
      // Points for shared characters
      for (const char of q) {
        if (sym.includes(char)) {
          score += 2;
        }
      }
      
      // Bonus points if starts with same character
      if (sym.startsWith(q[0])) {
        score += 3;
      }
      
      return { ticker: t, score };
    });

    matches = scores
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.ticker);
  }

  // Return maximum 9 similar suggestions
  return matches.slice(0, 9);
}

// Fetch stock details - Unified Sourcing (Yahoo Finance + Investidor10)
export async function fetchStockData(symbol: string): Promise<StockData> {
  const cleanSymbol = symbol.toUpperCase().replace('.SA', '').trim();

  // Load defaults mock (fallbacks) if needed
  const mockBase = DEFAULT_MOCK_DATA[cleanSymbol] || {
    longName: `${cleanSymbol} S.A.`,
    logourl: `https://icons.brapi.dev/icons/${cleanSymbol}.svg`,
    pl: 10.0,
    pvp: 1.5,
    dy: 4.5,
    roe: 12.0,
    margemLiquida: 10.0,
    lpa: 1.0,
    vpa: 10.0,
    targetPrice: 20.0,
    strategy: 'Outro',
    thesis: 'Nenhuma tese cadastrada para este ativo ainda. Clique no campo abaixo para redigir sua análise fundamentalista.',
    riskLevel: 'Médio',
  };

  let regularMarketPrice = 30.00;
  let high = 31.00;
  let low = 29.00;
  let change = 0.45;
  let changePercent = 1.52;
  let vol = 1250000;
  let cap = 1250000000;
  let currency = 'BRL';
  let longName = mockBase.longName || `${cleanSymbol} S.A.`;
  let logo = `https://icons.brapi.dev/icons/${cleanSymbol}.svg`;
  let history: Array<{
    date: string;
    price: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
  }> = [];
  
  let loadedViaYahoo = false;

  // 1. Fetch Price & Chart History via Brapi
  try {
    const brapiToken = import.meta.env.VITE_BRAPI_TOKEN || '';
    const chartRes = await fetch(`https://brapi.dev/api/quote/${cleanSymbol}?range=3mo&interval=1d&token=${brapiToken}`);
    if (chartRes.ok) {
      const chartJson = await chartRes.json();
      const meta = chartJson.results?.[0];
      if (meta) {
        regularMarketPrice = meta.regularMarketPrice ?? regularMarketPrice;
        high = meta.regularMarketDayHigh ?? regularMarketPrice;
        low = meta.regularMarketDayLow ?? regularMarketPrice;
        vol = meta.regularMarketVolume ?? vol;
        currency = meta.currency ?? currency;
        longName = meta.longName ?? meta.shortName ?? longName;
        change = meta.regularMarketChange ?? 0;
        changePercent = meta.regularMarketChangePercent ?? 0;

        const historyData = meta.historicalDataPrice || [];
        if (historyData.length > 0) {
          history = historyData.map((d: any) => ({
            date: new Date(d.date * 1000).toISOString().split('T')[0],
            price: Number(d.close.toFixed(2)),
            open: Number(d.open.toFixed(2)),
            high: Number(d.high.toFixed(2)),
            low: Number(d.low.toFixed(2)),
            close: Number(d.close.toFixed(2)),
            volume: Number(d.volume) || 0
          }));
        }
        loadedViaYahoo = true; // Using same flag to bypass error check later
      }
    }
  } catch (err) {
    console.warn('Brapi chart fetch failed, falling back to mocks', err);
  }

  // 2. Fetch Múltiplos Fundamentalistas from Investidor10
  let investidor10Data: Partial<StockData> | null = null;
  try {
    investidor10Data = await fetchInvestidor10Data(cleanSymbol);
    if (investidor10Data && investidor10Data.longName) {
      longName = investidor10Data.longName;
    }
  } catch (err) {
    console.warn('Investidor10 parser fetch failed', err);
  }

  // If both failed, try to fallback to B3 registry entry to avoid "Not Found" errors for valid B3 assets
  const registryEntry = ALL_B3_TICKERS.find(t => t.symbol === cleanSymbol);

  if (!loadedViaYahoo && !investidor10Data && !DEFAULT_MOCK_DATA[cleanSymbol]) {
    if (registryEntry) {
      longName = registryEntry.name;
      // Mark as loaded to trigger dynamic mock generation smoothly
      loadedViaYahoo = true;
    } else {
      throw new Error(`Ticker "${cleanSymbol}" não foi encontrado na B3.`);
    }
  }

  // Set default history fallback if none loaded
  if (history.length === 0) {
    history = generateHistoricalPrices(regularMarketPrice, 60);
  }

  // Calculate volatility based on historical prices
  const calculatedVol = calculateVolatility(history.map(h => ({ close: h.price })));

  // Merge LocalStorage overrides
  const userOverrides = getUserOverrides()[cleanSymbol] || {};

  const finalStockData: StockData = {
    symbol: cleanSymbol,
    shortName: cleanSymbol,
    longName: longName,
    currency: currency,
    regularMarketPrice: regularMarketPrice,
    regularMarketDayHigh: high,
    regularMarketDayLow: low,
    regularMarketChange: change,
    regularMarketChangePercent: changePercent,
    marketCap: cap,
    regularMarketVolume: vol,
    logourl: logo,
    
    // Fundamentalist Indicators (Investidor10 -> User Overrides -> Mocks -> Standard Fallbacks)
    pl: Number((userOverrides.pl ?? investidor10Data?.pl ?? mockBase.pl ?? 10.0).toFixed(3)),
    pvp: Number((userOverrides.pvp ?? investidor10Data?.pvp ?? mockBase.pvp ?? 1.5).toFixed(3)),
    dy: Number((userOverrides.dy ?? investidor10Data?.dy ?? mockBase.dy ?? 4.0).toFixed(3)),
    roe: Number((userOverrides.roe ?? investidor10Data?.roe ?? mockBase.roe ?? 12.0).toFixed(3)),
    margemLiquida: Number((userOverrides.margemLiquida ?? investidor10Data?.margemLiquida ?? mockBase.margemLiquida ?? 10.0).toFixed(3)),
    
    // Risk & Valuation
    volatility: calculatedVol,
    riskLevel: userOverrides.riskLevel ?? (calculatedVol < 15 ? 'Baixo' : calculatedVol > 30 ? 'Alto' : mockBase.riskLevel ?? 'Médio'),
    lpa: Number((userOverrides.lpa ?? investidor10Data?.lpa ?? mockBase.lpa ?? 1.0).toFixed(3)),
    vpa: Number((userOverrides.vpa ?? investidor10Data?.vpa ?? mockBase.vpa ?? 10.0).toFixed(3)),
    targetPrice: Number((userOverrides.targetPrice ?? mockBase.targetPrice ?? regularMarketPrice * 1.2).toFixed(3)),
    fairPriceManual: userOverrides.fairPriceManual,
    
    // Strategy & thesis
    strategy: userOverrides.strategy ?? mockBase.strategy ?? 'Outro',
    thesis: userOverrides.thesis ?? mockBase.thesis ?? '',
    
    history
  };

  return finalStockData;
}

// Fetch news feed
export async function fetchStockNews(symbol: string): Promise<NewsItem[]> {
  const cleanSymbol = symbol.toUpperCase().replace('.SA', '').trim();
  return generateDynamicStockNews(cleanSymbol);
}

// Fetch recommendations / consensus
export async function fetchStockConsensus(symbol: string, currentPrice: number): Promise<ConsensusData> {
  const cleanSymbol = symbol.toUpperCase().replace('.SA', '').trim();

  // Return highly contextual computed consensus based on mocks and price stats
  const baseMock = DEFAULT_MOCK_DATA[cleanSymbol];
  const target = baseMock?.targetPrice ?? (currentPrice * 1.2);
  
  const consensus: Record<string, ConsensusData> = {
    // Petróleo & Energia
    PETR4: { recommendation: 'Compra', targetHigh: 60.00, targetLow: 42.00, targetMean: 52.00, buys: 12, holds: 4, sells: 1 },
    PETR3: { recommendation: 'Compra', targetHigh: 58.00, targetLow: 40.00, targetMean: 50.00, buys: 11, holds: 5, sells: 1 },
    PRIO3: { recommendation: 'Compra Strong', targetHigh: 62.00, targetLow: 45.00, targetMean: 54.00, buys: 13, holds: 2, sells: 0 },
    CSAN3: { recommendation: 'Neutro', targetHigh: 18.00, targetLow: 11.00, targetMean: 14.50, buys: 4, holds: 7, sells: 3 },
    // Mineração & Siderurgia
    VALE3: { recommendation: 'Compra', targetHigh: 110.00, targetLow: 75.00, targetMean: 95.00, buys: 9, holds: 6, sells: 2 },
    CSNA3: { recommendation: 'Neutro', targetHigh: 16.00, targetLow: 10.00, targetMean: 13.00, buys: 3, holds: 6, sells: 4 },
    GGBR4: { recommendation: 'Compra', targetHigh: 28.00, targetLow: 18.00, targetMean: 23.00, buys: 7, holds: 5, sells: 2 },
    // Bancos & Financeiro
    ITUB4: { recommendation: 'Compra Strong', targetHigh: 42.00, targetLow: 34.00, targetMean: 38.00, buys: 15, holds: 2, sells: 0 },
    BBAS3: { recommendation: 'Compra', targetHigh: 38.00, targetLow: 28.00, targetMean: 33.00, buys: 10, holds: 4, sells: 1 },
    BBDC4: { recommendation: 'Neutro', targetHigh: 18.00, targetLow: 12.00, targetMean: 15.50, buys: 5, holds: 8, sells: 3 },
    SANB11: { recommendation: 'Neutro', targetHigh: 32.00, targetLow: 24.00, targetMean: 28.00, buys: 4, holds: 7, sells: 2 },
    B3SA3: { recommendation: 'Compra', targetHigh: 16.00, targetLow: 11.00, targetMean: 13.50, buys: 8, holds: 5, sells: 1 },
    BBSE3: { recommendation: 'Compra', targetHigh: 42.00, targetLow: 34.00, targetMean: 38.00, buys: 9, holds: 3, sells: 0 },
    // Utilities & Saneamento
    ELET3: { recommendation: 'Compra', targetHigh: 55.00, targetLow: 38.00, targetMean: 48.00, buys: 8, holds: 6, sells: 1 },
    EQTL3: { recommendation: 'Compra Strong', targetHigh: 40.00, targetLow: 30.00, targetMean: 36.00, buys: 12, holds: 3, sells: 0 },
    SBSP3: { recommendation: 'Compra Strong', targetHigh: 115.00, targetLow: 85.00, targetMean: 100.00, buys: 14, holds: 2, sells: 0 },
    SAPR4: { recommendation: 'Compra', targetHigh: 8.50, targetLow: 5.50, targetMean: 7.20, buys: 7, holds: 4, sells: 1 },
    TAEE11: { recommendation: 'Compra', targetHigh: 40.00, targetLow: 32.00, targetMean: 36.50, buys: 9, holds: 4, sells: 1 },
    CMIG4: { recommendation: 'Compra', targetHigh: 14.00, targetLow: 10.00, targetMean: 12.50, buys: 8, holds: 5, sells: 1 },
    CPFE3: { recommendation: 'Compra', targetHigh: 38.00, targetLow: 30.00, targetMean: 34.00, buys: 7, holds: 5, sells: 1 },
    CPLE6: { recommendation: 'Compra', targetHigh: 12.00, targetLow: 8.50, targetMean: 10.50, buys: 8, holds: 4, sells: 1 },
    // Construção Civil
    CURY3: { recommendation: 'Compra Strong', targetHigh: 28.00, targetLow: 21.00, targetMean: 24.50, buys: 10, holds: 1, sells: 0 },
    TEND3: { recommendation: 'Neutro', targetHigh: 20.00, targetLow: 12.00, targetMean: 16.00, buys: 2, holds: 5, sells: 3 },
    MRVE3: { recommendation: 'Neutro', targetHigh: 12.00, targetLow: 6.00, targetMean: 9.00, buys: 3, holds: 6, sells: 4 },
    DIRR3: { recommendation: 'Compra', targetHigh: 32.00, targetLow: 22.00, targetMean: 28.00, buys: 8, holds: 4, sells: 1 },
    // Industriais
    WEGE3: { recommendation: 'Neutro', targetHigh: 54.00, targetLow: 40.00, targetMean: 48.00, buys: 4, holds: 8, sells: 1 },
    EMBJ3: { recommendation: 'Compra Strong', targetHigh: 80.00, targetLow: 55.00, targetMean: 68.00, buys: 14, holds: 2, sells: 0 },
    EMBR3: { recommendation: 'Compra Strong', targetHigh: 80.00, targetLow: 55.00, targetMean: 68.00, buys: 14, holds: 2, sells: 0 },
    SUZB3: { recommendation: 'Compra', targetHigh: 72.00, targetLow: 52.00, targetMean: 62.00, buys: 9, holds: 5, sells: 1 },
    // Varejo
    LREN3: { recommendation: 'Compra', targetHigh: 22.00, targetLow: 14.00, targetMean: 18.00, buys: 8, holds: 5, sells: 2 },
    MGLU3: { recommendation: 'Venda', targetHigh: 14.00, targetLow: 6.00, targetMean: 9.50, buys: 1, holds: 4, sells: 8 },
    VIVA3: { recommendation: 'Compra', targetHigh: 32.00, targetLow: 22.00, targetMean: 28.00, buys: 9, holds: 3, sells: 1 },
    // Saúde
    RDOR3: { recommendation: 'Compra Strong', targetHigh: 38.00, targetLow: 28.00, targetMean: 34.00, buys: 13, holds: 2, sells: 0 },
    HAPV3: { recommendation: 'Compra', targetHigh: 8.00, targetLow: 4.50, targetMean: 6.50, buys: 7, holds: 5, sells: 2 },
    FLRY3: { recommendation: 'Compra', targetHigh: 20.00, targetLow: 14.00, targetMean: 17.50, buys: 8, holds: 4, sells: 1 },
    // Alimentos
    JBSS3: { recommendation: 'Compra', targetHigh: 48.00, targetLow: 34.00, targetMean: 42.00, buys: 10, holds: 4, sells: 1 },
    BRFS3: { recommendation: 'Compra', targetHigh: 30.00, targetLow: 20.00, targetMean: 26.00, buys: 8, holds: 5, sells: 1 },
    // Telecom & Tech
    VIVT3: { recommendation: 'Compra', targetHigh: 58.00, targetLow: 46.00, targetMean: 52.00, buys: 9, holds: 4, sells: 0 },
    TIMS3: { recommendation: 'Compra', targetHigh: 20.00, targetLow: 15.00, targetMean: 18.00, buys: 10, holds: 3, sells: 1 },
    TOTS3: { recommendation: 'Compra', targetHigh: 36.00, targetLow: 26.00, targetMean: 32.00, buys: 9, holds: 4, sells: 0 },
    // Outros
    RENT3: { recommendation: 'Compra Strong', targetHigh: 55.00, targetLow: 40.00, targetMean: 48.00, buys: 12, holds: 3, sells: 0 },
    RUMO3: { recommendation: 'Compra', targetHigh: 28.00, targetLow: 20.00, targetMean: 24.00, buys: 8, holds: 5, sells: 1 },
  };

  if (consensus[cleanSymbol]) {
    return consensus[cleanSymbol];
  }

  // Sector-aware dynamic fallback
  const { sector } = getCompanyNameAndRI(cleanSymbol);
  let buys = 5, holds = 5, sells = 2;
  let rec: ConsensusData['recommendation'] = 'Neutro';

  if (sector === 'utilities' || sector === 'sanitation') {
    buys = 8; holds = 4; sells = 1; rec = 'Compra';
  } else if (sector === 'finance') {
    buys = 7; holds = 5; sells = 1; rec = 'Compra';
  } else if (sector === 'oil') {
    buys = 6; holds = 5; sells = 2; rec = 'Compra';
  } else if (sector === 'retail') {
    buys = 4; holds = 5; sells = 3; rec = 'Neutro';
  } else if (sector === 'housing') {
    buys = 5; holds = 5; sells = 2; rec = 'Neutro';
  } else if (sector === 'us') {
    buys = 8; holds = 5; sells = 1; rec = 'Compra';
  }

  return {
    recommendation: rec,
    targetHigh: Number((target * 1.2).toFixed(2)),
    targetLow: Number((target * 0.8).toFixed(2)),
    targetMean: Number(target.toFixed(2)),
    buys,
    holds,
    sells
  };
}

// Candle chart timeframe types
export type CandleTimeframe = 'daily' | 'weekly' | 'monthly';

export interface CandleDataPoint {
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Fetch OHLCV chart data from Brapi with configurable timeframe
export async function fetchCandleChartData(
  symbol: string,
  timeframe: CandleTimeframe = 'daily'
): Promise<CandleDataPoint[]> {
  const cleanSymbol = symbol.toUpperCase().replace('.SA', '').trim();
  const brapiToken = import.meta.env.VITE_BRAPI_TOKEN || '';

  // Map timeframe to Brapi API parameters (extended ranges)
  const params: Record<CandleTimeframe, { range: string; interval: string }> = {
    daily:   { range: '1y',   interval: '1d' },
    weekly:  { range: '5y',   interval: '1wk' },
    monthly: { range: 'max',  interval: '1mo' },
  };

  const { range, interval } = params[timeframe];
  const url = `https://brapi.dev/api/quote/${cleanSymbol}?range=${range}&interval=${interval}&token=${brapiToken}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Brapi chart returned ${res.status}`);

    const json = await res.json();
    const historyData = json.results?.[0]?.historicalDataPrice || [];

    if (historyData.length === 0) throw new Error('No chart result');

    const history: CandleDataPoint[] = historyData.map((d: any) => ({
      date: new Date(d.date * 1000).toISOString().split('T')[0],
      price: Number(d.close.toFixed(2)),
      open: Number(d.open.toFixed(2)),
      high: Number(d.high.toFixed(2)),
      low: Number(d.low.toFixed(2)),
      close: Number(d.close.toFixed(2)),
      volume: Number(d.volume) || 0,
    }));

    // Generate fallback data if Brapi returns empty
    if (history.length === 0) throw new Error('Empty history from Brapi');

    return history;
  } catch (err) {
    console.warn(`fetchCandleChartData(${cleanSymbol}, ${timeframe}) failed:`, err);
    // Return fallback generated data
    return generateHistoricalPrices(30, timeframe === 'daily' ? 120 : timeframe === 'weekly' ? 104 : 60);
  }
}

// ============ DIVIDEND MAP ============

export interface DividendEvent {
  date: string;       // YYYY-MM-DD
  amount: number;     // Value per share in BRL
  month: number;      // 0-11
  year: number;
  type?: 'CASH' | 'STOCK';
  label?: string;
  factor?: number;    // for stock dividends (bonificações)
}

export interface DividendHistoryResult {
  symbol: string;
  longName: string;
  events: DividendEvent[];
  currentPrice: number;
  dy: number;
}

// Realistic fallback dividend schedules for major B3 tickers
const MOCK_DIVIDEND_SCHEDULES: Record<string, { months: number[]; amountPerEvent: number }> = {
  PETR4:  { months: [2, 4, 7, 10],       amountPerEvent: 1.45 },
  PETR3:  { months: [2, 4, 7, 10],       amountPerEvent: 1.45 },
  VALE3:  { months: [2, 5, 8],           amountPerEvent: 2.15 },
  ITUB4:  { months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], amountPerEvent: 0.27 },
  BBAS3:  { months: [0, 2, 5, 8, 11],    amountPerEvent: 0.95 },
  BBDC4:  { months: [0, 3, 6, 9],        amountPerEvent: 0.42 },
  ITSA4:  { months: [0, 3, 6, 9],        amountPerEvent: 0.35 },
  WEGE3:  { months: [2, 7],              amountPerEvent: 0.45 },
  TAEE11: { months: [0, 3, 5, 8, 11],    amountPerEvent: 0.68 },
  BBSE3:  { months: [1, 4, 7, 10],       amountPerEvent: 0.92 },
  CXSE3:  { months: [1, 4, 7, 10],       amountPerEvent: 0.55 },
  EGIE3:  { months: [0, 3, 6, 9],        amountPerEvent: 1.12 },
  CPLE6:  { months: [3, 9],              amountPerEvent: 0.88 },
  CMIG4:  { months: [3, 11],             amountPerEvent: 1.25 },
  TRPL4:  { months: [0, 3, 6, 9],        amountPerEvent: 0.72 },
  VIVT3:  { months: [3, 7, 11],          amountPerEvent: 0.65 },
  TIMS3:  { months: [3, 9],              amountPerEvent: 0.48 },
  SANB11: { months: [1, 4, 7, 10],       amountPerEvent: 0.55 },
  CURY3:  { months: [3, 6, 9, 11],       amountPerEvent: 0.42 },
  PSSA3:  { months: [2, 5, 8, 11],       amountPerEvent: 0.78 },
  SBSP3:  { months: [5, 11],             amountPerEvent: 1.85 },
  KLBN11: { months: [3, 6, 9, 11],       amountPerEvent: 0.35 },
  SUZB3:  { months: [5, 11],             amountPerEvent: 0.55 },
  JBSS3:  { months: [4, 10],             amountPerEvent: 1.10 },
  RENT3:  { months: [5, 11],             amountPerEvent: 0.65 },
  FLRY3:  { months: [3, 8],              amountPerEvent: 0.52 },
  HYPE3:  { months: [4, 10],             amountPerEvent: 0.38 },
  SLCE3:  { months: [3, 8, 11],          amountPerEvent: 1.35 },
  // FIIs — typically monthly
  MXRF11: { months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], amountPerEvent: 0.10 },
  HGLG11: { months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], amountPerEvent: 1.10 },
  XPML11: { months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], amountPerEvent: 0.85 },
  KNIP11: { months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], amountPerEvent: 1.05 },
  BTLG11: { months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], amountPerEvent: 0.78 },
  VISC11: { months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], amountPerEvent: 0.75 },
  KNCR11: { months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], amountPerEvent: 1.15 },
  XPLG11: { months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], amountPerEvent: 0.72 },
  HGRU11: { months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], amountPerEvent: 0.82 },
};

function generateMockDividendEvents(symbol: string, years: number[]): DividendEvent[] {
  const schedule = MOCK_DIVIDEND_SCHEDULES[symbol];
  if (!schedule) return [];

  const events: DividendEvent[] = [];
  for (const year of years) {
    for (const month of schedule.months) {
      // Add slight variation to amounts
      const variation = 1 + (Math.random() - 0.5) * 0.15;
      const amount = Number((schedule.amountPerEvent * variation).toFixed(4));
      const day = 10 + Math.floor(Math.random() * 15);
      events.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        amount,
        month,
        year,
      });
    }
  }
  return events;
}

// Fetch dividend history — Investidor10 (primary) → Brapi (fallback) → Mock
export async function fetchDividendHistory(symbol: string): Promise<DividendHistoryResult> {
  const cleanSymbol = symbol.toUpperCase().replace('.SA', '').trim();
  const brapiToken = import.meta.env.VITE_BRAPI_TOKEN || '';

  const currentYear = new Date().getFullYear();
  const yearsToShow = Array.from({ length: 15 }, (_, i) => currentYear - i).reverse();
  let events: DividendEvent[] = [];
  let currentPrice = 30;
  let longName = cleanSymbol;
  let dy = 0;

  // Helper to parse BR date "DD/MM/YYYY" → Date
  const parseBrDate = (s: string): Date | null => {
    if (!s) return null;
    const parts = s.trim().split('/');
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(d.getTime()) ? null : d;
  };

  // Helper to parse value like " 0,35048636" → number
  const parseDecimal = (s: string): number => {
    if (!s) return 0;
    const cleaned = s.trim().replace(/\./g, '').replace(',', '.');
    const v = parseFloat(cleaned);
    return isNaN(v) ? 0 : v;
  };

  // ─── 1. Try Investidor10 (primary source — real data) ───
  // Determine category order for URL
  const isBdr = cleanSymbol.endsWith('34');
  const is11 = cleanSymbol.endsWith('11');
  let categoryOrder = ['acoes', 'fiis', 'bdrs', 'etfs'];
  if (isBdr) categoryOrder = ['bdrs', 'acoes', 'etfs', 'fiis'];
  else if (is11) categoryOrder = ['fiis', 'acoes', 'etfs', 'bdrs'];

  for (const cat of categoryOrder) {
    if (events.length > 0) break; // already got data
    try {
      const url = `/investidor10/${cat}/${cleanSymbol.toLowerCase()}/proventos/`;
      const res = await fetch(url);
      if (!res.ok) continue;

      const htmlText = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // Extract company name
      const nameEl = doc.querySelector('.name-company');
      if (nameEl?.textContent) {
        longName = nameEl.textContent.replace(/\s+/g, ' ').trim();
      }

      // Extract current price from the page header
      const priceEl = doc.querySelector('._card-body span[data-value]') || doc.querySelector('.cotacao .value span');
      if (priceEl?.textContent) {
        const parsed = parseDecimal(priceEl.textContent);
        if (parsed > 0) currentPrice = parsed;
      }

      // Parse the dividends table: #table-dividends-history
      const table = doc.querySelector('#table-dividends-history');
      if (!table) continue;

      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 4) return;

        const tipo = (cells[0].textContent || '').trim().toUpperCase();
        // const dataCom = cells[1].textContent || '';
        const pagamento = (cells[2].textContent || '').trim();
        const valor = parseDecimal(cells[3].textContent || '');

        if (valor <= 0) return;

        // Use payment date for calendar placement (that's when money arrives)
        const payDate = parseBrDate(pagamento);
        if (!payDate) return;

        // Determine event type label
        let eventType: 'CASH' | 'STOCK' = 'CASH';
        let label = 'DIVIDENDO';
        if (tipo.includes('JSCP') || tipo.includes('JCP')) {
          label = 'JCP';
        } else if (tipo.includes('REND')) {
          label = 'REND. TRIB.';
        } else if (tipo.includes('BONIF')) {
          eventType = 'STOCK';
          label = 'BONIFICAÇÃO';
        }

        events.push({
          date: payDate.toISOString().split('T')[0],
          amount: eventType === 'STOCK' ? 0 : Number(valor.toFixed(8)),
          month: payDate.getMonth(),
          year: payDate.getFullYear(),
          type: eventType,
          label,
          ...(eventType === 'STOCK' ? { factor: valor } : {}),
        });
      });

      if (events.length > 0) {
        console.log(`[DividendMap] Investidor10 loaded ${events.length} events for ${cleanSymbol} (${cat})`);
      }
    } catch (err) {
      console.warn(`Investidor10 proventos fetch failed for ${cleanSymbol} (${cat}):`, err);
    }
  }

  // ─── 2. Fallback: Try Brapi ───
  if (events.length === 0) {
    try {
      const url = `https://brapi.dev/api/quote/${cleanSymbol}?dividends=true&token=${brapiToken}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const result = json.results?.[0];
        if (result) {
          currentPrice = result.regularMarketPrice ?? currentPrice;
          longName = result.longName ?? result.shortName ?? cleanSymbol;

          const cashDividends = result.dividendsData?.cashDividends;
          if (Array.isArray(cashDividends)) {
            cashDividends.forEach(div => {
              if (div.rate > 0 && div.paymentDate) {
                // Filter out estimated duplicates to prevent double-counting
                if (div.remarks && div.remarks.toLowerCase().includes('estimated')) {
                  return;
                }
                const dateObj = new Date(div.paymentDate);
                events.push({
                  date: dateObj.toISOString().split('T')[0],
                  amount: Number(div.rate.toFixed(3)),
                  month: dateObj.getMonth(),
                  year: dateObj.getFullYear(),
                  type: 'CASH',
                  label: div.label || 'DIVIDENDO'
                });
              }
            });
          }
          
          const stockDividends = result.dividendsData?.stockDividends;
          if (Array.isArray(stockDividends)) {
            stockDividends.forEach(div => {
              if (div.factor > 0 && (div.paymentDate || div.approvedOn)) {
                const dateObj = new Date(div.paymentDate || div.approvedOn);
                events.push({
                  date: dateObj.toISOString().split('T')[0],
                  amount: 0,
                  month: dateObj.getMonth(),
                  year: dateObj.getFullYear(),
                  type: 'STOCK',
                  label: div.label || 'BONIFICACAO',
                  factor: div.factor
                });
              }
            });
          }
        }
      }
    } catch (err) {
      console.warn(`Brapi dividend fetch failed for ${cleanSymbol}:`, err);
    }
  }

  // ─── 3. Fallback: Mock data ───
  if (events.length === 0) {
    events = generateMockDividendEvents(cleanSymbol, yearsToShow);
    const mockBase = DEFAULT_MOCK_DATA[cleanSymbol];
    if (mockBase) {
      longName = mockBase.longName || cleanSymbol;
      dy = mockBase.dy || 0;
    }

    // If still no events, generate synthetic from DY%
    if (events.length === 0) {
      const effectiveDY = dy || DEFAULT_MOCK_DATA[cleanSymbol]?.dy || 0;
      if (effectiveDY > 0 && currentPrice > 0) {
        const annualDiv = currentPrice * (effectiveDY / 100);
        const quarterlyDiv = annualDiv / 4;
        const quarterMonths = [2, 5, 8, 11];
        for (const year of yearsToShow) {
          for (const month of quarterMonths) {
            const variation = 1 + (Math.random() - 0.5) * 0.1;
            events.push({
              date: `${year}-${String(month + 1).padStart(2, '0')}-15`,
              amount: Number((quarterlyDiv * variation).toFixed(3)),
              month,
              year,
            });
          }
        }
      }
    }
  } else {
    // Real data loaded — calculate DY from last 12 months CASH events
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const last12 = events.filter(e => new Date(e.date) >= oneYearAgo && e.type !== 'STOCK');
    const totalDiv12 = last12.reduce((sum, e) => sum + e.amount, 0);
    dy = currentPrice > 0 ? (totalDiv12 / currentPrice) * 100 : 0;
  }

  // Fill DY from DEFAULT_MOCK if still 0
  if (dy === 0) {
    const mockBase = DEFAULT_MOCK_DATA[cleanSymbol];
    if (mockBase?.dy) dy = mockBase.dy;
  }

  return {
    symbol: cleanSymbol,
    longName,
    events,
    currentPrice,
    dy: Number(dy.toFixed(3)),
  };
}

export interface MarketMove {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  change: number;
}

export const POPULAR_B3_MARKET_MOVES = [
  'PETR4', 'VALE3', 'ITUB4', 'WEGE3', 'BBAS3', 
  'BBDC4', 'MGLU3', 'LREN3', 'SBSP3', 'ELET3', 
  'PRIO3', 'RENT3', 'GGBR4', 'SUZB3', 'JBSS3', 
  'EMBJ3', 'BRFS3', 'COGN3', 'HAPV3', 'B3SA3', 
  'ITSA4', 'TAEE11', 'TRPL4', 'CMIG4', 'EQTL3', 
  'RAIZ4', 'CSAN3', 'USIM5', 'KLBN11', 'MULT3'
];

export async function fetchMarketMoves(): Promise<MarketMove[]> {
  const results = await Promise.all(
    POPULAR_B3_MARKET_MOVES.map(async (symbol) => {
      try {
        const cleanSymbol = symbol.toUpperCase().replace('.SA', '').trim();
        const yahooSymbol = cleanSymbol.includes('.') || cleanSymbol.startsWith('^') || /^[A-Z]{1,5}$/.test(cleanSymbol)
          ? cleanSymbol 
          : `${cleanSymbol}.SA`;

        const res = await fetch(`/yahoo-chart/${yahooSymbol}?range=5d&interval=1d`);
        if (res.ok) {
          const json = await res.json();
          const result = json.chart?.result?.[0];
          const meta = result?.meta;
          if (meta) {
            const regularMarketPrice = meta.regularMarketPrice ?? meta.chartPreviousClose;
            const longName = meta.longName ?? meta.shortName ?? cleanSymbol;
            
            const timestamps = result.timestamp || [];
            const quote = result.indicators?.quote?.[0] || {};
            const closePrices = quote.close || [];
            
            const history: Array<{ date: string; price: number }> = [];
            for (let i = 0; i < timestamps.length; i++) {
              const c = closePrices[i];
              if (c !== null && c !== undefined) {
                history.push({
                  date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
                  price: c
                });
              }
            }

            let prevClose = regularMarketPrice;
            if (history.length >= 2) {
              const lastPoint = history[history.length - 1];
              const secondLastPoint = history[history.length - 2];
              const todayStr = new Date().toISOString().split('T')[0];
              if (lastPoint.date === todayStr) {
                prevClose = secondLastPoint.price;
              } else {
                const isMarketClosedToday = Math.abs(regularMarketPrice - lastPoint.price) < 0.001;
                if (isMarketClosedToday) {
                  prevClose = secondLastPoint.price;
                } else {
                  prevClose = lastPoint.price;
                }
              }
            }

            const change = regularMarketPrice - prevClose;
            const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

            return {
              symbol: cleanSymbol,
              name: longName.split(' - ')[0].replace(' S.A.', '').replace(' Group', '').replace(' Holding', '').replace(' S/A', ''),
              price: regularMarketPrice,
              changePercent: Number(changePercent.toFixed(2)),
              change: Number(change.toFixed(2))
            };
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch market move for ${symbol}:`, err);
      }
      return null;
    })
  );

  return results.filter((r): r is MarketMove => r !== null);
}

