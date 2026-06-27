// src/components/StockSummary.tsx
import React, { useState } from 'react';
import { Target, TrendingUp, TrendingDown, ArrowRight, Percent, Edit2, Check } from 'lucide-react';
import { saveUserOverride } from '../services/api';
import type { StockData } from '../services/api';

interface StockSummaryProps {
  data: StockData;
  onUpdateData: (newData: Partial<StockData>) => void;
}

export const StockSummary: React.FC<StockSummaryProps> = ({ data, onUpdateData }) => {
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(data.targetPrice.toString());

  const currentPrice = data.regularMarketPrice;
  const targetPrice = data.targetPrice;
  const priceChange = data.regularMarketChange;
  const priceChangePercent = data.regularMarketChangePercent;
  const isPositive = priceChangePercent >= 0;

  // Calculate Upside %
  const upsidePercent = targetPrice > 0 
    ? ((targetPrice - currentPrice) / currentPrice) * 100 
    : 0;

  // Calculate Margin of Safety (Margem de Segurança)
  // Standard formula: (1 - (Current Price / Target Price)) * 100
  const marginOfSafety = targetPrice > currentPrice 
    ? (1 - (currentPrice / targetPrice)) * 100 
    : 0;

  // Percentage position on a bar (cap at 100%)
  const barProgress = Math.max(0, Math.min(100, (currentPrice / targetPrice) * 100));

  const handleSaveTarget = () => {
    const val = parseFloat(targetInput);
    if (!isNaN(val) && val >= 0) {
      saveUserOverride(data.symbol, { targetPrice: val });
      onUpdateData({ targetPrice: val });
      setIsEditingTarget(false);
    }
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(3)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(3)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(3)}M`;
    return num.toLocaleString('pt-BR');
  };

  return (
    <div className="glass-card rounded-2xl p-8 shadow-xl space-y-8 relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -z-10" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-900 border border-dark-border rounded-2xl p-2.5 flex items-center justify-center shrink-0">
            <img 
              src={data.logourl} 
              alt={data.symbol} 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://icons.brapi.dev/icons/BRAPI.svg';
              }}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-dark-textPrimary tracking-tight font-mono" style={{ fontFamily: 'Outfit, sans-serif' }}>{data.symbol}</h2>
              <span className="text-2xs font-semibold px-2.5 py-0.5 bg-gray-800 border border-dark-border text-dark-textSecondary rounded-full" style={{ fontFamily: 'Outfit, sans-serif' }}>
                B3 Ação
              </span>
            </div>
            <p className="text-sm text-dark-textSecondary font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>{data.longName}</p>
          </div>
        </div>

        {/* Current Price Display */}
        <div className="text-left sm:text-right">
          <div className="text-3xl font-extrabold text-dark-textPrimary font-mono" style={{ fontFamily: 'JetBrains Mono, monospace', textShadow: '0 0 20px rgba(99,102,241,0.15)' }}>
            R$ {currentPrice.toFixed(3).replace('.', ',')}
          </div>
          <div className="flex items-center sm:justify-end gap-2 mt-1.5">
            <span className={`text-sm font-semibold flex items-center px-2.5 py-1 rounded-lg ${
              isPositive ? 'bg-emerald-950/20 text-brand-success border border-brand-success/20' : 
                           'bg-rose-950/20 text-brand-danger border border-brand-danger/20'
            }`} style={{ fontFamily: 'JetBrains Mono, monospace', boxShadow: isPositive ? '0 0 12px rgba(16,185,129,0.15)' : '0 0 12px rgba(239,68,68,0.15)' }}>
              {isPositive ? <TrendingUp className="w-4 h-4 mr-1 shrink-0" /> : <TrendingDown className="w-4 h-4 mr-1 shrink-0" />}
              {isPositive ? '+' : ''}{priceChangePercent.toFixed(3)}%
            </span>
            <span className="text-xs text-dark-textSecondary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              (R$ {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(3).replace('.', ',')})
            </span>
          </div>
        </div>
      </div>

      {/* Grid Quick Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
        <div className="bg-dark-card/30 border border-dark-border/40 rounded-xl p-2.5 flex flex-col justify-between transition-all hover:border-brand-primary/30 hover:bg-dark-card/50">
          <span className="block text-[10px] font-bold text-dark-textSecondary uppercase tracking-wider mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Máxima do Dia</span>
          <span className="text-xs font-bold text-dark-textPrimary font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>R$ {data.regularMarketDayHigh.toFixed(3).replace('.', ',')}</span>
        </div>
        <div className="bg-dark-card/30 border border-dark-border/40 rounded-xl p-2.5 flex flex-col justify-between transition-all hover:border-brand-primary/30 hover:bg-dark-card/50">
          <span className="block text-[10px] font-bold text-dark-textSecondary uppercase tracking-wider mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Mínima do Dia</span>
          <span className="text-xs font-bold text-dark-textPrimary font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>R$ {data.regularMarketDayLow.toFixed(3).replace('.', ',')}</span>
        </div>
        <div className="bg-dark-card/30 border border-dark-border/40 rounded-xl p-2.5 flex flex-col justify-between transition-all hover:border-brand-primary/30 hover:bg-dark-card/50">
          <span className="block text-[10px] font-bold text-dark-textSecondary uppercase tracking-wider mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Volume Diário</span>
          <span className="text-xs font-bold text-dark-textPrimary font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatLargeNumber(data.regularMarketVolume)}</span>
        </div>
        <div className="bg-dark-card/30 border border-dark-border/40 rounded-xl p-2.5 flex flex-col justify-between transition-all hover:border-brand-primary/30 hover:bg-dark-card/50">
          <span className="block text-[10px] font-bold text-dark-textSecondary uppercase tracking-wider mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Valor de Mercado</span>
          <span className="text-xs font-bold text-dark-textPrimary font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatLargeNumber(data.marketCap)}</span>
        </div>
        <div className="bg-dark-card/30 border border-dark-border/40 rounded-xl p-2.5 flex flex-col justify-between transition-all hover:border-brand-primary/30 hover:bg-dark-card/50">
          <span className="block text-[10px] font-bold text-dark-textSecondary uppercase tracking-wider mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Máx. 52 Sem</span>
          <span className="text-xs font-bold text-dark-textPrimary font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>R$ {(data.history.length > 0 ? Math.max(...data.history.map(h => h.high ?? h.price)) : 0).toFixed(3).replace('.', ',')}</span>
        </div>
        <div className="bg-dark-card/30 border border-dark-border/40 rounded-xl p-2.5 flex flex-col justify-between transition-all hover:border-brand-primary/30 hover:bg-dark-card/50">
          <span className="block text-[10px] font-bold text-dark-textSecondary uppercase tracking-wider mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Abertura</span>
          <span className="text-xs font-bold text-dark-textPrimary font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>R$ {(data.history.length > 0 ? (data.history[data.history.length - 1]?.open ?? 0) : 0).toFixed(3).replace('.', ',')}</span>
        </div>
      </div>

      {/* Target Price & Upside Progress Bar */}
      <div className="p-6.5 bg-gradient-to-r from-gray-900/60 to-dark-bg border border-dark-border rounded-xl space-y-5.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4.5 h-4.5 text-brand-primary" />
            <span className="text-sm font-semibold text-dark-textPrimary" style={{ fontFamily: 'Outfit, sans-serif' }}>Preço Alvo vs. Preço Atual</span>
          </div>
          
          {/* Target Price Editor */}
          <div className="flex items-center gap-2">
            {isEditingTarget ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-dark-textSecondary font-mono">R$</span>
                <input
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className="w-16 bg-dark-bg border border-dark-border focus:border-brand-primary outline-none py-0.5 px-1.5 rounded text-xs text-dark-textPrimary font-mono text-center"
                  step="0.01"
                  autoFocus
                />
                <button 
                  onClick={handleSaveTarget}
                  className="p-1 bg-brand-success/15 border border-brand-success/30 text-brand-success rounded hover:bg-brand-success/30 transition-colors"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-dark-textPrimary font-mono">
                  R$ {targetPrice.toFixed(2).replace('.', ',')}
                </span>
                <button 
                  onClick={() => {
                    setTargetInput(data.targetPrice.toString());
                    setIsEditingTarget(true);
                  }}
                  className="p-1 hover:bg-dark-cardHover text-dark-textSecondary hover:text-dark-textPrimary rounded transition-all"
                  title="Editar Preço Alvo"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upside Metrics Summary */}
        <div className="grid grid-cols-2 gap-4 border-t border-dark-border/40 pt-3 text-xs">
          <div style={{ background: 'rgba(9,13,22,0.5)', border: '1px solid rgba(31,41,55,0.4)', borderRadius: '10px', padding: '12px' }}>
            <span className="text-dark-textSecondary block" style={{ fontFamily: 'Outfit, sans-serif' }}>Potencial de Upside (Valorização)</span>
            <span className={`font-bold text-sm flex items-center gap-1 mt-0.5 ${upsidePercent >= 0 ? 'text-brand-success' : 'text-brand-danger'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {upsidePercent >= 0 ? '+' : ''}{upsidePercent.toFixed(1)}%
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div style={{ background: 'rgba(9,13,22,0.5)', border: '1px solid rgba(31,41,55,0.4)', borderRadius: '10px', padding: '12px' }}>
            <span className="text-dark-textSecondary block" style={{ fontFamily: 'Outfit, sans-serif' }}>Margem de Segurança (Graham)</span>
            <span className={`font-bold text-sm flex items-center gap-1 mt-0.5 ${marginOfSafety > 0 ? 'text-brand-info' : 'text-dark-textSecondary'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {marginOfSafety > 0 ? `${marginOfSafety.toFixed(1)}%` : 'Sem margem'}
              <Percent className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-4 bg-dark-bg border border-dark-border rounded-full overflow-hidden relative">
            {/* Target Price Reference mark */}
            <div className="absolute right-0 top-0 bottom-0 border-l border-brand-primary/50 w-0.5 z-10" title="Preço Alvo" />
            
            {/* Progress Fill */}
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                currentPrice >= targetPrice 
                  ? 'bg-gradient-to-r from-orange-600 to-rose-600' // Target reached or exceeded (Premium style)
                  : 'bg-gradient-to-r from-brand-info via-brand-primary to-brand-success'
              }`}
              style={{ width: `${barProgress}%` }}
            />

            {/* Marker dot at current price position */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `${barProgress}%`,
              transform: 'translate(-50%, -50%)',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#fff',
              border: '2px solid #6366f1',
              boxShadow: '0 0 8px rgba(99,102,241,0.4)',
              zIndex: 20,
            }} />
          </div>
          
          <div className="flex justify-between text-3xs text-dark-textSecondary font-semibold uppercase tracking-wider font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span>R$ {currentPrice.toFixed(2).replace('.', ',')}</span>
            {currentPrice >= targetPrice ? (
              <span className="text-brand-danger font-bold">Preço excedeu Alvo ({barProgress.toFixed(0)}%)</span>
            ) : (
              <span>Atual: {barProgress.toFixed(0)}% do Alvo</span>
            )}
            <span>Alvo: R$ {targetPrice.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
