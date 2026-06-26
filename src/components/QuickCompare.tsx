// src/components/QuickCompare.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeftRight, Search, X, TrendingUp } from 'lucide-react';
import { fetchStockData, searchTickers } from '../services/api';
import type { StockData } from '../services/api';

interface QuickCompareProps {
  currentData: StockData;
}

export const QuickCompare: React.FC<QuickCompareProps> = ({ currentData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [compareData, setCompareData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);

  const suggestions = useMemo(() => {
    return searchTickers(searchQuery, 7)
      .filter(t => t.symbol !== currentData.symbol)
      .slice(0, 6);
  }, [searchQuery, currentData.symbol]);

  const handleSelect = async (sym: string) => {
    setSearchQuery(sym);
    setShowSuggestions(false);
    setLoading(true);
    try {
      const data = await fetchStockData(sym);
      setCompareData(data);
    } catch (err) {
      console.error('Failed to load comparison stock', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset compare data when current data changes
  useEffect(() => {
    setCompareData(null);
    setSearchQuery('');
    setIsOpen(false);
  }, [currentData.symbol]);

  const metrics = useMemo(() => {
    if (!compareData) return [];

    const buildMetric = (
      label: string,
      aVal: number,
      bVal: number,
      format: (v: number) => string,
      lowerIsBetter: boolean = false
    ) => {
      let winner: 'a' | 'b' | 'tie' = 'tie';
      if (aVal !== bVal) {
        if (lowerIsBetter) {
          winner = aVal < bVal ? 'a' : 'b';
        } else {
          winner = aVal > bVal ? 'a' : 'b';
        }
      }
      // Special: for P/L and P/VP, negative values are bad
      if ((label === 'P/L' || label === 'P/VP') && (aVal < 0 || bVal < 0)) {
        if (aVal < 0 && bVal < 0) winner = 'tie';
        else if (aVal < 0) winner = 'b';
        else winner = 'a';
      }
      return { label, aVal: format(aVal), bVal: format(bVal), winner };
    };

    const fmtX = (v: number) => `${v.toFixed(2)}x`;
    const fmtP = (v: number) => `${v.toFixed(2)}%`;
    const fmtR = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

    return [
      buildMetric('Preço', currentData.regularMarketPrice, compareData.regularMarketPrice, fmtR),
      buildMetric('P/L', currentData.pl, compareData.pl, fmtX, true),
      buildMetric('P/VP', currentData.pvp, compareData.pvp, fmtX, true),
      buildMetric('Div. Yield', currentData.dy, compareData.dy, fmtP),
      buildMetric('ROE', currentData.roe, compareData.roe, fmtP),
      buildMetric('Margem Líq.', currentData.margemLiquida, compareData.margemLiquida, fmtP),
      buildMetric('Volatilidade', currentData.volatility, compareData.volatility, fmtP, true),
    ];
  }, [currentData, compareData]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-dark-card border border-dark-border hover:border-brand-primary/50 text-dark-textSecondary hover:text-brand-primary rounded-2xl shadow-2xl transition-all hover:-translate-y-0.5 group cursor-pointer"
        title="Comparar com outro ativo"
      >
        <ArrowLeftRight className="w-4 h-4 group-hover:text-brand-primary transition-colors" />
        <span className="text-xs font-bold uppercase tracking-wider">Comparar</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-h-[85vh] bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden animate-slideUp flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border/60">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-brand-primary" />
          <span className="text-xs font-bold text-dark-textPrimary uppercase tracking-wider">Comparador Rápido</span>
        </div>
        <button 
          onClick={() => { setIsOpen(false); setCompareData(null); setSearchQuery(''); }}
          className="p-1.5 hover:bg-dark-cardHover rounded-lg text-dark-textSecondary hover:text-dark-textPrimary transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-dark-border/40 relative">
        <div className="flex items-center gap-2 bg-dark-bg border border-dark-border rounded-xl px-3 py-2">
          <Search className="w-3.5 h-3.5 text-dark-textSecondary shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Buscar ativo para comparar..."
            className="bg-transparent outline-none text-xs text-dark-textPrimary placeholder-gray-600 w-full font-mono"
          />
        </div>

        {/* Suggestion Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-4 right-4 top-full mt-1 bg-gray-900 border border-dark-border rounded-xl shadow-2xl z-60 overflow-hidden">
            {suggestions.map(s => (
              <button
                key={s.symbol}
                onClick={() => handleSelect(s.symbol)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-dark-cardHover transition-colors text-left cursor-pointer"
              >
                <span className="font-mono font-bold text-xs text-dark-textPrimary">{s.symbol}</span>
                <span className="text-3xs text-dark-textSecondary truncate ml-2 max-w-[200px]">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        {loading && (
          <div className="py-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
            <p className="text-3xs text-dark-textSecondary mt-2">Carregando dados...</p>
          </div>
        )}

        {!loading && !compareData && (
          <div className="py-8 text-center text-3xs text-dark-textSecondary">
            <ArrowLeftRight className="w-8 h-8 mx-auto mb-3 text-dark-border" />
            <p className="font-semibold">Selecione um ativo acima para comparar</p>
            <p className="mt-1">com <strong className="text-brand-primary font-mono">{currentData.symbol}</strong></p>
          </div>
        )}

        {!loading && compareData && (
          <>
            {/* Stocks Header */}
            <div className="grid grid-cols-3 gap-2 text-center pb-3 border-b border-dark-border/40">
              <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-2.5">
                <span className="font-mono font-black text-sm text-brand-primary block">{currentData.symbol}</span>
                <span className="text-3xs text-dark-textSecondary truncate block">{currentData.shortName}</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-3xs text-dark-textSecondary font-bold uppercase">vs</span>
              </div>
              <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-xl p-2.5">
                <span className="font-mono font-black text-sm text-brand-purple block">{compareData.symbol}</span>
                <span className="text-3xs text-dark-textSecondary truncate block">{compareData.shortName}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            {metrics.map((m) => (
              <div key={m.label} className="grid grid-cols-3 gap-2 items-center py-2 border-b border-dark-border/20 last:border-b-0">
                <div className={`text-right font-mono text-xs font-bold ${
                  m.winner === 'a' ? 'text-brand-success' : 'text-dark-textPrimary'
                }`}>
                  {m.winner === 'a' && <TrendingUp className="w-3 h-3 inline mr-1 text-brand-success" />}
                  {m.aVal}
                </div>
                <div className="text-center">
                  <span className="text-3xs text-dark-textSecondary font-bold uppercase tracking-wider">{m.label}</span>
                </div>
                <div className={`text-left font-mono text-xs font-bold ${
                  m.winner === 'b' ? 'text-brand-success' : 'text-dark-textPrimary'
                }`}>
                  {m.bVal}
                  {m.winner === 'b' && <TrendingUp className="w-3 h-3 inline ml-1 text-brand-success" />}
                </div>
              </div>
            ))}

            {/* Verdict */}
            <div className="bg-dark-bg/60 border border-dark-border/60 rounded-xl p-3 mt-2">
              <p className="text-3xs text-dark-textSecondary font-semibold leading-relaxed">
                💡 <strong>Resumo:</strong>{' '}
                {(() => {
                  const aWins = metrics.filter(m => m.winner === 'a').length;
                  const bWins = metrics.filter(m => m.winner === 'b').length;
                  if (aWins > bWins) {
                    return `${currentData.symbol} apresenta vantagem em ${aWins} de ${metrics.length} indicadores analisados.`;
                  } else if (bWins > aWins) {
                    return `${compareData.symbol} apresenta vantagem em ${bWins} de ${metrics.length} indicadores analisados.`;
                  }
                  return `Ambos os ativos estão equilibrados nos indicadores analisados.`;
                })()}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
