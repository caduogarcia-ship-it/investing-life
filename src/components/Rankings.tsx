import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  DollarSign, 
  BarChart2, 
  TrendingUp, 
  Search, 
  Crown,
  ThumbsUp,
  Globe,
  Percent,
  Activity,
  Shield,
  Gauge
} from 'lucide-react';
import { RANKED_STOCKS } from '../data/rankingsData';
import type { RankedStock } from '../data/rankingsData';
import { normalizeText } from '../services/api';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface RankingsProps {
  onSelectTicker?: (symbol: string) => void;
}

type RankingMetric = 'dy' | 'ebitdaVP' | 'revenueGrowth' | 'analystBuys' | 'intlBuys' | 'roe' | 'pl' | 'margemLiquida' | 'netDebtEbitda' | 'graham' | 'bazin' | 'fisher' | 'barsi' | 'buffett';

// Helper to calculate stock metrics dynamically (including virtual investor methods)
const getMetricValue = (stock: RankedStock, metric: RankingMetric): number => {
  const standardMetrics: string[] = ['dy', 'ebitdaVP', 'revenueGrowth', 'analystBuys', 'intlBuys', 'roe', 'pl', 'margemLiquida', 'netDebtEbitda'];
  if (standardMetrics.includes(metric)) {
    return stock[metric as keyof RankedStock] as number ?? 0;
  }

  if (stock.isIntl) return 0; // valuation models apply to B3 stocks

  const pl = stock.pl ?? 15;
  const roe = stock.roe ?? 10;
  const dy = stock.dy ?? 0;
  const debt = stock.netDebtEbitda ?? 2.0;
  const margin = stock.margemLiquida ?? 10;
  const growth = stock.revenueGrowth ?? 5;
  const sector = stock.sector;

  switch (metric) {
    case 'graham': {
      // Graham Fair Value = sqrt(22.5 * LPA * VPA)
      // Graham ratio = sqrt(2250 / (PL^2 * ROE))
      if (pl <= 0 || roe <= 0) return 0;
      const ratio = Math.sqrt(2250 / (pl * pl * roe));
      return Number(ratio.toFixed(2));
    }
    case 'bazin': {
      // Bazin score out of 100: based on DY >= 6% and low debt
      if (dy < 3) return 0;
      let score = (dy / 6) * 100;
      if (debt > 2.5) score *= 0.5;
      if (debt > 4.0) score *= 0.1;
      return Number(Math.min(100, score).toFixed(1));
    }
    case 'fisher': {
      // Fisher score: high growth, high margin, high efficiency
      const cleanGrowth = Math.max(0, growth);
      const cleanMargin = Math.max(0, margin);
      const score = (cleanGrowth * 2.5) + (cleanMargin * 1.5) + roe;
      return Number(Math.min(100, score).toFixed(1));
    }
    case 'barsi': {
      // Barsi score: perennial sector (BESST) bonus + high DY + good ROE
      const isPerennial = ['Bancos', 'Energia Elétrica', 'Seguros & Financeiras', 'Telecomunicações', 'Saneamento & Concessões'].includes(sector);
      let score = isPerennial ? 40 : 10;
      score += dy >= 6 ? 40 : (dy / 6) * 40;
      score += roe >= 12 ? 20 : (roe / 12) * 20;
      return Number(Math.min(100, score).toFixed(1));
    }
    case 'buffett': {
      // Buffett score: ROE, margins, low debt, reasonable PL
      let score = 0;
      score += roe >= 15 ? 30 : (roe / 15) * 30;
      score += margin >= 12 ? 30 : (margin / 12) * 30;
      
      if (debt < 0) score += 20;
      else if (debt < 1.5) score += 18;
      else if (debt < 2.5) score += 10;
      
      if (pl > 0 && pl < 12) score += 20;
      else if (pl > 0 && pl < 18) score += 15;
      else if (pl > 0 && pl < 25) score += 5;

      return Number(Math.min(100, score).toFixed(1));
    }
    default:
      return 0;
  }
};

export const Rankings: React.FC<RankingsProps> = ({ onSelectTicker }) => {
  const [activeMetric, setActiveMetric] = useState<RankingMetric>('dy');
  const [searchTerm, setSearchTerm] = useState('');

  const metricCategoryInfo = useMemo(() => {
    if (['dy', 'roe', 'pl', 'margemLiquida', 'netDebtEbitda', 'ebitdaVP', 'revenueGrowth'].includes(activeMetric)) {
      return {
        label: 'Múltiplo Financeiro',
        colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        badgeText: 'Múltiplos',
        themeColor: '#6366F1'
      };
    }
    if (['graham', 'bazin', 'fisher', 'barsi', 'buffett'].includes(activeMetric)) {
      return {
        label: 'Fórmula de Grandes Investidores',
        colorClass: 'text-brand-purple bg-brand-purple/10 border-brand-purple/20',
        badgeText: 'Investidores',
        themeColor: '#8B5CF6'
      };
    }
    return {
      label: 'Consenso & Mercado',
      colorClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      badgeText: 'Consenso',
      themeColor: '#D97706'
    };
  }, [activeMetric]);

  const renderParameterItems = () => {
    switch (activeMetric) {
      case 'dy':
        return [
          { status: 'success', range: '> 8% a.a.', desc: 'Altíssimo retorno imediato em proventos.' },
          { status: 'warning', range: '5% - 8% a.a.', desc: 'Patamar saudável e previsível.' },
          { status: 'danger', range: '< 4% a.a.', desc: 'Foco provável em crescimento/reinvestimento.' }
        ];
      case 'roe':
        return [
          { status: 'success', range: '> 18%', desc: 'Retorno excelente sobre o patrimônio próprio.' },
          { status: 'warning', range: '10% - 18%', desc: 'Rentabilidade média padrão de mercado.' },
          { status: 'danger', range: '< 8%', desc: 'Baixo retorno sobre recursos aplicados.' }
        ];
      case 'pl':
        return [
          { status: 'success', range: '3x - 10x', desc: 'Ação teoricamente barata ou descontada.' },
          { status: 'warning', range: '10x - 20x', desc: 'Preço alinhado com o valor de mercado justo.' },
          { status: 'danger', range: '> 25x ou Neg.', desc: 'Preço premium ou prejuízo operacional.' }
        ];
      case 'margemLiquida':
        return [
          { status: 'success', range: '> 15%', desc: 'Lucratividade robusta com alta eficiência de custos.' },
          { status: 'warning', range: '7% - 15%', desc: 'Margem média aceitável de mercado.' },
          { status: 'danger', range: '< 5%', desc: 'Negócio altamente exposto a oscilações macro.' }
        ];
      case 'netDebtEbitda':
        return [
          { status: 'success', range: '< 1.0x / Caixa', desc: 'Altíssima solidez e liquidez.' },
          { status: 'warning', range: '1.0x - 2.5x', desc: 'Alavancagem equilibrada e sob controle.' },
          { status: 'danger', range: '> 3.5x', desc: 'Elevada dependência de capital de terceiros.' }
        ];
      case 'graham':
        return [
          { status: 'success', range: '> 1.5x', desc: 'Excelente margem de segurança (desconto superior a 33%).' },
          { status: 'warning', range: '1.0x - 1.5x', desc: 'Preço abaixo ou próximo do preço justo de Graham.' },
          { status: 'danger', range: '< 1.0x', desc: 'Ação negociada com prêmio (sem margem de segurança).' }
        ];
      case 'bazin':
        return [
          { status: 'success', range: '> 80 pts', desc: 'Enquadramento perfeito (DY alto e dívida controlada).' },
          { status: 'warning', range: '60 - 80 pts', desc: 'Enquadramento saudável com alavancagem moderada.' },
          { status: 'danger', range: '< 60 pts', desc: 'Fora dos parâmetros (DY baixo ou endividamento alto).' }
        ];
      case 'fisher':
        return [
          { status: 'success', range: '> 60 pts', desc: 'Altíssimo potencial de crescimento e barreira operacional.' },
          { status: 'warning', range: '35 - 60 pts', desc: 'Crescimento padrão de mercado com boa eficiência.' },
          { status: 'danger', range: '< 35 pts', desc: 'Perfil de crescimento lento ou margens comprimidas.' }
        ];
      case 'barsi':
        return [
          { status: 'success', range: '> 80 pts', desc: 'Ativo altamente previdenciário (setor BESST e DY recorrente).' },
          { status: 'warning', range: '50 - 80 pts', desc: 'Setor perene com proventos razoáveis, ou DY fora do BESST.' },
          { status: 'danger', range: '< 50 pts', desc: 'Não previdenciário (ciclos severos ou baixo DY).' }
        ];
      case 'buffett':
        return [
          { status: 'success', range: '> 80 pts', desc: 'Fosso competitivo sólido (Moat), alta rentabilidade.' },
          { status: 'warning', range: '55 - 80 pts', desc: 'Empresa sólida com boa rentabilidade e dívida média.' },
          { status: 'danger', range: '< 55 pts', desc: 'Alta alavancagem, baixa margem ou valuation caro.' }
        ];
      default:
        return null;
    }
  };

  // 1. Metric configuration
  const metricConfig = useMemo(() => {
    switch (activeMetric) {
      case 'dy':
        return {
          title: 'Maiores DY (Dividend Yield)',
          shortTitle: 'Dividend Yield',
          icon: <DollarSign className="w-5 h-5" />,
          colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
          colHeader: 'DY %',
          formatValue: (val: number) => `${val.toFixed(2)}%`,
          sortAsc: false,
          getHighlightClass: (val: number) => {
            if (val > 10) return 'text-emerald-400 font-bold bg-emerald-500/5';
            if (val > 6) return 'text-emerald-500 bg-emerald-500/5';
            return 'text-dark-textPrimary';
          }
        };
      case 'ebitdaVP':
        return {
          title: 'Melhor EBITDA / VP',
          shortTitle: 'EBITDA / VP',
          icon: <BarChart2 className="w-5 h-5" />,
          colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
          badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
          colHeader: 'EBITDA/VP',
          formatValue: (val: number) => `${val.toFixed(2)}x`,
          sortAsc: false,
          getHighlightClass: (val: number) => {
            if (val > 2.0) return 'text-blue-400 font-bold bg-blue-500/5';
            if (val > 1.0) return 'text-blue-500 bg-blue-500/5';
            return 'text-dark-textPrimary';
          }
        };
      case 'revenueGrowth':
        return {
          title: 'Maior Crescimento de Receita (YoY)',
          shortTitle: 'Cresc. Receita',
          icon: <TrendingUp className="w-5 h-5" />,
          colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
          badgeClass: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
          colHeader: 'Cresc. YoY',
          formatValue: (val: number) => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`,
          sortAsc: false,
          getHighlightClass: (val: number) => {
            if (val > 20) return 'text-purple-400 font-bold bg-purple-500/5';
            if (val > 10) return 'text-purple-500 bg-purple-500/5';
            if (val < 0) return 'text-rose-500 bg-rose-500/5';
            return 'text-dark-textPrimary';
          }
        };
      case 'analystBuys':
        return {
          title: 'Mais Recomendadas para Compra (Casas de Análise)',
          shortTitle: 'Recomendações B3',
          icon: <ThumbsUp className="w-5 h-5" />,
          colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          badgeClass: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
          colHeader: 'Recom. Compra',
          formatValue: (val: number) => `${Math.round(val)} recomendações`,
          sortAsc: false,
          getHighlightClass: (val: number) => {
            if (val > 20) return 'text-indigo-400 font-bold bg-indigo-500/5';
            if (val > 12) return 'text-indigo-500 bg-indigo-500/5';
            return 'text-dark-textPrimary';
          }
        };
      case 'intlBuys':
        return {
          title: 'Fundos e Ativos Internacionais Mais Recomendados',
          shortTitle: 'Recom. Global',
          icon: <Globe className="w-5 h-5" />,
          colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
          colHeader: 'Recom. Compra',
          formatValue: (val: number) => `${Math.round(val)} recomendações`,
          sortAsc: false,
          getHighlightClass: (val: number) => {
            if (val > 24) return 'text-amber-400 font-bold bg-amber-500/5';
            if (val > 15) return 'text-amber-500 bg-amber-500/5';
            return 'text-dark-textPrimary';
          }
        };
      case 'roe':
        return {
          title: 'Maiores ROE (Retorno sobre Patrimônio)',
          shortTitle: 'ROE',
          icon: <Percent className="w-5 h-5" />,
          colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          badgeClass: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
          colHeader: 'ROE %',
          formatValue: (val: number) => `${val.toFixed(1)}%`,
          sortAsc: false,
          getHighlightClass: (val: number) => {
            if (val > 20) return 'text-cyan-400 font-bold bg-cyan-500/5';
            if (val > 12) return 'text-cyan-500 bg-cyan-500/5';
            if (val < 0) return 'text-rose-500 bg-rose-500/5';
            return 'text-dark-textPrimary';
          }
        };
      case 'pl':
        return {
          title: 'Menores P/L (Ações mais Baratas por Lucro)',
          shortTitle: 'P/L Barato',
          icon: <Gauge className="w-5 h-5" />,
          colorClass: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
          badgeClass: 'bg-teal-500/10 text-teal-400 border border-teal-500/30',
          colHeader: 'P/L',
          formatValue: (val: number) => val < 0 ? 'Negativo' : `${val.toFixed(1)}x`,
          sortAsc: true, // Lower P/L is better
          getHighlightClass: (val: number) => {
            if (val < 0) return 'text-rose-500 bg-rose-500/5';
            if (val < 7) return 'text-teal-400 font-bold bg-teal-500/5';
            if (val < 12) return 'text-teal-500 bg-teal-500/5';
            return 'text-dark-textPrimary';
          }
        };
      case 'margemLiquida':
        return {
          title: 'Maiores Margens Líquidas (Lucratividade)',
          shortTitle: 'Margem Líquida',
          icon: <Activity className="w-5 h-5" />,
          colorClass: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
          badgeClass: 'bg-pink-500/10 text-pink-400 border border-pink-500/30',
          colHeader: 'Margem Líq. %',
          formatValue: (val: number) => `${val.toFixed(1)}%`,
          sortAsc: false,
          getHighlightClass: (val: number) => {
            if (val > 20) return 'text-pink-400 font-bold bg-pink-500/5';
            if (val > 10) return 'text-pink-500 bg-pink-500/5';
            if (val < 0) return 'text-rose-500 bg-rose-500/5';
            return 'text-dark-textPrimary';
          }
        };
      case 'netDebtEbitda':
        return {
          title: 'Menor Endividamento (Dív. Líq. / EBITDA)',
          shortTitle: 'Dív./EBITDA',
          icon: <Shield className="w-5 h-5" />,
          colorClass: 'text-lime-400 bg-lime-500/10 border-lime-500/20',
          badgeClass: 'bg-lime-500/10 text-lime-400 border border-lime-500/30',
          colHeader: 'Dív./EBITDA',
          formatValue: (val: number) => val < 0 ? `${val.toFixed(1)}x (Caixa)` : `${val.toFixed(1)}x`,
          sortAsc: true, // Lower debt is better
          getHighlightClass: (val: number) => {
            if (val < 0) return 'text-emerald-400 font-bold bg-emerald-500/5';
            if (val < 1.0) return 'text-lime-400 font-bold bg-lime-500/5';
            if (val < 2.0) return 'text-lime-500 bg-lime-500/5';
            if (val > 3.5) return 'text-rose-500 bg-rose-500/5';
            return 'text-dark-textPrimary';
          }
        };
      case 'graham':
        return {
          title: 'Método de Benjamin Graham (Preço Justo / Cotação)',
          shortTitle: 'Fórmula de Graham',
          icon: <Crown className="w-5 h-5" />,
          colorClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
          badgeClass: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
          colHeader: 'Graham Ratio',
          formatValue: (val: number) => val === 0 ? 'N/A' : `${val.toFixed(2)}x`,
          sortAsc: false,
          getHighlightClass: (val: number) => {
            if (val > 1.5) return 'text-yellow-400 font-bold bg-yellow-500/5';
            if (val >= 1.0) return 'text-yellow-500 bg-yellow-500/5';
            return 'text-dark-textSecondary';
          }
        };
      case 'bazin':
        return {
          title: 'Método Décio Bazin (Pontuação de Dividendos)',
          shortTitle: 'Pontuação Bazin',
          icon: <DollarSign className="w-5 h-5" />,
          colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
          colHeader: 'Score Bazin',
          formatValue: (val: number) => `${val.toFixed(1)} pts`,
          sortAsc: false,
          getHighlightClass: (val: number) => {
            if (val > 80) return 'text-emerald-400 font-bold bg-emerald-500/5';
            if (val > 60) return 'text-emerald-500 bg-emerald-500/5';
            return 'text-dark-textPrimary';
          }
        };
      case 'fisher':
        return {
          title: 'Método Philip Fisher (Crescimento & Margens)',
          shortTitle: 'Pontuação Fisher',
          icon: <TrendingUp className="w-5 h-5" />,
          colorClass: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
          badgeClass: 'bg-pink-500/10 text-pink-400 border border-pink-500/30',
          colHeader: 'Score Fisher',
          formatValue: (val: number) => `${val.toFixed(1)} pts`,
          sortAsc: false,
          getHighlightClass: (val: number) => {
            if (val > 60) return 'text-pink-400 font-bold bg-pink-500/5';
            if (val > 35) return 'text-pink-500 bg-pink-500/5';
            return 'text-dark-textPrimary';
          }
        };
      case 'barsi':
        return {
          title: 'Método Luiz Barsi (Ações Previdenciárias BESST)',
          shortTitle: 'Pontuação Barsi',
          icon: <Trophy className="w-5 h-5" />,
          colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
          badgeClass: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
          colHeader: 'Score Barsi',
          formatValue: (val: number) => `${val.toFixed(1)} pts`,
          sortAsc: false,
          getHighlightClass: (val: number) => {
            if (val > 80) return 'text-orange-400 font-bold bg-orange-500/5';
            if (val > 50) return 'text-orange-500 bg-orange-500/5';
            return 'text-dark-textPrimary';
          }
        };
      case 'buffett':
        return {
          title: 'Método Warren Buffett (Valor & Fosso de Moat)',
          shortTitle: 'Pontuação Buffett',
          icon: <Shield className="w-5 h-5" />,
          colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          badgeClass: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
          colHeader: 'Score Buffett',
          formatValue: (val: number) => `${val.toFixed(1)} pts`,
          sortAsc: false,
          getHighlightClass: (val: number) => {
            if (val > 80) return 'text-indigo-400 font-bold bg-indigo-500/5';
            if (val > 55) return 'text-indigo-500 bg-indigo-500/5';
            return 'text-dark-textPrimary';
          }
        };
    }
  }, [activeMetric]);

  // 2. Sort & Filter data
  const sortedAndFilteredData = useMemo(() => {
    // Filter by type: B3 stocks or International assets (standard metrics only)
    const isSelectingIntl = activeMetric === 'intlBuys';
    const baseList = RANKED_STOCKS.filter(stock => isSelectingIntl ? stock.isIntl === true : !stock.isIntl);

    // Sort based on active metric
    const sorted = [...baseList].sort((a, b) => {
      const valA = getMetricValue(a, activeMetric);
      const valB = getMetricValue(b, activeMetric);
      if (metricConfig.sortAsc) {
        // For ascending metrics (lower is better), filter out negatives for P/L and put them at end
        if (activeMetric === 'pl') {
          if (valA <= 0 && valB <= 0) return 0;
          if (valA <= 0) return 1;
          if (valB <= 0) return -1;
        }
        return valA - valB;
      }
      return valB - valA;
    });
    
    // Add ranking index to each
    const withRank = sorted.map((stock, index) => ({
      ...stock,
      rank: index + 1
    }));

    // Filter based on search term
    if (!searchTerm.trim()) {
      return withRank;
    }
    const cleanSearch = normalizeText(searchTerm);
    return withRank.filter(
      item => 
        normalizeText(item.symbol).includes(cleanSearch) || 
        normalizeText(item.name).includes(cleanSearch) ||
        normalizeText(item.sector).includes(cleanSearch)
    );
  }, [activeMetric, searchTerm, metricConfig.sortAsc]);

  // 2b. Prepare chart data for top 8
  const chartData = useMemo(() => {
    return sortedAndFilteredData.slice(0, 8).map(stock => ({
      name: stock.symbol,
      value: getMetricValue(stock, activeMetric),
      fullName: stock.name,
      isIntl: stock.isIntl,
    }));
  }, [sortedAndFilteredData, activeMetric]);

  // 3. Stats calculations (based on full sorted list, not filtered)
  const stats = useMemo(() => {
    const isSelectingIntl = activeMetric === 'intlBuys';
    const baseList = RANKED_STOCKS.filter(stock => isSelectingIntl ? stock.isIntl === true : !stock.isIntl);
    
    const sorted = [...baseList].sort((a, b) => {
      const valA = getMetricValue(a, activeMetric);
      const valB = getMetricValue(b, activeMetric);
      if (metricConfig.sortAsc) {
        if (activeMetric === 'pl') {
          if (valA <= 0 && valB <= 0) return 0;
          if (valA <= 0) return 1;
          if (valB <= 0) return -1;
        }
        return valA - valB;
      }
      return valB - valA;
    });
    const values = sorted.map(s => getMetricValue(s, activeMetric));
    const topStock = sorted[0] || { symbol: '-', name: '-', price: 0, dy: 0, ebitdaVP: 0, revenueGrowth: 0, marketCap: 0, analystBuys: 0, intlBuys: 0 };

    // Average (exclude negatives for P/L)
    const validValues = activeMetric === 'pl' ? values.filter(v => v > 0) : values;
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    const avg = validValues.length > 0 ? sum / validValues.length : 0;

    // Median
    let median = 0;
    if (validValues.length > 0) {
      const mid = Math.floor(validValues.length / 2);
      if (validValues.length % 2 === 0) {
        median = (validValues[mid - 1] + validValues[mid]) / 2;
      } else {
        median = validValues[mid];
      }
    }

    // Above average count (for ascending metrics, "above" means below the average)
    const countAboveAvg = metricConfig.sortAsc
      ? validValues.filter(val => val < avg).length
      : values.filter(val => val > avg).length;

    return {
      topStock,
      avg,
      median,
      countAboveAvg,
      totalCount: baseList.length
    };
  }, [activeMetric, metricConfig.sortAsc]);

  // Categorized Tab lists for Premium Layout
  const tabsGroup1: { key: RankingMetric; icon: React.ReactNode; label: string }[] = [
    { key: 'dy', icon: <DollarSign className="w-3.5 h-3.5" />, label: 'DY' },
    { key: 'roe', icon: <Percent className="w-3.5 h-3.5" />, label: 'ROE' },
    { key: 'pl', icon: <Gauge className="w-3.5 h-3.5" />, label: 'P/L' },
    { key: 'margemLiquida', icon: <Activity className="w-3.5 h-3.5" />, label: 'Margem' },
    { key: 'netDebtEbitda', icon: <Shield className="w-3.5 h-3.5" />, label: 'Dív/EBITDA' },
    { key: 'ebitdaVP', icon: <BarChart2 className="w-3.5 h-3.5" />, label: 'EBITDA/VP' },
    { key: 'revenueGrowth', icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'Receita YoY' },
  ];

  const tabsGroup2: { key: RankingMetric; icon: React.ReactNode; label: string }[] = [
    { key: 'graham', icon: <Crown className="w-3.5 h-3.5 text-yellow-400" />, label: 'Graham' },
    { key: 'bazin', icon: <DollarSign className="w-3.5 h-3.5 text-emerald-400" />, label: 'Bazin' },
    { key: 'fisher', icon: <TrendingUp className="w-3.5 h-3.5 text-pink-400" />, label: 'Fisher' },
    { key: 'barsi', icon: <Trophy className="w-3.5 h-3.5 text-orange-400" />, label: 'Barsi' },
    { key: 'buffett', icon: <Shield className="w-3.5 h-3.5 text-indigo-400" />, label: 'Buffett' },
  ];

  const tabsGroup3: { key: RankingMetric; icon: React.ReactNode; label: string }[] = [
    { key: 'analystBuys', icon: <ThumbsUp className="w-3.5 h-3.5" />, label: 'Recom. B3' },
    { key: 'intlBuys', icon: <Globe className="w-3.5 h-3.5" />, label: 'Recom. Global' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Pill Selector */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0 shadow-md shadow-brand-primary/5">
            <Trophy className="w-5.5 h-5.5 text-brand-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-dark-textPrimary tracking-tight">
              Rankings de Ações e Fundos
            </h2>
            <p className="text-dark-textSecondary text-xs font-medium mt-0.5">
              Classificação geral de ativos brasileiros e globais sob diferentes óticas financeiras e recomendações.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-dark-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar ticker ou setor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-dark-bg/60 border border-dark-border/80 focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 rounded-xl pl-9 pr-4 py-2 text-sm text-dark-textPrimary focus:outline-none w-full lg:w-60 transition-all duration-300 placeholder:text-dark-textSecondary/70 shadow-inner"
          />
        </div>
      </div>

      {/* Grouped Tabs Selection Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Col 1: Múltiplos Chave */}
        <div className="bg-dark-card/40 border border-dark-border/60 p-4 rounded-2xl shadow-lg flex flex-col justify-between hover:border-brand-primary/30 transition-colors">
          <div className="space-y-2.5">
            <span className="text-[10px] font-black text-dark-textSecondary uppercase tracking-wider block border-l-2 border-brand-primary pl-2 select-none">Múltiplos Financeiros</span>
            <div className="flex flex-wrap gap-1.5">
              {tabsGroup1.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveMetric(tab.key)}
                  className={`px-3 py-2 rounded-xl text-2xs font-extrabold flex items-center gap-1.5 transition-all duration-200 active-scale cursor-pointer ${
                    activeMetric === tab.key
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                      : 'text-dark-textSecondary hover:text-dark-textPrimary hover:bg-dark-bg/60'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2: Grandes Investidores */}
        <div className="bg-dark-card/40 border border-dark-border/60 p-4 rounded-2xl shadow-lg flex flex-col justify-between hover:border-brand-purple/30 transition-colors">
          <div className="space-y-2.5">
            <span className="text-[10px] font-black text-dark-textSecondary uppercase tracking-wider block border-l-2 border-brand-purple pl-2 select-none">Fórmulas de Investidores</span>
            <div className="flex flex-wrap gap-1.5">
              {tabsGroup2.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveMetric(tab.key)}
                  className={`px-3 py-2 rounded-xl text-2xs font-extrabold flex items-center gap-1.5 transition-all duration-200 active-scale cursor-pointer ${
                    activeMetric === tab.key
                      ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20'
                      : 'text-dark-textSecondary hover:text-dark-textPrimary hover:bg-dark-bg/60'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: Recomendações */}
        <div className="bg-dark-card/40 border border-dark-border/60 p-4 rounded-2xl shadow-lg flex flex-col justify-between hover:border-yellow-500/30 transition-colors">
          <div className="space-y-2.5">
            <span className="text-[10px] font-black text-dark-textSecondary uppercase tracking-wider block border-l-2 border-yellow-500 pl-2 select-none">Consenso & Mercado</span>
            <div className="flex flex-wrap gap-1.5">
              {tabsGroup3.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveMetric(tab.key)}
                  className={`px-3 py-2 rounded-xl text-2xs font-extrabold flex items-center gap-1.5 transition-all duration-200 active-scale cursor-pointer ${
                    activeMetric === tab.key
                      ? 'bg-yellow-600 text-white shadow-md shadow-yellow-600/20'
                      : 'text-dark-textSecondary hover:text-dark-textPrimary hover:bg-dark-bg/60'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Top Stock */}
        <div className="glass-card hover-lift p-4.5 rounded-2xl shadow-xl flex flex-col justify-between h-[105px] relative overflow-hidden border border-dark-border/80">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between text-dark-textSecondary text-[10px] font-bold uppercase tracking-wider">
            <span>Líder da Categoria</span>
            <div className="p-1 rounded-lg bg-yellow-500/10 border border-yellow-500/25">
              <Crown className="w-3.5 h-3.5 text-yellow-400" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-black text-dark-textPrimary font-mono uppercase truncate max-w-[110px]">
              {stats.topStock.symbol}
            </span>
            <span className="text-sm font-black text-brand-primary font-mono shrink-0">
              {metricConfig.formatValue(getMetricValue(stats.topStock, activeMetric))}
            </span>
          </div>
        </div>

        {/* Card 2: Average */}
        <div className="glass-card hover-lift p-4.5 rounded-2xl shadow-xl flex flex-col justify-between h-[105px] relative overflow-hidden border border-dark-border/80">
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-xl pointer-events-none" style={{ backgroundColor: `${metricCategoryInfo.themeColor}12` }} />
          <div className="text-dark-textSecondary text-[10px] font-bold uppercase tracking-wider">Média Geral</div>
          <div className="mt-1 text-2xl font-black font-mono text-dark-textPrimary">
            {metricConfig.formatValue(stats.avg)}
          </div>
          <div className="text-[10px] text-dark-textSecondary font-semibold">Média dos ativos analisados</div>
        </div>

        {/* Card 3: Median */}
        <div className="glass-card hover-lift p-4.5 rounded-2xl shadow-xl flex flex-col justify-between h-[105px] relative overflow-hidden border border-dark-border/80">
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-xl pointer-events-none" style={{ backgroundColor: `${metricCategoryInfo.themeColor}12` }} />
          <div className="text-dark-textSecondary text-[10px] font-bold uppercase tracking-wider">Mediana</div>
          <div className="mt-1 text-2xl font-black font-mono text-dark-textPrimary">
            {metricConfig.formatValue(stats.median)}
          </div>
          <div className="text-[10px] text-dark-textSecondary font-semibold">Ponto central da distribuição</div>
        </div>

        {/* Card 4: Count Above/Below Average */}
        <div className="glass-card hover-lift p-4.5 rounded-2xl shadow-xl flex flex-col justify-between h-[105px] relative overflow-hidden border border-dark-border/80">
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-xl pointer-events-none" style={{ backgroundColor: `${metricCategoryInfo.themeColor}12` }} />
          <div className="text-dark-textSecondary text-[10px] font-bold uppercase tracking-wider">
            {metricConfig.sortAsc ? 'Abaixo da Média' : 'Acima da Média'}
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-brand-primary">{stats.countAboveAvg}</span>
            <span className="text-xs text-dark-textSecondary font-semibold">ativos</span>
          </div>
          <div className="text-[10px] text-dark-textSecondary font-semibold">
            {stats.totalCount > 0 ? ((stats.countAboveAvg / stats.totalCount) * 100).toFixed(0) : 0}% do universo analisado
          </div>
        </div>
      </div>

      {/* Visual Chart of Top Stocks & Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 glass-card p-5 rounded-2xl shadow-xl flex flex-col justify-between border border-dark-border/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-dark-textPrimary flex items-center gap-1.5">
              <span>📊 Top 8 Ativos da Categoria</span>
            </h3>
            <span className="text-[10px] text-dark-textSecondary font-medium">Comparativo Visual</span>
          </div>

          <div className="h-44 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={metricCategoryInfo.themeColor} stopOpacity={0.95}/>
                      <stop offset="100%" stopColor={metricCategoryInfo.themeColor} stopOpacity={0.25}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--color-dark-textSecondary, #9CA3AF)" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="var(--color-dark-textSecondary, #9CA3AF)" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => metricConfig.formatValue(v)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#fff'
                    }}
                    formatter={(value: any, _name: any, props: any) => [
                      metricConfig.formatValue(value as number), 
                      props.payload.fullName
                    ]}
                    labelStyle={{ color: 'var(--color-brand-primary, #3B82F6)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="url(#barGradient)">
                    {chartData.map((_entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill="url(#barGradient)"
                        className="hover:opacity-80 transition-all duration-200 cursor-pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-dark-textSecondary font-medium border border-dashed border-dark-border rounded-xl">
                Sem dados para exibir no gráfico.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 glass-card p-5 rounded-2xl shadow-xl flex flex-col justify-between border border-dark-border/80 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none" style={{ backgroundColor: `${metricCategoryInfo.themeColor}10` }} />
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-dark-textPrimary flex items-center gap-1.5">
                <span>💡 Métrica:</span>
                <span className="text-xs font-black" style={{ color: metricCategoryInfo.themeColor }}>{metricConfig.shortTitle}</span>
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${metricCategoryInfo.colorClass}`}>
                {metricCategoryInfo.badgeText}
              </span>
            </div>
            
            <p className="text-xs text-dark-textSecondary mt-3 leading-relaxed font-semibold">
              {(() => {
                switch (activeMetric) {
                  case 'dy':
                    return 'O Dividend Yield expressa a relação entre os dividendos pagos por uma empresa e o preço atual de suas ações. Um indicador alto pode indicar atratividade para geração de renda passiva recorrente.';
                  case 'roe':
                    return 'O Retorno sobre o Patrimônio Líquido (ROE) mede a eficiência de uma empresa em gerar lucros a partir dos recursos dos acionistas. Valores acima de 15% costumam indicar empresas muito rentáveis.';
                  case 'pl':
                    return 'O Preço sobre Lucro (P/L) indica o número de anos que levaria para reaver o capital investido via lucros distribuídos, caso estes fossem constantes. Um P/L menor pode indicar que a ação está descontada (barata).';
                  case 'margemLiquida':
                    return 'A Margem Líquida revela a porcentagem de receita que sobra como lucro líquido após o pagamento de todas as despesas e impostos. Margens maiores indicam alta resiliência e poder de precificação.';
                  case 'netDebtEbitda':
                    return 'A relação Dívida Líquida / EBITDA mostra em quantos anos a empresa quitaria suas dívidas usando seu resultado operacional. Valores baixos ou negativos (caixa líquido) indicam excelente saúde financeira.';
                  case 'ebitdaVP':
                    return 'A relação EBITDA sobre o Valor Patrimonial avalia a eficiência de geração de caixa operacional em relação aos ativos tangíveis líquidos da companhia. Indica o retorno operacional gerado sobre a base de capital.';
                  case 'revenueGrowth':
                    return 'O Crescimento de Receita (YoY) demonstra a expansão da receita bruta da companhia nos últimos 12 meses em relação ao ano anterior. Essencial para identificar empresas com perfil de crescimento acelerado.';
                  case 'analystBuys':
                    return 'Consenso quantitativo de recomendações de compra (Buy/Strong Buy) compilado das principais casas de análise e bancos de investimentos que cobrem os ativos listados na B3.';
                  case 'intlBuys':
                    return 'Consenso quantitativo de recomendações de compra para ETFs globais e BDRs que representam ativos internacionais negociados no exterior ou na bolsa brasileira.';
                  case 'graham':
                    return 'O Método de Benjamin Graham (Preço Justo) calcula o valor intrínseco de uma ação considerando o Lucro por Ação (LPA) e o Valor Patrimonial (VPA) com uma relação limite de 22,5x. Valores acima de 1,0x indicam que o preço justo está acima da cotação de mercado, apontando um desconto.';
                  case 'bazin':
                    return 'O Método de Décio Bazin visa selecionar empresas pagadoras de dividendos com Dividend Yield de no mínimo 6% ao ano, baixa dívida líquida (Dív./EBITDA < 2,5x) e ausência de problemas de gestão, com foco em segurança e renda passiva.';
                  case 'fisher':
                    return 'O Método de Philip Fisher busca empresas de "Crescimento Excepcional", com foco em expansão de receitas brutas ano a ano, margens elevadas para financiar pesquisa e desenvolvimento, e alta rentabilidade de capital próprio.';
                  case 'barsi':
                    return 'O Método de Luiz Barsi Filho (Carteira Previdenciária) foca no acúmulo de ações de empresas de setores perenes (BESST: Bancos, Energia, Saneamento, Seguros e Telecomunicações), com Dividend Yield >= 6% a.a. e alto ROE.';
                  case 'buffett':
                    return 'O Método de Warren Buffett busca empresas com vantagens competitivas claras (Fosso Econômico / Moat), caracterizadas por ROE acima de 15%, margens de lucro gordas, baixo endividamento e valuation (P/L) razoável.';
                  default:
                    return '';
                }
              })()}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-dark-border/40">
            <span className="text-[10px] font-black text-dark-textPrimary uppercase tracking-wider block mb-2">Parâmetros de Análise:</span>
            <div className="space-y-2">
              {renderParameterItems() ? (
                renderParameterItems()?.map((item, idx) => {
                  let statusBg = '';
                  let statusText = '';
                  let statusBorder = '';
                  if (item.status === 'success') {
                    statusBg = 'bg-emerald-500/10';
                    statusText = 'text-emerald-400';
                    statusBorder = 'border-emerald-500/20';
                  } else if (item.status === 'warning') {
                    statusBg = 'bg-amber-500/10';
                    statusText = 'text-amber-400';
                    statusBorder = 'border-amber-500/20';
                  } else {
                    statusBg = 'bg-rose-500/10';
                    statusText = 'text-rose-400';
                    statusBorder = 'border-rose-500/20';
                  }
                  
                  return (
                    <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl border border-dark-border/40 bg-dark-bg/25 hover:border-dark-border transition-colors">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black font-mono uppercase tracking-wider border shrink-0 ${statusBg} ${statusText} ${statusBorder}`}>
                        {item.range}
                      </span>
                      <p className="text-[10px] text-dark-textSecondary leading-normal font-semibold mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 bg-dark-bg/30 border border-dark-border/40 rounded-xl text-[10px] text-dark-textSecondary leading-normal font-semibold">
                  Dica: Sempre compare múltiplos entre empresas do mesmo setor de atuação, pois as estruturas de capital e dinâmicas de receita variam substancialmente.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Ranking Table */}
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden border border-dark-border/80">
        <div className="px-5 py-4 border-b border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${metricConfig.badgeClass}`}>
              {metricConfig.icon}
            </div>
            <h3 className="font-bold text-dark-textPrimary">{metricConfig.title}</h3>
          </div>
          <span className="text-xs bg-dark-bg border border-dark-border text-dark-textSecondary px-2.5 py-1 rounded-lg">
            {sortedAndFilteredData.length} resultados
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-dark-card/95 backdrop-blur z-10 border-b border-dark-border text-[11px] font-extrabold uppercase tracking-wider text-dark-textSecondary">
              <tr>
                <th className="py-3 px-4 text-center w-12">#</th>
                <th className="py-3 px-4 w-24">Ticker</th>
                <th className="py-3 px-4">Nome / Ativo</th>
                <th className="py-3 px-4 w-40">Setor</th>
                <th className="py-3 px-4 text-right w-28">Preço</th>
                <th className="py-3 px-4 text-right w-36 bg-dark-bg/20">{metricConfig.colHeader}</th>
                <th className="py-3 px-4 text-right w-36">Val. Mercado</th>
                <th className="py-3 px-4 text-right w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40 text-sm text-dark-textPrimary">
              {sortedAndFilteredData.length > 0 ? (
                sortedAndFilteredData.map((stock: RankedStock & { rank: number }) => {
                  // Render medal badge for top 3
                  let medal: React.ReactNode = (
                    <span className="font-mono font-bold text-xs text-dark-textSecondary">{stock.rank}</span>
                  );
                  if (stock.rank === 1) {
                    medal = (
                      <div className="w-6 h-6 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-xs shadow-md shadow-yellow-500/5 mx-auto select-none">
                        🥇
                      </div>
                    );
                  } else if (stock.rank === 2) {
                    medal = (
                      <div className="w-6 h-6 rounded-full bg-slate-300/10 border border-slate-300/30 flex items-center justify-center text-xs shadow-md shadow-slate-300/5 mx-auto select-none">
                        🥈
                      </div>
                    );
                  } else if (stock.rank === 3) {
                    medal = (
                      <div className="w-6 h-6 rounded-full bg-amber-700/10 border border-amber-700/30 flex items-center justify-center text-xs shadow-md shadow-amber-700/5 mx-auto select-none">
                        🥉
                      </div>
                    );
                  }

                  const isAssetClickable = !stock.isIntl;
                  const metricValue = getMetricValue(stock, activeMetric);

                  return (
                    <tr 
                      key={stock.symbol}
                      className={`hover:bg-dark-bg/40 transition-colors group ${isAssetClickable ? 'cursor-pointer' : 'cursor-default'}`}
                      onClick={() => isAssetClickable && onSelectTicker?.(stock.symbol)}
                    >
                      <td className="py-3.5 px-4 text-center font-bold text-dark-textSecondary w-12">
                        {medal}
                      </td>
                      <td className="py-3.5 px-4 w-24">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stock.isIntl ? 'bg-amber-400' : 'bg-brand-primary'}`} />
                          <span className={`font-mono font-bold text-xs text-dark-textPrimary tracking-wide ${isAssetClickable ? 'group-hover:text-brand-primary transition-colors' : ''}`}>
                            {stock.symbol}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold max-w-xs truncate text-dark-textPrimary">
                        {stock.name}
                      </td>
                      <td className="py-3.5 px-4 w-40">
                        <span className="px-2 py-0.5 rounded-md bg-dark-bg/60 border border-dark-border/40 text-dark-textSecondary text-[10px] font-bold">
                          {stock.sector}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-dark-textPrimary w-28">
                        R$ {stock.price.toFixed(2)}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold font-mono text-xs w-36 ${metricConfig.getHighlightClass(metricValue)}`}>
                        {metricConfig.formatValue(metricValue)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-dark-textSecondary w-36">
                        {stock.marketCap > 1000 ? `R$ ${(stock.marketCap / 1000).toFixed(1)}T` : `R$ ${stock.marketCap.toFixed(1)}B`}
                      </td>
                      <td className="py-3.5 px-4 text-right w-24 relative">
                        {isAssetClickable && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-3xs font-black text-brand-primary flex items-center justify-end gap-1 absolute right-4 top-1/2 -translate-y-1/2 select-none uppercase tracking-wider">
                            <span>Análise</span>
                            <span>→</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-dark-textSecondary font-semibold">
                    Nenhum ativo encontrado para a busca "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
