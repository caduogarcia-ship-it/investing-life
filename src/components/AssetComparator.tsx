import React, { useState, useMemo } from 'react';
import { 
  GitCompare, Plus, X, TrendingUp, TrendingDown, 
  ShieldAlert, Award, DollarSign, BarChart2, Check, Info, AlertTriangle, ShieldCheck, Target 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { ALL_B3_TICKERS, getTickerCategory } from '../services/api';

interface ComparedAsset {
  symbol: string;
  name: string;
  category: string;
  color: string;
  isBenchmark?: boolean;
}

const COLOR_PALETTE = [
  '#6366f1', // Indigo / Brand Primary
  '#10b981', // Emerald / Success
  '#f59e0b', // Amber / Warning
  '#f43f5e', // Rose / Danger
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#3b82f6', // Blue
];

const BENCHMARKS: ComparedAsset[] = [
  { symbol: 'CDI', name: 'CDI (100%)', category: 'Índice Renda Fixa', color: '#10b981', isBenchmark: true },
  { symbol: 'IBOV', name: 'Ibovespa (^BVSP)', category: 'Índice Ações', color: '#6366f1', isBenchmark: true },
  { symbol: 'IFIX', name: 'IFIX (Fundos Imobiliários)', category: 'Índice FIIs', color: '#f59e0b', isBenchmark: true },
  { symbol: 'IPCA', name: 'IPCA (Inflação)', category: 'Índice de Preços', color: '#f43f5e', isBenchmark: true },
  { symbol: 'SP500', name: 'S&P 500 (BRL)', category: 'Índice Global', color: '#06b6d4', isBenchmark: true },
];

const PRESETS = [
  { name: 'PETR4 vs VALE3 vs IBOV', symbols: ['PETR4', 'VALE3', 'IBOV'] },
  { name: 'BOVA11 vs IVVB11 vs CDI', symbols: ['BOVA11', 'IVVB11', 'CDI'] },
  { name: 'MXRF11 vs HGLG11 vs IFIX', symbols: ['MXRF11', 'HGLG11', 'IFIX'] },
  { name: 'WEGE3 vs ITUB4 vs SP500', symbols: ['WEGE3', 'ITUB4', 'SP500'] },
];

export const AssetComparator: React.FC = () => {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['PETR4', 'VALE3', 'IBOV']);
  const [timeframe, setTimeframe] = useState<'1M' | '6M' | '1Y' | '2Y' | '5Y'>('1Y');
  const [searchInput, setSearchInput] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [simulationAmount, setSimulationAmount] = useState<number>(10000);

  // Generate synthetic historical returns & metrics seeded by ticker symbol & timeframe for continuous smooth data
  const comparisonData = useMemo(() => {
    const monthsCount = timeframe === '1M' ? 1 : timeframe === '6M' ? 6 : timeframe === '1Y' ? 12 : timeframe === '2Y' ? 24 : 60;
    const now = new Date();
    
    // Generate dates array
    const dates: string[] = [];
    for (let i = monthsCount; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      dates.push(d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
    }

    // Seeded random walk per symbol
    const assetReturns: Record<string, number[]> = {};
    const assetDrawdowns: Record<string, number[]> = {};
    
    selectedSymbols.forEach((sym) => {
      let seed = 0;
      for (let i = 0; i < sym.length; i++) seed += sym.charCodeAt(i);
      
      const returns = [0]; // Starts at 0%
      let currentVal = 0;

      // Base monthly drift & volatility parameters
      let drift = 0.8; // 0.8% avg monthly return
      let vol = 4.5;   // 4.5% volatility

      if (sym === 'CDI') { drift = 0.85; vol = 0.05; }
      else if (sym === 'IPCA') { drift = 0.40; vol = 0.15; }
      else if (sym === 'IFIX') { drift = 0.90; vol = 1.8; }
      else if (sym === 'IBOV') { drift = 1.10; vol = 5.2; }
      else if (sym === 'SP500') { drift = 1.35; vol = 4.2; }
      else if (sym.includes('11')) { drift = 1.0; vol = 2.5; } // FIIs / ETFs
      else { drift = 1.2 + (seed % 5) / 10; vol = 5.0 + (seed % 4); } // Stocks

      for (let m = 1; m <= monthsCount; m++) {
        // Pseudo random variation
        const pseudoRand = Math.sin(seed * m * 1.5 + m * 0.7);
        const change = drift + pseudoRand * vol;
        currentVal += change;
        returns.push(Number(currentVal.toFixed(2)));
      }
      assetReturns[sym] = returns;

      // Calculate historical drawdown curve at each date point
      let peak = 0;
      const drawdowns: number[] = [];
      returns.forEach((r) => {
        if (r > peak) peak = r;
        const dd = r - peak;
        drawdowns.push(Number(dd.toFixed(2)));
      });
      assetDrawdowns[sym] = drawdowns;
    });

    // Format performance chart data for Recharts
    const chartData = dates.map((date, idx) => {
      const point: Record<string, any> = { date };
      selectedSymbols.forEach((sym) => {
        point[sym] = assetReturns[sym][idx] || 0;
      });
      return point;
    });

    // Format drawdown curve chart data for Recharts
    const drawdownChartData = dates.map((date, idx) => {
      const point: Record<string, any> = { date };
      selectedSymbols.forEach((sym) => {
        point[sym] = assetDrawdowns[sym][idx] || 0;
      });
      return point;
    });

    // Compute metrics & scatter plot points per symbol
    const metricsMap = selectedSymbols.map((sym, index) => {
      const returns = assetReturns[sym] || [0];
      const totalReturn = returns[returns.length - 1] || 0;
      
      // Calculate max drawdown
      let maxPeak = 0;
      let maxDrawdown = 0;
      returns.forEach((r) => {
        if (r > maxPeak) maxPeak = r;
        const dd = maxPeak - r;
        if (dd > maxDrawdown) maxDrawdown = dd;
      });

      // Calculate annualized return
      const years = monthsCount / 12;
      const annualizedReturn = Math.pow(1 + totalReturn / 100, 1 / Math.max(0.1, years)) - 1;

      // Volatility approximation
      let vol = 12.0;
      if (sym === 'CDI') vol = 0.5;
      else if (sym === 'IPCA') vol = 1.2;
      else if (sym === 'IFIX') vol = 7.5;
      else if (sym === 'IBOV') vol = 18.5;
      else if (sym === 'SP500') vol = 15.2;
      else vol = 16.0 + ((sym.charCodeAt(0) * 3) % 15);

      // Sharpe Ratio = (Annualized Return - Risk Free 10.5%) / Volatility
      const riskFree = 10.5;
      const sharpe = vol > 0 ? ((annualizedReturn * 100) - riskFree) / vol : 0;
      const riskReturnRatio = vol > 0 ? (totalReturn / vol) : 0;

      // Risk Classification
      let riskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto' = 'Médio';
      if (vol < 5) riskLevel = 'Baixo';
      else if (vol < 12) riskLevel = 'Médio';
      else if (vol < 22) riskLevel = 'Alto';
      else riskLevel = 'Muito Alto';

      // Find metadata
      const bm = BENCHMARKS.find(b => b.symbol === sym);
      const b3 = ALL_B3_TICKERS.find(t => t.symbol === sym);
      
      const name = bm ? bm.name : b3 ? b3.name : sym;
      const category = bm ? bm.category : getTickerCategory(sym, name);
      const color = COLOR_PALETTE[index % COLOR_PALETTE.length];

      const finalSimulatedValue = simulationAmount * (1 + totalReturn / 100);
      const simulatedProfit = finalSimulatedValue - simulationAmount;

      return {
        symbol: sym,
        name,
        category,
        color,
        totalReturn,
        annualizedReturnPercent: annualizedReturn * 100,
        volatility: vol,
        sharpeRatio: Number(sharpe.toFixed(2)),
        riskReturnRatio: Number(riskReturnRatio.toFixed(2)),
        riskLevel,
        maxDrawdown: -Math.abs(Number(maxDrawdown.toFixed(2))),
        finalSimulatedValue,
        simulatedProfit,
        bestMonth: Number((Math.max(...returns.map((r, i) => i === 0 ? 0 : r - returns[i-1]))).toFixed(2)),
        worstMonth: Number((Math.min(...returns.map((r, i) => i === 0 ? 0 : r - returns[i-1]))).toFixed(2)),
      };
    });

    // Format Scatter Plot Data: x = Volatility (%), y = Total Return (%), z = 100 (bubble size)
    const scatterData = metricsMap.map((m) => ({
      x: Number(m.volatility.toFixed(2)),
      y: Number(m.totalReturn.toFixed(2)),
      z: 120,
      symbol: m.symbol,
      color: m.color,
      category: m.category,
      sharpe: m.sharpeRatio
    }));

    return { chartData, drawdownChartData, metricsMap, scatterData };
  }, [selectedSymbols, timeframe, simulationAmount]);

  // Search filtered suggestions
  const searchResults = useMemo(() => {
    if (!searchInput.trim()) return [];
    const query = searchInput.toUpperCase().trim();
    
    const matchedBenchmarks = BENCHMARKS.filter(b => 
      b.symbol.includes(query) || b.name.toUpperCase().includes(query)
    );

    const matchedB3 = ALL_B3_TICKERS.filter(t => 
      t.symbol.includes(query) || t.name.toUpperCase().includes(query)
    ).slice(0, 8);

    return [
      ...matchedBenchmarks.map(b => ({ symbol: b.symbol, name: b.name, category: b.category })),
      ...matchedB3.map(t => ({ symbol: t.symbol, name: t.name, category: getTickerCategory(t.symbol, t.name) }))
    ];
  }, [searchInput]);

  const addAsset = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) return;
    if (selectedSymbols.length >= 6) {
      alert('Você pode comparar no máximo 6 ativos simultaneamente para manter o gráfico legível.');
      return;
    }
    setSelectedSymbols([...selectedSymbols, symbol]);
    setSearchInput('');
    setShowSearchDropdown(false);
  };

  const removeAsset = (symbol: string) => {
    if (selectedSymbols.length <= 1) {
      alert('Selecione pelo menos 1 ativo ou índice para visualizar.');
      return;
    }
    setSelectedSymbols(selectedSymbols.filter(s => s !== symbol));
  };

  const applyPreset = (symbols: string[]) => {
    setSelectedSymbols(symbols);
  };

  return (
    <div className="space-y-8 select-none animate-fadeIn pb-12">
      {/* Header Banner (Mais Retorno Style) */}
      <div className="bg-gradient-to-r from-dark-card via-dark-card/90 to-brand-primary/10 border border-dark-border/80 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/15 border border-brand-primary/30 rounded-full text-brand-primary text-xs font-bold uppercase tracking-wider">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Ferramenta Mais Retorno</span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-black text-dark-textPrimary tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Comparador de Ativos & Benchmarks
          </h2>

          <p className="text-xs lg:text-sm text-dark-textSecondary font-medium leading-relaxed">
            Compare a rentabilidade acumulada, o gráfico de drawdown (queda histórica), a matriz de dispersão risco x retorno e o Índice Sharpe entre ações, FIIs, ETFs, BDRs e índices (CDI, Ibovespa, IFIX, IPCA e S&P 500).
          </p>
        </div>

        {/* Quick Presets */}
        <div className="mt-6 pt-6 border-t border-dark-border/40 flex flex-wrap items-center gap-2.5">
          <span className="text-3xs font-bold uppercase tracking-wider text-dark-textSecondary flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-brand-primary" />
            Comparações Prontas:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.symbols)}
              className="px-3 py-1.5 bg-dark-bg/60 hover:bg-brand-primary/20 border border-dark-border hover:border-brand-primary/40 rounded-xl text-xs font-mono font-bold text-dark-textPrimary hover:text-brand-primary transition-all duration-200 cursor-pointer active:scale-95"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Selection & Search Bar */}
      <div className="bg-dark-card border border-dark-border rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Add Ticker Input */}
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Digite um ticker ou índice (ex: PETR4, IVVB11, CDI)..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-full bg-dark-bg border border-dark-border/80 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 outline-none rounded-xl py-3 pl-4 pr-10 text-xs text-dark-textPrimary font-mono placeholder:text-dark-textSecondary/50"
              />
              {searchInput && (
                <button 
                  onClick={() => setSearchInput('')} 
                  className="absolute right-3 top-3 text-dark-textSecondary hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div 
                className="absolute left-0 right-0 mt-2 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto"
                style={{ backdropFilter: 'blur(16px)' }}
              >
                {searchResults.map((res) => (
                  <button
                    key={res.symbol}
                    onClick={() => addAsset(res.symbol)}
                    className="w-full text-left px-4 py-2.5 hover:bg-dark-cardHover flex items-center justify-between border-b border-dark-border/20 last:border-none transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs text-brand-primary">{res.symbol}</span>
                      <span className="text-3xs text-dark-textSecondary max-w-[200px] truncate">{res.name}</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-dark-bg border border-dark-border text-dark-textSecondary font-bold uppercase">
                      {res.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Benchmark Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-3xs font-bold uppercase tracking-wider text-dark-textSecondary mr-1">Benchmarcks:</span>
            {BENCHMARKS.map((bm) => {
              const isSelected = selectedSymbols.includes(bm.symbol);
              return (
                <button
                  key={bm.symbol}
                  onClick={() => isSelected ? removeAsset(bm.symbol) : addAsset(bm.symbol)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    isSelected 
                      ? 'bg-brand-primary/20 border-brand-primary text-brand-primary shadow-sm'
                      : 'bg-dark-bg/40 border-dark-border text-dark-textSecondary hover:text-white'
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{bm.symbol}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Currently Selected Asset Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dark-border/40">
          <span className="text-3xs font-bold uppercase tracking-wider text-dark-textSecondary mr-2">Ativos em Comparação ({selectedSymbols.length}/6):</span>
          {comparisonData.metricsMap.map((item) => (
            <div
              key={item.symbol}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold shadow-sm transition-all"
              style={{ 
                backgroundColor: `${item.color}15`, 
                borderColor: `${item.color}40`,
                color: item.color 
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.symbol}</span>
              <button
                onClick={() => removeAsset(item.symbol)}
                className="hover:opacity-75 transition-opacity ml-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chart Section 1: Rentabilidade Acumulada */}
      <div className="bg-dark-card border border-dark-border rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
        
        {/* Controls: Timeframe buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-bold text-dark-textPrimary" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Gráfico de Rentabilidade Acumulada (%)
            </h3>
          </div>

          {/* Timeframe selector */}
          <div className="flex p-1 bg-dark-bg border border-dark-border rounded-xl">
            {(['1M', '6M', '1Y', '2Y', '5Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold font-mono transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-dark-textSecondary hover:text-white'
                }`}
              >
                {tf === '1M' ? '1 Mês' : tf === '6M' ? '6 Meses' : tf === '1Y' ? '1 Ano' : tf === '2Y' ? '2 Anos' : '5 Anos'}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Multi-line Chart */}
        <div className="h-[380px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: '#1f2937' }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(v) => `${v >= 0 ? '+' : ''}${v}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                  borderColor: '#374151',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
                formatter={(val: any) => [`${Number(val) >= 0 ? '+' : ''}${Number(val).toFixed(2)}%`, 'Rentabilidade']}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>{value}</span>}
              />
              {comparisonData.metricsMap.map((item) => (
                <Line
                  key={item.symbol}
                  type="monotone"
                  dataKey={item.symbol}
                  name={item.symbol}
                  stroke={item.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NEW CHART 1: GRÁFICO DE DRAWDOWN AO LONGO DO TEMPO (Underwater Chart) */}
      <div className="bg-dark-card border border-dark-border rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-border/40">
          <div>
            <h3 className="text-base font-bold text-dark-textPrimary flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <TrendingDown className="w-5 h-5 text-red-400" />
              Gráfico de Drawdown Histórico (Queda % do Topo)
            </h3>
            <p className="text-xs text-dark-textSecondary font-medium mt-0.5">
              Exibe a curva contínua de desvalorização (% em relação ao topo histórico anterior) de cada ativo ao longo do tempo.
            </p>
          </div>
        </div>

        <div className="h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData.drawdownChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: '#1f2937' }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                  borderColor: '#374151',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
                formatter={(val: any) => [`${Number(val).toFixed(2)}%`, 'Queda Histórica (Drawdown)']}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>{value}</span>}
              />
              {comparisonData.metricsMap.map((item) => (
                <Line
                  key={item.symbol}
                  type="monotone"
                  dataKey={item.symbol}
                  name={item.symbol}
                  stroke={item.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NEW CHART 2: GRÁFICO DE DISPERSÃO RISCO X RENTABILIDADE (Scatter Plot 2D) */}
      <div className="bg-dark-card border border-dark-border rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-border/40">
          <div>
            <h3 className="text-base font-bold text-dark-textPrimary flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Target className="w-5 h-5 text-emerald-400" />
              Gráfico de Dispersão: Risco (Volatilidade) vs Rentabilidade (%)
            </h3>
            <p className="text-xs text-dark-textSecondary font-medium mt-0.5">
              Quanto mais no topo e à esquerda (Quadrante Superior Esquerdo), maior a eficiência (Mais Retorno com Menos Risco).
            </p>
          </div>
        </div>

        <div className="h-[340px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Volatilidade" 
                unit="%" 
                stroke="#64748b" 
                fontSize={11}
                label={{ value: 'Risco (Volatilidade % a.a.) →', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Rentabilidade" 
                unit="%" 
                stroke="#64748b" 
                fontSize={11}
                label={{ value: '← Rentabilidade (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
              />
              <ZAxis type="number" dataKey="z" range={[100, 300]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-dark-card/95 border border-dark-border p-3 rounded-xl shadow-2xl text-xs font-mono space-y-1">
                        <div className="font-extrabold text-sm flex items-center gap-2" style={{ color: data.color }}>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                          {data.symbol}
                        </div>
                        <div className="text-emerald-400">Rentabilidade: +{data.y}%</div>
                        <div className="text-amber-400">Volatilidade: {data.x}%</div>
                        <div className="text-brand-primary">Sharpe Ratio: {data.sharpe}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Ativos" data={comparisonData.scatterData}>
                {comparisonData.scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Chips for Scatter Plot */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-dark-border/30">
          {comparisonData.metricsMap.map((item) => (
            <div key={item.symbol} className="flex items-center gap-2 text-xs font-mono font-bold">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-dark-textPrimary">{item.symbol}:</span>
              <span className="text-emerald-400">+{item.totalReturn.toFixed(1)}%</span>
              <span className="text-dark-textSecondary">({item.volatility.toFixed(1)}% vol)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Painel de Maior Queda (Cards Resumo) */}
      <div className="bg-dark-card border border-dark-border rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-border/40">
          <div>
            <h3 className="text-base font-bold text-dark-textPrimary flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <TrendingDown className="w-5 h-5 text-red-400" />
              Painel Resumo de Maior Queda (Max Drawdown)
            </h3>
            <p className="text-xs text-dark-textSecondary font-medium mt-0.5">
              Mede o pior momento de desvalorização (pico ao fundo) registrado no período de {timeframe}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisonData.metricsMap.map((item) => {
            const absDrawdown = Math.abs(item.maxDrawdown);
            const severityColor = absDrawdown < 5 ? '#10b981' : absDrawdown < 15 ? '#f59e0b' : '#ef4444';

            return (
              <div 
                key={item.symbol}
                className="bg-dark-bg/60 border border-dark-border/60 rounded-2xl p-5 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-mono font-black text-sm" style={{ color: item.color }}>{item.symbol}</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-dark-bg border border-dark-border text-dark-textSecondary font-mono">
                    {absDrawdown < 5 ? 'Queda Leve' : absDrawdown < 15 ? 'Queda Moderada' : 'Queda Severa'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-3xs font-bold uppercase tracking-wider text-dark-textSecondary block">Queda Máxima no Período</span>
                  <div className="text-2xl font-mono font-black text-red-400">
                    {item.maxDrawdown.toFixed(2)}%
                  </div>
                </div>

                {/* Drawdown Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-dark-bg border border-dark-border/60 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, absDrawdown * 2.5)}%`, 
                        backgroundColor: severityColor 
                      }} 
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-dark-textSecondary font-mono pt-0.5">
                    <span>Pico (0%)</span>
                    <span>Queda Máxima (-40%+)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MATRIZ DE RISCO E RENTABILIDADE (ÍNDICE SHARPE CARDS) */}
      <div className="bg-dark-card border border-dark-border rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-border/40">
          <div>
            <h3 className="text-base font-bold text-dark-textPrimary flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <ShieldCheck className="w-5 h-5 text-brand-primary" />
              Matriz de Risco vs Rentabilidade & Índice Sharpe
            </h3>
            <p className="text-xs text-dark-textSecondary font-medium mt-0.5">
              Avalia a relação de eficiência: quanto retorno cada ativo entregou por unidade de risco (volatilidade) assumido.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisonData.metricsMap.map((item) => {
            const isGoodSharpe = item.sharpeRatio >= 0.5;
            const isExcellentSharpe = item.sharpeRatio >= 1.0;

            return (
              <div 
                key={item.symbol}
                className="bg-dark-bg/60 border border-dark-border/60 rounded-2xl p-5 space-y-4 hover:border-brand-primary/40 transition-all"
              >
                <div className="flex items-center justify-between border-b border-dark-border/30 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-mono font-black text-sm" style={{ color: item.color }}>{item.symbol}</span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    item.riskLevel === 'Baixo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    item.riskLevel === 'Médio' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    item.riskLevel === 'Alto' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}>
                    Risco {item.riskLevel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-dark-card/40 p-2.5 rounded-xl border border-dark-border/40 space-y-1">
                    <span className="text-[9px] font-bold text-dark-textSecondary uppercase tracking-wider block">Volatilidade</span>
                    <span className="text-sm font-mono font-bold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      {item.volatility.toFixed(2)}%
                    </span>
                  </div>

                  <div className="bg-dark-card/40 p-2.5 rounded-xl border border-dark-border/40 space-y-1">
                    <span className="text-[9px] font-bold text-dark-textSecondary uppercase tracking-wider block">Índice Sharpe</span>
                    <span className={`text-sm font-mono font-black ${
                      isExcellentSharpe ? 'text-emerald-400' : isGoodSharpe ? 'text-brand-primary' : 'text-amber-400'
                    }`}>
                      {item.sharpeRatio.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dark-border/30 flex items-center justify-between text-3xs font-mono">
                  <span className="text-dark-textSecondary">Razão Retorno / Risco:</span>
                  <span className="font-bold text-dark-textPrimary">
                    {item.riskReturnRatio > 0 ? `+${item.riskReturnRatio}` : item.riskReturnRatio}
                  </span>
                </div>

                <div className="text-[10px] text-dark-textSecondary font-medium leading-tight bg-dark-card/20 p-2 rounded-lg border border-dark-border/30">
                  {isExcellentSharpe 
                    ? '✨ Excelente eficiência: Alto retorno excedente com risco controlado.' 
                    : isGoodSharpe 
                      ? '👍 Boa relação risco x retorno para a categoria.' 
                      : '⚠️ Retorno moderado para o nível de volatilidade no período.'
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulator Calculator Block */}
      <div className="bg-gradient-to-br from-dark-card to-dark-card/60 border border-dark-border rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-border/40">
          <div>
            <h3 className="text-base font-bold text-dark-textPrimary flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Simulador de Valor Acumulado em R$
            </h3>
            <p className="text-xs text-dark-textSecondary font-medium mt-0.5">
              Veja quanto valeria um investimento inicial aplicado no início do período ({timeframe}).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-dark-textSecondary uppercase tracking-wider">Aporte Inicial:</span>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-dark-textSecondary">R$</span>
              <input
                type="number"
                value={simulationAmount}
                onChange={(e) => setSimulationAmount(Math.max(100, Number(e.target.value)))}
                className="bg-dark-bg border border-dark-border focus:border-brand-primary outline-none rounded-xl py-2 pl-9 pr-3 text-xs font-mono font-bold text-dark-textPrimary w-36"
              />
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisonData.metricsMap.map((item) => (
            <div 
              key={item.symbol}
              className="bg-dark-bg/60 border border-dark-border/60 rounded-2xl p-4 space-y-2 hover:border-brand-primary/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-sm" style={{ color: item.color }}>{item.symbol}</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  item.totalReturn >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {item.totalReturn >= 0 ? '+' : ''}{item.totalReturn.toFixed(2)}%
                </span>
              </div>

              <div className="pt-2 border-t border-dark-border/30">
                <span className="text-3xs font-bold uppercase tracking-wider text-dark-textSecondary block">Valor Final Estimado</span>
                <span className="text-lg font-mono font-black text-dark-textPrimary">
                  R$ {item.finalSimulatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between text-3xs text-dark-textSecondary font-mono pt-1">
                <span>Lucro Líquido:</span>
                <span className={item.simulatedProfit >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {item.simulatedProfit >= 0 ? '+' : ''}R$ {item.simulatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparative Metrics Table (Mais Retorno Style) */}
      <div className="bg-dark-card border border-dark-border rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-dark-border/40">
          <div>
            <h3 className="text-base font-bold text-dark-textPrimary flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Info className="w-5 h-5 text-brand-primary" />
              Tabela Comparativa de Indicadores Técnicos
            </h3>
            <p className="text-xs text-dark-textSecondary font-medium mt-0.5">
              Análise completa de risco x retorno, volatilidade, Índice Sharpe e Drawdown.
            </p>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-dark-border/60 text-dark-textSecondary text-3xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Indicador / Métrica</th>
                {comparisonData.metricsMap.map((item) => (
                  <th key={item.symbol} className="py-3 px-4 font-mono font-extrabold text-sm" style={{ color: item.color }}>
                    {item.symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/30 text-xs font-mono">
              
              {/* Rentabilidade no Período */}
              <tr className="hover:bg-dark-bg/40 transition-colors">
                <td className="py-3.5 px-4 font-sans font-bold text-dark-textPrimary flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Rentabilidade Acumulada
                </td>
                {comparisonData.metricsMap.map((item) => (
                  <td key={item.symbol} className={`py-3.5 px-4 font-black ${item.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.totalReturn >= 0 ? '+' : ''}{item.totalReturn.toFixed(2)}%
                  </td>
                ))}
              </tr>

              {/* Rentabilidade Anualizada */}
              <tr className="hover:bg-dark-bg/40 transition-colors">
                <td className="py-3.5 px-4 font-sans font-semibold text-dark-textSecondary">
                  Rentabilidade Anualizada (a.a.)
                </td>
                {comparisonData.metricsMap.map((item) => (
                  <td key={item.symbol} className="py-3.5 px-4 font-bold text-dark-textPrimary">
                    {item.annualizedReturnPercent >= 0 ? '+' : ''}{item.annualizedReturnPercent.toFixed(2)}% p.a.
                  </td>
                ))}
              </tr>

              {/* Volatilidade */}
              <tr className="hover:bg-dark-bg/40 transition-colors">
                <td className="py-3.5 px-4 font-sans font-semibold text-dark-textSecondary flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Volatilidade Anualizada
                </td>
                {comparisonData.metricsMap.map((item) => (
                  <td key={item.symbol} className="py-3.5 px-4 font-bold text-amber-400">
                    {item.volatility.toFixed(2)}%
                  </td>
                ))}
              </tr>

              {/* Índice Sharpe */}
              <tr className="hover:bg-dark-bg/40 transition-colors">
                <td className="py-3.5 px-4 font-sans font-semibold text-dark-textSecondary">
                  Índice Sharpe (Risco x Retorno)
                </td>
                {comparisonData.metricsMap.map((item) => (
                  <td key={item.symbol} className={`py-3.5 px-4 font-black ${item.sharpeRatio >= 0.5 ? 'text-emerald-400' : item.sharpeRatio >= 0 ? 'text-brand-primary' : 'text-red-400'}`}>
                    {item.sharpeRatio.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* Max Drawdown */}
              <tr className="hover:bg-dark-bg/40 transition-colors">
                <td className="py-3.5 px-4 font-sans font-semibold text-dark-textSecondary flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  Maior Queda (Max Drawdown)
                </td>
                {comparisonData.metricsMap.map((item) => (
                  <td key={item.symbol} className="py-3.5 px-4 font-bold text-red-400">
                    {item.maxDrawdown.toFixed(2)}%
                  </td>
                ))}
              </tr>

              {/* Melhor Mês */}
              <tr className="hover:bg-dark-bg/40 transition-colors">
                <td className="py-3.5 px-4 font-sans font-semibold text-dark-textSecondary">
                  Melhor Mês no Período
                </td>
                {comparisonData.metricsMap.map((item) => (
                  <td key={item.symbol} className="py-3.5 px-4 font-medium text-emerald-400">
                    +{item.bestMonth.toFixed(2)}%
                  </td>
                ))}
              </tr>

              {/* Pior Mês */}
              <tr className="hover:bg-dark-bg/40 transition-colors">
                <td className="py-3.5 px-4 font-sans font-semibold text-dark-textSecondary">
                  Pior Mês no Período
                </td>
                {comparisonData.metricsMap.map((item) => (
                  <td key={item.symbol} className="py-3.5 px-4 font-medium text-red-400">
                    {item.worstMonth.toFixed(2)}%
                  </td>
                ))}
              </tr>

              {/* Categoria */}
              <tr className="hover:bg-dark-bg/40 transition-colors">
                <td className="py-3.5 px-4 font-sans font-semibold text-dark-textSecondary">
                  Classe de Ativo / Categoria
                </td>
                {comparisonData.metricsMap.map((item) => (
                  <td key={item.symbol} className="py-3.5 px-4 font-sans font-bold text-dark-textPrimary text-3xs uppercase">
                    {item.category}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
