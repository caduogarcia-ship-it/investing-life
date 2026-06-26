// src/components/StrategyThesis.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import { saveUserOverride } from '../services/api';
import type { StockData } from '../services/api';

interface StrategyThesisProps {
  data: StockData;
  onUpdateData: (newData: Partial<StockData>) => void;
}

type StrategyType = StockData['strategy'];

export const StrategyThesis: React.FC<StrategyThesisProps> = ({ data, onUpdateData }) => {
  const [thesisText, setThesisText] = useState(data.thesis);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceTimer = useRef<any>(null);

  // Sync thesis text with stock change
  useEffect(() => {
    setThesisText(data.thesis);
    setSaveStatus('idle');
  }, [data.symbol, data.thesis]);

  const strategies: Array<{ value: StrategyType; label: string; color: string; activeColor: string }> = [
    { value: 'Crescimento/Growth', label: 'Crescimento / Growth', color: 'border-indigo-500/30 text-indigo-400 bg-indigo-950/10', activeColor: 'bg-indigo-600 text-white border-indigo-500' },
    { value: 'Dividendos/Value', label: 'Dividendos / Value', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10', activeColor: 'bg-emerald-600 text-white border-emerald-500' },
    { value: 'Turnaround', label: 'Turnaround', color: 'border-rose-500/30 text-rose-400 bg-rose-950/10', activeColor: 'bg-rose-600 text-white border-rose-500' },
    { value: 'Setor Cíclico', label: 'Setor Cíclico', color: 'border-amber-500/30 text-amber-400 bg-amber-950/10', activeColor: 'bg-amber-600 text-white border-amber-500' },
    { value: 'Outro', label: 'Outro / Geral', color: 'border-gray-500/30 text-gray-400 bg-gray-950/10', activeColor: 'bg-gray-600 text-white border-gray-500' }
  ];

  const handleStrategyChange = (newStrategy: StrategyType) => {
    saveUserOverride(data.symbol, { strategy: newStrategy });
    onUpdateData({ strategy: newStrategy });
  };

  const handleThesisChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setThesisText(text);
    setSaveStatus('saving');

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      saveUserOverride(data.symbol, { thesis: text });
      onUpdateData({ thesis: text });
      setSaveStatus('saved');
      
      // Reset indicator to idle after 2s
      setTimeout(() => {
        setSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
      }, 2000);
    }, 800); // Save after 800ms of inactivity
  };

  // Immediate save on blur
  const handleBlur = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (saveStatus === 'saving') {
      saveUserOverride(data.symbol, { thesis: thesisText });
      onUpdateData({ thesis: thesisText });
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xs font-bold text-dark-textSecondary uppercase tracking-wider block">Tese de Investimentos</span>
          <h3 className="text-lg font-bold text-dark-textPrimary">Estratégia e Anotações Pessoais</h3>
        </div>
        
        {/* Autosave status indicator */}
        <div className="text-3xs font-semibold flex items-center gap-1.5 shrink-0">
          {saveStatus === 'saving' && (
            <span className="text-brand-info flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Salvando estudo...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-brand-success flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Salvo localmente
            </span>
          )}
        </div>
      </div>

      {/* Strategy selector */}
      <div className="space-y-2">
        <label className="block text-2xs font-bold text-dark-textSecondary uppercase tracking-wider flex items-center gap-1">
          <Bookmark className="w-3.5 h-3.5 text-brand-primary" />
          Classificação Estratégica do Ativo
        </label>
        
        <div className="flex flex-wrap gap-2.5 pt-1">
          {strategies.map((strat) => {
            const isActive = data.strategy === strat.value;
            return (
              <button
                key={strat.value}
                onClick={() => handleStrategyChange(strat.value)}
                className={`px-3.5 py-1.8 rounded-xl border text-xs font-semibold transition-all duration-300 ${
                  isActive ? strat.activeColor : `${strat.color} hover:border-gray-600`
                }`}
              >
                {strat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Investment Thesis Notes Area */}
      <div className="space-y-2.5">
        <label className="block text-2xs font-bold text-dark-textSecondary uppercase tracking-wider flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-brand-primary" />
          Tese do Estudo de Ativo (Editável)
        </label>
        
        <div className="relative">
          <textarea
            value={thesisText}
            onChange={handleThesisChange}
            onBlur={handleBlur}
            placeholder="Descreva aqui sua tese de investimentos detalhada para este ativo. Cite catalisadores, pontos fortes, riscos regulatórios e operacionais..."
            rows={5}
            className="w-full bg-dark-bg border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none rounded-xl p-4 text-sm text-dark-textPrimary placeholder-gray-600 resize-y leading-relaxed transition-all"
          />
        </div>
        <p className="text-3xs text-dark-textSecondary leading-normal">
          Seus dados são salvos localmente no navegador em tempo real enquanto você digita ou quando sai do campo.
        </p>
      </div>

    </div>
  );
};
