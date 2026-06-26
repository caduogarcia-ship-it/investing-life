// src/components/RecommendedPortfolios.tsx
import React, { useState, useMemo } from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

interface RecommendedStock {
  ticker: string;
  weight: number;
  sector: string;
  targetPrice: number;
}

interface PortfolioConfig {
  id: string;
  category: string;
  institution: string;
  name: string;
  description: string;
  lastUpdated: string;
  stocks: RecommendedStock[];
}

const CATEGORIES = [
  { id: 'acoes', name: 'Ações' },
  { id: 'etf_nac', name: 'ETF Nacionais' },
  { id: 'etf_int', name: 'ETFs Internacionais' },
  { id: 'fii', name: 'FII' },
  { id: 'stocks', name: 'Stocks' },
  { id: 'bdrs', name: 'BDRs' },
  { id: 'renda_fixa', name: 'Renda Fixa' },
];

const PORTFOLIOS_DATA: PortfolioConfig[] = [
  // AÇÕES
  {
    id: 'btg',
    category: 'acoes',
    institution: 'BTG Pactual',
    name: 'Carteira 10+ Capitalização',
    description: 'Ações recomendadas com foco em superar o Ibovespa no longo prazo através de empresas sólidas com alto dividend yield e crescimento.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'PETR4', weight: 15, sector: 'Petróleo & Gás', targetPrice: 48.00 },
      { ticker: 'VALE3', weight: 15, sector: 'Mineração & Siderurgia', targetPrice: 85.00 },
      { ticker: 'ITUB4', weight: 10, sector: 'Financeiro', targetPrice: 42.00 },
      { ticker: 'EQTL3', weight: 10, sector: 'Energia Elétrica', targetPrice: 38.00 },
      { ticker: 'WEGE3', weight: 10, sector: 'Bens de Capital', targetPrice: 56.00 },
      { ticker: 'RENT3', weight: 10, sector: 'Consumo & Logística', targetPrice: 65.00 },
      { ticker: 'SBSP3', weight: 10, sector: 'Saneamento', targetPrice: 95.00 },
      { ticker: 'CURY3', weight: 10, sector: 'Construção Civil', targetPrice: 28.00 },
      { ticker: 'CYRE3', weight: 5, sector: 'Construção Civil', targetPrice: 24.50 },
      { ticker: 'VBBR3', weight: 5, sector: 'Distribuição', targetPrice: 30.00 },
    ]
  },
  {
    id: 'xp',
    category: 'acoes',
    institution: 'XP Investimentos',
    name: 'Carteira Recomendada Top 10',
    description: 'Seleção das 10 principais teses de investimentos da XP baseada em fundamentos macroeconômicos e forte dinâmica de lucros.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'VALE3', weight: 15, sector: 'Mineração & Siderurgia', targetPrice: 88.00 },
      { ticker: 'ITUB4', weight: 15, sector: 'Financeiro', targetPrice: 43.50 },
      { ticker: 'PETR4', weight: 10, sector: 'Petróleo & Gás', targetPrice: 46.50 },
      { ticker: 'WEGE3', weight: 10, sector: 'Bens de Capital', targetPrice: 54.00 },
      { ticker: 'EQTL3', weight: 10, sector: 'Energia Elétrica', targetPrice: 37.00 },
      { ticker: 'CPLE6', weight: 10, sector: 'Energia Elétrica', targetPrice: 12.50 },
      { ticker: 'VIVA3', weight: 10, sector: 'Consumo / Varejo', targetPrice: 32.00 },
      { ticker: 'RADL3', weight: 10, sector: 'Saúde / Drogarias', targetPrice: 31.00 },
      { ticker: 'RENT3', weight: 5, sector: 'Consumo & Logística', targetPrice: 63.50 },
      { ticker: 'ALOS3', weight: 5, sector: 'Shoppings', targetPrice: 29.00 },
    ]
  },
  {
    id: 'itau',
    category: 'acoes',
    institution: 'Itaú BBA',
    name: 'Carteira Recomendada Radar',
    description: 'Portfólio equilibrado com viés defensivo, selecionando líderes setoriais com histórico consistente de dividendos e governança.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'ITUB4', weight: 20, sector: 'Financeiro', targetPrice: 44.00 },
      { ticker: 'VALE3', weight: 15, sector: 'Mineração & Siderurgia', targetPrice: 86.00 },
      { ticker: 'PETR4', weight: 15, sector: 'Petróleo & Gás', targetPrice: 49.00 },
      { ticker: 'EQTL3', weight: 10, sector: 'Energia Elétrica', targetPrice: 39.00 },
      { ticker: 'WEGE3', weight: 10, sector: 'Bens de Capital', targetPrice: 55.00 },
      { ticker: 'CYRE3', weight: 10, sector: 'Construção Civil', targetPrice: 26.00 },
      { ticker: 'RENT3', weight: 10, sector: 'Consumo & Logística', targetPrice: 66.00 },
      { ticker: 'EGIE3', weight: 10, sector: 'Energia Elétrica', targetPrice: 50.00 },
    ]
  },
  {
    id: 'suno',
    category: 'acoes',
    institution: 'Suno Research',
    name: 'Suno Carteira Valor',
    description: 'Foco estrito em Value Investing. Ações com múltiplos descontados que oferecem margem de segurança elevada e alto potencial de dividendos.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'BBAS3', weight: 15, sector: 'Financeiro', targetPrice: 34.00 },
      { ticker: 'TAEE11', weight: 15, sector: 'Energia Elétrica', targetPrice: 41.00 },
      { ticker: 'ITSA4', weight: 15, sector: 'Holding / Bancos', targetPrice: 13.00 },
      { ticker: 'ALUP11', weight: 15, sector: 'Energia Elétrica', targetPrice: 33.50 },
      { ticker: 'WEGE3', weight: 10, sector: 'Bens de Capital', targetPrice: 54.00 },
      { ticker: 'KLBN11', weight: 10, sector: 'Papel & Celulose', targetPrice: 26.00 },
      { ticker: 'VIVT3', weight: 10, sector: 'Telecomunicações', targetPrice: 58.00 },
      { ticker: 'EGIE3', weight: 10, sector: 'Energia Elétrica', targetPrice: 48.00 },
    ]
  },
  {
    id: 'empiricus',
    category: 'acoes',
    institution: 'Empiricus',
    name: 'As 10 Ideias do Mês',
    description: 'Composição dinâmica mesclando ações de dividendos consolidados com small caps de alto crescimento e potencial de destravamento de valor.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'PETR4', weight: 15, sector: 'Petróleo & Gás', targetPrice: 50.00 },
      { ticker: 'VALE3', weight: 15, sector: 'Mineração & Siderurgia', targetPrice: 84.00 },
      { ticker: 'ITUB4', weight: 15, sector: 'Financeiro', targetPrice: 42.50 },
      { ticker: 'RENT3', weight: 10, sector: 'Consumo & Logística', targetPrice: 62.00 },
      { ticker: 'EQTL3', weight: 10, sector: 'Energia Elétrica', targetPrice: 36.00 },
      { ticker: 'ALOS3', weight: 10, sector: 'Shoppings', targetPrice: 28.50 },
      { ticker: 'CURY3', weight: 10, sector: 'Construção Civil', targetPrice: 29.00 },
      { ticker: 'CYRE3', weight: 5, sector: 'Construção Civil', targetPrice: 25.00 },
      { ticker: 'SBSP3', weight: 5, sector: 'Saneamento', targetPrice: 92.00 },
      { ticker: 'WEGE3', weight: 5, sector: 'Bens de Capital', targetPrice: 53.00 },
    ]
  },
  {
    id: 'genial',
    category: 'acoes',
    institution: 'Genial Investimentos',
    name: 'Carteira Recomendada Top Picks',
    description: 'Portfólio com foco em empresas de alta previsibilidade de fluxo de caixa, dividendos e excelente governança corporativa no cenário macroeconômico.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'VALE3', weight: 15, sector: 'Mineração & Siderurgia', targetPrice: 86.50 },
      { ticker: 'PETR4', weight: 15, sector: 'Petróleo & Gás', targetPrice: 49.50 },
      { ticker: 'ITUB4', weight: 10, sector: 'Financeiro', targetPrice: 43.00 },
      { ticker: 'BBDC4', weight: 10, sector: 'Financeiro', targetPrice: 17.50 },
      { ticker: 'LOGG3', weight: 10, sector: 'Galpões Logísticos', targetPrice: 27.00 },
      { ticker: 'CPLE6', weight: 10, sector: 'Energia Elétrica', targetPrice: 12.00 },
      { ticker: 'WEGE3', weight: 10, sector: 'Bens de Capital', targetPrice: 55.00 },
      { ticker: 'EGIE3', weight: 10, sector: 'Energia Elétrica', targetPrice: 49.50 },
      { ticker: 'SBSP3', weight: 5, sector: 'Saneamento', targetPrice: 94.00 },
      { ticker: 'CYRE3', weight: 5, sector: 'Construção Civil', targetPrice: 25.50 },
    ]
  },
  {
    id: 'santander',
    category: 'acoes',
    institution: 'Santander',
    name: 'Carteira Clássica de Ações',
    description: 'Teses consolidadas do Santander focadas em líderes do mercado nacional que possuem forte geração de valor e balanço equilibrado.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'ITUB4', weight: 15, sector: 'Financeiro', targetPrice: 44.50 },
      { ticker: 'VALE3', weight: 15, sector: 'Mineração & Siderurgia', targetPrice: 87.00 },
      { ticker: 'PETR4', weight: 10, sector: 'Petróleo & Gás', targetPrice: 48.50 },
      { ticker: 'RENT3', weight: 10, sector: 'Consumo & Logística', targetPrice: 64.00 },
      { ticker: 'EQTL3', weight: 10, sector: 'Energia Elétrica', targetPrice: 38.50 },
      { ticker: 'WEGE3', weight: 10, sector: 'Bens de Capital', targetPrice: 56.50 },
      { ticker: 'VIVA3', weight: 10, sector: 'Consumo / Varejo', targetPrice: 31.00 },
      { ticker: 'B3SA3', weight: 10, sector: 'Financeiro', targetPrice: 14.50 },
      { ticker: 'CURY3', weight: 5, sector: 'Construção Civil', targetPrice: 28.50 },
      { ticker: 'SBSP3', weight: 5, sector: 'Saneamento', targetPrice: 96.00 },
    ]
  },
  {
    id: 'bb',
    category: 'acoes',
    institution: 'BB Investimentos',
    name: 'Carteira Recomendada Fator',
    description: 'Estratégia quantitativo-fundamentalista do Banco do Brasil selecionando ativos sólidos com alta liquidez.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'BBAS3', weight: 20, sector: 'Financeiro', targetPrice: 33.50 },
      { ticker: 'VALE3', weight: 15, sector: 'Mineração & Siderurgia', targetPrice: 85.50 },
      { ticker: 'PETR4', weight: 15, sector: 'Petróleo & Gás', targetPrice: 49.00 },
      { ticker: 'ITSA4', weight: 10, sector: 'Holding / Bancos', targetPrice: 12.80 },
      { ticker: 'EQTL3', weight: 10, sector: 'Energia Elétrica', targetPrice: 37.50 },
      { ticker: 'KLBN11', weight: 10, sector: 'Papel & Celulose', targetPrice: 25.50 },
      { ticker: 'TAEE11', weight: 10, sector: 'Energia Elétrica', targetPrice: 41.50 },
      { ticker: 'VIVT3', weight: 10, sector: 'Telecomunicações', targetPrice: 57.00 },
    ]
  },

  // ETF NACIONAIS
  {
    id: 'btg_etf_nac',
    category: 'etf_nac',
    institution: 'BTG Pactual',
    name: 'Portfólio de ETFs B3',
    description: 'Seleção tática de índices negociados na bolsa brasileira para diversificação rápida e barata.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'BOVA11', weight: 30, sector: 'Índice Amplo (Ibovespa)', targetPrice: 135.00 },
      { ticker: 'SMAL11', weight: 20, sector: 'Small Caps', targetPrice: 115.00 },
      { ticker: 'DIVO11', weight: 20, sector: 'Altos Dividendos', targetPrice: 95.00 },
      { ticker: 'IVVB11', weight: 20, sector: 'S&P 500 (Dólar Hedges)', targetPrice: 320.00 },
      { ticker: 'HASH11', weight: 10, sector: 'Criptoativos', targetPrice: 65.00 },
    ]
  },
  {
    id: 'xp_etf_nac',
    category: 'etf_nac',
    institution: 'XP Investimentos',
    name: 'Seleção Indexada XP',
    description: 'ETFs recomendados para investidores focados em alocação passiva estruturada na B3.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'BOVA11', weight: 40, sector: 'Índice Amplo (Ibovespa)', targetPrice: 136.00 },
      { ticker: 'IVVB11', weight: 30, sector: 'S&P 500 (Dólar Hedges)', targetPrice: 325.00 },
      { ticker: 'SMAL11', weight: 15, sector: 'Small Caps', targetPrice: 118.00 },
      { ticker: 'GOLD11', weight: 15, sector: 'Commodities / Ouro', targetPrice: 15.50 },
    ]
  },
  {
    id: 'genial_etf_nac',
    category: 'etf_nac',
    institution: 'Genial Investimentos',
    name: 'Carteira de ETFs Genial',
    description: 'Alocação focada em diversificação geográfica e temática de ETFs na bolsa local.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'BOVA11', weight: 25, sector: 'Índice Amplo (Ibovespa)', targetPrice: 134.50 },
      { ticker: 'IVVB11', weight: 25, sector: 'S&P 500 (Dólar Hedges)', targetPrice: 322.00 },
      { ticker: 'SMAL11', weight: 25, sector: 'Small Caps', targetPrice: 116.00 },
      { ticker: 'HASH11', weight: 25, sector: 'Criptoativos', targetPrice: 64.00 },
    ]
  },

  // ETF INTERNACIONAIS
  {
    id: 'itau_etf_int',
    category: 'etf_int',
    institution: 'Itaú BBA',
    name: 'Radar Global ETFs',
    description: 'Portfólio de ETFs listados nos EUA recomendado para diversificação internacional de longo prazo.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'SPY', weight: 30, sector: 'Índice S&P 500', targetPrice: 550.00 },
      { ticker: 'QQQ', weight: 30, sector: 'Tecnologia Nasdaq', targetPrice: 480.00 },
      { ticker: 'SCHD', weight: 20, sector: 'Ações Dividendadoras', targetPrice: 85.00 },
      { ticker: 'VNQ', weight: 20, sector: 'Imobiliário (REITs)', targetPrice: 95.00 },
    ]
  },
  {
    id: 'btg_etf_int',
    category: 'etf_int',
    institution: 'BTG Pactual',
    name: 'Carteira de ETFs Globais',
    description: 'Alocação global otimizada com foco em ETFs de baixas taxas de administração nos EUA.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'VOO', weight: 35, sector: 'Índice S&P 500', targetPrice: 510.00 },
      { ticker: 'VXUS', weight: 25, sector: 'Mundo Ex-EUA', targetPrice: 68.00 },
      { ticker: 'BND', weight: 20, sector: 'Renda Fixa Global', targetPrice: 76.00 },
      { ticker: 'IWM', weight: 20, sector: 'Small Caps EUA', targetPrice: 220.00 },
    ]
  },

  // FII
  {
    id: 'xp_fii',
    category: 'fii',
    institution: 'XP Investimentos',
    name: 'Top Picks Fundos Imobiliários',
    description: 'Seleção ativa de FIIs de tijolo e papel com forte resiliência de rendimentos e desconto patrimonial.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'HGLG11', weight: 20, sector: 'Logística', targetPrice: 172.00 },
      { ticker: 'KNIP11', weight: 20, sector: 'Recebíveis (Papel)', targetPrice: 98.00 },
      { ticker: 'XPML11', weight: 20, sector: 'Shopping Centers', targetPrice: 118.00 },
      { ticker: 'BTLG11', weight: 20, sector: 'Logística', targetPrice: 108.00 },
      { ticker: 'HGRU11', weight: 20, sector: 'Renda Urbana', targetPrice: 132.00 },
    ]
  },
  {
    id: 'suno_fii',
    category: 'fii',
    institution: 'Suno Research',
    name: 'Carteira Recomendada FIIs',
    description: 'Foco em geração constante de renda passiva isenta e diversificação setorial imobiliária.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'TRXF11', weight: 25, sector: 'Renda Urbana', targetPrice: 115.00 },
      { ticker: 'MXRF11', weight: 25, sector: 'Recebíveis (Papel)', targetPrice: 10.80 },
      { ticker: 'HGLG11', weight: 25, sector: 'Logística', targetPrice: 170.00 },
      { ticker: 'ALZR11', weight: 25, sector: 'Híbrido', targetPrice: 122.00 },
    ]
  },
  {
    id: 'genial_fii',
    category: 'fii',
    institution: 'Genial Investimentos',
    name: 'FIIs Top Pick Genial',
    description: 'Seleção de fundos imobiliários com foco em rendimentos robustos e valorização patrimonial no longo prazo.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'KNIP11', weight: 30, sector: 'Recebíveis (Papel)', targetPrice: 97.50 },
      { ticker: 'HGLG11', weight: 30, sector: 'Logística', targetPrice: 171.00 },
      { ticker: 'XPML11', weight: 20, sector: 'Shopping Centers', targetPrice: 116.50 },
      { ticker: 'BTLG11', weight: 20, sector: 'Logística', targetPrice: 107.00 },
    ]
  },

  // STOCKS
  {
    id: 'btg_stocks',
    category: 'stocks',
    institution: 'BTG Pactual',
    name: 'Carteira de Ações Americanas',
    description: 'As principais teses de investimento no mercado dos EUA, focadas nas Big Techs e líderes de inovação.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'AAPL', weight: 20, sector: 'Tecnologia / Consumo', targetPrice: 210.00 },
      { ticker: 'MSFT', weight: 20, sector: 'Software / IA', targetPrice: 460.00 },
      { ticker: 'AMZN', weight: 20, sector: 'E-commerce & Nuvem', targetPrice: 205.00 },
      { ticker: 'NVDA', weight: 20, sector: 'Semicondutores / IA', targetPrice: 125.00 },
      { ticker: 'GOOGL', weight: 20, sector: 'Internet & Mídia', targetPrice: 190.00 },
    ]
  },
  {
    id: 'xp_stocks',
    category: 'stocks',
    institution: 'XP Investimentos',
    name: 'Recomendações Globais (USA)',
    description: 'Empresas de alta governança corporativa e escala global negociadas nas bolsas de Nova York.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'MSFT', weight: 25, sector: 'Software / IA', targetPrice: 465.00 },
      { ticker: 'AAPL', weight: 20, sector: 'Tecnologia / Consumo', targetPrice: 215.00 },
      { ticker: 'META', weight: 20, sector: 'Mídia Social / IA', targetPrice: 520.00 },
      { ticker: 'LLY', weight: 20, sector: 'Saúde / Farmacêutica', targetPrice: 880.00 },
      { ticker: 'BRK.B', weight: 15, sector: 'Financeiro / Conglomerado', targetPrice: 450.00 },
    ]
  },

  // BDRs
  {
    id: 'itau_bdrs',
    category: 'bdrs',
    institution: 'Itaú BBA',
    name: 'Top Seleção BDRs B3',
    description: 'Teses internacionais acessíveis de forma simplificada por BDRs na própria B3.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'AAPL34', weight: 20, sector: 'Tecnologia / Consumo', targetPrice: 65.00 },
      { ticker: 'MSFT34', weight: 20, sector: 'Software / IA', targetPrice: 78.00 },
      { ticker: 'GOGL34', weight: 20, sector: 'Internet & Mídia', targetPrice: 85.00 },
      { ticker: 'AMZO34', weight: 20, sector: 'E-commerce & Nuvem', targetPrice: 42.00 },
      { ticker: 'MELI34', weight: 20, sector: 'E-commerce / Finanças', targetPrice: 82.00 },
    ]
  },
  {
    id: 'empiricus_bdrs',
    category: 'bdrs',
    institution: 'Empiricus',
    name: 'Melhores BDRs para Comprar',
    description: 'BDRs com foco em crescimento exponencial e dinamismo de mercado global.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'NVDC34', weight: 25, sector: 'Semicondutores / IA', targetPrice: 95.00 },
      { ticker: 'TSLA34', weight: 25, sector: 'Automotivo / Energia', targetPrice: 48.00 },
      { ticker: 'NFLX34', weight: 25, sector: 'Streaming / Mídia', targetPrice: 75.00 },
      { ticker: 'DISB34', weight: 25, sector: 'Entretenimento', targetPrice: 58.00 },
    ]
  },

  // RENDA FIXA
  {
    id: 'xp_renda_fixa',
    category: 'renda_fixa',
    institution: 'XP Investimentos',
    name: 'Recomendação de Renda Fixa',
    description: 'Estratégia equilibrada combinando liquidez diária, proteção contra inflação e prêmio pré-fixado.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'Tesouro Selic', weight: 40, sector: 'Pós-fixado (Selic)', targetPrice: 10.75 },
      { ticker: 'Tesouro IPCA+', weight: 30, sector: 'Inflação (IPCA)', targetPrice: 6.20 },
      { ticker: 'CDB Banco BMG', weight: 20, sector: 'Pós-fixado (CDI)', targetPrice: 120.00 },
      { ticker: 'LCI Caixa Econômica', weight: 10, sector: 'Isento (LCI)', targetPrice: 9.50 },
    ]
  },
  {
    id: 'btg_renda_fixa',
    category: 'renda_fixa',
    institution: 'BTG Pactual',
    name: 'Alocação em Renda Fixa',
    description: 'Títulos selecionados para maximizar rentabilidade líquida considerando o cenário macroeconômico.',
    lastUpdated: 'Junho de 2026',
    stocks: [
      { ticker: 'Tesouro Selic 2029', weight: 35, sector: 'Pós-fixado (Selic)', targetPrice: 10.75 },
      { ticker: 'Tesouro IPCA+ 2035', weight: 35, sector: 'Inflação (IPCA)', targetPrice: 6.35 },
      { ticker: 'LCA Banco do Brasil', weight: 20, sector: 'Isento (LCA)', targetPrice: 9.75 },
      { ticker: 'Deb. Incentivada Vale', weight: 10, sector: 'Crédito Privado', targetPrice: 7.10 },
    ]
  }
];

interface RecommendedPortfoliosProps {
  onSelectTicker: (symbol: string) => void;
}

export const RecommendedPortfolios: React.FC<RecommendedPortfoliosProps> = ({ onSelectTicker }) => {
  const [activeCategory, setActiveCategory] = useState<string>('acoes');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('btg');

  // Filter portfolios by active category
  const filteredPortfolios = useMemo(() => {
    return PORTFOLIOS_DATA.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  // Selected portfolio from the filtered category list
  const selectedPortfolio = useMemo(() => {
    const found = filteredPortfolios.find(p => p.id === selectedPortfolioId);
    return found || filteredPortfolios[0] || PORTFOLIOS_DATA[0];
  }, [filteredPortfolios, selectedPortfolioId]);

  // Aggregate Top Recommended Assets for the active category (Consolidated Consensus)
  const consolidatedTopPicks = useMemo(() => {
    const counts: Record<string, { count: number; weightSum: number; targetPrices: number[]; institutions: string[] }> = {};
    
    filteredPortfolios.forEach(p => {
      p.stocks.forEach(s => {
        if (!counts[s.ticker]) {
          counts[s.ticker] = { count: 0, weightSum: 0, targetPrices: [], institutions: [] };
        }
        counts[s.ticker].count += 1;
        counts[s.ticker].weightSum += s.weight;
        counts[s.ticker].targetPrices.push(s.targetPrice);
        counts[s.ticker].institutions.push(p.institution);
      });
    });

    return Object.entries(counts)
      .map(([ticker, info]) => ({
        ticker,
        recommendationCount: info.count,
        averageWeight: Number((info.weightSum / info.count).toFixed(1)),
        averageTargetPrice: Number((info.targetPrices.reduce((a, b) => a + b, 0) / info.targetPrices.length).toFixed(2)),
        institutions: info.institutions
      }))
      .sort((a, b) => b.recommendationCount - a.recommendationCount || b.averageWeight - a.averageWeight)
      .slice(0, 5);
  }, [filteredPortfolios]);

  // Dynamic formatting of target value/yield
  const formatTargetValue = (stock: RecommendedStock) => {
    if (activeCategory !== 'renda_fixa') {
      return `R$ ${stock.targetPrice.toFixed(2).replace('.', ',')}`;
    }
    if (stock.sector.includes('Inflação')) {
      return `IPCA + ${stock.targetPrice.toFixed(2).replace('.', ',')}%`;
    }
    if (stock.ticker.includes('CDB') || stock.sector.includes('CDI')) {
      return `${stock.targetPrice.toFixed(0)}% do CDI`;
    }
    return `${stock.targetPrice.toFixed(2).replace('.', ',')}% a.a.`;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Category Selection Tabs */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-4.5 shadow-lg flex flex-wrap gap-2 items-center justify-center sm:justify-start">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              const firstPort = PORTFOLIOS_DATA.find(p => p.category === cat.id);
              if (firstPort) {
                setSelectedPortfolioId(firstPort.id);
              }
            }}
            className={`px-4.5 py-2.5 rounded-xl text-3xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-brand-primary text-dark-bg font-black shadow-lg shadow-brand-primary/20 scale-[1.02]'
                : 'bg-dark-bg/40 border border-dark-border/60 text-dark-textSecondary hover:text-dark-textPrimary hover:border-dark-border'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid: Consensus Top Picks & Selector (Restructured for better framing) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        
        {/* Consensus Top Picks Card (col-span-4) */}
        <div className="xl:col-span-4 bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-bold text-dark-textPrimary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Consenso de Mercado (Top Picks)
            </h3>
            <p className="text-3xs text-dark-textSecondary font-semibold mt-1">Ativos com maior número de aparições nas carteiras selecionadas</p>
          </div>

          <div className="space-y-3.5">
            {consolidatedTopPicks.length > 0 ? (
              consolidatedTopPicks.map((pick, index) => (
                <div 
                  key={pick.ticker} 
                  className="p-3.5 bg-dark-bg/40 border border-dark-border/60 hover-lift rounded-xl flex items-center justify-between select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6.5 h-6.5 bg-brand-primary/10 border border-brand-primary/20 rounded-lg flex items-center justify-center font-mono font-black text-2xs text-brand-primary">
                      #{index + 1}
                    </div>
                    <div>
                      <span 
                        onClick={() => onSelectTicker(pick.ticker)}
                        className="font-mono font-extrabold text-xs text-dark-textPrimary hover:text-brand-primary cursor-pointer transition-colors block"
                      >
                        {pick.ticker}
                      </span>
                      <span className="text-4xs text-dark-textSecondary/80 block">Presença: {pick.recommendationCount} de {filteredPortfolios.length} carteiras</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-4xs text-emerald-400 block font-bold">
                      {activeCategory === 'renda_fixa' ? 'Retorno Médio' : 'Alvo Médio'}
                    </span>
                    <span className="text-2xs font-bold text-dark-textPrimary font-mono">
                      {activeCategory === 'renda_fixa' 
                        ? (pick.ticker.includes('CDB') ? `${pick.averageTargetPrice.toFixed(0)}% CDI` : `${pick.averageTargetPrice.toFixed(2).replace('.', ',')}% a.a.`)
                        : `R$ ${pick.averageTargetPrice.toFixed(2).replace('.', ',')}`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-3xs text-dark-textSecondary font-medium">
                Nenhum ativo consolidado.
              </div>
            )}
          </div>

          <div className="text-4xs text-dark-textSecondary font-semibold bg-dark-bg/40 border border-dark-border/40 p-3 rounded-lg leading-relaxed">
            💡 <strong>Dica Operacional:</strong> Tickers com alto consenso de mercado indicam unanimidade setorial entre os analistas, sugerindo teses de alta previsibilidade e solidez.
          </div>
        </div>

        {/* Institution Selector & Portfolio Display (col-span-8 - Enquadramento da lista aprimorado) */}
        <div className="xl:col-span-8 bg-dark-card border border-dark-border rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row items-stretch min-h-[500px]">
          
          {/* Left Column: List of Houses (Split-Pane Sidebar Layout) */}
          <div className="w-full md:w-[220px] bg-dark-bg/25 border-b md:border-b-0 md:border-r border-dark-border/50 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto no-scrollbar shrink-0 select-none">
            <div className="p-3 border-b border-dark-border/40 hidden md:block">
              <span className="text-4xs font-black text-dark-textSecondary uppercase tracking-wider">Instituições</span>
            </div>
            
            {filteredPortfolios.map(p => {
              const isActive = selectedPortfolio.id === p.id;
              // Generate generic initials from name (e.g. BTG Pactual -> BTG)
              const initials = p.institution.split(' ').map(n => n[0]).join('').slice(0, 3);
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPortfolioId(p.id)}
                  className={`flex items-center gap-3 w-auto md:w-full text-left px-4 py-3.5 border-b-2 md:border-b-0 md:border-l-3 transition-all cursor-pointer whitespace-nowrap md:whitespace-normal shrink-0 ${
                    isActive
                      ? 'bg-brand-primary/5 md:border-l-brand-primary border-b-brand-primary text-brand-primary'
                      : 'border-b-transparent md:border-l-transparent text-dark-textSecondary hover:text-dark-textPrimary hover:bg-dark-cardHover/40'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-3xs border transition-colors ${
                    isActive
                      ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                      : 'bg-dark-bg border-dark-border/80 text-dark-textSecondary'
                  }`}>
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-3xs font-extrabold truncate">{p.institution}</span>
                    <span className="text-4xs text-dark-textSecondary truncate hidden md:block">{p.name}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Portfolio Details & Assets List Table */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-6">
            
            {/* Header info / Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-dark-border/30 pb-4">
              <div>
                <h4 className="text-sm font-bold text-dark-textPrimary">{selectedPortfolio.institution}</h4>
                <p className="text-2xs text-brand-primary font-bold mt-0.5">{selectedPortfolio.name}</p>
              </div>
              <div className="text-4xs font-mono font-bold text-dark-textSecondary uppercase bg-dark-bg/60 border border-dark-border/50 px-2 py-1 rounded-md">
                Atualização: {selectedPortfolio.lastUpdated}
              </div>
            </div>

            {/* Description Card */}
            <p className="text-3xs text-dark-textSecondary font-semibold bg-dark-bg/30 border border-dark-border/40 p-4 rounded-xl leading-relaxed">
              {selectedPortfolio.description}
            </p>

            {/* Table layout with better framing */}
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[500px] text-left">
                <thead>
                  <tr className="border-b border-dark-border text-4xs text-dark-textSecondary font-bold uppercase tracking-wider">
                    <th className="pb-3 w-[120px]">Ativo</th>
                    <th className="pb-3 w-[150px]">
                      {activeCategory === 'renda_fixa' ? 'Indexador / Tipo' : 'Setor'}
                    </th>
                    <th className="pb-3 text-center">Peso (%)</th>
                    <th className="pb-3 text-right">
                      {activeCategory === 'renda_fixa' ? 'Rentabilidade' : 'Preço Alvo'}
                    </th>
                    <th className="pb-3 w-[50px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPortfolio.stocks.map((stock) => (
                    <tr 
                      key={stock.ticker} 
                      className="border-b border-dark-border/30 last:border-b-0 hover:bg-dark-bg/20 transition-colors"
                    >
                      <td className="py-3">
                        <button
                          onClick={() => onSelectTicker(stock.ticker)}
                          className="font-mono font-black text-xs text-dark-textPrimary hover:text-brand-primary cursor-pointer transition-colors block text-left"
                        >
                          {stock.ticker}
                        </button>
                      </td>
                      <td className="py-3">
                        <span className="text-3xs text-dark-textSecondary font-semibold">{stock.sector}</span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className="text-2xs font-bold text-dark-textPrimary font-mono">{stock.weight}%</span>
                          <div className="w-16 h-1 bg-dark-bg border border-dark-border/40 rounded-full overflow-hidden shrink-0">
                            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${stock.weight * 4}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-2xs font-bold text-dark-textPrimary font-mono">
                          {formatTargetValue(stock)}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => onSelectTicker(stock.ticker)}
                          className="p-1 hover:bg-dark-cardHover rounded-lg text-dark-textSecondary hover:text-dark-textPrimary transition-all cursor-pointer"
                          title="Ver análise completa deste ativo"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
