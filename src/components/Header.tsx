// src/components/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Settings, RefreshCw, BarChart2, LogOut } from 'lucide-react';
import { getApiToken, searchTickers, getTickerCategory } from '../services/api';

interface HeaderProps {
  onSearch: (ticker: string) => void;
  onOpenSettings: () => void;
  loading: boolean;
  onLogout?: () => void;
}

interface IndexData {
  name: string;
  value: string;
  change: number;
}

interface IndexConfig {
  name: string;
  symbol: string;
  format: (price: number) => string;
}

const INDEX_CONFIGS: IndexConfig[] = [
  {
    name: 'IBOVESPA',
    symbol: '^BVSP',
    format: (p) => Math.round(p).toLocaleString('pt-BR')
  },
  {
    name: 'IFIX',
    symbol: 'IFIX.SA',
    format: (p) => Math.round(p).toLocaleString('pt-BR')
  },
  {
    name: 'DÓLAR (USD)',
    symbol: 'USDBRL=X',
    format: (p) => `R$ ${p.toFixed(2).replace('.', ',')}`
  },
  {
    name: 'S&P 500',
    symbol: '^GSPC',
    format: (p) => Math.round(p).toLocaleString('pt-BR')
  },
  {
    name: 'NASDAQ',
    symbol: '^IXIC',
    format: (p) => Math.round(p).toLocaleString('pt-BR')
  },
  {
    name: 'BITCOIN (BTC)',
    symbol: 'BTC-USD',
    format: (p) => `U$ ${Math.round(p).toLocaleString('pt-BR')}`
  }
];

export const Header: React.FC<HeaderProps> = ({ onSearch, onOpenSettings, loading, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ symbol: string; name: string; category?: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [indices, setIndices] = useState<IndexData[]>([
    { name: 'IBOVESPA', value: '124.305', change: 0.84 },
    { name: 'IFIX', value: '3.384', change: 0.12 },
    { name: 'DÓLAR (USD)', value: 'R$ 5,14', change: -0.32 },
    { name: 'S&P 500', value: '5.290', change: 0.45 },
    { name: 'NASDAQ', value: '16.750', change: 0.72 },
    { name: 'BITCOIN (BTC)', value: 'U$ 68.450', change: 1.85 },
    { name: 'TAXA SELIC', value: '10,50%', change: 0.00 }
  ]);
  
  const suggestionsRef = useRef<HTMLFormElement>(null);

  // Popular B3 Tickers for Quick Selection
  const popularTickers = [
    { symbol: 'PETR4', name: 'Petrobras S.A. (PETR4)' },
    { symbol: 'VALE3', name: 'Vale S.A. (VALE3)' },
    { symbol: 'WEGE3', name: 'WEG S.A. (WEGE3)' },
    { symbol: 'ITUB4', name: 'Itaú Unibanco (ITUB4)' },
    { symbol: 'MXRF11', name: 'Maxi Renda FII (MXRF11)' },
    { symbol: 'AAPL34', name: 'Apple Inc. BDR (AAPL34)' }
  ];

  useEffect(() => {
    // Hide suggestions on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions based on input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions(popularTickers.map(t => ({
        ...t,
        category: getTickerCategory(t.symbol, t.name)
      })));
      return;
    }

    const results = searchTickers(searchQuery, 12);

    if (results.length === 0) {
      const tickerFormatted = searchQuery.toUpperCase().trim();
      setSuggestions([{ 
        symbol: tickerFormatted, 
        name: `Buscar ativo personalizado: ${tickerFormatted}`,
        category: 'Personalizado'
      }]);
    } else {
      setSuggestions(results.map(item => ({
        ...item,
        category: getTickerCategory(item.symbol, item.name)
      })));
    }
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.toUpperCase().trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (symbol: string) => {
    onSearch(symbol);
    setSearchQuery(symbol);
    setShowSuggestions(false);
  };

  // Real-time indices fetching and simulation
  useEffect(() => {
    const fetchIndicesData = async () => {
      try {
        const fetchedData = await Promise.all(
          INDEX_CONFIGS.map(async (config) => {
            try {
              const res = await fetch(`/yahoo-chart/${config.symbol}?range=1d&interval=1m`);
              if (res.ok) {
                const json = await res.json();
                const result = json.chart?.result?.[0];
                const meta = result?.meta;
                if (meta) {
                  const price = meta.regularMarketPrice ?? meta.chartPreviousClose;
                  const prevClose = meta.chartPreviousClose ?? price;
                  const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
                  if (price) {
                    return {
                      name: config.name,
                      value: config.format(price),
                      change: Number(changePct.toFixed(2))
                    };
                  }
                }
              }
            } catch (e) {
              console.error(`Error fetching index ${config.name}:`, e);
            }
            return null;
          })
        );

        setIndices(prev => prev.map(idx => {
          if (idx.name === 'TAXA SELIC') return idx;
          const configIndex = INDEX_CONFIGS.findIndex(c => c.name === idx.name);
          if (configIndex !== -1 && fetchedData[configIndex] !== null) {
            return fetchedData[configIndex]!;
          }
          return idx;
        }));
      } catch (err) {
        console.error('Error in fetchIndicesData:', err);
      }
    };

    // Initial fetch
    fetchIndicesData();

    // Fetch real values every 30 seconds
    const fetchInterval = setInterval(fetchIndicesData, 30000);

    // Simulate minor visual fluctuations every 8 seconds (only between syncs)
    const simulationInterval = setInterval(() => {
      setIndices(prev => prev.map(idx => {
        if (idx.name === 'TAXA SELIC') {
          return idx;
        }

        const delta = (Math.random() - 0.5) * 0.05;
        const newChange = Number((idx.change + delta).toFixed(2));
        
        let valNum = parseFloat(idx.value.replace('R$', '').replace('U$', '').replace(/\./g, '').replace(',', '.'));
        if (isNaN(valNum)) return idx;

        const multiplier = 1 + (delta / 100);
        const newVal = valNum * multiplier;

        let formattedVal = idx.value;
        if (idx.name === 'IBOVESPA' || idx.name === 'IFIX' || idx.name === 'S&P 500' || idx.name === 'NASDAQ') {
          formattedVal = Math.round(newVal).toLocaleString('pt-BR');
        } else if (idx.name === 'DÓLAR (USD)') {
          formattedVal = `R$ ${newVal.toFixed(2).replace('.', ',')}`;
        } else if (idx.name === 'BITCOIN (BTC)') {
          formattedVal = `U$ ${Math.round(newVal).toLocaleString('pt-BR')}`;
        }

        return { ...idx, value: formattedVal, change: newChange };
      }));
    }, 8000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(simulationInterval);
    };
  }, []);

  const hasToken = getApiToken().length > 0;

  // Helper to group suggestions by category
  const groupedSuggestions = suggestions.reduce((acc, item) => {
    const cat = item.category || 'Outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof suggestions>);

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-dark-border flex flex-col">
      {/* Scrolling Index Ticker Tape */}
      <div className="w-full border-b border-dark-border/40 py-2 px-4 overflow-x-auto no-scrollbar flex items-center gap-6 select-none whitespace-nowrap" style={{ background: 'linear-gradient(90deg, rgba(9,13,22,0.8), rgba(17,24,39,0.6), rgba(9,13,22,0.8))', borderBottom: '1px solid transparent', borderImage: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), rgba(139,92,246,0.15), transparent) 1' }}>
        {indices.map((idx, i) => {
          const isPositive = idx.change >= 0;
          const isNeutral = idx.change === 0;
          return (
            <div 
              key={i} 
              className={`inline-flex items-center gap-2 px-3 py-1 bg-dark-card/30 border rounded-full transition-all hover:bg-dark-card/70 ${
                isNeutral
                  ? 'border-dark-border/50 text-dark-textSecondary'
                  : isPositive
                    ? 'border-brand-success/15 text-brand-success hover:border-brand-success/35'
                    : 'border-brand-danger/15 text-brand-danger hover:border-brand-danger/35'
              }`}
            >
              <span className="text-4xs font-black tracking-wider uppercase opacity-75">{idx.name}</span>
              <span className="text-xs font-extrabold text-dark-textPrimary font-mono">{idx.value}</span>
              {!isNeutral && (
                <span className={`text-4xs font-black font-mono flex items-center${Math.abs(idx.change) > 1 ? ' animate-pulse' : ''}`}>
                  {isPositive ? '+' : ''}{idx.change.toFixed(2)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 lg:px-8 max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Logo and App Name */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-brand-primary to-brand-purple rounded-xl text-white shadow-md animate-glow-pulse-soft">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight gradient-text">Investing Life</h1>
              <p className="text-xs text-dark-textSecondary font-medium">B3 Stock Analyzer & Tracker</p>
            </div>
          </div>

          {/* Settings & Logout Trigger for Mobile */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onOpenSettings}
              className="p-2 text-dark-textSecondary hover:text-dark-textPrimary hover:bg-dark-cardHover rounded-lg transition-colors border border-transparent hover:border-dark-border"
            >
              <Settings className={`w-5 h-5 ${hasToken ? 'text-brand-success' : ''}`} />
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sair"
                className="p-2 text-dark-textSecondary hover:text-brand-danger hover:bg-dark-cardHover rounded-lg transition-colors border border-transparent hover:border-dark-border"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar & Options */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSubmit} className="relative flex-1 md:w-80" ref={suggestionsRef}>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-dark-textSecondary" />
              <input
                type="text"
                placeholder="🔍 Buscar ativo por Ticker... (ex: PETR4)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-dark-card border border-dark-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 outline-none rounded-xl py-2 pl-9 pr-8 text-sm text-dark-textPrimary placeholder-dark-textSecondary/50 transition-all font-mono"
                style={{ fontFamily: 'JetBrains Mono, Fira Code, monospace' }}
              />
              {loading && (
                <RefreshCw className="absolute right-3 top-2.5 w-4 h-4 text-brand-primary animate-spin" />
              )}
            </div>

            {/* Dropdown Suggestions Grouped by Category */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto" style={{ background: 'rgba(17, 24, 39, 0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(31, 41, 55, 0.7)', borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                {Object.entries(groupedSuggestions).map(([category, items]) => (
                  <div key={category} className="border-b border-dark-border/40 last:border-none">
                    <div className="px-3 py-1.5 text-[10px] font-black text-brand-primary/80 tracking-wider uppercase bg-dark-card/40 flex items-center justify-between">
                      <span>{category}</span>
                      <span className="text-[9px] text-dark-textSecondary font-mono">{items.length}</span>
                    </div>
                    <div className="flex flex-col">
                      {items.map((item) => (
                        <button
                          key={item.symbol}
                          type="button"
                          onClick={() => handleSuggestionClick(item.symbol)}
                          className="w-full text-left px-4 py-2 hover:bg-dark-cardHover flex items-center justify-between border-b border-dark-border/10 last:border-none transition-all group relative cursor-pointer"
                          style={{ borderLeft: '2px solid transparent' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderLeftColor = '#6366F1'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderLeftColor = 'transparent'; }}
                        >
                          <span className="font-mono font-bold text-dark-textPrimary group-hover:text-brand-primary transition-colors text-xs">
                            {item.symbol}
                          </span>
                          <span className="text-3xs text-dark-textSecondary max-w-44 truncate">
                            {item.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Settings Trigger for Desktop */}
          <button
            onClick={onOpenSettings}
            title={hasToken ? 'API Token Ativo' : 'Configurar Token API'}
            className={`hidden md:block p-2.5 text-dark-textSecondary hover:text-dark-textPrimary bg-dark-card border border-dark-border hover:border-gray-700 rounded-xl transition-all relative ${
              hasToken ? 'border-brand-success/30 hover:border-brand-success/50' : ''
            }`}
          >
            <Settings className="w-4 h-4" />
            {hasToken && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-success ring-2 ring-dark-card animate-pulse" />
            )}
          </button>

          {/* Logout Trigger for Desktop */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sair da Conta"
              className="hidden md:block p-2.5 text-dark-textSecondary hover:text-brand-danger bg-dark-card border border-dark-border hover:border-gray-700 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
