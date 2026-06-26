// src/components/DividendMap.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, Plus, X, Calendar, TrendingUp, AlertTriangle, ChevronLeft, ChevronRight, Search, Loader2 } from 'lucide-react';
import { fetchDividendHistory, searchTickers } from '../services/api';
import type { DividendHistoryResult } from '../services/api';
import { DividendSimulator } from './DividendSimulator';

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTH_LABELS_FULL = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

interface DividendMapProps {
  onSelectTicker?: (symbol: string) => void;
  portfolio: Array<{ symbol: string }>;
}

export const DividendMap: React.FC<DividendMapProps> = ({ onSelectTicker, portfolio }) => {
  const [subTab, setSubTab] = useState<'map' | 'simulator' | 'long-term'>('map');
  const [tickers, setTickers] = useState<string[]>(() => {
    if (portfolio && portfolio.length > 0) {
      return portfolio.map(item => item.symbol);
    }
    return ['PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'TAEE11', 'WEGE3'];
  });
  const [data, setData] = useState<Map<string, DividendHistoryResult>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingTickers, setLoadingTickers] = useState<Set<string>>(new Set());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddInput, setShowAddInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCell, setHoveredCell] = useState<{ symbol: string; month: number } | null>(null);

  // Estados da aba de Histórico Longo
  const [ltAsset, setLtAsset] = useState<string>('');
  const [ltStartYear, setLtStartYear] = useState<number>(new Date().getFullYear() - 10);
  const [ltEndYear, setLtEndYear] = useState<number>(new Date().getFullYear());

  const currentYear = new Date().getFullYear();

  // Sync tickers if portfolio changes
  useEffect(() => {
    if (portfolio && portfolio.length > 0) {
      setTickers(portfolio.map(item => item.symbol));
    }
  }, [portfolio]);

  // Set default long-term asset when tickers load
  useEffect(() => {
    if (tickers.length > 0 && !ltAsset) {
      setLtAsset(tickers[0]);
    }
  }, [tickers, ltAsset]);

  // Serialized tickers key to detect changes without infinite loops
  const tickersKey = JSON.stringify(tickers);

  // Load dividend data for all tickers (re-runs when tickers change)
  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      setLoading(true);
      const results = new Map<string, DividendHistoryResult>();
      
      const promises = tickers.map(async (sym) => {
        try {
          const result = await fetchDividendHistory(sym);
          if (active) results.set(sym, result);
        } catch (err) {
          console.warn(`Failed to load dividends for ${sym}`, err);
        }
      });

      await Promise.all(promises);
      if (active) {
        setData(results);
        setLoading(false);
      }
    };

    loadAll();
    return () => { active = false; };
  }, [tickersKey]);

  // Add a new ticker
  const handleAddTicker = async (sym: string) => {
    const clean = sym.toUpperCase().replace('.SA', '').trim();
    if (!clean || tickers.includes(clean)) return;

    setTickers(prev => [...prev, clean]);
    setShowAddInput(false);
    setSearchQuery('');
    setLoadingTickers(prev => new Set(prev).add(clean));

    try {
      const result = await fetchDividendHistory(clean);
      setData(prev => {
        const next = new Map(prev);
        next.set(clean, result);
        return next;
      });
    } catch (err) {
      console.warn(`Failed to load dividends for ${clean}`, err);
    } finally {
      setLoadingTickers(prev => {
        const next = new Set(prev);
        next.delete(clean);
        return next;
      });
    }
  };

  // Remove a ticker
  const handleRemoveTicker = (sym: string) => {
    setTickers(prev => prev.filter(s => s !== sym));
    setData(prev => {
      const next = new Map(prev);
      next.delete(sym);
      return next;
    });
  };

  // Build heatmap matrix for selected year
  const heatmapData = useMemo(() => {
    const rows: Array<{
      symbol: string;
      longName: string;
      dy: number;
      currentPrice: number;
      months: number[]; // amount per month (0 = no dividend)
      annualTotal: number;
    }> = [];

    for (const sym of tickers) {
      const result = data.get(sym);
      if (!result) {
        rows.push({ symbol: sym, longName: sym, dy: 0, currentPrice: 0, months: new Array(12).fill(0), annualTotal: 0 });
        continue;
      }

      const months = new Array(12).fill(0);
      const yearEvents = result.events.filter(e => e.year === selectedYear);
      
      for (const event of yearEvents) {
        months[event.month] += event.amount;
      }

      // Round
      for (let i = 0; i < 12; i++) {
        months[i] = Number(months[i].toFixed(4));
      }

      const annualTotal = months.reduce((a, b) => a + b, 0);

      rows.push({
        symbol: sym,
        longName: result.longName,
        dy: result.dy,
        currentPrice: result.currentPrice,
        months,
        annualTotal: Number(annualTotal.toFixed(2)),
      });
    }

    return rows;
  }, [tickers, data, selectedYear]);

  // Monthly totals across all stocks
  const monthlyTotals = useMemo(() => {
    const totals = new Array(12).fill(0);
    for (const row of heatmapData) {
      for (let i = 0; i < 12; i++) {
        totals[i] += row.months[i];
      }
    }
    return totals.map(v => Number(v.toFixed(2)));
  }, [heatmapData]);

  const grandTotal = useMemo(() => monthlyTotals.reduce((a, b) => a + b, 0), [monthlyTotals]);

  // Find max dividend value for color scaling
  const maxDividend = useMemo(() => {
    let max = 0;
    for (const row of heatmapData) {
      for (const v of row.months) {
        if (v > max) max = v;
      }
    }
    return max || 1;
  }, [heatmapData]);

  // Color intensity function
  const getCellColor = (value: number) => {
    if (value <= 0) return 'bg-dark-bg/30';
    const intensity = Math.min(value / maxDividend, 1);
    if (intensity < 0.25) return 'bg-emerald-950/40 border-emerald-900/30';
    if (intensity < 0.5) return 'bg-emerald-900/50 border-emerald-800/30';
    if (intensity < 0.75) return 'bg-emerald-800/60 border-emerald-700/30';
    return 'bg-emerald-700/70 border-emerald-600/40';
  };

  const getCellTextColor = (value: number) => {
    if (value <= 0) return 'text-dark-textSecondary/30';
    const intensity = Math.min(value / maxDividend, 1);
    if (intensity < 0.25) return 'text-emerald-400/70';
    if (intensity < 0.5) return 'text-emerald-300/80';
    return 'text-emerald-200';
  };

  // Search suggestions
  const searchResults = useMemo(() => {
    return searchTickers(searchQuery, 10)
      .filter(t => !tickers.includes(t.symbol))
      .slice(0, 6);
  }, [searchQuery, tickers]);

  // Count months with dividends per stock
  const countDividendMonths = (months: number[]) => months.filter(v => v > 0).length;

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Header Card */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <DollarSign className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-dark-textPrimary tracking-tight">Mapa de Dividendos</h2>
              <p className="text-xs text-dark-textSecondary font-medium">Calendário de proventos por ação e por mês • Acompanhe a previsibilidade de rendimentos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Year selector */}
            <div className="flex items-center bg-dark-bg border border-dark-border rounded-xl p-0.5">
              <button
                onClick={() => setSelectedYear(prev => Math.max(prev - 1, currentYear - 2))}
                disabled={selectedYear <= currentYear - 2}
                className="p-1.5 rounded-lg text-dark-textSecondary hover:text-dark-textPrimary hover:bg-dark-cardHover transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-1.5 text-sm font-black text-dark-textPrimary font-mono min-w-[70px] text-center">{selectedYear}</span>
              <button
                onClick={() => setSelectedYear(prev => Math.min(prev + 1, currentYear))}
                disabled={selectedYear >= currentYear}
                className="p-1.5 rounded-lg text-dark-textSecondary hover:text-dark-textPrimary hover:bg-dark-cardHover transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Add stock button */}
            <button
              onClick={() => setShowAddInput(prev => !prev)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showAddInput
                  ? 'bg-brand-danger/10 text-brand-danger border border-brand-danger/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              {showAddInput ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddInput ? 'Cancelar' : 'Adicionar Ativo'}
            </button>
          </div>
        </div>

        {/* Add Ticker Search */}
        {showAddInput && (
          <div className="mt-5 pt-5 border-t border-dark-border/40 animate-fadeIn">
            <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-textSecondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleAddTicker(searchQuery);
                  }
                }}
                placeholder="Buscar ativo... (ex: PETR4, MXRF11, BBAS3)"
                className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-dark-textPrimary placeholder:text-dark-textSecondary/50 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                autoFocus
              />

              {searchResults.length > 0 && (
                <div className="absolute z-20 mt-2 w-full bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden">
                  {searchResults.map(t => (
                    <button
                      key={t.symbol}
                      onClick={() => handleAddTicker(t.symbol)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-dark-cardHover transition-all text-left border-b border-dark-border/30 last:border-b-0 cursor-pointer"
                    >
                      <div>
                        <span className="font-mono font-bold text-sm text-dark-textPrimary">{t.symbol}</span>
                        <span className="text-2xs text-dark-textSecondary ml-2 truncate">{t.name}</span>
                      </div>
                      <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex border-b border-dark-border/40 pb-1 mb-6">
        <button
          onClick={() => setSubTab('map')}
          className={`pb-3 px-6 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            subTab === 'map'
              ? 'border-emerald-500 text-emerald-400 font-black'
              : 'border-transparent text-dark-textSecondary hover:text-dark-textPrimary'
          }`}
        >
          Mapa de Dividendos
        </button>
        <button
          onClick={() => setSubTab('simulator')}
          className={`pb-3 px-6 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            subTab === 'simulator'
              ? 'border-emerald-500 text-emerald-400 font-black'
              : 'border-transparent text-dark-textSecondary hover:text-dark-textPrimary'
          }`}
        >
          Simulador Bola de Neve
        </button>
        <button
          onClick={() => setSubTab('long-term')}
          className={`pb-3 px-6 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            subTab === 'long-term'
              ? 'border-emerald-500 text-emerald-400 font-black'
              : 'border-transparent text-dark-textSecondary hover:text-dark-textPrimary'
          }`}
        >
          Histórico Longo
        </button>
      </div>

      {subTab === 'map' ? (
        <>
          {/* Summary Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-lg">
              <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Ativos Monitorados</span>
              <span className="text-2xl font-black text-dark-textPrimary font-mono mt-1 block">{tickers.length}</span>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-lg">
              <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Total Dividendos {selectedYear}</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">R$ {grandTotal.toFixed(2).replace('.', ',')}</span>
              <span className="text-3xs text-dark-textSecondary block mt-0.5">por ação (unitário)</span>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-lg">
              <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Meses c/ Dividendos</span>
              <span className="text-2xl font-black text-dark-textPrimary font-mono mt-1 block">{monthlyTotals.filter(v => v > 0).length}/12</span>
              <span className="text-3xs text-dark-textSecondary block mt-0.5">cobertura anual</span>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-lg">
              <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Média Mensal</span>
              <span className="text-2xl font-black text-brand-primary font-mono mt-1 block">
                R$ {monthlyTotals.filter(v => v > 0).length > 0
                  ? (grandTotal / monthlyTotals.filter(v => v > 0).length).toFixed(2).replace('.', ',')
                  : '0,00'}
              </span>
              <span className="text-3xs text-dark-textSecondary block mt-0.5">por mês ativo</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="bg-dark-card border border-dark-border rounded-2xl shadow-xl overflow-hidden">

            {loading ? (
              <div className="flex items-center justify-center py-24 gap-3">
                <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
                <span className="text-sm text-dark-textSecondary font-bold">Carregando mapa de dividendos...</span>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[900px]">

                  {/* Table Header — Months */}
                  <thead>
                    <tr className="border-b border-dark-border">
                      <th className="sticky left-0 z-10 bg-dark-card px-5 py-4 text-left text-3xs font-bold text-dark-textSecondary uppercase tracking-wider w-[180px]">
                        Ativo
                      </th>
                      {MONTH_LABELS.map((label, i) => {
                        const isCurrentMonth = selectedYear === currentYear && i === new Date().getMonth();
                        return (
                          <th
                            key={label}
                            className={`px-2.5 py-4 text-center text-3xs font-bold uppercase tracking-wider min-w-[65px] ${
                              isCurrentMonth ? 'text-brand-primary bg-brand-primary/5' : 'text-dark-textSecondary'
                            }`}
                          >
                            {label}
                            {isCurrentMonth && <div className="w-1 h-1 bg-brand-primary rounded-full mx-auto mt-1" />}
                          </th>
                        );
                      })}
                      <th className="px-4 py-4 text-center text-3xs font-bold text-emerald-400 uppercase tracking-wider min-w-[90px] bg-emerald-950/10">
                        Total Ano
                      </th>
                      <th className="px-4 py-4 text-center text-3xs font-bold text-dark-textSecondary uppercase tracking-wider min-w-[65px]">
                        DY%
                      </th>
                      <th className="px-3 py-4 text-center text-3xs font-bold text-dark-textSecondary uppercase tracking-wider w-[40px]">
                        
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body — Stock Rows */}
                  <tbody>
                    {heatmapData.map((row, rowIdx) => {
                      const divMonths = countDividendMonths(row.months);
                      const isLoading = loadingTickers.has(row.symbol);

                      return (
                        <tr
                          key={row.symbol}
                          className={`border-b border-dark-border/40 transition-colors ${
                            rowIdx % 2 === 0 ? 'bg-dark-bg/20' : ''
                          } hover:bg-dark-cardHover/50`}
                        >
                          {/* Stock name cell */}
                          <td className="sticky left-0 z-10 bg-dark-card px-5 py-3.5">
                            <button
                              onClick={() => onSelectTicker?.(row.symbol)}
                              className="flex items-center gap-2.5 group text-left cursor-pointer"
                            >
                              <div className="w-8 h-8 bg-dark-bg border border-dark-border rounded-lg flex items-center justify-center text-3xs font-black text-dark-textSecondary group-hover:text-brand-primary group-hover:border-brand-primary/30 transition-all shrink-0">
                                {divMonths}
                              </div>
                              <div className="truncate">
                                <span className="font-mono font-bold text-xs text-dark-textPrimary group-hover:text-brand-primary transition-colors block">
                                  {row.symbol}
                                </span>
                                <span className="text-3xs text-dark-textSecondary truncate block max-w-[120px]">
                                  {isLoading ? 'Carregando...' : row.longName}
                                </span>
                              </div>
                            </button>
                          </td>

                          {/* Month cells */}
                          {row.months.map((val, monthIdx) => {
                            const isCurrentMonth = selectedYear === currentYear && monthIdx === new Date().getMonth();
                            const isHovered = hoveredCell?.symbol === row.symbol && hoveredCell?.month === monthIdx;

                            return (
                              <td
                                key={monthIdx}
                                className={`px-1.5 py-2.5 text-center relative ${isCurrentMonth ? 'bg-brand-primary/3' : ''}`}
                                onMouseEnter={() => setHoveredCell({ symbol: row.symbol, month: monthIdx })}
                                onMouseLeave={() => setHoveredCell(null)}
                              >
                                <div
                                  className={`mx-auto w-full max-w-[56px] py-2 px-1 rounded-lg border transition-all ${
                                    getCellColor(val)
                                  } ${isHovered && val > 0 ? 'ring-1 ring-emerald-400/40 scale-105' : ''} ${
                                    val > 0 ? 'border-emerald-800/20' : 'border-transparent'
                                  }`}
                                >
                                  <span className={`text-2xs font-bold font-mono block ${getCellTextColor(val)}`}>
                                    {val > 0 ? val.toFixed(2) : '—'}
                                  </span>
                                </div>

                                {/* Tooltip on hover */}
                                {isHovered && val > 0 && (
                                  <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-dark-card border border-dark-border rounded-xl shadow-2xl p-3 min-w-[180px] pointer-events-none animate-fadeIn">
                                    <div className="text-3xs text-dark-textSecondary font-bold uppercase tracking-wider">{MONTH_LABELS_FULL[monthIdx]} {selectedYear}</div>
                                    <div className="text-xs font-black text-emerald-400 font-mono mt-1">R$ {val.toFixed(4).replace('.', ',')}</div>
                                    <div className="text-3xs text-dark-textSecondary mt-1">{row.symbol} • Provento por ação</div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-dark-card border-r border-b border-dark-border rotate-45" />
                                  </div>
                                )}
                              </td>
                            );
                          })}

                          {/* Annual total */}
                          <td className="px-3 py-3.5 text-center bg-emerald-950/10">
                            <span className={`text-xs font-black font-mono ${row.annualTotal > 0 ? 'text-emerald-400' : 'text-dark-textSecondary/40'}`}>
                              {row.annualTotal > 0 ? `R$ ${row.annualTotal.toFixed(2).replace('.', ',')}` : '—'}
                            </span>
                          </td>

                          {/* DY% */}
                          <td className="px-3 py-3.5 text-center">
                            <span className={`text-xs font-bold font-mono ${
                              row.dy >= 8 ? 'text-emerald-400' : row.dy >= 4 ? 'text-amber-400' : row.dy > 0 ? 'text-dark-textSecondary' : 'text-dark-textSecondary/40'
                            }`}>
                              {row.dy > 0 ? `${row.dy.toFixed(1)}%` : '—'}
                            </span>
                          </td>

                          {/* Remove button */}
                          <td className="px-3 py-3.5 text-center">
                            {tickers.length > 1 && (
                              <button
                                onClick={() => handleRemoveTicker(row.symbol)}
                                className="p-1 text-dark-textSecondary/50 hover:text-brand-danger hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"
                                title="Remover ativo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Table Footer — Monthly Totals */}
                  <tfoot>
                    <tr className="border-t-2 border-dark-border bg-dark-bg/40">
                      <td className="sticky left-0 z-10 bg-dark-card px-5 py-4">
                        <span className="text-xs font-bold text-dark-textPrimary uppercase tracking-wider">Total Mês</span>
                      </td>
                      {monthlyTotals.map((total, i) => {
                        const isCurrentMonth = selectedYear === currentYear && i === new Date().getMonth();
                        return (
                          <td key={i} className={`px-1.5 py-4 text-center ${isCurrentMonth ? 'bg-brand-primary/5' : ''}`}>
                            <span className={`text-2xs font-black font-mono ${total > 0 ? 'text-emerald-400' : 'text-dark-textSecondary/30'}`}>
                              {total > 0 ? total.toFixed(2) : '—'}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-3 py-4 text-center bg-emerald-950/15">
                        <span className="text-sm font-black font-mono text-emerald-400">
                          R$ {grandTotal.toFixed(2).replace('.', ',')}
                        </span>
                      </td>
                      <td className="px-3 py-4" />
                      <td className="px-3 py-4" />
                    </tr>
                  </tfoot>

                </table>
              </div>
            )}
          </div>

          {/* Monthly Distribution Bar Chart */}
          {!loading && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 lg:p-8 shadow-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 border border-brand-primary/20 rounded-xl">
                  <Calendar className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-dark-textPrimary tracking-tight">Distribuição Mensal de Proventos</h3>
                  <p className="text-xs text-dark-textSecondary font-medium">Visualização da concentração de dividendos ao longo de {selectedYear}</p>
                </div>
              </div>

              <div className="relative" style={{ height: '200px' }}>
                <div className="absolute inset-0 flex items-end gap-2">
                  {monthlyTotals.map((total, i) => {
                    const maxTotal = Math.max(...monthlyTotals) || 1;
                    const barMaxHeight = 160; // px, leaving room for label + month name
                    const barHeight = total > 0 ? Math.max(12, Math.round((total / maxTotal) * barMaxHeight)) : 6;
                    const isCurrentMonth = selectedYear === currentYear && i === new Date().getMonth();

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end group" style={{ height: '100%' }}>
                        {/* Value label */}
                        <span className={`text-3xs font-bold font-mono mb-1 transition-opacity ${
                          total > 0 
                            ? 'text-emerald-400' 
                            : 'text-transparent'
                        }`}>
                          {total > 0 ? `R$${total.toFixed(1)}` : '·'}
                        </span>
                        
                        {/* Bar */}
                        <div 
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            total > 0
                              ? isCurrentMonth
                                ? 'bg-gradient-to-t from-brand-primary to-brand-primary/60 shadow-sm shadow-brand-primary/20'
                                : 'bg-gradient-to-t from-emerald-600 to-emerald-500/60 group-hover:from-emerald-500 group-hover:to-emerald-400/60'
                              : 'bg-dark-border/30'
                          }`}
                          style={{ height: `${barHeight}px` }}
                        />
                        
                        {/* Month label */}
                        <span className={`text-3xs font-bold mt-2 ${
                          isCurrentMonth ? 'text-brand-primary' : 'text-dark-textSecondary'
                        }`}>
                          {MONTH_LABELS[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coverage analysis */}
              <div className="flex items-center gap-6 pt-4 border-t border-dark-border/40 text-2xs text-dark-textSecondary font-semibold">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Mês mais forte: <strong className="text-emerald-400 font-mono">
                      {MONTH_LABELS[monthlyTotals.indexOf(Math.max(...monthlyTotals))]} (R$ {Math.max(...monthlyTotals).toFixed(2)})
                    </strong>
                  </span>
                </div>
                {monthlyTotals.filter(v => v === 0).length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      <strong className="text-amber-500">{monthlyTotals.filter(v => v === 0).length} mese(s)</strong> sem cobertura de dividendos
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-lg">
            <div className="flex flex-wrap items-center gap-6 text-3xs font-semibold text-dark-textSecondary">
              <span className="text-dark-textPrimary font-bold uppercase tracking-wider">Legenda:</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-4 rounded bg-dark-bg/30 border border-dark-border/40" />
                <span>Sem dividendo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-4 rounded bg-emerald-950/40 border border-emerald-900/30" />
                <span>Baixo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-4 rounded bg-emerald-900/50 border border-emerald-800/30" />
                <span>Moderado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-4 rounded bg-emerald-800/60 border border-emerald-700/30" />
                <span>Alto</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-4 rounded bg-emerald-700/70 border border-emerald-600/40" />
                <span>Muito Alto</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="w-2 h-2 bg-brand-primary rounded-full" />
                <span>Mês Atual</span>
              </div>
            </div>
          </div>
        </>
      ) : subTab === 'simulator' ? (
        <DividendSimulator />
      ) : (
        (() => {
          const assetData = data.get(ltAsset);
          if (!assetData) return <div className="p-8 text-center text-dark-textSecondary font-bold">Carregando dados...</div>;

          // Validação de intervalo para não ser negativo e ordenar os anos corretamente
          const start = Math.min(ltStartYear, ltEndYear);
          const end = Math.max(ltStartYear, ltEndYear);
          const yearsRange = [];
          for (let y = start; y <= end; y++) {
            yearsRange.push(y);
          }

          const yearTotals = yearsRange.map(yr => {
            const yearEvents = assetData.events.filter(e => e.year === yr);
            return yearEvents.reduce((sum, e) => sum + e.amount, 0);
          });

          const totalPeriod = yearTotals.reduce((a, b) => a + b, 0);
          const avgYear = totalPeriod / yearsRange.length;
          const missingYearsCount = yearTotals.filter(v => v === 0).length;

          return (
            <div className="space-y-6 animate-fadeIn">
              {/* Filtros */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-lg flex flex-wrap items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-3xs font-bold text-dark-textSecondary uppercase">Ativo</span>
                  <select
                    value={ltAsset}
                    onChange={(e) => setLtAsset(e.target.value)}
                    className="bg-dark-bg border border-dark-border rounded-lg text-sm text-dark-textPrimary font-bold px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {tickers.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-3xs font-bold text-dark-textSecondary uppercase">Ano Base</span>
                  <select
                    value={ltStartYear}
                    onChange={(e) => setLtStartYear(Number(e.target.value))}
                    className="bg-dark-bg border border-dark-border rounded-lg text-sm text-dark-textPrimary font-bold px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {Array.from({ length: 26 }, (_, i) => currentYear - i).map(y => (
                      <option key={`start-${y}`} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-5 text-dark-textSecondary font-bold text-sm">até</div>

                <div className="flex flex-col gap-1">
                  <span className="text-3xs font-bold text-dark-textSecondary uppercase">Ano Final</span>
                  <select
                    value={ltEndYear}
                    onChange={(e) => setLtEndYear(Number(e.target.value))}
                    className="bg-dark-bg border border-dark-border rounded-lg text-sm text-dark-textPrimary font-bold px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {Array.from({ length: 26 }, (_, i) => currentYear - i).map(y => (
                      <option key={`end-${y}`} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-lg">
                  <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Total Acumulado</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">R$ {totalPeriod.toFixed(2).replace('.', ',')}</span>
                  <span className="text-3xs text-dark-textSecondary block mt-0.5">no período selecionado</span>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-lg">
                  <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Média Anual</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">R$ {avgYear.toFixed(2).replace('.', ',')}</span>
                  <span className="text-3xs text-dark-textSecondary block mt-0.5">por ano</span>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-lg">
                  <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Período Analisado</span>
                  <span className="text-2xl font-black text-dark-textPrimary font-mono mt-1 block">{yearsRange.length} Anos</span>
                  <span className="text-3xs text-dark-textSecondary block mt-0.5">entre {start} e {end}</span>
                </div>
              </div>

              {/* Alerta de Risco */}
              {missingYearsCount > 0 && (
                <div className="bg-brand-danger/10 border-2 border-brand-danger/30 rounded-xl p-5 shadow-lg flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-danger/20 flex items-center justify-center border border-brand-danger/30 shrink-0">
                    <AlertTriangle className="w-6 h-6 text-brand-danger" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-brand-danger uppercase tracking-wide">Alerta de Inconstância</h3>
                    <p className="text-xs text-brand-danger/90 font-semibold mt-1">
                      No intervalo selecionado, o ativo <strong>{ltAsset}</strong> teve <strong className="text-brand-danger bg-brand-danger/20 px-1.5 py-0.5 rounded">{missingYearsCount} ano(s)</strong> sem pagar nenhum dividendo (R$ 0,00). Isso afeta gravemente o efeito dos juros compostos a longo prazo.
                    </p>
                  </div>
                </div>
              )}

              {/* Gráfico/Tabela Ano a Ano */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl">
                 <h3 className="text-xs font-black text-dark-textPrimary uppercase tracking-wider mb-6 border-l-2 border-emerald-500 pl-2">Distribuição Histórica Ano a Ano</h3>
                 <div className="flex items-end gap-2 overflow-x-auto no-scrollbar pb-2" style={{ height: '220px' }}>
                    {yearsRange.map((yr, i) => {
                      const total = yearTotals[i];
                      const maxTotal = Math.max(...yearTotals) || 1;
                      const barMaxHeight = 180;
                      const barHeight = total > 0 ? Math.max(12, Math.round((total / maxTotal) * barMaxHeight)) : 6;
                      const isZero = total === 0;

                      return (
                        <div key={yr} className="flex-1 min-w-[48px] flex flex-col items-center justify-end group h-full">
                          <span className={`text-[10px] font-bold font-mono mb-1 transition-opacity ${
                            isZero ? 'text-brand-danger' : 'text-emerald-400 opacity-0 group-hover:opacity-100'
                          }`}>
                            {isZero ? '🚨 0,00' : `R$ ${total.toFixed(2)}`}
                          </span>
                          <div 
                            className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 relative ${
                              isZero 
                                ? 'bg-brand-danger/30 border border-brand-danger' 
                                : 'bg-gradient-to-t from-emerald-700 to-emerald-500/80 group-hover:from-emerald-600 group-hover:to-emerald-400'
                            }`}
                            style={{ height: `${barHeight}px` }}
                          >
                             {isZero && (
                               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-50">
                                 <div className="w-full h-px bg-brand-danger/50 absolute top-1/2 -translate-y-1/2 rotate-45" />
                                 <div className="w-full h-px bg-brand-danger/50 absolute top-1/2 -translate-y-1/2 -rotate-45" />
                               </div>
                             )}
                          </div>
                          <span className={`text-3xs font-bold mt-2 ${isZero ? 'text-brand-danger' : 'text-dark-textSecondary'}`}>
                            {yr}
                          </span>
                        </div>
                      );
                    })}
                 </div>
              </div>
            </div>
          );
        })()
      )}

    </div>
  );
};
