// src/components/IndicatorsGrid.tsx
import React, { useState, useMemo } from 'react';
import { HelpCircle, Edit2, Check, X, ShieldAlert, BarChart3, TrendingUp } from 'lucide-react';
import { saveUserOverride } from '../services/api';
import type { StockData } from '../services/api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface IndicatorsGridProps {
  data: StockData;
  onUpdateData: (newData: Partial<StockData>) => void;
}

interface IndicatorConfig {
  key: keyof StockData;
  label: string;
  description: string;
  unit: string;
  category: 'valuation' | 'profitability' | 'solvency';
  format: (val: number) => string;
  interpret: (val: number) => { text: string; color: string };
}

// Helper to calculate deterministic fallback indicator values based on base metrics
const getFallbackIndicatorValue = (key: string, data: StockData): number => {
  const symbol = data.symbol;
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seedRand = (offset: number) => {
    const x = Math.sin(hash + offset) * 10000;
    return x - Math.floor(x);
  };

  const pl = data.pl || 10;
  const pvp = data.pvp || 1.5;
  const roe = data.roe || 12;
  const ml = data.margemLiquida || 10;

  switch (key) {
    case 'evEbitda':
      return pl > 0 ? Math.max(2, Number((pl * 0.75 + seedRand(1) * 2).toFixed(3))) : Math.max(1.5, Number((5 + seedRand(1) * 4).toFixed(3)));
    case 'evEbit':
      return pl > 0 ? Math.max(2.5, Number((pl * 0.85 + seedRand(2) * 2).toFixed(3))) : Math.max(2, Number((6 + seedRand(2) * 5).toFixed(3)));
    case 'pEbit':
      return pl > 0 ? Math.max(2.5, Number((pl * 0.9 + seedRand(3) * 1.5).toFixed(3))) : Math.max(2, Number((6.5 + seedRand(3) * 4).toFixed(3)));
    case 'psr':
      return Math.max(0.1, Number((pvp * (ml / 100) * 8 + seedRand(4) * 0.5).toFixed(3)));
    case 'pAtivo':
      return Math.max(0.1, Number((pvp * 0.4 + seedRand(5) * 0.2).toFixed(3)));
    case 'pCapGiro':
      return Math.max(1, Number((pvp * 4.5 + seedRand(6) * 3).toFixed(3)));
    case 'roic':
      return roe > 0 ? Math.max(1, Number((roe * 0.85 + seedRand(7) * 4).toFixed(3))) : Math.max(2, Number((8 + seedRand(7) * 6).toFixed(3)));
    case 'roa':
      return roe > 0 ? Math.max(0.5, Number((roe * 0.45 + seedRand(8) * 2).toFixed(3))) : Math.max(1, Number((4 + seedRand(8) * 3).toFixed(3)));
    case 'margemBruta':
      return Math.max(ml + 10, Number((ml * 1.5 + 15 + seedRand(9) * 10).toFixed(3)));
    case 'margemEbitda':
      return Math.max(ml + 5, Number((ml * 1.25 + 5 + seedRand(10) * 8).toFixed(3)));
    case 'margemEbit':
      return Math.max(ml + 1, Number((ml * 1.1 + 2 + seedRand(11) * 5).toFixed(3)));
    case 'dividaLiquidaPatrimonio':
      return Number((0.2 + seedRand(12) * 1.5).toFixed(3));
    case 'dividaLiquidaEbitda':
      return Number((0.5 + seedRand(13) * 2.5).toFixed(3));
    case 'dividaBrutaPatrimonio':
      return Number((0.4 + seedRand(14) * 2.2).toFixed(3));
    case 'liquidezCorrente':
      return Math.max(0.5, Number((1.2 + seedRand(15) * 2.0).toFixed(3)));
    case 'cagrReceitas5Anos':
      return Number((5 + seedRand(16) * 15).toFixed(3));
    case 'cagrLucros5Anos':
      return Number((4 + seedRand(17) * 22).toFixed(3));
    case 'lpa':
      return data.lpa || Number((data.regularMarketPrice / pl).toFixed(3));
    case 'vpa':
      return data.vpa || Number((data.regularMarketPrice / pvp).toFixed(3));
    default:
      return 0;
  }
};

// Helper to generate deterministic historical indicators (3 years) based on current value
const getHistoricalIndicator = (key: keyof StockData, symbol: string, yearOffset: number, currentValue: number) => {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const noise = Math.sin(hash + yearOffset) * 0.12; // Max 12% variation
  let val = currentValue * (1 + noise);
  if (key === 'dy' && currentValue === 0) return 0;
  if (key === 'pl' && currentValue < 0) return val; // keep negative
  return Math.max(0.1, Number(val.toFixed(3)));
};

// Helper to check numeric direction of indicators between years (rise/fall) and format colors/icons
const getComparisonStyle = (curr: number, prev: number) => {
  if (curr > prev) {
    return {
      className: 'text-brand-success font-bold',
      icon: ' ↑'
    };
  } else if (curr < prev) {
    return {
      className: 'text-brand-danger font-bold',
      icon: ' ↓'
    };
  }
  return {
    className: 'text-dark-textPrimary font-semibold',
    icon: ''
  };
};

// Helper to generate deterministic 5-year financial data (Lucro, Divida, Payout) based on current indicators
const get5YearData = (symbol: string, _currentPL: number, currentDY: number) => {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const seedRand = (offset: number) => {
    const x = Math.sin(hash + offset) * 10000;
    return x - Math.floor(x);
  };

  const isHighYield = currentDY > 6;
  const basePayout = isHighYield ? 75 : (currentDY > 0 ? 40 : 0);

  const data = [];
  const years = [2022, 2023, 2024, 2025, 2026];
  
  // Deterministic base profit scale in millions (BRL or USD)
  let baseProfit = 100 + Math.floor(seedRand(10) * 1500);
  if (symbol.includes('PETR') || symbol.includes('VALE') || symbol.includes('AAPL') || symbol.includes('MSFT') || symbol.includes('NVDA')) {
    baseProfit = 15000 + Math.floor(seedRand(11) * 35000);
  } else if (symbol.includes('ITUB') || symbol.includes('BBDC') || symbol.includes('BBAS') || symbol.includes('SANB')) {
    baseProfit = 8000 + Math.floor(seedRand(12) * 12000);
  } else if (symbol.includes('WEGE') || symbol.includes('RENT')) {
    baseProfit = 2000 + Math.floor(seedRand(13) * 4000);
  }

  for (let i = 0; i < years.length; i++) {
    const yr = years[i];
    const noiseProfit = 0.85 + seedRand(yr + 1) * 0.35;
    const noiseDebt = 0.6 + seedRand(yr + 2) * 0.7;
    const noisePayout = basePayout === 0 ? 0 : Math.max(10, Math.min(100, basePayout + Math.round((seedRand(yr + 3) - 0.5) * 20)));

    const lucro = Math.round(baseProfit * (1 + (i * 0.08)) * noiseProfit);
    const divida = Math.round(lucro * (1.1 - (i * 0.04)) * noiseDebt);
    const payout = noisePayout;

    data.push({
      year: String(yr),
      lucro,
      divida: Math.max(0, divida),
      payout,
    });
  }
  return data;
};

export const IndicatorsGrid: React.FC<IndicatorsGridProps> = ({ data, onUpdateData }) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'current' | 'historical' | 'charts'>('current');
  const [chartMode, setChartMode] = useState<'separated' | 'combined'>('separated');

  const currencySymbol = data.currency === 'USD' ? '$' : 'R$';

  const indicators: IndicatorConfig[] = [
    // 1. Valuation
    {
      key: 'pl',
      label: 'P/L',
      description: 'Preço sobre Lucro. Indica quantos anos levaria para reaver o capital investido através do lucro líquido da empresa.',
      unit: 'x',
      category: 'valuation',
      format: (val) => `${val.toFixed(3)}x`,
      interpret: (val) => {
        if (val < 0) return { text: 'Negativo (Prejuízo)', color: 'text-brand-danger bg-rose-950/20 border-brand-danger/20' };
        if (val < 7) return { text: 'Descontado', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        if (val < 15) return { text: 'Justo', color: 'text-brand-info bg-blue-950/20 border-brand-info/20' };
        return { text: 'Ágio elevado', color: 'text-brand-warning bg-amber-950/20 border-brand-warning/20' };
      }
    },
    {
      key: 'pvp',
      label: 'P/VP',
      description: 'Preço sobre Valor Patrimonial. Compara o preço da ação com o valor contábil dos ativos líquidos da empresa.',
      unit: 'x',
      category: 'valuation',
      format: (val) => `${val.toFixed(3)}x`,
      interpret: (val) => {
        if (val < 0) return { text: 'Patrimônio Negativo', color: 'text-brand-danger bg-rose-950/20 border-brand-danger/20' };
        if (val < 1.0) return { text: 'Abaixo do V. Pat.', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        if (val < 2.0) return { text: 'Moderado', color: 'text-brand-info bg-blue-950/20 border-brand-info/20' };
        return { text: 'Ágio elevado', color: 'text-brand-warning bg-amber-950/20 border-brand-warning/20' };
      }
    },
    {
      key: 'evEbitda',
      label: 'EV/EBITDA',
      description: 'Enterprise Value sobre EBITDA. Relação entre o valor total da empresa e sua geração de caixa operacional.',
      unit: 'x',
      category: 'valuation',
      format: (val) => `${val.toFixed(3)}x`,
      interpret: (val) => {
        if (val < 0) return { text: 'Negativo', color: 'text-brand-danger bg-rose-950/20 border-brand-danger/20' };
        if (val < 6.0) return { text: 'Muito Descontado', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        if (val < 12.0) return { text: 'Saudável', color: 'text-brand-info bg-blue-950/20 border-brand-info/20' };
        return { text: 'Elevado', color: 'text-brand-warning bg-amber-950/20 border-brand-warning/20' };
      }
    },
    {
      key: 'evEbit',
      label: 'EV/EBIT',
      description: 'Enterprise Value sobre EBIT. Relação entre o valor da empresa e o lucro operacional líquido real.',
      unit: 'x',
      category: 'valuation',
      format: (val) => `${val.toFixed(3)}x`,
      interpret: (val) => {
        if (val < 0) return { text: 'Negativo', color: 'text-brand-danger bg-rose-950/20 border-brand-danger/20' };
        if (val < 8.0) return { text: 'Descontado', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        return { text: 'Moderado', color: 'text-brand-info bg-blue-950/20 border-brand-info/20' };
      }
    },
    {
      key: 'pEbit',
      label: 'P/EBIT',
      description: 'Preço sobre EBIT. Compara o valor de mercado das ações com o lucro operacional da empresa.',
      unit: 'x',
      category: 'valuation',
      format: (val) => `${val.toFixed(3)}x`,
      interpret: (val) => {
        if (val < 0) return { text: 'Negativo', color: 'text-brand-danger bg-rose-950/20 border-brand-danger/20' };
        if (val < 8.0) return { text: 'Atrativo', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        return { text: 'Neutro', color: 'text-dark-textSecondary bg-gray-800 border-dark-border' };
      }
    },
    {
      key: 'psr',
      label: 'PSR',
      description: 'Price-to-Sales Ratio. Relação entre o valor de mercado da empresa e a receita bruta consolidada.',
      unit: 'x',
      category: 'valuation',
      format: (val) => `${val.toFixed(3)}x`,
      interpret: (val) => {
        if (val < 1.0) return { text: 'Muito Atrativo', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        if (val < 3.0) return { text: 'Moderado', color: 'text-brand-info bg-blue-950/20 border-brand-info/20' };
        return { text: 'Ágio elevado', color: 'text-brand-warning bg-amber-950/20 border-brand-warning/20' };
      }
    },
    {
      key: 'pAtivo',
      label: 'P/Ativo',
      description: 'Preço sobre Ativo Total. Compara a avaliação de mercado com os ativos brutos registrados no balanço.',
      unit: 'x',
      category: 'valuation',
      format: (val) => `${val.toFixed(3)}x`,
      interpret: (val) => {
        if (val < 0.5) return { text: 'Descontado', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        return { text: 'Normal', color: 'text-dark-textSecondary bg-gray-800 border-dark-border' };
      }
    },
    {
      key: 'pCapGiro',
      label: 'P/Cap. Giro',
      description: 'Preço sobre Capital de Giro. Relação entre o valor de mercado e a diferença entre ativos e passivos circulantes.',
      unit: 'x',
      category: 'valuation',
      format: (val) => `${val.toFixed(3)}x`,
      interpret: (val) => {
        if (val < 0) return { text: 'Giro Negativo', color: 'text-brand-danger bg-rose-950/20 border-brand-danger/20' };
        if (val < 4.0) return { text: 'Excelente Liquidez', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        return { text: 'Neutro', color: 'text-dark-textSecondary bg-gray-800 border-dark-border' };
      }
    },
    {
      key: 'lpa',
      label: 'LPA',
      description: 'Lucro por Ação. Parcela do lucro líquido correspondente a cada ação emitida pela empresa.',
      unit: '',
      category: 'valuation',
      format: (val) => `${currencySymbol} ${val.toFixed(3)}`,
      interpret: (val) => {
        if (val < 0) return { text: 'Prejuízo p/ Ação', color: 'text-brand-danger bg-rose-950/20 border-brand-danger/20' };
        return { text: 'Lucrativa', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
      }
    },
    {
      key: 'vpa',
      label: 'VPA',
      description: 'Valor Patrimonial por Ação. Mostra o valor contábil líquido correspondente a cada ação.',
      unit: '',
      category: 'valuation',
      format: (val) => `${currencySymbol} ${val.toFixed(3)}`,
      interpret: (_val) => {
        return { text: 'Patr. Líquido', color: 'text-brand-info bg-blue-950/20 border-brand-info/20' };
      }
    },

    // 2. Rentabilidade & Eficiência
    {
      key: 'roe',
      label: 'ROE',
      description: 'Retorno sobre o Patrimônio Líquido. Mede a capacidade da empresa de gerar lucro a partir de seu capital próprio.',
      unit: '%',
      category: 'profitability',
      format: (val) => `${val.toFixed(3)}%`,
      interpret: (val) => {
        if (val < 0) return { text: 'Destrói Valor', color: 'text-brand-danger bg-rose-950/20 border-brand-danger/20' };
        if (val < 10.0) return { text: 'Retorno Baixo', color: 'text-dark-textSecondary bg-gray-800 border-dark-border' };
        if (val < 20.0) return { text: 'Eficiente', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        return { text: 'Altamente Eficiente', color: 'text-brand-purple bg-purple-950/20 border-brand-purple/20' };
      }
    },
    {
      key: 'roic',
      label: 'ROIC',
      description: 'Retorno sobre o Capital Investido. Mede a taxa de retorno que a empresa consegue sobre todo o capital empregado (próprio + terceiros).',
      unit: '%',
      category: 'profitability',
      format: (val) => `${val.toFixed(3)}%`,
      interpret: (val) => {
        if (val < 0) return { text: 'Destrói Valor', color: 'text-brand-danger bg-rose-950/20 border-brand-danger/20' };
        if (val < 10.0) return { text: 'Retorno Baixo', color: 'text-dark-textSecondary bg-gray-800 border-dark-border' };
        if (val < 18.0) return { text: 'Bom Retorno', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        return { text: 'Retorno Excepcional', color: 'text-brand-purple bg-purple-950/20 border-brand-purple/20' };
      }
    },
    {
      key: 'roa',
      label: 'ROA',
      description: 'Retorno sobre Ativos. Indica a eficiência na utilização dos ativos totais para gerar lucro líquido.',
      unit: '%',
      category: 'profitability',
      format: (val) => `${val.toFixed(3)}%`,
      interpret: (val) => {
        if (val < 2.0) return { text: 'Baixo', color: 'text-dark-textSecondary bg-gray-800 border-dark-border' };
        if (val < 8.0) return { text: 'Saudável', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        return { text: 'Muito Rentável', color: 'text-brand-purple bg-purple-950/20 border-brand-purple/20' };
      }
    },
    {
      key: 'margemBruta',
      label: 'Margem Bruta',
      description: 'Percentual restante da receita após deduzir os custos diretos de fabricação ou serviços.',
      unit: '%',
      category: 'profitability',
      format: (val) => `${val.toFixed(3)}%`,
      interpret: (val) => {
        if (val < 20.0) return { text: 'Margem Apertada', color: 'text-brand-warning bg-amber-950/20 border-brand-warning/20' };
        if (val < 50.0) return { text: 'Saudável', color: 'text-brand-info bg-blue-950/20 border-brand-info/20' };
        return { text: 'Excelente Margem', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
      }
    },
    {
      key: 'margemEbitda',
      label: 'Margem EBITDA',
      description: 'Eficiência operacional medida como EBITDA dividido pela Receita Líquida.',
      unit: '%',
      category: 'profitability',
      format: (val) => `${val.toFixed(3)}%`,
      interpret: (val) => {
        if (val < 10.0) return { text: 'Baixa', color: 'text-dark-textSecondary bg-gray-800 border-dark-border' };
        if (val < 25.0) return { text: 'Boa Operação', color: 'text-brand-info bg-blue-950/20 border-brand-info/20' };
        return { text: 'Operação de Alta Geração', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
      }
    },
    {
      key: 'margemEbit',
      label: 'Margem EBIT',
      description: 'Mede a rentabilidade estritamente operacional (lucro operacional sobre receita líquida).',
      unit: '%',
      category: 'profitability',
      format: (val) => `${val.toFixed(3)}%`,
      interpret: (val) => {
        if (val < 5.0) return { text: 'Margem Baixa', color: 'text-brand-warning bg-amber-950/20 border-brand-warning/20' };
        return { text: 'Saudável', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
      }
    },
    {
      key: 'margemLiquida',
      label: 'Margem Líquida',
      description: 'Porcentagem da receita que se converte em lucro líquido após dedução de todas as despesas.',
      unit: '%',
      category: 'profitability',
      format: (val) => `${val.toFixed(3)}%`,
      interpret: (val) => {
        if (val < 0) return { text: 'Prejuízo Líquido', color: 'text-brand-danger bg-rose-950/20 border-brand-danger/20' };
        if (val < 5.0) return { text: 'Margem Apertada', color: 'text-brand-warning bg-amber-950/20 border-brand-warning/20' };
        if (val < 15.0) return { text: 'Saudável', color: 'text-brand-info bg-blue-950/20 border-brand-info/20' };
        return { text: 'Excelente Margem', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
      }
    },

    // 3. Endividamento & Crescimento
    {
      key: 'dy',
      label: 'Dividend Yield',
      description: 'Rendimento de Dividendos. Percentual de proventos pagos aos acionistas nos últimos 12 meses frente ao preço atual.',
      unit: '%',
      category: 'solvency',
      format: (val) => `${val.toFixed(3)}%`,
      interpret: (val) => {
        if (val === 0) return { text: 'Não paga dividendos', color: 'text-dark-textSecondary bg-gray-800 border-dark-border' };
        if (val < 4.0) return { text: 'Rendimento Baixo', color: 'text-brand-info bg-blue-950/20 border-brand-info/20' };
        if (val < 8.0) return { text: 'Rendimento Bom', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        return { text: 'Yield Excelente', color: 'text-brand-purple bg-purple-950/20 border-brand-purple/20' };
      }
    },
    {
      key: 'dividaLiquidaPatrimonio',
      label: 'Dív. Líq./Patr.',
      description: 'Dívida Líquida dividida pelo Patrimônio Líquido. Mede a alavancagem financeira gerada pelo capital de terceiros.',
      unit: 'x',
      category: 'solvency',
      format: (val) => `${val.toFixed(3)}x`,
      interpret: (val) => {
        if (val < 0) return { text: 'Caixa Líquido', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        if (val < 0.8) return { text: 'Alavancagem Saudável', color: 'text-brand-info bg-blue-950/20 border-brand-info/20' };
        return { text: 'Alavancagem Elevada', color: 'text-brand-warning bg-amber-950/20 border-brand-warning/20' };
      }
    },
    {
      key: 'dividaLiquidaEbitda',
      label: 'Dív. Líq./EBITDA',
      description: 'Dívida Líquida dividida pelo EBITDA. Indica a capacidade de pagar o endividamento usando a geração de caixa operacional atual.',
      unit: 'x',
      category: 'solvency',
      format: (val) => `${val.toFixed(3)}x`,
      interpret: (val) => {
        if (val < 0) return { text: 'Caixa Líquido', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        if (val < 2.0) return { text: 'Endividamento Seguro', color: 'text-brand-info bg-blue-950/20 border-brand-info/20' };
        if (val < 3.5) return { text: 'Endividamento Alerta', color: 'text-brand-warning bg-amber-950/20 border-brand-warning/20' };
        return { text: 'Alavancagem de Alto Risco', color: 'text-brand-danger bg-rose-950/20 border-brand-danger/20' };
      }
    },
    {
      key: 'dividaBrutaPatrimonio',
      label: 'Dív. Bruta/Patr.',
      description: 'Dívida Bruta dividida pelo Patrimônio Líquido. Indica a proporção total de recursos de terceiros no patrimônio.',
      unit: 'x',
      category: 'solvency',
      format: (val) => `${val.toFixed(3)}x`,
      interpret: (val) => {
        if (val < 1.0) return { text: 'Confortável', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
        return { text: 'Moderado', color: 'text-dark-textSecondary bg-gray-800 border-dark-border' };
      }
    },
    {
      key: 'liquidezCorrente',
      label: 'Liq. Corrente',
      description: 'Relação entre ativos circulantes e passivos circulantes. Indica a solvência de curto prazo da empresa.',
      unit: 'x',
      category: 'solvency',
      format: (val) => `${val.toFixed(3)}x`,
      interpret: (val) => {
        if (val < 1.0) return { text: 'Risco de Ilividez C/P', color: 'text-brand-danger bg-rose-950/20 border-brand-danger/20' };
        if (val < 1.5) return { text: 'Ajustado', color: 'text-brand-warning bg-amber-950/20 border-brand-warning/20' };
        return { text: 'Excelente Solvência', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
      }
    },
    {
      key: 'cagrReceitas5Anos',
      label: 'CAGR Rec. 5A',
      description: 'Compound Annual Growth Rate das Receitas. Taxa de crescimento anual composta da receita líquida consolidada de 5 anos.',
      unit: '%',
      category: 'solvency',
      format: (val) => `${val.toFixed(3)}%`,
      interpret: (val) => {
        if (val < 0) return { text: 'Receita Encolhendo', color: 'text-brand-danger bg-rose-950/20 border-brand-danger/20' };
        if (val < 8.0) return { text: 'Crescimento Lento', color: 'text-dark-textSecondary bg-gray-800 border-dark-border' };
        return { text: 'Crescimento Forte', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
      }
    },
    {
      key: 'cagrLucros5Anos',
      label: 'CAGR Luc. 5A',
      description: 'Compound Annual Growth Rate dos Lucros. Taxa de crescimento anual composta do lucro líquido consolidado de 5 anos.',
      unit: '%',
      category: 'solvency',
      format: (val) => `${val.toFixed(3)}%`,
      interpret: (val) => {
        if (val < 0) return { text: 'Lucro Encolhendo', color: 'text-brand-danger bg-rose-950/20 border-brand-danger/20' };
        if (val < 10.0) return { text: 'Crescimento Lento', color: 'text-dark-textSecondary bg-gray-800 border-dark-border' };
        return { text: 'Expansão Acelerada', color: 'text-brand-success bg-emerald-950/20 border-brand-success/20' };
      }
    }
  ];

  const handleEdit = (key: string, value: number) => {
    setEditingKey(key);
    setEditValue(value.toString());
  };

  const handleSave = (key: keyof StockData) => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      saveUserOverride(data.symbol, { [key]: val });
      onUpdateData({ [key]: val });
      setEditingKey(null);
    }
  };


  // Calculate fundamentalist scorecard (out of 5 points)
  const scorecard = useMemo(() => {
    let score = 0;
    if (data.pl > 0 && data.pl < 12) score += 1;
    if (data.pvp > 0 && data.pvp < 1.8) score += 1;
    if (data.dy >= 6.0) score += 1;
    if (data.roe >= 12.0) score += 1;
    if (data.margemLiquida >= 10.0) score += 1;

    let verdict = 'Conservador / Regular';
    let verdictColor = 'text-brand-warning bg-amber-950/20 border-brand-warning/20';
    if (score >= 4) {
      verdict = 'Excelente Saúde Financeira';
      verdictColor = 'text-brand-success bg-emerald-950/20 border-brand-success/20 animate-pulse';
    } else if (score === 3) {
      verdict = 'Saudável / Moderado';
      verdictColor = 'text-brand-info bg-blue-950/20 border-brand-info/20';
    } else if (score <= 1) {
      verdict = 'Risco Fundamentalista Elevado';
      verdictColor = 'text-brand-danger bg-rose-950/20 border-brand-danger/20';
    }

    return { score, verdict, verdictColor };
  }, [data]);

  const fiveYearData = useMemo(() => {
    return get5YearData(data.symbol, data.pl, data.dy);
  }, [data.symbol, data.pl, data.dy]);

  const formatFinancial = (val: number, full: boolean = false) => {
    if (val === 0) return '0';
    if (Math.abs(val) >= 1000) {
      const formatted = (val / 1000).toFixed(1);
      return full ? `${formatted} Bi` : `${formatted}B`;
    }
    return full ? `${val.toFixed(0)} Mi` : `${val.toFixed(0)}M`;
  };

  // Grouped Indicators Categories for rendering
  const valuationIndicators = useMemo(() => indicators.filter(i => i.category === 'valuation'), [indicators]);
  const profitabilityIndicators = useMemo(() => indicators.filter(i => i.category === 'profitability'), [indicators]);
  const solvencyIndicators = useMemo(() => indicators.filter(i => i.category === 'solvency'), [indicators]);

  const renderIndicatorGrid = (configs: IndicatorConfig[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {configs.map((ind) => {
        const rawValue = data[ind.key] !== undefined 
          ? (data[ind.key] as number) 
          : getFallbackIndicatorValue(ind.key as string, data);
        
        const interpretation = ind.interpret(rawValue);
        const isEditing = editingKey === ind.key;

        return (
          <div 
            key={ind.key}
            className="bg-dark-bg/40 border border-dark-border/60 hover-lift rounded-xl p-5.5 flex flex-col justify-between group relative"
          >
            {/* Header inside indicator card */}
            <div className="flex items-center justify-between">
              <span className="text-2xs font-extrabold text-dark-textSecondary tracking-wide uppercase flex items-center gap-1.5">
                {ind.label}
                <button
                  onMouseEnter={() => setActiveTooltip(ind.key as string)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-gray-600 hover:text-dark-textSecondary transition-colors cursor-help"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </span>

              {/* Inline edit button */}
              {!isEditing && (
                <button
                  onClick={() => handleEdit(ind.key as string, rawValue)}
                  className="opacity-0 group-hover:opacity-100 text-dark-textSecondary hover:text-dark-textPrimary p-1 hover:bg-dark-cardHover rounded transition-all"
                  title={`Editar ${ind.label}`}
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Tooltip Popup */}
            {activeTooltip === ind.key && (
              <div className="absolute left-4 top-11 right-4 bg-gray-900 border border-dark-border rounded-lg p-3 shadow-2xl z-20 text-3xs text-dark-textSecondary leading-relaxed">
                {ind.description}
              </div>
            )}

            {/* Value Input or Label */}
            <div className="my-3.5">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full bg-dark-card border border-brand-primary outline-none py-1.5 px-2 rounded-lg text-sm text-dark-textPrimary font-mono font-bold text-center"
                    step="0.01"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave(ind.key)}
                    className="p-1.5 bg-brand-success/15 border border-brand-success/30 text-brand-success rounded-lg hover:bg-brand-success/30 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingKey(null)}
                    className="p-1.5 bg-rose-950/15 border border-brand-danger/30 text-brand-danger rounded-lg hover:bg-rose-950/30 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-xl font-extrabold text-dark-textPrimary font-mono block">
                  {ind.format(rawValue)}
                </span>
              )}
            </div>

            {/* Interpretation Badge */}
            <div className="mt-1">
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${interpretation.color}`}>
                {interpretation.text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="glass-card rounded-2xl p-8 shadow-xl space-y-8">
      
      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-dark-border/40 pb-5">
        <div className="flex flex-col gap-2.5">
          <div>
            <span className="text-2xs font-bold text-dark-textSecondary uppercase tracking-wider block">Estudo Fundamentalista</span>
            <h3 className="text-lg font-bold text-dark-textPrimary">Análise e Indicadores da Empresa</h3>
          </div>
          
          {/* Subtabs selectors */}
          <div className="flex flex-wrap items-center gap-1.5 bg-dark-bg/60 border border-dark-border/80 rounded-xl p-1 select-none self-start">
            <button
              onClick={() => setActiveSubTab('current')}
              className={`text-[11px] font-extrabold uppercase tracking-wide px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                activeSubTab === 'current'
                  ? 'bg-brand-primary text-white shadow shadow-brand-primary/15'
                  : 'text-dark-textSecondary hover:text-dark-textPrimary'
              }`}
            >
              Múltiplos Atuais
            </button>
            <button
              onClick={() => setActiveSubTab('historical')}
              className={`text-[11px] font-extrabold uppercase tracking-wide px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                activeSubTab === 'historical'
                  ? 'bg-brand-primary text-white shadow shadow-brand-primary/15'
                  : 'text-dark-textSecondary hover:text-dark-textPrimary'
              }`}
            >
              Evolução Temporal
            </button>
            <button
              onClick={() => setActiveSubTab('charts')}
              className={`text-[11px] font-extrabold uppercase tracking-wide px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                activeSubTab === 'charts'
                  ? 'bg-brand-primary text-white shadow shadow-brand-primary/15'
                  : 'text-dark-textSecondary hover:text-dark-textPrimary'
              }`}
            >
              Gráficos Financeiros
            </button>
          </div>
        </div>

        {/* Fundamentalist Scorecard Display */}
        <div className="flex items-center gap-3 bg-dark-bg/60 border border-dark-border/80 rounded-xl p-3 select-none">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono font-black text-emerald-400 text-lg">
            {scorecard.score}/5
          </div>
          <div>
            <span className="text-4xs font-bold text-dark-textSecondary uppercase tracking-wider block">Score Fundamentalista</span>
            <span className={`text-4xs font-black px-2 py-0.5 rounded-full border inline-block mt-0.5 ${scorecard.verdictColor}`}>
              {scorecard.verdict}
            </span>
          </div>
        </div>
      </div>

      {activeSubTab === 'current' ? (
        <div className="space-y-10 animate-fadeIn">
          {/* Section 1: Valuation */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-dark-textPrimary uppercase tracking-wider text-left border-l-2 border-brand-primary pl-2.5 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-primary" />
              Indicadores de Valuation (Preço / Valor)
            </h4>
            {renderIndicatorGrid(valuationIndicators)}
          </div>

          {/* Section 2: Rentabilidade */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-dark-textPrimary uppercase tracking-wider text-left border-l-2 border-brand-primary pl-2.5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-primary" />
              Indicadores de Rentabilidade & Eficiência
            </h4>
            {renderIndicatorGrid(profitabilityIndicators)}
          </div>

          {/* Section 3: Endividamento */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-dark-textPrimary uppercase tracking-wider text-left border-l-2 border-brand-primary pl-2.5 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand-primary" />
              Indicadores de Endividamento, Liquidez & Crescimento
            </h4>
            {renderIndicatorGrid(solvencyIndicators)}
          </div>
        </div>
      ) : activeSubTab === 'historical' ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Historical Table */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-dark-textPrimary uppercase tracking-wider text-left border-l-2 border-brand-primary pl-2.5">
              Evolução de Múltiplos (Últimos 3 Anos)
            </h4>
            <div className="overflow-x-auto rounded-xl border border-dark-border/60 bg-dark-bg/25">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="bg-dark-card/60 border-b border-dark-border/60 text-dark-textSecondary font-extrabold text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-5 sticky left-0 z-10 bg-dark-card/95 border-r border-dark-border/40">Indicador</th>
                    {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - i).map((year, i) => (
                      <th key={year} className="py-3.5 px-5 text-center min-w-[160px]">
                        {i === 0 ? `Atualizado (${year})` : `${year} (${i} ano${i > 1 ? 's' : ''} atrás)`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40 font-mono text-dark-textPrimary">
                  {indicators.map((ind) => {
                    const baseVal = data[ind.key] !== undefined 
                      ? (data[ind.key] as number) 
                      : getFallbackIndicatorValue(ind.key as string, data);
                    
                    const yearsList = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - i);
                    const values = yearsList.map((_, i) => i === 0 ? baseVal : getHistoricalIndicator(ind.key, data.symbol, i, baseVal));

                    return (
                      <tr key={ind.key} className="hover:bg-dark-card/10 transition-colors">
                        <td className="py-3.5 px-5 font-sans font-extrabold text-[12px] text-dark-textSecondary uppercase tracking-wider sticky left-0 z-10 bg-dark-bg/95 border-r border-dark-border/40">
                          {ind.label}
                        </td>
                        {values.map((val, i) => {
                          const prevVal = i < values.length - 1 ? values[i + 1] : val;
                          const comp = i < values.length - 1 ? getComparisonStyle(val, prevVal) : { className: 'text-dark-textSecondary/80 font-semibold', icon: '' };
                          
                          return (
                            <td key={yearsList[i]} className={`py-3.5 px-5 text-center font-bold text-[13px] ${comp.className}`}>
                              {ind.format(val)}{comp.icon}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* Chart View Selector */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-dark-border/40 pb-4">
            <div>
              <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Visualização Gráfica</span>
              <h4 className="text-sm font-bold text-dark-textPrimary">Demonstrativos de 5 Anos (2022 - 2026)</h4>
            </div>
            
            <div className="flex items-center gap-1.5 bg-dark-bg/60 border border-dark-border/80 rounded-xl p-1 select-none">
              <button
                onClick={() => setChartMode('separated')}
                className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === 'separated'
                    ? 'bg-dark-card text-dark-textPrimary border border-dark-border shadow'
                    : 'text-dark-textSecondary hover:text-dark-textPrimary'
                }`}
              >
                Gráficos Separados
              </button>
              <button
                onClick={() => setChartMode('combined')}
                className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === 'combined'
                    ? 'bg-dark-card text-dark-textPrimary border border-dark-border shadow'
                    : 'text-dark-textSecondary hover:text-dark-textPrimary'
                }`}
              >
                Comparação Unificada
              </button>
            </div>
          </div>

          {/* KPI Cards for the Latest Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card: Lucro Líquido 2026 */}
            <div className="bg-dark-bg/30 border border-dark-border/40 hover:border-brand-success/30 rounded-xl p-4 flex items-center justify-between transition-all duration-300">
              <div>
                <span className="text-[10px] font-bold text-dark-textSecondary uppercase tracking-wider block">Lucro Líquido (2026)</span>
                <span className="text-base font-black text-brand-success font-mono mt-1 block">
                  {currencySymbol} {formatFinancial(fiveYearData[fiveYearData.length - 1].lucro, true)}
                </span>
              </div>
              <div className="w-8 h-8 bg-brand-success/10 border border-brand-success/20 rounded-lg flex items-center justify-center text-brand-success shadow-inner shadow-brand-success/5">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* Card: Dívida Líquida 2026 */}
            <div className="bg-dark-bg/30 border border-dark-border/40 hover:border-brand-danger/30 rounded-xl p-4 flex items-center justify-between transition-all duration-300">
              <div>
                <span className="text-[10px] font-bold text-dark-textSecondary uppercase tracking-wider block">Dívida Líquida (2026)</span>
                <span className="text-base font-black text-brand-danger font-mono mt-1 block">
                  {currencySymbol} {formatFinancial(fiveYearData[fiveYearData.length - 1].divida, true)}
                </span>
              </div>
              <div className="w-8 h-8 bg-brand-danger/10 border border-brand-danger/20 rounded-lg flex items-center justify-center text-brand-danger shadow-inner shadow-brand-danger/5">
                <ShieldAlert className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* Card: Payout (2026) */}
            <div className="bg-dark-bg/30 border border-dark-border/40 hover:border-brand-purple/30 rounded-xl p-4 flex items-center justify-between transition-all duration-300">
              <div>
                <span className="text-[10px] font-bold text-dark-textSecondary uppercase tracking-wider block">Payout (2026)</span>
                <span className="text-base font-black text-brand-purple font-mono mt-1 block">
                  {fiveYearData[fiveYearData.length - 1].payout}%
                </span>
              </div>
              <div className="w-8 h-8 bg-brand-purple/10 border border-brand-purple/20 rounded-lg flex items-center justify-center text-brand-purple shadow-inner shadow-brand-purple/5">
                <BarChart3 className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>

          {chartMode === 'separated' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart 1: Lucro Líquido */}
              <div className="bg-dark-bg/40 border border-dark-border/60 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-brand-success/20 transition-colors">
                <div>
                  <span className="text-[10px] font-bold text-dark-textSecondary uppercase tracking-wider block">Desempenho</span>
                  <h5 className="text-xs font-extrabold text-dark-textPrimary">Lucro Líquido Anual</h5>
                </div>
                <div className="h-48 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={fiveYearData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.25} />
                      <XAxis dataKey="year" stroke="#6b7280" fontSize={10} tickLine={false} />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={9} 
                        tickLine={false}
                        tickFormatter={(v) => formatFinancial(v)}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#11131c', border: '1px solid #374151', borderRadius: '12px' }}
                        labelStyle={{ color: '#9ca3af', fontSize: '10px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#10b981', fontSize: '11px', fontWeight: 'bold' }}
                        formatter={(value: any) => [`${currencySymbol} ${formatFinancial(value as number, true)}`, 'Lucro Líquido']}
                      />
                      <Area type="monotone" dataKey="lucro" stroke="#10b981" fillOpacity={1} fill="url(#colorLucro)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Dívida Líquida */}
              <div className="bg-dark-bg/40 border border-dark-border/60 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-brand-danger/20 transition-colors">
                <div>
                  <span className="text-[10px] font-bold text-dark-textSecondary uppercase tracking-wider block">Endividamento</span>
                  <h5 className="text-xs font-extrabold text-dark-textPrimary">Dívida Líquida Anual</h5>
                </div>
                <div className="h-48 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={fiveYearData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDivida" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.25} />
                      <XAxis dataKey="year" stroke="#6b7280" fontSize={10} tickLine={false} />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={9} 
                        tickLine={false}
                        tickFormatter={(v) => formatFinancial(v)}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#11131c', border: '1px solid #374151', borderRadius: '12px' }}
                        labelStyle={{ color: '#9ca3af', fontSize: '10px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#ef4444', fontSize: '11px', fontWeight: 'bold' }}
                        formatter={(value: any) => [`${currencySymbol} ${formatFinancial(value as number, true)}`, 'Dívida Líquida']}
                      />
                      <Area type="monotone" dataKey="divida" stroke="#ef4444" fillOpacity={1} fill="url(#colorDivida)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Payout (%) */}
              <div className="bg-dark-bg/40 border border-dark-border/60 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-brand-purple/20 transition-colors">
                <div>
                  <span className="text-[10px] font-bold text-dark-textSecondary uppercase tracking-wider block">Distribuição</span>
                  <h5 className="text-xs font-extrabold text-dark-textPrimary">Payout Anual (%)</h5>
                </div>
                <div className="h-48 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fiveYearData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.25} />
                      <XAxis dataKey="year" stroke="#6b7280" fontSize={10} tickLine={false} />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={9} 
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#11131c', border: '1px solid #374151', borderRadius: '12px' }}
                        labelStyle={{ color: '#9ca3af', fontSize: '10px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#a78bfa', fontSize: '11px', fontWeight: 'bold' }}
                        formatter={(value: any) => [`${value}%`, 'Payout']}
                      />
                      <Bar dataKey="payout" fill="#a78bfa" radius={[4, 4, 0, 0]} fillOpacity={0.8} maxBarSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            /* Unified Comparison Chart */
            <div className="bg-dark-bg/40 border border-dark-border/60 rounded-xl p-6 space-y-4">
              <div>
                <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Gráfico Comparativo</span>
                <h5 className="text-xs font-bold text-dark-textPrimary">Lucro vs Dívida vs Payout (2022 - 2026)</h5>
              </div>
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={fiveYearData} margin={{ top: 15, right: -5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.2} />
                    <XAxis dataKey="year" stroke="#6b7280" fontSize={11} tickLine={false} />
                    
                    {/* Left Y Axis for Currency values (Lucro & Divida) */}
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      stroke="#6b7280" 
                      fontSize={10} 
                      tickLine={false}
                      tickFormatter={(v) => formatFinancial(v)}
                    />
                    
                    {/* Right Y Axis for Payout percentage */}
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#6b7280" 
                      fontSize={10} 
                      tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                      domain={[0, 100]}
                    />

                    <Tooltip 
                      contentStyle={{ backgroundColor: '#11131c', border: '1px solid #374151', borderRadius: '12px' }}
                      labelStyle={{ color: '#9ca3af', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                      formatter={(value: any, name?: any) => {
                        if (name === "Payout (%)") return [`${value}%`, name];
                        return [`${currencySymbol} ${formatFinancial(value as number, true)}`, name || ''];
                      }}
                    />
                    
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />

                    <Bar 
                      yAxisId="left" 
                      dataKey="lucro" 
                      name="Lucro Líquido" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]} 
                      fillOpacity={0.8}
                      maxBarSize={22}
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="divida" 
                      name="Dívida Líquida" 
                      fill="#ef4444" 
                      radius={[4, 4, 0, 0]} 
                      fillOpacity={0.8}
                      maxBarSize={22}
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="payout" 
                      name="Payout (%)" 
                      stroke="#a78bfa" 
                      strokeWidth={3} 
                      dot={{ r: 4, stroke: '#a78bfa', strokeWidth: 1, fill: '#11131c' }} 
                      activeDot={{ r: 6, stroke: '#a78bfa', strokeWidth: 2, fill: '#11131c' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Educational Note */}
          <div className="bg-dark-bg/25 border border-dark-border/40 rounded-xl p-4 flex gap-3 items-start">
            <div className="w-8 h-8 bg-brand-primary/10 border border-brand-primary/20 rounded-lg flex items-center justify-center text-brand-primary shrink-0 mt-0.5">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h6 className="text-[11px] font-bold text-dark-textPrimary">Análise de Correlação Fundamentalista</h6>
              <p className="text-[10px] text-dark-textSecondary leading-relaxed mt-1">
                Uma empresa financeiramente robusta idealmente apresenta **Lucro Líquido** crescente, **Dívida Líquida** controlada (ou negativa/caixa líquido) e um **Payout** sustentável. Se a curva do Payout subir muito sem o crescimento correspondente do Lucro, a distribuição de proventos pode se tornar insustentável no longo prazo.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
