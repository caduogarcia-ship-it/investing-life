import React, { useState, useEffect } from 'react';
import { Bookmark, Briefcase, Trash2, TrendingUp, TrendingDown, Eye, Plus, Loader2, Award, ArrowUpRight, ArrowDownRight, X, HelpCircle, Search, LineChart, Calculator } from 'lucide-react';
import { fetchStockData, fetchMarketMoves } from '../services/api';
import type { MarketMove } from '../services/api';
import type { PortfolioItem } from './Portfolio';

interface HomeOverviewProps {
  watchlist: string[];
  portfolio: PortfolioItem[];
  onSelectTicker: (symbol: string) => void;
  onRemoveWatchlist: (symbol: string) => void;
  onRemovePortfolio: (symbol: string) => void;
  onOpenAddModal: () => void;
}

interface WatchlistItemDetails {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  loading: boolean;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  watchlist,
  portfolio,
  onSelectTicker,
  onRemoveWatchlist,
  onRemovePortfolio,
  onOpenAddModal,
}) => {
  const getGreeting = () => { const h = new Date().getHours(); if (h < 12) return '☀️ Bom dia'; if (h < 18) return '🌤️ Boa tarde'; return '🌙 Boa noite'; };
  const [watchDetails, setWatchDetails] = useState<Map<string, WatchlistItemDetails>>(new Map());
  const [loadingWatch, setLoadingWatch] = useState(false);
  const [marketMoves, setMarketMoves] = useState<MarketMove[]>([]);
  const [loadingMoves, setLoadingMoves] = useState(false);
  const [showGuide, setShowGuide] = useState(() => !localStorage.getItem('b3_hide_welcome_guide'));

  const isMarketOpen = () => {
    const d = new Date();
    const day = d.getDay();
    const hr = d.getHours();
    const min = d.getMinutes();
    if (day === 0 || day === 6) return false;
    const timeVal = hr * 60 + min;
    return timeVal >= 600 && timeVal <= 1080; // 10:00 to 18:00
  };

  useEffect(() => {
    let active = true;
    const loadMoves = async () => {
      if (active) setLoadingMoves(true);
      try {
        const data = await fetchMarketMoves();
        if (active) setMarketMoves(data);
      } catch (err) {
        console.error('Failed to load market moves:', err);
      } finally {
        if (active) setLoadingMoves(false);
      }
    };
    loadMoves();
    
    // Refresh every 60 seconds
    const interval = setInterval(loadMoves, 60000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const gainers = [...marketMoves]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 10);
  const losers = [...marketMoves]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 10);

  // Fetch prices for watchlist items on mount or watchlist changes
  useEffect(() => {
    let active = true;
    if (watchlist.length === 0) {
      if (active) setWatchDetails(new Map());
      return;
    }

    const fetchDetails = async () => {
      if (active) setLoadingWatch(true);
      
      const newDetails = new Map<string, WatchlistItemDetails>();
      
      // Load details for all watchlist tickers
      await Promise.all(
        watchlist.map(async (sym) => {
          try {
            const data = await fetchStockData(sym);
            if (active) {
              newDetails.set(sym, {
                symbol: sym,
                name: data.shortName || data.longName || sym,
                price: data.regularMarketPrice,
                changePercent: data.regularMarketChangePercent,
                loading: false,
              });
            }
          } catch (e) {
            if (active) {
              newDetails.set(sym, {
                symbol: sym,
                name: sym,
                price: 0,
                changePercent: 0,
                loading: false,
              });
            }
          }
        })
      );

      if (active) {
        setWatchDetails(newDetails);
        setLoadingWatch(false);
      }
    };

    fetchDetails();
    return () => { active = false; };
  }, [watchlist]);

  // Aggregate stats
  const totalCost = portfolio.reduce((sum, item) => sum + (item.quantity * item.averagePrice), 0);
  const totalCurrent = portfolio.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0);
  const totalProfit = totalCurrent - totalCost;
  const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {showGuide && (
        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-purple/5 border border-brand-primary/20 rounded-2xl p-6 relative shadow-lg animate-fadeIn">
          <button
            onClick={() => {
              setShowGuide(false);
              localStorage.setItem('b3_hide_welcome_guide', 'true');
            }}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-dark-textSecondary hover:text-dark-textPrimary hover:bg-dark-cardHover transition-colors cursor-pointer"
            title="Fechar guia"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex gap-3 mb-4">
            <span className="p-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 shrink-0 self-start">
              <HelpCircle className="w-5 h-5 text-brand-primary" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-dark-textPrimary tracking-wide uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Guia Rápido de Introdução
              </h3>
              <p className="text-xs text-dark-textSecondary mt-0.5 font-semibold leading-relaxed">
                Bem-vindo ao Investing Life! Esta plataforma foi projetada para tornar a análise de ações da B3 simples e fundamentada. Siga os passos abaixo para começar:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div className="bg-dark-card/45 p-4 rounded-xl border border-dark-border/40 space-y-1.5">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-brand-primary shrink-0" />
                <span className="text-2xs font-extrabold text-dark-textPrimary uppercase tracking-wider">1. Buscar Ativo</span>
              </div>
              <p className="text-3xs text-dark-textSecondary leading-relaxed">
                Use a barra de pesquisa no topo (ex: <strong>VALE3</strong>, <strong>PETR4</strong>) para carregar os dados fundamentados do ativo.
              </p>
            </div>

            <div className="bg-dark-card/45 p-4 rounded-xl border border-dark-border/40 space-y-1.5">
              <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4 text-brand-primary shrink-0" />
                <span className="text-2xs font-extrabold text-dark-textPrimary uppercase tracking-wider">2. Analisar Indicadores</span>
              </div>
              <p className="text-3xs text-dark-textSecondary leading-relaxed">
                Na aba <strong>Análise de Ativo</strong>, confira Graham, Bazin, saúde financeira, histórico de dividendos e consensos.
              </p>
            </div>

            <div className="bg-dark-card/45 p-4 rounded-xl border border-dark-border/40 space-y-1.5">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-brand-primary shrink-0" />
                <span className="text-2xs font-extrabold text-dark-textPrimary uppercase tracking-wider">3. Fazer Valuation</span>
              </div>
              <p className="text-3xs text-dark-textSecondary leading-relaxed">
                Na aba <strong>Calculadoras</strong>, use o Gordon ou Crescimento Variado para simular o preço justo e justificar as taxas.
              </p>
            </div>

            <div className="bg-dark-card/45 p-4 rounded-xl border border-dark-border/40 space-y-1.5">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-primary shrink-0" />
                <span className="text-2xs font-extrabold text-dark-textPrimary uppercase tracking-wider">4. Simular Aportes</span>
              </div>
              <p className="text-3xs text-dark-textSecondary leading-relaxed">
                Utilize as abas <strong>Carteira</strong>, <strong>Simulador</strong> e <strong>Rankings</strong> para comparar ativos e estimar a sua renda passiva no futuro.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner and Aggregates */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <span style={{ fontSize: '11px', fontFamily: 'Outfit, sans-serif', color: '#94a3b8', fontWeight: 600 }}>{getGreeting()}, investidor</span>
          <h2 className="text-xl font-extrabold text-dark-textPrimary tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Painel Geral de Ativos</h2>
          <p className="text-xs text-dark-textSecondary font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>Acompanhe seus estudos fundamentados e o retorno consolidado de sua carteira</p>
        </div>

        <div className="flex items-center gap-3.5 w-full lg:w-auto">
          <button
            onClick={onOpenAddModal}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-brand-primary text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-brand-primary/10 hover:shadow-brand-primary/20 transition-all cursor-pointer active-scale"
          >
            <Plus className="w-4 h-4" />
            Adicionar Ativo
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Watchlist Count */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-md hover-lift" style={{ borderTop: '2px solid #8b5cf6' }}>
          <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block" style={{ fontFamily: 'Outfit, sans-serif' }}>Ativos em Estudo</span>
          <span className="text-2xl font-black text-dark-textPrimary font-mono mt-1 block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{watchlist.length}</span>
          <span className="text-4xs text-dark-textSecondary block mt-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>tickers monitorados</span>
        </div>

        {/* Card 2: Portfolio Cost */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-md hover-lift" style={{ borderTop: '2px solid #6366f1' }}>
          <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block" style={{ fontFamily: 'Outfit, sans-serif' }}>Total Investido (Custo)</span>
          <span className="text-2xl font-black text-dark-textPrimary font-mono mt-1 block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-4xs text-dark-textSecondary block mt-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>PM médio ponderado</span>
        </div>

        {/* Card 3: Portfolio Current Value */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-md hover-lift" style={{ borderTop: '2px solid #10b981' }}>
          <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block" style={{ fontFamily: 'Outfit, sans-serif' }}>Valor Atual da Carteira</span>
          <span className="text-2xl font-black text-brand-primary font-mono mt-1 block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            R$ {totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-4xs text-dark-textSecondary block mt-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>cotação em tempo real</span>
        </div>

        {/* Card 4: Profit/Loss */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-md hover-lift" style={{ borderTop: `2px solid ${totalProfit >= 0 ? '#10b981' : '#ef4444'}` }}>
          <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block" style={{ fontFamily: 'Outfit, sans-serif' }}>Retorno Consolidado (P&L)</span>
          <span className={`text-2xl font-black font-mono mt-1 block ${totalProfit >= 0 ? 'text-brand-success' : 'text-brand-danger'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-4xs font-bold block mt-0.5 ${totalProfit >= 0 ? 'text-brand-success' : 'text-brand-danger'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
            {totalProfit >= 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}% de lucro
          </span>
        </div>
      </div>

      {/* Grid: Watchlist & Portfolio side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Watchlist Section */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-dark-border/45 pb-3">
            <h3 className="text-sm font-bold text-dark-textPrimary flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Bookmark className="w-4.5 h-4.5 text-brand-purple" />
              Estudar / Ficar de Olho (Favoritos)
            </h3>
            <span className="text-4xs font-mono font-bold text-dark-textSecondary bg-dark-bg/60 border border-dark-border/50 px-2 py-0.5 rounded-md">
              {watchlist.length} ativos
            </span>
          </div>

          <div className="flex-1 space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
            {loadingWatch && watchlist.length > 0 && watchDetails.size === 0 ? (
              <div className="py-20 text-center flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
                <span className="text-3xs font-bold text-dark-textSecondary">Sincronizando cotações...</span>
              </div>
            ) : watchlist.length === 0 ? (
              <div className="py-20 text-center text-3xs text-dark-textSecondary font-medium" style={{ border: '2px dashed rgba(31,41,55,0.8)', borderRadius: '16px', margin: '8px', transition: 'border-color 0.3s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(31,41,55,0.8)')}>
                <Eye className="w-8 h-8 mx-auto mb-3 text-dark-border" />
                Nenhum ativo favorito monitorado.
                <button 
                  onClick={onOpenAddModal}
                  className="block mx-auto mt-2 text-brand-primary hover:underline font-bold"
                >
                  Adicionar o primeiro ativo
                </button>
              </div>
            ) : (
              watchlist.map((sym) => {
                const details = watchDetails.get(sym);
                const isPositive = details ? details.changePercent >= 0 : true;

                return (
                  <div
                    key={sym}
                    className="p-3.5 bg-dark-bg/40 border border-dark-border/60 hover-lift rounded-xl flex items-center justify-between select-none"
                    style={{ borderLeft: '3px solid #8b5cf6', borderRadius: '12px' }}
                  >
                    <div 
                      onClick={() => onSelectTicker(sym)}
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="w-8 h-8 border border-brand-purple/20 rounded-lg flex items-center justify-center font-mono font-black text-2xs text-brand-purple shrink-0" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.08))' }}>
                        {sym.slice(0, 3)}
                      </div>
                      <div className="truncate pr-2">
                        <span className="font-mono font-extrabold text-xs text-dark-textPrimary hover:text-brand-primary transition-colors block">
                          {sym}
                        </span>
                        <span className="text-4xs text-dark-textSecondary truncate block max-w-[180px]">
                          {details ? details.name : 'Carregando dados...'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 shrink-0">
                      {details && (
                        <div className="text-right">
                          <span className="text-xs font-bold text-dark-textPrimary font-mono block">
                            R$ {details.price.toFixed(2).replace('.', ',')}
                          </span>
                          <span className={`text-4xs font-bold font-mono flex items-center justify-end ${
                            isPositive ? 'text-brand-success' : 'text-brand-danger'
                          }`}>
                            {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                            {isPositive ? '+' : ''}{details.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => onRemoveWatchlist(sym)}
                        className="p-1.5 hover:bg-dark-cardHover rounded-lg text-dark-textSecondary hover:text-brand-danger transition-colors cursor-pointer"
                        title="Remover dos favoritos"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-dark-border/45 pb-3">
            <h3 className="text-sm font-bold text-dark-textPrimary flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Briefcase className="w-4.5 h-4.5 text-brand-primary" />
              Minha Carteira (Posições Ativas)
            </h3>
            <span className="text-4xs font-mono font-bold text-dark-textSecondary bg-dark-bg/60 border border-dark-border/50 px-2 py-0.5 rounded-md">
              {portfolio.length} ativos
            </span>
          </div>

          <div className="flex-1 space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
            {portfolio.length === 0 ? (
              <div className="py-20 text-center text-3xs text-dark-textSecondary font-medium" style={{ border: '2px dashed rgba(31,41,55,0.8)', borderRadius: '16px', margin: '8px', transition: 'border-color 0.3s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(31,41,55,0.8)')}>
                <Briefcase className="w-8 h-8 mx-auto mb-3 text-dark-border" />
                Nenhuma posição registrada em carteira.
                <button 
                  onClick={onOpenAddModal}
                  className="block mx-auto mt-2 text-brand-primary hover:underline font-bold"
                >
                  Adicionar primeira posição
                </button>
              </div>
            ) : (
              portfolio.map((item) => {
                const itemCost = item.quantity * item.averagePrice;
                const itemCurrent = item.quantity * item.currentPrice;
                const itemProfit = itemCurrent - itemCost;
                const itemProfitPercent = itemCost > 0 ? (itemProfit / itemCost) * 100 : 0;
                const isPositive = itemProfit >= 0;

                return (
                  <div
                    key={item.symbol}
                    className="p-3.5 bg-dark-bg/40 border border-dark-border/60 hover-lift rounded-xl flex items-center justify-between select-none"
                    style={{ borderLeft: '3px solid #6366f1', borderRadius: '12px' }}
                  >
                    <div 
                      onClick={() => onSelectTicker(item.symbol)}
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="w-8 h-8 border border-brand-primary/20 rounded-lg flex items-center justify-center font-mono font-black text-2xs text-brand-primary shrink-0" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))' }}>
                        {item.symbol.slice(0, 3)}
                      </div>
                      <div className="truncate pr-2">
                        <span className="font-mono font-extrabold text-xs text-dark-textPrimary hover:text-brand-primary transition-colors block">
                          {item.symbol}
                        </span>
                        <span className="text-4xs text-dark-textSecondary truncate block max-w-[180px]">
                          {item.quantity} cotas • PM: R$ {item.averagePrice.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-dark-textPrimary font-mono block">
                          R$ {itemCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className={`text-4xs font-bold font-mono flex items-center justify-end ${
                          isPositive ? 'text-brand-success' : 'text-brand-danger'
                        }`}>
                          {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                          {isPositive ? '+' : ''}{itemProfitPercent.toFixed(1)}%
                        </span>
                      </div>

                      <button
                        onClick={() => onRemovePortfolio(item.symbol)}
                        className="p-1.5 hover:bg-dark-cardHover rounded-lg text-dark-textSecondary hover:text-brand-danger transition-colors cursor-pointer"
                        title="Remover da carteira"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Divider */}
      <div className="height-1px" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), rgba(139,92,246,0.15), transparent)' }} />

      {/* Market Highlights */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-dark-textPrimary flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Award className="w-5 h-5 text-brand-primary" />
              Destaques do mercado, {new Date().toLocaleDateString('pt-BR')}
            </h3>
            <p className="text-4xs text-dark-textSecondary font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
              As 10 maiores oscilações diárias entre os ativos mais negociados da bolsa
            </p>
          </div>
          
          <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border shrink-0 self-start sm:self-auto ${
            isMarketOpen() 
              ? 'bg-emerald-950/20 text-brand-success border-brand-success/20' 
              : 'bg-dark-card border-dark-border text-dark-textSecondary'
          }`}>
            {isMarketOpen() ? '● Mercado Aberto (Tempo Real)' : '○ Mercado Fechado (Exibindo Fechamento)'}
          </span>
        </div>

        {loadingMoves && marketMoves.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-2 bg-dark-card border border-dark-border rounded-2xl">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            <span className="text-3xs font-bold text-dark-textSecondary">Consultando cotações e variações da B3...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Maiores Altas */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between border-b border-dark-border/45 pb-3">
                <h4 className="text-xs font-bold text-brand-success flex items-center gap-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <ArrowUpRight className="w-4.5 h-4.5" />
                  Maiores Altas (Top 10)
                </h4>
              </div>
              <div className="flex-1 space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {gainers.length === 0 ? (
                  <div className="py-20 text-center text-3xs text-dark-textSecondary">
                    Nenhum dado de alta disponível.
                  </div>
                ) : (
                  gainers.map((m) => {
                    return (
                      <div
                        key={m.symbol}
                        onClick={() => onSelectTicker(m.symbol)}
                        className="p-3 bg-dark-bg/40 border border-dark-border/60 hover-lift rounded-xl flex items-center justify-between cursor-pointer select-none transition-all hover:border-brand-success/25"
                        style={{ borderLeft: '3px solid #10b981', borderRadius: '12px' }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 border border-brand-success/20 rounded-lg flex items-center justify-center font-mono font-black text-2xs text-brand-success shrink-0" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(99,102,241,0.04))' }}>
                            {m.symbol.slice(0, 3)}
                          </div>
                          <div className="truncate">
                            <span className="font-mono font-extrabold text-xs text-dark-textPrimary hover:text-brand-success transition-colors block">
                              {m.symbol}
                            </span>
                            <span className="text-4xs text-dark-textSecondary truncate block max-w-[180px]">
                              {m.name}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-dark-textPrimary font-mono block">
                            R$ {m.price.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-4xs font-bold font-mono text-brand-success flex items-center justify-end">
                            <TrendingUp className="w-3 h-3 mr-0.5" />
                            +{m.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Maiores Quedas */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between border-b border-dark-border/45 pb-3">
                <h4 className="text-xs font-bold text-brand-danger flex items-center gap-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <ArrowDownRight className="w-4.5 h-4.5" />
                  Maiores Quedas (Top 10)
                </h4>
              </div>
              <div className="flex-1 space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {losers.length === 0 ? (
                  <div className="py-20 text-center text-3xs text-dark-textSecondary">
                    Nenhum dado de queda disponível.
                  </div>
                ) : (
                  losers.map((m) => {
                    return (
                      <div
                        key={m.symbol}
                        onClick={() => onSelectTicker(m.symbol)}
                        className="p-3 bg-dark-bg/40 border border-dark-border/60 hover-lift rounded-xl flex items-center justify-between cursor-pointer select-none transition-all hover:border-brand-danger/25"
                        style={{ borderLeft: '3px solid #ef4444', borderRadius: '12px' }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 border border-brand-danger/20 rounded-lg flex items-center justify-center font-mono font-black text-2xs text-brand-danger shrink-0" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(99,102,241,0.04))' }}>
                            {m.symbol.slice(0, 3)}
                          </div>
                          <div className="truncate">
                            <span className="font-mono font-extrabold text-xs text-dark-textPrimary hover:text-brand-danger transition-colors block">
                              {m.symbol}
                            </span>
                            <span className="text-4xs text-dark-textSecondary truncate block max-w-[180px]">
                              {m.name}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-dark-textPrimary font-mono block">
                            R$ {m.price.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-4xs font-bold font-mono text-brand-danger flex items-center justify-end">
                            <TrendingDown className="w-3 h-3 mr-0.5" />
                            {m.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
