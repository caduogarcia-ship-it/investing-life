// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StockSummary } from './components/StockSummary';
import { StockChart } from './components/StockChart';
import { IndicatorsGrid } from './components/IndicatorsGrid';
import { RiskAnalysis, ValuationAnalysis } from './components/RiskAnalysis';
import { StrategyThesis } from './components/StrategyThesis';
import { NewsAndConsensus } from './components/NewsAndConsensus';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { Portfolio } from './components/Portfolio';
import { CandleAnalysis } from './components/CandleAnalysis';
import { DividendMap } from './components/DividendMap';
import { Rankings } from './components/Rankings';
import { RecommendedPortfolios } from './components/RecommendedPortfolios';
import { QuickCompare } from './components/QuickCompare';
import { fetchStockData, getSimilarTickers } from './services/api';
import type { StockData, B3Ticker } from './services/api';
import { AlertCircle, FolderHeart, Compass, ArrowRight, LineChart, Wallet, CandlestickChart, DollarSign, Trophy, Star, Calculator } from 'lucide-react';
import { Login } from './components/Login';
import { HomeOverview } from './components/HomeOverview';
import { AddAssetModal } from './components/AddAssetModal';
import type { PortfolioItem } from './components/Portfolio';
import { CalculatorsPreview } from './components/CalculatorsPreview';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('b3_logged_in') === 'true';
  });

  const [ticker, setTicker] = useState<string>(() => {
    return localStorage.getItem('b3_selected_ticker') || 'PETR4';
  });
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickerNotFound, setTickerNotFound] = useState(false);
  const [similarSuggestions, setSimilarSuggestions] = useState<B3Ticker[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('b3_watchlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse watchlist from localStorage', e);
      }
    }
    return ['PETR4', 'VALE3', 'WEGE3', 'CURY3', 'TEND3', 'ITUB4'];
  });

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('b3_analise_portfolio');
    let currentPortfolio: PortfolioItem[] = [];
    if (saved) {
      try {
        currentPortfolio = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse portfolio from localStorage', e);
      }
    }

    // Seed/merge the 12 user-requested assets exactly once
    const seeded = localStorage.getItem('b3_portfolio_seeded_v2');
    if (!seeded) {
      const initialAssets: PortfolioItem[] = [
        { symbol: 'BBDC3', quantity: 8, averagePrice: 11.55, currentPrice: 11.55, longName: 'Banco Bradesco S.A.' },
        { symbol: 'VALE3', quantity: 1, averagePrice: 51.90, currentPrice: 51.90, longName: 'Vale S.A.' },
        { symbol: 'TAEE11', quantity: 2, averagePrice: 34.62, currentPrice: 34.62, longName: 'Taesa S.A.' },
        { symbol: 'EMBJ3', quantity: 1, averagePrice: 73.60, currentPrice: 73.60, longName: 'Embraer S.A.' },
        { symbol: 'PRIO3', quantity: 1, averagePrice: 62.16, currentPrice: 62.16, longName: 'PetroRio S.A.' },
        { symbol: 'SAPR4', quantity: 7, averagePrice: 6.27, currentPrice: 6.27, longName: 'Sanepar S.A.' },
        { symbol: 'POMO4', quantity: 8, averagePrice: 6.35, currentPrice: 6.35, longName: 'Marcopolo S.A.' },
        { symbol: 'ITSA4', quantity: 3, averagePrice: 10.43, currentPrice: 10.43, longName: 'Itaúsa S.A.' },
        { symbol: 'SMFT3', quantity: 2, averagePrice: 18.64, currentPrice: 18.64, longName: 'Smartfit S.A.' },
        { symbol: 'TOTS3', quantity: 1, averagePrice: 33.09, currentPrice: 33.09, longName: 'Totvs S.A.' },
        { symbol: 'B3SA3', quantity: 2, averagePrice: 16.33, currentPrice: 16.33, longName: 'B3 S.A.' },
        { symbol: 'CPLE3', quantity: 2, averagePrice: 12.10, currentPrice: 12.10, longName: 'Copel S.A.' }
      ];

      const merged = [...currentPortfolio];
      initialAssets.forEach(asset => {
        const existingIdx = merged.findIndex(item => item.symbol.toUpperCase() === asset.symbol.toUpperCase());
        if (existingIdx > -1) {
          const existing = merged[existingIdx];
          const newQty = existing.quantity + asset.quantity;
          const newAvg = ((existing.quantity * existing.averagePrice) + (asset.quantity * asset.averagePrice)) / newQty;
          merged[existingIdx] = {
            ...existing,
            quantity: newQty,
            averagePrice: Number(newAvg.toFixed(2)),
          };
        } else {
          merged.push(asset);
        }
      });

      localStorage.setItem('b3_portfolio_seeded_v2', 'true');
      localStorage.setItem('b3_analise_portfolio', JSON.stringify(merged));
      return merged;
    }

    return currentPortfolio;
  });

  const [activeTab, setActiveTab] = useState<'analise' | 'carteira' | 'candles' | 'dividendos' | 'rankings' | 'recomendadas' | 'calculos'>(() => {
    const saved = localStorage.getItem('b3_active_tab');
    return (saved as any) || 'analise';
  });

  // Persist states to localStorage
  useEffect(() => {
    localStorage.setItem('b3_selected_ticker', ticker);
  }, [ticker]);

  useEffect(() => {
    localStorage.setItem('b3_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('b3_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('b3_analise_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const handleAddAsset = async (symbol: string, type: 'studying' | 'portfolio', qty?: number, avgPrice?: number) => {
    const cleanSym = symbol.toUpperCase().replace('.SA', '').trim();
    if (!cleanSym) return;

    setWatchlist(prev => {
      if (!prev.includes(cleanSym)) {
        return [...prev, cleanSym];
      }
      return prev;
    });

    if (type === 'portfolio' && qty && avgPrice) {
      try {
        const data = await fetchStockData(cleanSym);
        const curPrice = data.regularMarketPrice;
        const longName = data.longName || cleanSym;

        setPortfolio(prev => {
          const existingIdx = prev.findIndex(item => item.symbol === cleanSym);
          let updated = [];
          if (existingIdx > -1) {
            const existing = prev[existingIdx];
            const newQty = existing.quantity + qty;
            const newAvg = ((existing.quantity * existing.averagePrice) + (qty * avgPrice)) / newQty;
            
            updated = [...prev];
            updated[existingIdx] = {
              ...existing,
              quantity: newQty,
              averagePrice: Number(newAvg.toFixed(2)),
              currentPrice: curPrice,
            };
          } else {
            updated = [
              ...prev,
              {
                symbol: cleanSym,
                quantity: qty,
                averagePrice: avgPrice,
                currentPrice: curPrice,
                longName,
              }
            ];
          }
          return updated;
        });
      } catch (err) {
        console.warn('Failed to fetch price details for added portfolio asset', err);
        setPortfolio(prev => {
          const existingIdx = prev.findIndex(item => item.symbol === cleanSym);
          if (existingIdx > -1) return prev;
          return [
            ...prev,
            {
              symbol: cleanSym,
              quantity: qty,
              averagePrice: avgPrice,
              currentPrice: avgPrice,
              longName: cleanSym,
            }
          ];
        });
      }
    }
  };

  const handleLoginSuccess = (email: string) => {
    localStorage.setItem('b3_logged_in', 'true');
    localStorage.setItem('b3_user_email', email);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('b3_logged_in');
    localStorage.removeItem('b3_user_email');
    setIsLoggedIn(false);
  };


  // Load stock data on ticker change or API refresh
  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;
    const loadStock = async () => {
      setLoading(true);
      setError(null);
      setTickerNotFound(false);
      setSimilarSuggestions([]);
      try {
        const data = await fetchStockData(ticker);
        if (active) {
          setStockData(data);
          // Auto add to watchlist if valid and not there
          setWatchlist(prev => {
            if (!prev.includes(data.symbol)) {
              return [...prev, data.symbol];
            }
            return prev;
          });
        }
      } catch (err: any) {
        console.error('Error fetching stock data', err);
        if (active) {
          setTickerNotFound(true);
          const suggestions = getSimilarTickers(ticker);
          setSimilarSuggestions(suggestions);
          setError(`Não foi possível carregar os dados de "${ticker}". O ticker não existe ou o serviço está temporariamente indisponível.`);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadStock();
    return () => {
      active = false;
    };
  }, [ticker]);

  const handleSearch = (newTicker: string) => {
    if (newTicker.trim()) {
      setTicker(newTicker.toUpperCase().trim());
      setShowDetail(true);
      setActiveTab('analise');
    }
  };

  const handleUpdateStockData = (updatedFields: Partial<StockData>) => {
    setStockData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ...updatedFields
      };
    });
  };

  const handleRemoveFromWatchlist = (symbolToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlist(prev => {
      const filtered = prev.filter(s => s !== symbolToRemove);
      // Fallback if watchlist becomes empty
      if (filtered.length === 0) return ['PETR4'];
      
      // If we are deleting the currently active ticker, switch to the first one in the list
      if (ticker === symbolToRemove) {
        setTicker(filtered[0]);
      }
      return filtered;
    });
  };



  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-textPrimary flex flex-col font-sans selection:bg-brand-primary/30 selection:text-white">
      {/* Header */}
      <Header
        onSearch={handleSearch}
        onOpenSettings={() => setIsSettingsOpen(true)}
        loading={loading}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 lg:px-8 space-y-8">
        
        {/* Main Tab Selectors */}
        <div className="flex bg-dark-card border border-dark-border p-1 rounded-2xl text-xs font-bold uppercase tracking-wider max-w-5xl mx-auto justify-between shadow-md select-none w-full">
          <button
            onClick={() => setActiveTab('analise')}
            className={`flex-1 py-2.5 rounded-xl transition-all duration-300 cursor-pointer active-scale flex items-center justify-center gap-1.5 ${
              activeTab === 'analise' 
                ? 'text-white' 
                : 'text-dark-textSecondary hover:text-dark-textPrimary'
            }`}
            style={activeTab === 'analise' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', fontFamily: 'Outfit, sans-serif' } : { fontFamily: 'Outfit, sans-serif' }}
          >
            <LineChart className="w-3.5 h-3.5" />
            Análise de Ativo
          </button>
          <button
            onClick={() => setActiveTab('carteira')}
            className={`flex-1 py-2.5 rounded-xl transition-all duration-300 cursor-pointer active-scale flex items-center justify-center gap-1.5 ${
              activeTab === 'carteira' 
                ? 'text-white' 
                : 'text-dark-textSecondary hover:text-dark-textPrimary'
            }`}
            style={activeTab === 'carteira' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', fontFamily: 'Outfit, sans-serif' } : { fontFamily: 'Outfit, sans-serif' }}
          >
            <Wallet className="w-3.5 h-3.5" />
            Minha Carteira
          </button>
          <button
            onClick={() => setActiveTab('candles')}
            className={`flex-1 py-2.5 rounded-xl transition-all duration-300 cursor-pointer active-scale flex items-center justify-center gap-1.5 ${
              activeTab === 'candles' 
                ? 'text-white' 
                : 'text-dark-textSecondary hover:text-dark-textPrimary'
            }`}
            style={activeTab === 'candles' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', fontFamily: 'Outfit, sans-serif' } : { fontFamily: 'Outfit, sans-serif' }}
          >
            <CandlestickChart className="w-3.5 h-3.5" />
            Análise Gráfica
          </button>
          <button
            onClick={() => setActiveTab('dividendos')}
            className={`flex-1 py-2.5 rounded-xl transition-all duration-300 cursor-pointer active-scale flex items-center justify-center gap-1.5 ${
              activeTab === 'dividendos' 
                ? 'text-white' 
                : 'text-dark-textSecondary hover:text-dark-textPrimary'
            }`}
            style={activeTab === 'dividendos' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', fontFamily: 'Outfit, sans-serif' } : { fontFamily: 'Outfit, sans-serif' }}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Mapa de Dividendos
          </button>
          <button
            onClick={() => setActiveTab('calculos')}
            className={`flex-1 py-2.5 rounded-xl transition-all duration-300 cursor-pointer active-scale flex items-center justify-center gap-1.5 ${
              activeTab === 'calculos' 
                ? 'text-white' 
                : 'text-dark-textSecondary hover:text-dark-textPrimary'
            }`}
            style={activeTab === 'calculos' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', fontFamily: 'Outfit, sans-serif' } : { fontFamily: 'Outfit, sans-serif' }}
          >
            <Calculator className="w-3.5 h-3.5" />
            Cálculos
          </button>
          <button
            onClick={() => setActiveTab('rankings')}
            className={`flex-1 py-2.5 rounded-xl transition-all duration-300 cursor-pointer active-scale flex items-center justify-center gap-1.5 ${
              activeTab === 'rankings' 
                ? 'text-white' 
                : 'text-dark-textSecondary hover:text-dark-textPrimary'
            }`}
            style={activeTab === 'rankings' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', fontFamily: 'Outfit, sans-serif' } : { fontFamily: 'Outfit, sans-serif' }}
          >
            <Trophy className="w-3.5 h-3.5" />
            Rankings da Bolsa
          </button>
          <button
            onClick={() => setActiveTab('recomendadas')}
            className={`flex-1 py-2.5 rounded-xl transition-all duration-300 cursor-pointer active-scale flex items-center justify-center gap-1.5 ${
              activeTab === 'recomendadas' 
                ? 'text-white' 
                : 'text-dark-textSecondary hover:text-dark-textPrimary'
            }`}
            style={activeTab === 'recomendadas' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', fontFamily: 'Outfit, sans-serif' } : { fontFamily: 'Outfit, sans-serif' }}
          >
            <Star className="w-3.5 h-3.5" />
            Recomendações
          </button>
        </div>

        {/* Error Alert */}
        {error && (activeTab === 'analise' || activeTab === 'candles') && (
          <div className="p-4.5 bg-rose-950/20 border border-brand-danger/30 text-brand-danger rounded-2xl flex items-center gap-3.5 shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex-1 text-sm">{error}</div>
            <button 
              onClick={() => setError(null)}
              className="text-xs font-bold hover:underline shrink-0 px-2 py-1 hover:bg-rose-950/40 rounded-lg transition-all"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Watchlist Strip (Horizontal Watchlist Bar) - Displayed in Analysis Detail and Candles Tabs */}
        {((activeTab === 'analise' && showDetail) || activeTab === 'candles') && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-lg flex items-center gap-4 overflow-x-auto select-none no-scrollbar">
            <div className="flex items-center gap-2 text-xs font-bold text-dark-textSecondary uppercase tracking-wider shrink-0 pr-4 border-r border-dark-border/40">
              <FolderHeart className="w-4.5 h-4.5 text-brand-purple" />
              <span>Painel de Estudos</span>
            </div>

            <div className="flex items-center gap-2.5">
              {watchlist.map((sym) => {
                const isActive = sym === ticker;
                return (
                  <button
                    key={sym}
                    onClick={() => setTicker(sym)}
                    className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all border flex items-center gap-2 ${
                      isActive 
                        ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm shadow-brand-primary/5' 
                        : 'bg-dark-bg/40 border-dark-border/60 hover:border-gray-700 text-dark-textSecondary hover:text-dark-textPrimary'
                    }`}
                  >
                    <span>{sym}</span>
                    {watchlist.length > 1 && (
                      <span 
                        onClick={(e) => handleRemoveFromWatchlist(sym, e)}
                        className="text-4xs hover:bg-dark-cardHover p-0.5 rounded text-dark-textSecondary hover:text-brand-danger transition-colors font-sans ml-1"
                        title="Remover do painel"
                      >
                        ✕
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Conditional Tab Rendering */}
        <div key={activeTab} className="animate-fadeIn">
        {activeTab === 'analise' && !showDetail ? (
          <HomeOverview 
            watchlist={watchlist}
            portfolio={portfolio}
            onSelectTicker={(sym) => {
              setTicker(sym);
              setShowDetail(true);
            }}
            onRemoveWatchlist={(sym) => {
              setWatchlist(prev => prev.filter(s => s !== sym));
            }}
            onRemovePortfolio={(sym) => {
              setPortfolio(prev => prev.filter(s => s.symbol !== sym));
            }}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        ) : activeTab === 'carteira' ? (
          <Portfolio 
            onSelectTicker={(sym) => {
              setTicker(sym);
              setShowDetail(true);
              setActiveTab('analise');
            }}
            portfolio={portfolio}
            setPortfolio={setPortfolio}
          />
        ) : activeTab === 'dividendos' ? (
          <DividendMap 
            portfolio={portfolio}
            onSelectTicker={(sym) => {
              setTicker(sym);
              setShowDetail(true);
              setActiveTab('analise');
            }}
          />
        ) : activeTab === 'calculos' ? (
          <CalculatorsPreview stockData={stockData} />
        ) : activeTab === 'rankings' ? (
          <Rankings 
            onSelectTicker={(sym) => {
              setTicker(sym);
              setShowDetail(true);
              setActiveTab('analise');
            }}
          />
        ) : activeTab === 'recomendadas' ? (
          <RecommendedPortfolios 
            onSelectTicker={(sym) => {
              setTicker(sym);
              setShowDetail(true);
              setActiveTab('analise');
            }}
          />
        ) : activeTab === 'candles' ? (
          <CandleAnalysis ticker={ticker} />
        ) : loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-4 h-64 bg-dark-card border border-dark-border rounded-2xl" />
            <div className="lg:col-span-8 h-64 bg-dark-card border border-dark-border rounded-2xl" />
            <div className="lg:col-span-12 h-28 bg-dark-card border border-dark-border rounded-2xl" />
          </div>
        ) : tickerNotFound ? (
          <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-8 animate-fadeIn">
            <div className="inline-flex p-4.5 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-3xl shadow-lg relative">
              <Compass className="w-10 h-10 animate-pulse" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-dark-textPrimary tracking-tight">
                Ativo Não Encontrado
              </h2>
              <p className="text-sm text-dark-textSecondary max-w-xl mx-auto leading-relaxed">
                Não conseguimos localizar o ticker <strong className="text-brand-purple font-mono font-bold text-base px-1.5 py-0.5 bg-brand-purple/10 rounded">{ticker}</strong> na B3.
                Verifique se o código está correto ou clique em uma das sugestões semelhantes abaixo para realizar a análise:
              </p>
            </div>

            {similarSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5 pt-4">
                {similarSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.symbol}
                    onClick={() => setTicker(suggestion.symbol)}
                    className="p-5 bg-dark-card border border-dark-border hover:border-brand-primary/45 rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-primary/5 group flex items-center justify-between"
                  >
                    <div className="space-y-1 truncate pr-3">
                      <span className="font-mono font-black text-lg text-dark-textPrimary group-hover:text-brand-primary transition-colors tracking-wide">
                        {suggestion.symbol}
                      </span>
                      <p className="text-2xs text-dark-textSecondary truncate font-medium max-w-[180px]">
                        {suggestion.name}
                      </p>
                    </div>
                    <div className="p-2 bg-dark-bg/60 border border-dark-border group-hover:bg-brand-primary/10 group-hover:border-brand-primary/20 rounded-xl transition-all shrink-0">
                      <ArrowRight className="w-4 h-4 text-dark-textSecondary group-hover:text-brand-primary transition-all group-hover:translate-x-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-xs text-dark-textSecondary">
                Nenhum ativo semelhante pôde ser determinado. Tente digitar algo diferente (ex: PETR4, VALE3, MXRF11).
              </div>
            )}
            
            <div className="pt-6">
              <button
                onClick={() => setTicker('PETR4')}
                className="px-6 py-2.5 bg-dark-card hover:bg-dark-cardHover border border-dark-border hover:border-gray-700 text-dark-textPrimary hover:text-white font-semibold rounded-xl text-xs transition-all"
              >
                Voltar para PETR4 (Petrobras)
              </button>
            </div>
          </div>
        ) : stockData ? (
          <div className="space-y-8">
            
            {/* Back to Home Button */}
            <div className="flex items-center">
              <button
                onClick={() => setShowDetail(false)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-dark-card border border-dark-border hover:border-gray-700 text-3xs font-extrabold uppercase tracking-wider text-dark-textSecondary hover:text-dark-textPrimary rounded-xl transition-all cursor-pointer shadow-sm hover:-translate-x-0.5 active-scale"
              >
                ← Voltar ao Painel Geral
              </button>
            </div>

            {/* Grid 1: Summary & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-5 flex flex-col justify-between">
                <StockSummary 
                  data={stockData} 
                  onUpdateData={handleUpdateStockData}
                />
              </div>
              <div className="lg:col-span-7">
                <StockChart 
                  symbol={stockData.symbol}
                  history={stockData.history}
                  currentPrice={stockData.regularMarketPrice}
                  priceChangePercent={stockData.regularMarketChangePercent}
                />
              </div>
            </div>

            {/* Row 2: Fundamentalist Multiples Grid */}
            <div>
              <IndicatorsGrid 
                data={stockData}
                onUpdateData={handleUpdateStockData}
              />
            </div>

            {/* Grid 3: Risk & Valuation side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <RiskAnalysis 
                data={stockData}
                onUpdateData={handleUpdateStockData}
              />
              <ValuationAnalysis 
                data={stockData}
                onUpdateData={handleUpdateStockData}
              />
            </div>

            {/* Row 4: Strategy & Thesis (Full Width) */}
            <div>
              <StrategyThesis 
                data={stockData}
                onUpdateData={handleUpdateStockData}
              />
            </div>

            {/* Row 5: News Feed & Analyst Consensus */}
            <div>
              <NewsAndConsensus 
                symbol={stockData.symbol}
                currentPrice={stockData.regularMarketPrice}
              />
            </div>

            {/* Quick Compare Floating Widget */}
            <QuickCompare currentData={stockData} />

          </div>
        ) : (
          <div className="py-24 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-brand-danger mx-auto" />
            <h3 className="text-lg font-bold text-dark-textPrimary">Nenhum ativo selecionado</h3>
            <p className="text-xs text-dark-textSecondary">Use a barra de pesquisa acima para analisar uma ação da B3.</p>
          </div>
        )}
        </div>
      </main>

      {/* API Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddAsset}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
