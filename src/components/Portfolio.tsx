// src/components/Portfolio.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Briefcase, PlusCircle, ArrowUpRight, DollarSign } from 'lucide-react';
import { ALL_B3_TICKERS, fetchStockData, searchTickers, getTickerCategory, getTickerStrategy, getTickerSector } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

export interface PortfolioItem {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  longName: string;
  change30d?: number;
  change60d?: number;
}

interface PortfolioProps {
  onSelectTicker: (symbol: string) => void;
  portfolio: PortfolioItem[];
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioItem[]>>;
}

const COLORS = [
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#84cc16'  // Lime
];

export const Portfolio: React.FC<PortfolioProps> = ({ onSelectTicker, portfolio, setPortfolio }) => {
  const [loading, setLoading] = useState(false);
  const [perfPeriod, setPerfPeriod] = useState<'30d' | '60d' | 'total'>('total');
  const [activeTickerIndex, setActiveTickerIndex] = useState<number | null>(null);
  const [activeSectorIndex, setActiveSectorIndex] = useState<number | null>(null);
  const [activeStrategyIndex, setActiveStrategyIndex] = useState<number | null>(null);
  
  // Form states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [averagePrice, setAveragePrice] = useState('30.00');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof ALL_B3_TICKERS>([]);

  // Fetch prices for all items in portfolio
  useEffect(() => {
    if (portfolio.length === 0) return;
    
    // Check if we should update prices (once per session or on tab open)
    const updatePrices = async () => {
      setLoading(true);
      try {
        const updated = await Promise.all(
          portfolio.map(async (item) => {
            try {
              const data = await fetchStockData(item.symbol);
              const history = data.history || [];
              let change30d = 0;
              let change60d = 0;
              if (history.length > 0) {
                const current = data.regularMarketPrice;
                const idx30 = Math.max(0, history.length - 22);
                const p30 = history[idx30]?.price || current;
                change30d = p30 > 0 ? ((current - p30) / p30) * 100 : 0;

                const idx60 = Math.max(0, history.length - 43);
                const p60 = history[idx60]?.price || current;
                change60d = p60 > 0 ? ((current - p60) / p60) * 100 : 0;
              }
              return {
                ...item,
                currentPrice: data.regularMarketPrice,
                longName: data.longName || item.longName,
                change30d,
                change60d
              };
            } catch {
              return item;
            }
          })
        );
        
        // Only update state and storage if values actually changed
        const hasChanged = JSON.stringify(updated) !== JSON.stringify(portfolio);
        if (hasChanged) {
          setPortfolio(updated);
          localStorage.setItem('b3_analise_portfolio', JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Failed to update portfolio prices', e);
      } finally {
        setLoading(false);
      }
    };

    updatePrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync suggestions
  useEffect(() => {
    setSuggestions(searchTickers(searchQuery, 5));
  }, [searchQuery]);

  const handleSelectSuggestion = (ticker: typeof ALL_B3_TICKERS[0]) => {
    setSelectedSymbol(ticker.symbol);
    setSearchQuery(ticker.symbol);
    setShowSuggestions(false);
    
    // Try to pre-fill average price with current price if possible
    fetchStockData(ticker.symbol)
      .then(data => setAveragePrice(data.regularMarketPrice.toString()))
      .catch(() => {});
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSymbol) return;

    const qty = parseInt(quantity);
    const avgPrice = parseFloat(averagePrice);
    if (isNaN(qty) || qty <= 0 || isNaN(avgPrice) || avgPrice <= 0) return;

    setLoading(true);
    let curPrice = avgPrice;
    let longName = `${selectedSymbol} S.A.`;
    let change30d = 0;
    let change60d = 0;

    try {
      const data = await fetchStockData(selectedSymbol);
      curPrice = data.regularMarketPrice;
      longName = data.longName;
      const history = data.history || [];
      if (history.length > 0) {
        const idx30 = Math.max(0, history.length - 22);
        const p30 = history[idx30]?.price || curPrice;
        change30d = p30 > 0 ? ((curPrice - p30) / p30) * 100 : 0;

        const idx60 = Math.max(0, history.length - 43);
        const p60 = history[idx60]?.price || curPrice;
        change60d = p60 > 0 ? ((curPrice - p60) / p60) * 100 : 0;
      }
    } catch {
      // Keep fallbacks
    }

    const newItem: PortfolioItem = {
      symbol: selectedSymbol,
      quantity: qty,
      averagePrice: avgPrice,
      currentPrice: curPrice,
      longName,
      change30d,
      change60d
    };

    setPortfolio(prev => {
      // Check if item already exists
      const existingIdx = prev.findIndex(item => item.symbol === selectedSymbol);
      let updated = [];
      if (existingIdx > -1) {
        // Average cost calculation
        const existing = prev[existingIdx];
        const newQty = existing.quantity + qty;
        const newAvg = ((existing.quantity * existing.averagePrice) + (qty * avgPrice)) / newQty;
        
        updated = [...prev];
        updated[existingIdx] = {
          ...existing,
          quantity: newQty,
          averagePrice: Number(newAvg.toFixed(2)),
          currentPrice: curPrice,
          change30d: change30d || existing.change30d,
          change60d: change60d || existing.change60d
        };
      } else {
        updated = [...prev, newItem];
      }
      localStorage.setItem('b3_analise_portfolio', JSON.stringify(updated));
      return updated;
    });

    // Reset Form
    setSelectedSymbol('');
    setSearchQuery('');
    setQuantity('100');
    setAveragePrice('30.00');
    setLoading(false);
  };

  const handleDeleteItem = (symbol: string) => {
    const updated = portfolio.filter(item => item.symbol !== symbol);
    setPortfolio(updated);
    localStorage.setItem('b3_analise_portfolio', JSON.stringify(updated));
  };

  // Math metrics
  const totalCost = portfolio.reduce((sum, item) => sum + (item.quantity * item.averagePrice), 0);
  const totalCurrentValue = portfolio.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0);
  const totalPnL = totalCurrentValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  // Weighted historical performance
  const portfolio30dReturn = totalCurrentValue > 0 
    ? portfolio.reduce((sum, item) => sum + ((item.quantity * item.currentPrice) / totalCurrentValue) * (item.change30d || 0), 0)
    : 0;

  const portfolio60dReturn = totalCurrentValue > 0 
    ? portfolio.reduce((sum, item) => sum + ((item.quantity * item.currentPrice) / totalCurrentValue) * (item.change60d || 0), 0)
    : 0;

  // Benchmarks configuration
  const BENCHMARKS_DATA = {
    '30d': [
      { name: 'Carteira', value: Number(portfolio30dReturn.toFixed(2)), color: '#6366f1' },
      { name: 'CDI', value: 0.85, color: '#f59e0b', fullName: 'Certificado de Depósito Interbancário' },
      { name: 'Ibovespa', value: 1.20, color: '#06b6d4', fullName: 'Índice Bovespa (IBOV)' },
      { name: 'IDIV', value: 1.55, color: '#ec4899', fullName: 'Índice de Dividendos B3' },
      { name: 'S&P 500', value: 2.10, color: '#a855f7', fullName: 'Standard & Poor\'s 500' }
    ],
    '60d': [
      { name: 'Carteira', value: Number(portfolio60dReturn.toFixed(2)), color: '#6366f1' },
      { name: 'CDI', value: 1.71, color: '#f59e0b', fullName: 'Certificado de Depósito Interbancário' },
      { name: 'Ibovespa', value: 2.45, color: '#06b6d4', fullName: 'Índice Bovespa (IBOV)' },
      { name: 'IDIV', value: 3.15, color: '#ec4899', fullName: 'Índice de Dividendos B3' },
      { name: 'S&P 500', value: 4.25, color: '#a855f7', fullName: 'Standard & Poor\'s 500' }
    ],
    'total': [
      { name: 'Carteira', value: Number(totalPnLPercent.toFixed(2)), color: '#6366f1' },
      { name: 'CDI', value: 10.80, color: '#f59e0b', fullName: 'CDI Acumulado (Ref: 12M)' },
      { name: 'Ibovespa', value: 8.50, color: '#06b6d4', fullName: 'Índice Bovespa (IBOV) (Ref: 12M)' },
      { name: 'IDIV', value: 11.50, color: '#ec4899', fullName: 'Índice de Dividendos B3 (Ref: 12M)' },
      { name: 'S&P 500', value: 15.30, color: '#a855f7', fullName: 'Standard & Poor\'s 500 (Ref: 12M)' }
    ]
  };

  const activeBenchmarks = BENCHMARKS_DATA[perfPeriod];
  const portfolioVal = activeBenchmarks[0].value;

  // Resolve portfolio items with categories and strategies
  const resolvedPortfolio = useMemo(() => {
    return portfolio.map((item: PortfolioItem) => {
      const category = getTickerCategory(item.symbol, item.longName);
      const strategy = getTickerStrategy(item.symbol);
      const sector = getTickerSector(item.symbol);
      const value = Number((item.quantity * item.currentPrice).toFixed(2));
      return {
        ...item,
        category,
        strategy,
        sector,
        value
      };
    });
  }, [portfolio]);

  // Allocation by ticker
  const tickerData = useMemo(() => {
    return resolvedPortfolio.map((item: any) => ({
      name: item.symbol,
      value: item.value,
      description: item.longName
    })).sort((a: any, b: any) => b.value - a.value);
  }, [resolvedPortfolio]);

  // Allocation by sector
  const sectorData = useMemo(() => {
    const groups: Record<string, { value: number; count: number; items: string[] }> = {};
    resolvedPortfolio.forEach((item: any) => {
      const sec = item.sector;
      if (!groups[sec]) {
        groups[sec] = { value: 0, count: 0, items: [] };
      }
      groups[sec].value += item.value;
      groups[sec].count += 1;
      groups[sec].items.push(item.symbol);
    });
    return Object.entries(groups).map(([name, data]) => ({
      name,
      value: Number(data.value.toFixed(2)),
      description: `${data.count} ativo(s) (${data.items.join(', ')})`
    })).sort((a: any, b: any) => b.value - a.value);
  }, [resolvedPortfolio]);

  // Allocation by strategy
  const strategyData = useMemo(() => {
    const groups: Record<string, { value: number; count: number; items: string[] }> = {};
    resolvedPortfolio.forEach((item: any) => {
      const strat = item.strategy;
      if (!groups[strat]) {
        groups[strat] = { value: 0, count: 0, items: [] };
      }
      groups[strat].value += item.value;
      groups[strat].count += 1;
      groups[strat].items.push(item.symbol);
    });
    return Object.entries(groups).map(([name, data]) => ({
      name,
      value: Number(data.value.toFixed(2)),
      description: `${data.count} ativo(s) (${data.items.join(', ')})`
    })).sort((a: any, b: any) => b.value - a.value);
  }, [resolvedPortfolio]);



  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Portfolio Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Cost */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg flex items-center gap-5">
          <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl text-indigo-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Custo Total Investido</span>
            <span className="text-xl font-black text-dark-textPrimary font-mono">
              R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Current Value */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg flex items-center gap-5">
          <div className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl text-brand-primary">
            <Briefcase className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Valor Patrimonial Atual</span>
            <span className="text-xl font-black text-dark-textPrimary font-mono">
              R$ {totalCurrentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Profit / Loss */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg flex items-center gap-5">
          <div className={`p-4 rounded-2xl border ${
            totalPnL >= 0 
              ? 'bg-emerald-950/25 border-brand-success/20 text-brand-success' 
              : 'bg-rose-950/25 border-brand-danger/20 text-brand-danger'
          }`}>
            {totalPnL >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Resultado Consolidado</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-black font-mono ${totalPnL >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                {totalPnL >= 0 ? '+' : ''}R$ {totalPnL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-mono font-bold ${totalPnL >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                ({totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: List vs. Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Form & Table (col-span-8) */}
        <div className="lg:col-span-8 bg-dark-card border border-dark-border rounded-2xl p-6 lg:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-dark-textPrimary tracking-tight">Ativos em Carteira</h3>
                <p className="text-xs text-dark-textSecondary font-medium">Gerencie sua carteira pessoal de investimentos na B3</p>
              </div>
              {loading && <span className="text-4xs text-brand-primary animate-pulse uppercase tracking-wider font-bold">Atualizando Cotações...</span>}
            </div>

            {/* Assets Table */}
            {portfolio.length > 0 ? (
              <div className="overflow-x-auto select-none">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dark-border/40 text-4xs font-bold text-dark-textSecondary uppercase tracking-wider">
                      <th className="pb-3.5 pl-2">Ativo</th>
                      <th className="pb-3.5">Qtd</th>
                      <th className="pb-3.5">P. Médio</th>
                      <th className="pb-3.5">Cotação</th>
                      <th className="pb-3.5">Custo</th>
                      <th className="pb-3.5">Total</th>
                      <th className="pb-3.5">Rentabilidade</th>
                      <th className="pb-3.5 pr-2 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/30 text-xs font-medium">
                    {portfolio.map((item) => {
                      const cost = item.quantity * item.averagePrice;
                      const value = item.quantity * item.currentPrice;
                      const pnl = value - cost;
                      const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
                      return (
                        <tr key={item.symbol} className="hover:bg-dark-cardHover/30 transition-colors group">
                          {/* Symbol & Name */}
                          <td className="py-4 pl-2">
                            <button
                              onClick={() => onSelectTicker(item.symbol)}
                              title="Analisar Ativo"
                              className="font-mono font-black text-dark-textPrimary hover:text-brand-primary transition-all flex items-center gap-1.5 cursor-pointer text-sm"
                            >
                              {item.symbol}
                              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary" />
                            </button>
                            <span className="text-4xs text-dark-textSecondary block max-w-[130px] truncate">{item.longName}</span>
                          </td>
                          {/* Quantity */}
                          <td className="py-4 font-mono font-bold text-dark-textPrimary">{item.quantity}</td>
                          {/* Average Price */}
                          <td className="py-4 font-mono text-dark-textSecondary">R$ {item.averagePrice.toFixed(2).replace('.', ',')}</td>
                          {/* Current Price */}
                          <td className="py-4 font-mono text-dark-textPrimary">R$ {item.currentPrice.toFixed(2).replace('.', ',')}</td>
                          {/* Total Cost */}
                          <td className="py-4 font-mono text-dark-textSecondary">R$ {cost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          {/* Total Value */}
                          <td className="py-4 font-mono font-bold text-dark-textPrimary">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          {/* PNL */}
                          <td className="py-4">
                            <span className={`font-mono font-bold ${pnl >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                              {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="py-4 pr-2 text-right">
                            <button
                              onClick={() => handleDeleteItem(item.symbol)}
                              className="p-1.8 text-dark-textSecondary hover:text-brand-danger hover:bg-rose-950/15 rounded-lg border border-transparent hover:border-brand-danger/25 transition-all cursor-pointer"
                              title="Remover Ativo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 border border-dashed border-dark-border rounded-xl text-center space-y-3">
                <Briefcase className="w-8 h-8 text-dark-textSecondary mx-auto animate-pulse" />
                <p className="text-xs text-dark-textSecondary font-medium">Sua carteira está vazia. Adicione ativos abaixo.</p>
              </div>
            )}
          </div>

          {/* Form to Add Asset */}
          <form onSubmit={handleAddItem} className="pt-6 border-t border-dark-border/40 space-y-4">
            <h4 className="text-xs font-bold text-dark-textPrimary uppercase tracking-wider flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-brand-primary" /> Adicionar Ativo à Carteira
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Ticker Autocomplete */}
              <div className="relative">
                <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider mb-1.5">Ticker</label>
                <input
                  type="text"
                  placeholder="Ex: PETR4"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedSymbol(e.target.value.toUpperCase().trim());
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-dark-bg border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none py-2 px-3.5 rounded-xl text-sm font-mono font-bold text-dark-textPrimary"
                />
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    {suggestions.map((item) => (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left px-4 py-2 hover:bg-dark-cardHover flex items-center justify-between border-b border-dark-border/40 last:border-none font-medium cursor-pointer"
                      >
                        <span className="font-mono text-xs font-bold text-dark-textPrimary">{item.symbol}</span>
                        <span className="text-4xs text-dark-textSecondary max-w-32 truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider mb-1.5">Quantidade</label>
                <input
                  type="number"
                  placeholder="100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none py-2 px-3.5 rounded-xl text-sm font-mono font-bold text-dark-textPrimary"
                />
              </div>

              {/* Average Price */}
              <div>
                <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider mb-1.5">Preço Médio (BRL)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="30.00"
                  value={averagePrice}
                  onChange={(e) => setAveragePrice(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none py-2 px-3.5 rounded-xl text-sm font-mono font-bold text-dark-textPrimary"
                />
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!selectedSymbol}
                className="px-5 py-2.5 bg-brand-primary hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-primary/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Adicionar Holding
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Allocation Charts (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main Title Card */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-dark-textPrimary tracking-tight">Distribuição da Carteira</h3>
            <p className="text-xs text-dark-textSecondary font-medium">Acompanhe a diversificação de seu patrimônio de forma clara</p>
          </div>

          {portfolio.length > 0 ? (
            <>
              {/* 1. Allocation by Ticker */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-dark-textPrimary uppercase tracking-wider flex items-center justify-between">
                    <span>Ativos</span>
                    <span className="text-2xs text-brand-primary lowercase font-normal">por ticker</span>
                  </h4>
                  <p className="text-[10px] text-dark-textSecondary">Participação individual de cada ticker no valor de mercado da carteira</p>
                </div>
                
                <div className="h-48 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={tickerData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                        onMouseEnter={(_: any, index: number) => setActiveTickerIndex(index)}
                        onMouseLeave={() => setActiveTickerIndex(null)}
                      >
                        {tickerData.map((_: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            style={{ cursor: 'pointer', outline: 'none' }}
                            opacity={activeTickerIndex === null || activeTickerIndex === index ? 1 : 0.6}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    {activeTickerIndex !== null && tickerData[activeTickerIndex] ? (
                      <div className="flex flex-col items-center text-center max-w-[100px]">
                        <span className="text-[9px] font-black text-brand-primary uppercase tracking-wider truncate w-full">{tickerData[activeTickerIndex].name}</span>
                        <span className="text-sm font-black text-dark-textPrimary font-mono mt-0.5">{((tickerData[activeTickerIndex].value / totalCurrentValue) * 100).toFixed(1)}%</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <span className="text-[8px] font-bold text-dark-textSecondary uppercase tracking-wider">Ativos</span>
                        <span className="text-[11px] font-black text-dark-textPrimary font-mono mt-0.5">{portfolio.length} Itens</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Legend list */}
                <div className="max-h-40 overflow-y-auto space-y-1.5 pt-2 border-t border-dark-border/40 select-none">
                  {tickerData.map((item: any, idx: number) => {
                    const percent = totalCurrentValue > 0 ? (item.value / totalCurrentValue) * 100 : 0;
                    return (
                      <div 
                        key={item.name} 
                        className={`flex flex-col p-1 rounded-lg transition-colors cursor-pointer ${
                          activeTickerIndex === idx ? 'bg-dark-cardHover/50' : ''
                        }`}
                        onMouseEnter={() => setActiveTickerIndex(idx)}
                        onMouseLeave={() => setActiveTickerIndex(null)}
                      >
                        <div className="flex items-center justify-between text-3xs font-semibold text-dark-textSecondary">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="font-mono text-dark-textPrimary font-bold">{item.name}</span>
                          </div>
                          <span className="font-mono text-dark-textPrimary">{percent.toFixed(1)}%</span>
                        </div>
                        <span className="text-[9px] text-dark-textSecondary/80 pl-3.5 truncate block w-full">
                          {item.description}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Allocation by Sector */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-dark-textPrimary uppercase tracking-wider flex items-center justify-between">
                    <span>Setores</span>
                    <span className="text-2xs text-brand-purple lowercase font-normal">por setor</span>
                  </h4>
                  <p className="text-[10px] text-dark-textSecondary">Distribuição patrimonial segmentada por setores econômicos da bolsa</p>
                </div>
                
                <div className="h-48 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                        onMouseEnter={(_: any, index: number) => setActiveSectorIndex(index)}
                        onMouseLeave={() => setActiveSectorIndex(null)}
                      >
                        {sectorData.map((_: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[(index + 3) % COLORS.length]} 
                            style={{ cursor: 'pointer', outline: 'none' }}
                            opacity={activeSectorIndex === null || activeSectorIndex === index ? 1 : 0.6}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    {activeSectorIndex !== null && sectorData[activeSectorIndex] ? (
                      <div className="flex flex-col items-center text-center max-w-[100px]">
                        <span className="text-[9px] font-black text-brand-purple uppercase tracking-wider truncate w-full">{sectorData[activeSectorIndex].name}</span>
                        <span className="text-sm font-black text-dark-textPrimary font-mono mt-0.5">{((sectorData[activeSectorIndex].value / totalCurrentValue) * 100).toFixed(1)}%</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <span className="text-[8px] font-bold text-dark-textSecondary uppercase tracking-wider">Setores</span>
                        <span className="text-[11px] font-black text-dark-textPrimary font-mono mt-0.5">{sectorData.length} Áreas</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Legend list */}
                <div className="max-h-40 overflow-y-auto space-y-1.5 pt-2 border-t border-dark-border/40 select-none">
                  {sectorData.map((item: any, idx: number) => {
                    const percent = totalCurrentValue > 0 ? (item.value / totalCurrentValue) * 100 : 0;
                    return (
                      <div 
                        key={item.name} 
                        className={`flex flex-col p-1 rounded-lg transition-colors cursor-pointer ${
                          activeSectorIndex === idx ? 'bg-dark-cardHover/50' : ''
                        }`}
                        onMouseEnter={() => setActiveSectorIndex(idx)}
                        onMouseLeave={() => setActiveSectorIndex(null)}
                      >
                        <div className="flex items-center justify-between text-3xs font-semibold text-dark-textSecondary">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[(idx + 3) % COLORS.length] }} />
                            <span className="font-mono text-dark-textPrimary font-bold">{item.name}</span>
                          </div>
                          <span className="font-mono text-dark-textPrimary">{percent.toFixed(1)}%</span>
                        </div>
                        <span className="text-[9px] text-dark-textSecondary/80 pl-3.5 truncate block w-full">
                          {item.description}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Allocation by Strategy */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-dark-textPrimary uppercase tracking-wider flex items-center justify-between">
                    <span>Estratégias</span>
                    <span className="text-2xs text-brand-success lowercase font-normal">por tese</span>
                  </h4>
                  <p className="text-[10px] text-dark-textSecondary">Participação ponderada sob teses de investimento (ex: dividendos ou crescimento)</p>
                </div>
                
                <div className="h-48 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={strategyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                        onMouseEnter={(_: any, index: number) => setActiveStrategyIndex(index)}
                        onMouseLeave={() => setActiveStrategyIndex(null)}
                      >
                        {strategyData.map((_: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[(index + 6) % COLORS.length]} 
                            style={{ cursor: 'pointer', outline: 'none' }}
                            opacity={activeStrategyIndex === null || activeStrategyIndex === index ? 1 : 0.6}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    {activeStrategyIndex !== null && strategyData[activeStrategyIndex] ? (
                      <div className="flex flex-col items-center text-center max-w-[100px]">
                        <span className="text-[9px] font-black text-brand-success uppercase tracking-wider truncate w-full">{strategyData[activeStrategyIndex].name}</span>
                        <span className="text-sm font-black text-dark-textPrimary font-mono mt-0.5">{((strategyData[activeStrategyIndex].value / totalCurrentValue) * 100).toFixed(1)}%</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <span className="text-[8px] font-bold text-dark-textSecondary uppercase tracking-wider">Teses</span>
                        <span className="text-[11px] font-black text-dark-textPrimary font-mono mt-0.5">{strategyData.length} Estilos</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Legend list */}
                <div className="max-h-40 overflow-y-auto space-y-1.5 pt-2 border-t border-dark-border/40 select-none">
                  {strategyData.map((item: any, idx: number) => {
                    const percent = totalCurrentValue > 0 ? (item.value / totalCurrentValue) * 100 : 0;
                    return (
                      <div 
                        key={item.name} 
                        className={`flex flex-col p-1 rounded-lg transition-colors cursor-pointer ${
                          activeStrategyIndex === idx ? 'bg-dark-cardHover/50' : ''
                        }`}
                        onMouseEnter={() => setActiveStrategyIndex(idx)}
                        onMouseLeave={() => setActiveStrategyIndex(null)}
                      >
                        <div className="flex items-center justify-between text-3xs font-semibold text-dark-textSecondary">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[(idx + 6) % COLORS.length] }} />
                            <span className="font-mono text-dark-textPrimary font-bold">{item.name}</span>
                          </div>
                          <span className="font-mono text-dark-textPrimary">{percent.toFixed(1)}%</span>
                        </div>
                        <span className="text-[9px] text-dark-textSecondary/80 pl-3.5 truncate block w-full">
                          {item.description}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl py-24 text-center text-xs text-dark-textSecondary">
              Adicione ativos para gerar os gráficos de alocação.
            </div>
          )}
        </div>

      </div>

      {/* Benchmarks Performance Comparison */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 lg:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-dark-textPrimary tracking-tight">Comparativo de Desempenho</h3>
            <p className="text-xs text-dark-textSecondary font-medium">Compare o rendimento de sua carteira com os principais índices econômicos e financeiros</p>
          </div>
          
          <div className="flex bg-dark-bg border border-dark-border p-0.5 rounded-xl text-3xs font-bold uppercase tracking-wider select-none">
            <button
              onClick={() => setPerfPeriod('30d')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                perfPeriod === '30d' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'text-dark-textSecondary hover:text-dark-textPrimary'
              }`}
            >
              30 Dias
            </button>
            <button
              onClick={() => setPerfPeriod('60d')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                perfPeriod === '60d' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'text-dark-textSecondary hover:text-dark-textPrimary'
              }`}
            >
              60 Dias
            </button>
            <button
              onClick={() => setPerfPeriod('total')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                perfPeriod === 'total' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'text-dark-textSecondary hover:text-dark-textPrimary'
              }`}
            >
              Total
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Bar Chart representing comparison (col-span-7) */}
          <div className="lg:col-span-7 h-60 w-full relative">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activeBenchmarks} margin={{ top: 20, right: 10, bottom: 5, left: -20 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#374151" 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#1f2937' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#374151"
                  tick={{ fill: '#9ca3af', fontSize: 9, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#11131c',
                    borderColor: '#1f2233',
                    borderRadius: '12px',
                    color: '#f3f4f6',
                    fontFamily: 'monospace',
                    fontSize: '11px'
                  }}
                  formatter={(value: any) => [`${value >= 0 ? '+' : ''}${value}%`, 'Rentabilidade']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {activeBenchmarks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cards for each index performance compared to portfolio (col-span-5) */}
          <div className="lg:col-span-5 space-y-3 max-h-60 overflow-y-auto pr-1">
            {activeBenchmarks.slice(1).map((idx) => {
              const diff = portfolioVal - idx.value;
              const beatsIndex = diff >= 0;
              return (
                <div key={idx.name} className="p-3 bg-dark-bg/60 border border-dark-border/50 rounded-xl flex items-center justify-between font-sans">
                  <div className="space-y-0.5 truncate pr-2">
                    <span className="text-2xs font-extrabold text-dark-textPrimary tracking-tight">{idx.name}</span>
                    <p className="text-4xs text-dark-textSecondary truncate">{idx.fullName}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-2xs font-bold text-dark-textPrimary">{idx.value >= 0 ? '+' : ''}{idx.value.toFixed(2)}%</span>
                    
                    <span className={`px-2 py-0.5 rounded-md text-4xs font-bold tracking-wider uppercase ${
                      beatsIndex 
                        ? 'bg-emerald-950/20 text-brand-success border border-brand-success/20' 
                        : 'bg-rose-950/20 text-brand-danger border border-brand-danger/20'
                    }`}>
                      {beatsIndex ? `Venceu (+${diff.toFixed(2)}%)` : `Abaixo (${diff.toFixed(2)}%)`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
