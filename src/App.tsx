// src/App.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { StockSummary } from './components/StockSummary';
import { StockChart } from './components/StockChart';
import { IndicatorsGrid } from './components/IndicatorsGrid';
import { RiskAnalysis, ValuationAnalysis } from './components/RiskAnalysis';
import { StrategyThesis } from './components/StrategyThesis';
import { NewsAndConsensus } from './components/NewsAndConsensus';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import type { TabType } from './components/Sidebar';
import { Portfolio } from './components/Portfolio';
import { CandleAnalysis } from './components/CandleAnalysis';
import { DividendMap } from './components/DividendMap';
import { Rankings } from './components/Rankings';
import { RecommendedPortfolios } from './components/RecommendedPortfolios';
import { QuickCompare } from './components/QuickCompare';
import { fetchStockData, getSimilarTickers } from './services/api';
import type { StockData, B3Ticker } from './services/api';
import { AlertCircle, FolderHeart, Compass, ArrowRight } from 'lucide-react';
import { Login } from './components/Login';
import { HomeOverview } from './components/HomeOverview';
import { AddAssetModal } from './components/AddAssetModal';
import type { PortfolioItem } from './components/Portfolio';
import { CalculatorsPreview } from './components/CalculatorsPreview';
import { AdminHub } from './components/AdminHub';
import { TesouroDireto } from './components/TesouroDireto';
import { supabase, loadUserData, saveUserData, ADMIN_EMAIL } from './services/supabase';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(true);

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
  
  const [watchlist, setWatchlist] = useState<string[]>(['PETR4', 'VALE3', 'WEGE3', 'CURY3', 'TEND3', 'ITUB4']);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem('b3_active_tab');
    return (saved as any) || 'analise';
  });

  // Debounce ref for cloud saving
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Supabase Auth: Check session on mount ──
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setIsLoggedIn(true);
          setCurrentUserEmail(session.user.email || '');
          setCurrentUserId(session.user.id);
          // Load user data from cloud
          const userData = await loadUserData(session.user.id);
          if (userData) {
            if (Array.isArray(userData.portfolio) && userData.portfolio.length > 0) {
              setPortfolio(userData.portfolio);
            }
            if (Array.isArray(userData.watchlist) && userData.watchlist.length > 0) {
              setWatchlist(userData.watchlist);
            }
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setAuthLoading(false);
      }
    };
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setCurrentUserEmail(session.user.email || '');
        setCurrentUserId(session.user.id);
      } else {
        setIsLoggedIn(false);
        setCurrentUserEmail('');
        setCurrentUserId('');
        setPortfolio([]);
        setWatchlist(['PETR4', 'VALE3', 'WEGE3', 'CURY3', 'TEND3', 'ITUB4']);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ── Cloud Sync: Save portfolio & watchlist to Supabase (debounced) ──
  const syncToCloud = useCallback(() => {
    if (!currentUserId || !currentUserEmail || currentUserEmail === 'test@investinglife.com') return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveUserData(currentUserId, currentUserEmail, portfolio, watchlist);
    }, 1500);
  }, [currentUserId, currentUserEmail, portfolio, watchlist]);

  useEffect(() => {
    if (isLoggedIn && currentUserId) {
      syncToCloud();
    }
  }, [portfolio, watchlist, isLoggedIn, currentUserId, syncToCloud]);

  const isAdmin = currentUserEmail === ADMIN_EMAIL;

  // Persist local-only states to localStorage (ticker, tab)
  useEffect(() => {
    localStorage.setItem('b3_selected_ticker', ticker);
  }, [ticker]);

  useEffect(() => {
    localStorage.setItem('b3_active_tab', activeTab);
  }, [activeTab]);

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

  const handleLoginSuccess = async (email: string) => {
    setCurrentUserEmail(email);
    setIsLoggedIn(true);

    if (email === 'test@investinglife.com') {
      setCurrentUserId('test-user-id');
      return;
    }

    // Load user data from cloud after login
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        const userData = await loadUserData(session.user.id);
        if (userData) {
          if (Array.isArray(userData.portfolio) && userData.portfolio.length > 0) {
            setPortfolio(userData.portfolio);
          }
          if (Array.isArray(userData.watchlist) && userData.watchlist.length > 0) {
            setWatchlist(userData.watchlist);
          }
        }
      }
    } catch (err) {
      console.error('Post-login data load failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsLoggedIn(false);
    setCurrentUserEmail('');
    setCurrentUserId('');
    setPortfolio([]);
    setWatchlist(['PETR4', 'VALE3', 'WEGE3', 'CURY3', 'TEND3', 'ITUB4']);
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



  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center space-y-4 animate-fadeIn">
          <div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-dark-textSecondary font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>Verificando sessão...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen w-full bg-dark-bg text-dark-textPrimary font-sans selection:bg-brand-primary/30 selection:text-white overflow-hidden relative">
      <div className="print:hidden absolute left-0 top-0 h-full z-50">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isAdmin={isAdmin}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
          isLoggedIn={isLoggedIn}
        />
      </div>
      
      <div className="w-full flex flex-col h-full overflow-hidden pl-20">
        {/* Header */}
        <div className="print:hidden">
          <Header
            onSearch={handleSearch}
            loading={loading}
          />
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-10 lg:px-8">
          <div className="max-w-7xl mx-auto w-full space-y-8">

        {/* Error Alert */}
        {error && (activeTab === 'analise' || activeTab === 'candles') && (
          <div className="p-4.5 bg-rose-950/20 border border-brand-danger/30 text-brand-danger rounded-xl flex items-center gap-3.5 shadow-premium">
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
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-premium flex items-center gap-4 overflow-x-auto select-none no-scrollbar print:hidden">
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
        ) : activeTab === 'tesouro' ? (
          <TesouroDireto />
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
        ) : activeTab === 'admin' && isAdmin ? (
          <AdminHub currentEmail={currentUserEmail} />
        ) : activeTab === 'candles' ? (
          <CandleAnalysis ticker={ticker} />
        ) : loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-4 h-64 bg-dark-card border border-dark-border rounded-xl" />
            <div className="lg:col-span-8 h-64 bg-dark-card border border-dark-border rounded-xl" />
            <div className="lg:col-span-12 h-28 bg-dark-card border border-dark-border rounded-xl" />
          </div>
        ) : tickerNotFound ? (
          <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-8 animate-fadeIn">
            <div className="inline-flex p-4.5 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-3xl shadow-premium relative">
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
                    className="p-5 bg-dark-card border border-dark-border hover:border-brand-primary/45 rounded-xl text-left transition-all hover:-translate-y-1 hover:shadow-premium hover:shadow-brand-primary/5 group flex items-center justify-between"
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
          </div>
        </main>
      </div>

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
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
