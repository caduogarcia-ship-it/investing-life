import React, { useState, useEffect, useMemo } from 'react';
import { Sliders, Calculator, RotateCcw, AlertTriangle, HelpCircle, Lock, Unlock, Printer, TrendingUp, FileText, Save, FolderOpen, X, Trash2 } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { StockData } from '../services/api';

interface LockableInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  isLocked: boolean;
  onToggleLock: () => void;
  onChange: (val: number) => void;
  tooltip?: string;
  disabled?: boolean;
  disableLock?: boolean;
  statusText?: string;
}

const LockableInput: React.FC<LockableInputProps> = ({
  label, value, min, max, step, unit, isLocked, onToggleLock, onChange, tooltip, disabled, disableLock, statusText
}) => {
  const [localVal, setLocalVal] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalVal(value.toString());
    }
  }, [value, isFocused]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setLocalVal(text);
    const parsed = parseFloat(text);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      setLocalVal(parsed.toString());
      onChange(parsed);
    }
  };

  const isDisabled = disabled !== undefined ? disabled : isLocked;
  const isLockBtnDisabled = disableLock !== undefined ? disableLock : false;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(31,41,55,0.5)' }}>
      <div className="h-[2px]" style={{ background: isLocked ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
      <div className="p-3.5 space-y-3" style={{ background: 'rgba(9,13,22,0.35)' }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-dark-textSecondary">{label}</span>
            {statusText && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                statusText.includes('Inativo') ? 'bg-brand-danger/10 text-brand-danger border border-brand-danger/10 opacity-70' :
                statusText === 'Calculado' ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {statusText}
              </span>
            )}
            {tooltip && (
              <span title={tooltip}>
                <HelpCircle className="w-3 h-3 text-dark-textSecondary/50" />
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleLock}
              disabled={isLockBtnDisabled}
              className={`p-1.5 rounded-lg transition-colors ${
                isLockBtnDisabled ? 'opacity-30 cursor-not-allowed text-dark-textSecondary/30' :
                isLocked ? 'bg-brand-danger/20 text-brand-danger' : 'bg-dark-bg/60 text-dark-textSecondary hover:text-dark-textPrimary'
              }`}
              title={isLockBtnDisabled ? "Inativo" : isLocked ? "Destravar valor" : "Travar valor contra Auto-Preenchimento"}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <div className={`flex items-center bg-dark-bg/80 border ${isDisabled ? 'border-brand-danger/20' : 'border-dark-border/60 focus-within:border-brand-purple'} rounded-lg px-2.5 py-1`}>
              <input 
                type="number" step={step} min={min} max={max} 
                value={localVal}
                disabled={isDisabled}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={handleTextChange}
                className={`w-14 bg-transparent text-right font-mono text-sm outline-none border-none p-0 focus:ring-0 focus:outline-none ${isDisabled ? 'text-dark-textSecondary opacity-60' : 'text-dark-textPrimary'}`}
              />
              <span className="text-dark-textSecondary text-sm font-mono ml-1">{unit}</span>
            </div>
          </div>
        </div>
        <input 
          type="range" min={min} max={max} step={step} 
          value={value}
          disabled={isDisabled}
          onChange={handleSliderChange}
          className={`w-full h-1.5 rounded-full appearance-none accent-brand-purple ${isDisabled ? 'bg-brand-danger/10 opacity-30 cursor-not-allowed' : 'bg-dark-bg cursor-pointer'}`}
        />
      </div>
    </div>
  );
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const formatPercent = (val: number) => {
  return `${val.toFixed(2).replace('.', ',')}%`;
};

const initialJustifications = {
  rf: { label: 'Taxa Livre de Risco (Rf)', text: 'Baseada na média histórica do Tesouro IPCA+ de longo prazo ou Selic.', active: true },
  beta: { label: 'Beta (β)', text: 'Reflete a volatilidade histórica observada para o papel nos últimos 5 anos.', active: true },
  erp: { label: 'Prêmio de Risco (ERP)', text: 'Equity Risk Premium estimado por Aswath Damodaran para o mercado brasileiro.', active: true },
  k: { label: 'Custo de Capital (R ou Ke)', text: 'Taxa de desconto calculada via modelo CAPM (Rf + β * ERP).', active: true },
  roe: { label: 'Retorno sobre Patrimônio (ROE)', text: 'Retorno sobre o patrimônio médio recente do ativo.', active: true },
  payout: { label: 'Taxa de Payout', text: 'Percentual estimado de distribuição de lucros sob a forma de dividendos.', active: true },
  g: { label: 'Crescimento Constante (g)', text: 'Calculado a partir de ROE x (1 - Payout) para perpetuidade.', active: true },
  d0: { label: 'Dividendo Atual (DIV0)', text: 'Último dividendo pago acumulado no ano base.', active: true },
  g1: { label: 'Crescimento Estágio 1 (g1)', text: 'Crescimento forte projetado para os próximos 3 anos.', active: true },
  g2: { label: 'Crescimento Perpétuo (g2)', text: 'Crescimento de longo prazo na perpetuidade alinhado à inflação histórica.', active: true },
};

interface CalculatorsPreviewProps {
  stockData: StockData | null;
}

interface SavedCalc {
  id: string;
  name: string;
  mode: 'GORDON' | 'VARIADO';
  inputs: Record<string, number>;
  date: string;
}

export const CalculatorsPreview: React.FC<CalculatorsPreviewProps> = ({ stockData }) => {
  // --- VALUATION MODE TOGGLE ---
  const [valuationMode, setValuationMode] = useState<'GORDON' | 'VARIADO'>('GORDON');

  const recommendedParams = useMemo(() => {
    return {
      rf: 0,
      beta: 0,
      erp: 0,
      roe: 0,
      payout: 0,
      d1: 0,
      g1: 0,
      n: 3,
      g2: 0,
      d0: 0,
      g: 0,
      ke: 0,
    };
  }, []);

  // --- INTERACTIVE / CUSTOMIZABLE STATES ---
  const [inputs, setInputs] = useState(recommendedParams);
  const [locks, setLocks] = useState({
    rf: false, beta: false, erp: false, roe: false, payout: false, d1: false,
    g1: false, n: false, g2: false, d0: false, g: false, ke: false
  });
  const [justifications, setJustifications] = useState(initialJustifications);
  const [currentPriceInput, setCurrentPriceInput] = useState<string>('');

  useEffect(() => {
    if (stockData?.regularMarketPrice) {
      setCurrentPriceInput(stockData.regularMarketPrice.toString());
    }
  }, [stockData?.regularMarketPrice]);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedCalculations, setSavedCalculations] = useState<SavedCalc[]>(() => {
    try {
      const item = localStorage.getItem('investing_life_saved_calcs');
      return item ? JSON.parse(item) : [];
    } catch (e) {
      return [];
    }
  });

  const handleSaveCalculation = () => {
    if (!saveName.trim()) return;
    const newSave: SavedCalc = {
      id: Math.random().toString(36).substring(2, 9),
      name: saveName.trim(),
      mode: valuationMode,
      inputs: { ...inputs },
      date: new Date().toISOString()
    };
    const updated = [...savedCalculations, newSave];
    setSavedCalculations(updated);
    localStorage.setItem('investing_life_saved_calcs', JSON.stringify(updated));
    setIsSaveModalOpen(false);
    setSaveName('');
  };

  const handleLoadCalculation = (calc: SavedCalc) => {
    setInputs(calc.inputs as any);
    setIsLoadModalOpen(false);
  };

  const handleDeleteCalculation = (id: string) => {
    const updated = savedCalculations.filter(c => c.id !== id);
    setSavedCalculations(updated);
    localStorage.setItem('investing_life_saved_calcs', JSON.stringify(updated));
  };

  // Sync initial state
  useEffect(() => {
    setInputs(recommendedParams);
    setLocks({ 
      rf: false, beta: false, erp: false, roe: false, payout: false, d1: false,
      g1: false, n: false, g2: false, d0: false, g: false, ke: false 
    });
    setJustifications(initialJustifications);
  }, [recommendedParams]);

  // --- HANDLERS ---
  const handleInputChange = (key: keyof typeof inputs, value: number) => {
    setInputs(prev => {
      const next = { ...prev, [key]: value };
      if ((key === 'roe' || key === 'payout') && !locks.g) {
        const ret = 1 - (next.payout / 100);
        const gEst = (next.roe / 100) * ret;
        next.g = Number((gEst * 100).toFixed(2));
      }
      if ((key === 'rf' || key === 'beta' || key === 'erp') && !locks.ke) {
        next.ke = Number((next.rf + next.beta * next.erp).toFixed(2));
      }
      return next;
    });
  };

  const toggleLock = (key: keyof typeof locks) => {
    setLocks(prev => {
      const nextLocks = { ...prev, [key]: !prev[key] };
      // If unlocking g, recalculate it immediately to sync
      if (key === 'g' && !nextLocks.g) {
        setInputs(prevInputs => {
          const ret = 1 - (prevInputs.payout / 100);
          const gEst = (prevInputs.roe / 100) * ret;
          return {
            ...prevInputs,
            g: Number((gEst * 100).toFixed(2))
          };
        });
      }
      // If unlocking ke, recalculate it immediately to sync
      if (key === 'ke' && !nextLocks.ke) {
        setInputs(prevInputs => {
          return {
            ...prevInputs,
            ke: Number((prevInputs.rf + prevInputs.beta * prevInputs.erp).toFixed(2))
          };
        });
      }
      return nextLocks;
    });
  };

  const handleReset = () => {
    setInputs(recommendedParams);
    setLocks({ 
      rf: false, beta: false, erp: false, roe: false, payout: false, d1: false,
      g1: false, n: false, g2: false, d0: false, g: false, ke: false 
    });
    setJustifications(initialJustifications);
  };

  const updateJustificationText = (key: keyof typeof initialJustifications, text: string) => {
    setJustifications(prev => ({
      ...prev,
      [key]: { ...prev[key], text }
    }));
  };

  const toggleJustification = (key: keyof typeof initialJustifications) => {
    setJustifications(prev => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active }
    }));
  };

  // --- ENGINE DE CÁLCULO ---
  const calc = useMemo(() => {
    // k is inputs.ke (which is either manually written or computed from CAPM in real-time)
    const k = inputs.ke / 100;
    const kPerc = inputs.ke;

    if (valuationMode === 'GORDON') {
      const gPerc = inputs.g;
      const g = gPerc / 100;
      const isValid = k > g;
      
      let p0 = 0;
      if (isValid) {
        p0 = inputs.d1 / (k - g);
      }

      const chartData = [];
      let currentD = inputs.d1;
      for (let year = 1; year <= 10; year++) {
        chartData.push({ year: `Ano ${year}`, dividendo: Number(currentD.toFixed(2)) });
        currentD = currentD * (1 + g);
      }

      return { kPerc, gPerc, isValid, p0, chartData, vpEstagio1: 0, vpTV: 0 };
    } else {
      // VARIADO MODE (n-Stage Growth Model)
      const g1 = inputs.g1 / 100;
      const g2 = inputs.g2 / 100;
      const n = inputs.n; // Dynamic duration based on input

      const isValid = k > g2; // Regra de negócio: Custo de Capital deve ser maior que Crescimento Perpétuo
      
      let p0 = 0;
      let vpEstagio1 = 0;
      let vpTV = 0;
      const chartData = [];
      
      if (isValid) {
        // Use exact compound formula (matches what's shown in step-by-step display)
        const g1Dec = g1;   // already in decimal
        const g2Dec = g2;   // already in decimal

        // Estágio 1 (Crescimento Acelerado) - usando fórmula de potência exata
        for (let t = 1; t <= n; t++) {
          const dt = inputs.d0 * Math.pow(1 + g1Dec, t); // DIV_t = D0 * (1+g1)^t
          const pvDt = dt / Math.pow(1 + k, t);
          vpEstagio1 += pvDt;
          chartData.push({ year: `Ano ${t}`, dividendo: Number(dt.toFixed(4)) });
        }

        // Estágio 2 (Perpetuidade) - DIV_N exato por potência, depois Gordon
        const divN = inputs.d0 * Math.pow(1 + g1Dec, n); // DIV_N exacto
        const dNPlus1 = divN * (1 + g2Dec);              // DIV_(N+1)
        const tvN = dNPlus1 / (k - g2Dec);               // P_N = Gordon
        vpTV = tvN / Math.pow(1 + k, n);                 // VP(P_N)
        
        p0 = vpEstagio1 + vpTV;
        
        // Projetar +5 anos no gráfico para ilustrar a perpetuidade
        let currentDStage2 = dNPlus1;
        for (let t = n + 1; t <= n + 5; t++) {
          chartData.push({ year: `Ano ${t}`, dividendo: Number(currentDStage2.toFixed(4)) });
          currentDStage2 = currentDStage2 * (1 + g2Dec);
        }
      }

      return { kPerc, gPerc: inputs.g2, isValid, p0, chartData, vpEstagio1, vpTV };
    }
  }, [inputs, valuationMode]);

  const currencySymbol = stockData?.currency === 'USD' ? '$' : 'R$';

  // LockableInput is defined outside the component to prevent unmounting and focus loss

  return (
    <>
    <div className="space-y-8 animate-fadeIn print:hidden">
      {/* ═══════════════════════════════════════════════ */}
      {/* HEADER CARD                                     */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-xl border border-dark-border shadow-xl" style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(15,18,30,0.98))' }}>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        
        <div className="relative z-10 p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl animate-glow-pulse-soft" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.25)' }}>
                <Calculator className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>Valuation — Fluxos Descontados</h2>
                <p className="text-sm text-dark-textSecondary font-medium mt-0.5">
                  {stockData ? `Analisando: ${stockData.symbol} — ${stockData.longName || stockData.shortName}` : 'Selecione um ativo para análise automática'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Mode Switcher */}
            <div className="flex p-1 rounded-xl select-none shrink-0" style={{ background: 'rgba(9,13,22,0.7)', border: '1px solid rgba(31,41,55,0.8)' }}>
              <button
                onClick={() => setValuationMode('GORDON')}
                className={`px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  valuationMode === 'GORDON'
                    ? 'text-white shadow-premium'
                    : 'text-dark-textSecondary hover:text-dark-textPrimary'
                }`}
                style={valuationMode === 'GORDON' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' } : {}}
              >
                ● Constante (Gordon)
              </button>
              <button
                onClick={() => setValuationMode('VARIADO')}
                className={`px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  valuationMode === 'VARIADO'
                    ? 'text-white shadow-premium'
                    : 'text-dark-textSecondary hover:text-dark-textPrimary'
                }`}
                style={valuationMode === 'VARIADO' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' } : {}}
              >
                ● Variado (2 Estágios)
              </button>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-dark-textSecondary hover:text-dark-textPrimary transition-all cursor-pointer select-none active-scale"
              style={{ background: 'rgba(9,13,22,0.5)', border: '1px solid rgba(31,41,55,0.8)' }}
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── COL 1 & 2: Parameters ─── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Auto-fill Preset Buttons */}
            <div className="flex flex-wrap items-center gap-3 bg-dark-card border border-dark-border p-4 rounded-xl shadow-sm">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer select-none active-scale transition-all text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Cálculo
              </button>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLoadModalOpen(!isLoadModalOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer select-none active-scale transition-all text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Carregar Salvos ({savedCalculations.filter(c => c.mode === valuationMode).length})
                </button>

                {/* DROPDOWN: Carregar Cálculo */}
                {isLoadModalOpen && (
                  <>
                    {/* Overlay invisível para fechar ao clicar fora */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsLoadModalOpen(false)} />
                    
                    <div className="absolute top-full left-0 mt-3 z-50 w-[320px] bg-dark-card/80 backdrop-blur-md border border-dark-border rounded-xl shadow-premium overflow-hidden flex flex-col max-h-[50vh] animate-fadeIn">
                      <div className="flex justify-between items-center p-4 border-b border-dark-border/50">
                        <h3 className="text-sm font-bold text-dark-textPrimary" style={{ fontFamily: 'Outfit, sans-serif' }}>Meus Cálculos Salvos</h3>
                        <button onClick={() => setIsLoadModalOpen(false)} className="text-dark-textSecondary hover:text-dark-textPrimary transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4 overflow-y-auto space-y-2 flex-1 no-scrollbar">
                        {savedCalculations.filter(c => c.mode === valuationMode).length === 0 ? (
                          <div className="text-center py-6 text-dark-textSecondary text-xs">
                            Nenhum cálculo salvo.
                          </div>
                        ) : (
                          savedCalculations.filter(c => c.mode === valuationMode).map(calc => (
                            <div key={calc.id} className="flex items-center justify-between p-3 bg-dark-bg/60 border border-dark-border/50 rounded-xl hover:border-brand-primary/50 transition-colors group cursor-pointer" onClick={() => handleLoadCalculation(calc)}>
                              <div className="flex-1 min-w-0 pr-3">
                                <h4 className="text-xs font-bold text-dark-textPrimary truncate">{calc.name}</h4>
                                <span className="text-[10px] text-dark-textSecondary mt-0.5 block">
                                  {new Date(calc.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteCalculation(calc.id); }} className="p-2 text-dark-textSecondary hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors shrink-0" title="Excluir">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <span className="text-[10px] text-dark-textSecondary ml-auto flex items-center gap-1">
                <Lock className="w-3 h-3" /> Valores com cadeado não serão afetados
              </span>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl shadow-premium overflow-hidden">
              <div className="px-6 py-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid rgba(31,41,55,0.6)', background: 'linear-gradient(90deg, rgba(99,102,241,0.04), transparent)' }}>
                <div className="p-1.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <Sliders className="w-4 h-4 text-brand-purple" />
                </div>
                <h3 className="text-sm font-black text-dark-textPrimary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {valuationMode === 'GORDON' ? 'Parâmetros da Fórmula de Gordon' : 'Parâmetros do Crescimento Variado'}
                </h3>
              </div>

              <div className="p-6 space-y-7">

                {/* ── Bloco A: CAPM ── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-brand-purple" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>A</span>
                    <span className="text-sm font-extrabold text-brand-purple uppercase tracking-wider">Variáveis do CAPM (k)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <LockableInput label="Rf (Livre Risco)" value={inputs.rf} min={0} max={25} step={0.1} unit="%" isLocked={locks.rf} onToggleLock={() => toggleLock('rf')} onChange={(val) => handleInputChange('rf', val)} tooltip="Taxa Livre de Risco" />
                    <LockableInput label="Beta (β)" value={inputs.beta} min={0} max={4.0} step={0.05} unit="" isLocked={locks.beta} onToggleLock={() => toggleLock('beta')} onChange={(val) => handleInputChange('beta', val)} tooltip="Volatilidade do Ativo vs Mercado" />
                    <LockableInput label="ERP (Prêmio de Risco)" value={inputs.erp} min={0} max={15} step={0.05} unit="%" isLocked={locks.erp} onToggleLock={() => toggleLock('erp')} onChange={(val) => handleInputChange('erp', val)} tooltip="Equity Risk Premium" />
                  </div>
                </div>

                {valuationMode === 'GORDON' ? (
                  <>
                    {/* ── Bloco B: Fundamentos ── */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-brand-primary" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>B</span>
                        <span className="text-sm font-extrabold text-brand-primary uppercase tracking-wider">Variáveis Fundamentais (g)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <LockableInput label="ROE" value={inputs.roe} min={0} max={60} step={0.5} unit="%" isLocked={locks.roe} onToggleLock={() => toggleLock('roe')} onChange={(val) => handleInputChange('roe', val)} tooltip="Return on Equity" disabled={locks.g} disableLock={locks.g} statusText={locks.g ? "Inativo (g Manual)" : undefined} />
                        <LockableInput label="Payout Ratio" value={inputs.payout} min={0} max={100} step={1} unit="%" isLocked={locks.payout} onToggleLock={() => toggleLock('payout')} onChange={(val) => handleInputChange('payout', val)} tooltip="Porcentagem do Lucro Distribuída" disabled={locks.g} disableLock={locks.g} statusText={locks.g ? "Inativo (g Manual)" : undefined} />
                        <LockableInput label="Taxa de Crescimento (g)" value={inputs.g} min={0} max={15} step={0.05} unit="%" isLocked={locks.g} onToggleLock={() => toggleLock('g')} onChange={(val) => handleInputChange('g', val)} tooltip="Taxa de Crescimento Constante. Destrave para calcular automaticamente." disabled={!locks.g} disableLock={false} statusText={locks.g ? "Manual" : "Calculado"} />
                      </div>
                    </div>

                    {/* ── Bloco C: Fluxo de Caixa ── */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-emerald-400" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>C</span>
                        <span className="text-sm font-extrabold text-emerald-400 uppercase tracking-wider">Variável de Fluxo (Base)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LockableInput label="Dividendo Esperado (D1)" value={inputs.d1} min={0} max={100} step={0.05} unit={currencySymbol} isLocked={locks.d1} onToggleLock={() => toggleLock('d1')} onChange={(val) => handleInputChange('d1', val)} tooltip="Dividendo Projetado para o Ano 1" />
                        <LockableInput label="Custo de Capital (R ou Ke)" value={inputs.ke} min={0} max={30} step={0.05} unit="%" isLocked={locks.ke} onToggleLock={() => toggleLock('ke')} onChange={(val) => handleInputChange('ke', val)} tooltip="Custo de Capital Exigido (R ou Ke). Destrave para usar CAPM." disabled={!locks.ke} disableLock={false} statusText={locks.ke ? "Manual" : "Calculado"} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* ── Bloco B: Parâmetros Crescimento Variado (DIV0, n, g1, g2, Ke) ── */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-brand-primary" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>B</span>
                        <span className="text-sm font-extrabold text-brand-primary uppercase tracking-wider">Variáveis de Entrada ({inputs.n} Anos + Perpétuo)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LockableInput label="Dividendo Atual (DIV0)" value={inputs.d0} min={0} max={100} step={0.05} unit="R$" isLocked={locks.d0} onToggleLock={() => toggleLock('d0')} onChange={(val) => handleInputChange('d0', val)} tooltip="Dividendo atual pago pela ação (DIV0)" />
                        <LockableInput label="Duração Estágio 1 (n)" value={inputs.n} min={1} max={15} step={1} unit="anos" isLocked={locks.n} onToggleLock={() => toggleLock('n')} onChange={(val) => handleInputChange('n', val)} tooltip="Duração do período de crescimento acelerado/anormal (n)" />
                        <LockableInput label={`Cresc. Estágio 1 (g1)`} value={inputs.g1} min={0} max={100} step={0.5} unit="%" isLocked={locks.g1} onToggleLock={() => toggleLock('g1')} onChange={(val) => handleInputChange('g1', val)} tooltip={`Taxa de Crescimento para os próximos ${inputs.n} anos (g1)`} />
                        <LockableInput label="Cresc. Perpétuo (g2)" value={inputs.g2} min={0} max={15} step={0.1} unit="%" isLocked={locks.g2} onToggleLock={() => toggleLock('g2')} onChange={(val) => handleInputChange('g2', val)} tooltip="Taxa constante de crescimento na perpetuidade (g2)" />
                        <LockableInput label="Custo de Capital (R ou Ke)" value={inputs.ke} min={0} max={30} step={0.05} unit="%" isLocked={locks.ke} onToggleLock={() => toggleLock('ke')} onChange={(val) => handleInputChange('ke', val)} tooltip="Custo de Capital Exigido (R ou Ke). Destrave para usar CAPM." disabled={!locks.ke} disableLock={false} statusText={locks.ke ? "Manual" : "Calculado"} />
                      </div>
                    </div>
                  </>
                )}

                {/* ── Bloco de Explicação de Benchmarks ── */}
                <div className="mt-8 bg-dark-bg/40 border border-dark-border/40 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-dark-textSecondary uppercase tracking-widest">Base de Dados & Benchmarks</span>
                  </div>
                  <p className="text-xs text-dark-textSecondary leading-relaxed">
                    O modelo calcula a <strong className="text-dark-textPrimary">Taxa de Desconto (k)</strong> baseado no modelo CAPM utilizando os seguintes referenciais (que podem ser travados 🔒 para usar a sua própria base de pesquisa):
                  </p>
                  <ul className="text-xs text-dark-textSecondary space-y-2 pl-4 list-disc marker:text-brand-purple">
                    <li>
                      <strong className="text-dark-textPrimary">Rf (Taxa Livre de Risco):</strong> Representa o retorno sem risco (ex: Tesouro Direto, taxa Selic ou título do Tesouro IPCA+ de longo prazo).
                    </li>
                    <li>
                      <strong className="text-dark-textPrimary">ERP (Prêmio de Risco do Mercado - Damodaran):</strong> Representa a taxa excedente que o mercado exige em relação à taxa livre de risco (Rm - Rf), baseada no histórico de risco país do site de Aswath Damodaran.
                    </li>
                    <li>
                      <strong className="text-dark-textPrimary">Destravamento:</strong> Você pode ajustar e <strong className="text-brand-danger">travar (🔒)</strong> esses índices nos blocos acima para garantir que sua pesquisa de CDI/IPCA não seja sobrescrita pelos cenários automáticos (Otimista/Pessimista).
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cards de Passo a Passo do Crescimento Variado */}
            {valuationMode === 'VARIADO' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-extrabold text-dark-textPrimary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Demonstração Passo a Passo do Cálculo ({inputs.n} Anos + Perpetuidade)
                  </h3>
                </div>

                {!calc.isValid ? (
                  <div className="bg-brand-danger/10 border-2 border-brand-danger/30 rounded-xl p-5 shadow-premium">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-brand-danger shrink-0" />
                      <div>
                        <h4 className="text-xs font-black text-brand-danger uppercase tracking-wide">Premissa Inválida para o Passo a Passo</h4>
                        <p className="text-2xs text-dark-textSecondary mt-1 leading-relaxed">
                          O Custo de Capital (R ou Ke) deve ser estritamente maior que a Taxa de Crescimento na Perpetuidade (g2) para que o cálculo possa ser realizado.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Passo 1 Card */}
                    <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-premium space-y-4">
                      <div className="flex items-center gap-2 border-b border-dark-border/40 pb-3">
                        <span className="w-6 h-6 rounded-md flex items-center justify-center text-2xs font-black text-brand-purple bg-brand-purple/10 border border-brand-purple/20">1</span>
                        <h4 className="text-xs font-black text-dark-textPrimary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Passo 1: Projeção dos Dividendos (Anos 1 a {inputs.n})
                        </h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-dark-bg/40 p-3 rounded-lg border border-dark-border/30">
                          <p className="text-xs font-bold text-dark-textSecondary font-mono">Fórmula: DIV_n = DIV_anterior * (1 + g1)</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {Array.from({ length: inputs.n }).map((_, idx) => {
                            const year = idx + 1;
                            const prevVal = year === 1 ? inputs.d0 : inputs.d0 * Math.pow(1 + inputs.g1 / 100, year - 1);
                            const val = inputs.d0 * Math.pow(1 + inputs.g1 / 100, year);
                            return (
                              <div key={year} className="bg-dark-bg/60 p-4 rounded-xl border border-dark-border/50">
                                <span className="text-[10px] font-bold text-dark-textSecondary uppercase block">Ano {year} (DIV_{year})</span>
                                <span className="text-2xs font-bold text-dark-textSecondary block mt-1">
                                  {prevVal.toFixed(4)} × (1 + {inputs.g1.toFixed(4)}%)
                                </span>
                                <span className="text-base font-black text-emerald-400 block mt-0.5">
                                  = {val.toFixed(4)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Passo 2 Card */}
                    <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-premium space-y-4">
                      <div className="flex items-center gap-2 border-b border-dark-border/40 pb-3">
                        <span className="w-6 h-6 rounded-md flex items-center justify-center text-2xs font-black text-brand-primary bg-brand-primary/10 border border-brand-primary/20">2</span>
                        <h4 className="text-xs font-black text-dark-textPrimary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Passo 2: Cálculo da Perpetuidade (P_{inputs.n}) no Ano {inputs.n}
                        </h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-dark-bg/40 p-3 rounded-lg border border-dark-border/30">
                          <p className="text-xs font-bold text-dark-textSecondary font-mono">Fórmula de Gordon: P_{inputs.n} = [DIV_{inputs.n} * (1 + g2)] / (R - g2)</p>
                        </div>
                        
                        <div className="bg-dark-bg/60 p-4 rounded-xl border border-dark-border/50 space-y-3">
                          {(() => {
                            const g1Dec = inputs.g1 / 100;
                            const g2Dec = inputs.g2 / 100;
                            const kDec  = inputs.ke  / 100;
                            const divN  = inputs.d0 * Math.pow(1 + g1Dec, inputs.n); // full precision
                            const pN    = (divN * (1 + g2Dec)) / (kDec - g2Dec);     // full precision
                            return (
                              <>
                                <div>
                                  <span className="text-[10px] font-bold text-dark-textSecondary uppercase block">Valores Substituídos (4 casas decimais)</span>
                                  <p className="text-xs font-bold text-dark-textPrimary mt-1 font-mono">
                                    P_{inputs.n} = [{divN.toFixed(4)} × (1 + {(inputs.g2).toFixed(4)}%)] / ({(inputs.ke).toFixed(4)}% - {(inputs.g2).toFixed(4)}%)
                                  </p>
                                  <p className="text-2xs text-dark-textSecondary mt-1 font-mono">
                                    = [{divN.toFixed(4)} × {(1 + g2Dec).toFixed(6)}] / {(kDec - g2Dec).toFixed(6)}
                                  </p>
                                  <p className="text-2xs text-dark-textSecondary mt-0.5 font-mono">
                                    = {(divN * (1 + g2Dec)).toFixed(4)} / {(kDec - g2Dec).toFixed(6)}
                                  </p>
                                </div>
                                
                                <div className="pt-2 border-t border-dark-border/30 flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-dark-textSecondary uppercase">Valor de Venda Terminal (P_{inputs.n})</span>
                                  <span className="text-lg font-black text-brand-primary">
                                    {formatCurrency(pN)}
                                    <span className="text-xs font-mono text-dark-textSecondary ml-2">({pN.toFixed(4)})</span>
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Passo 3 Card */}
                    <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-premium space-y-4">
                      <div className="flex items-center gap-2 border-b border-dark-border/40 pb-3">
                        <span className="w-6 h-6 rounded-md flex items-center justify-center text-2xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">3</span>
                        <h4 className="text-xs font-black text-dark-textPrimary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Passo 3: Valor Presente (Preço Justo P₀)
                        </h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-dark-bg/40 p-3 rounded-lg border border-dark-border/30">
                          <p className="text-xs font-bold text-dark-textSecondary font-mono leading-relaxed">
                            Fórmula: P₀ = {Array.from({ length: inputs.n }).map((_, i) => `[DIV_${i+1} / (1+R)^${i+1}]`).join(' + ')} + [P_{inputs.n} / (1+R)^{inputs.n}]
                          </p>
                        </div>

                        <div className="space-y-2.5">
                          {(() => {
                            const d0 = inputs.d0;
                            const g1 = inputs.g1 / 100;
                            const g2 = inputs.g2 / 100;
                            const r = inputs.ke / 100;
                            const n = inputs.n;

                            let vpSum = 0;
                            const steps = [];

                            // Estágio 1 - usa potência exata (consistente com cálculo principal)
                            for (let t = 1; t <= n; t++) {
                              const dt = d0 * Math.pow(1 + g1, t); // potência exata, sem acumulação
                              const vpDt = dt / Math.pow(1 + r, t);
                              vpSum += vpDt;
                              steps.push({
                                label: `VP de DIV_${t}`,
                                valStr: `${dt.toFixed(4)} / ${Math.pow(1 + r, t).toFixed(6)}`,
                                vp: vpDt
                              });
                            }

                            // Estágio 2 - usa potência exata
                            const divN = d0 * Math.pow(1 + g1, n); // full precision
                            const pN = (divN * (1 + g2)) / (r - g2);
                            const vpPN = pN / Math.pow(1 + r, n);
                            vpSum += vpPN;
                            steps.push({
                              label: `VP de P_${n} (TV)`,
                              valStr: `${pN.toFixed(4)} / ${Math.pow(1 + r, n).toFixed(6)}`,
                              vp: vpPN
                            });

                            return (
                              <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                  {steps.map((st, i) => (
                                    <div key={i} className="bg-dark-bg/55 p-3 rounded-lg border border-dark-border/40">
                                      <span className="text-[9px] font-bold text-dark-textSecondary uppercase block">{st.label}</span>
                                      <span className="text-[10px] text-dark-textSecondary block mt-1">{st.valStr}</span>
                                      <span className="text-sm font-extrabold text-dark-textPrimary block mt-0.5">{formatCurrency(st.vp)}</span>
                                    </div>
                                  ))}
                                </div>

                                <div className="bg-dark-bg/60 p-4 rounded-xl border border-dark-border/50 space-y-2 mt-4">
                                  <span className="text-[10px] font-bold text-dark-textSecondary uppercase block">Soma de Valores Descontados</span>
                                  <p className="text-xs font-bold text-dark-textSecondary leading-relaxed">
                                    P₀ = {steps.map(st => formatCurrency(st.vp)).join(' + ')}
                                  </p>
                                </div>

                                <div className="flex flex-col border-2 border-emerald-500/20 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.15)] mt-4">
                                  {/* PARTE SUPERIOR: COMPARAÇÃO (INPUT) */}
                                  <div className="bg-emerald-500/10 p-5 border-b border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <span className="text-sm font-black text-emerald-400 uppercase tracking-widest text-center sm:text-left">
                                      Comparação com Cotação de Mercado
                                    </span>
                                    <div className="flex items-center justify-center bg-dark-bg/80 border border-emerald-500/30 focus-within:border-emerald-400 rounded-lg px-4 py-2 w-full sm:max-w-[220px] transition-colors">
                                      <span className="text-emerald-400/70 text-lg font-mono mr-2">{currencySymbol}</span>
                                      <input 
                                        type="number" step="0.01" min="0" 
                                        value={currentPriceInput}
                                        onChange={(e) => setCurrentPriceInput(e.target.value)}
                                        placeholder="Preço Atual"
                                        className="w-full bg-transparent text-center font-mono text-lg font-bold outline-none border-none p-0 focus:ring-0 focus:outline-none text-emerald-400 placeholder:text-emerald-400/30"
                                      />
                                    </div>
                                  </div>

                                  {/* PARTE INFERIOR: RESULTADOS (P0 e STATUS) */}
                                  <div className="flex flex-col md:flex-row items-stretch">
                                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-emerald-500/5">
                                      <span className="text-xs font-black text-emerald-400/80 uppercase tracking-widest mb-2">
                                        Preço Justo Final Calculado (P₀)
                                      </span>
                                      <span className="text-5xl font-black text-emerald-400 font-mono drop-shadow-sm">
                                        {formatCurrency(vpSum)}
                                      </span>
                                    </div>

                                    {(() => {
                                      const currentPriceNum = parseFloat(currentPriceInput);
                                      if (!isNaN(currentPriceNum) && currentPriceNum > 0) {
                                        // Upside Potential: quanto a ação pode subir para chegar no preço justo
                                        const upside = ((vpSum - currentPriceNum) / currentPriceNum) * 100;
                                        
                                        let bgColor = 'bg-dark-card border-t md:border-t-0 md:border-l border-emerald-500/20';
                                        let textColor = 'text-brand-primary';
                                        let statusText = 'NO PREÇO JUSTO';
                                        let confetti = '';

                                        if (upside >= 15) {
                                          bgColor = 'bg-[radial-gradient(circle,_rgba(16,185,129,0.35)_0%,_transparent_100%)] border-t md:border-t-0 md:border-l border-emerald-500/30';
                                          textColor = 'text-emerald-400 drop-shadow-sm';
                                          statusText = 'OPORTUNIDADE (DESCONTADA)';
                                          confetti = '🎊 🎉 🎊';
                                        } else if (upside <= -15) {
                                          bgColor = 'bg-[radial-gradient(circle,_rgba(136,19,55,0.4)_0%,_transparent_100%)] border-t md:border-t-0 md:border-l border-rose-900/40';
                                          textColor = 'text-rose-400 drop-shadow-sm';
                                          statusText = 'CARA (ÁGIO ALTO)';
                                        } else if (upside > 0 && upside < 15) {
                                          bgColor = 'bg-[radial-gradient(circle,_rgba(234,179,8,0.25)_0%,_transparent_100%)] border-t md:border-t-0 md:border-l border-yellow-500/20';
                                          textColor = 'text-yellow-500 drop-shadow-sm';
                                          statusText = 'MARGEM CURTA (DESCONTO PEQUENO)';
                                        } else if (upside < 0 && upside > -15) {
                                          bgColor = 'bg-[radial-gradient(circle,_rgba(234,179,8,0.25)_0%,_transparent_100%)] border-t md:border-t-0 md:border-l border-yellow-500/20';
                                          textColor = 'text-yellow-500 drop-shadow-sm';
                                          statusText = 'LEVEMENTE CARA (ÁGIO PEQUENO)';
                                        }

                                        return (
                                          <div className={`relative overflow-hidden flex-1 p-8 flex flex-col items-center justify-center text-center transition-all duration-500 ${bgColor}`}>
                                            {upside <= -15 && (
                                              <AlertTriangle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] text-rose-950/40 w-44 h-44 pointer-events-none" strokeWidth={3} />
                                            )}
                                            {confetti && <div className="relative z-10 text-3xl animate-bounce mb-3">{confetti}</div>}
                                            <span className={`relative z-10 text-lg font-black uppercase tracking-wider mb-2 ${textColor}`}>
                                              {statusText}
                                            </span>
                                            <span className={`relative z-10 text-4xl font-black font-mono ${textColor}`}>
                                              {upside > 0 ? '+' : ''}{upside.toFixed(2)}%
                                            </span>
                                            <span className={`relative z-10 text-[10px] font-bold uppercase mt-1 opacity-70 ${textColor}`}>
                                              {upside > 0 ? 'Potencial de Valorização' : 'Risco de Queda'}
                                            </span>
                                          </div>
                                        );
                                      }
                                      return (
                                        <div className="flex-1 p-8 flex items-center justify-center text-center bg-dark-bg/40 border-t md:border-t-0 md:border-l border-emerald-500/20">
                                          <p className="text-sm text-emerald-400/40 italic font-medium">Insira a cotação atual acima para avaliar o status.</p>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cards de Passo a Passo do Crescimento Constante (Gordon) */}
            {valuationMode === 'GORDON' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-extrabold text-dark-textPrimary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Demonstração Passo a Passo do Cálculo (Crescimento Constante)
                  </h3>
                </div>

                {!calc.isValid ? (
                  <div className="bg-brand-danger/10 border-2 border-brand-danger/30 rounded-xl p-5 shadow-premium">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-brand-danger shrink-0" />
                      <div>
                        <h4 className="text-xs font-black text-brand-danger uppercase tracking-wide">Premissa Inválida para o Passo a Passo</h4>
                        <p className="text-2xs text-dark-textSecondary mt-1 leading-relaxed">
                          O Custo de Capital (k) deve ser estritamente maior que a Taxa de Crescimento Constante (g) para que o modelo de Gordon seja aplicável.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-premium space-y-4">
                      <div className="flex items-center gap-2 border-b border-dark-border/40 pb-3">
                        <span className="w-6 h-6 rounded-md flex items-center justify-center text-2xs font-black text-brand-primary bg-brand-primary/10 border border-brand-primary/20">1</span>
                        <h4 className="text-xs font-black text-dark-textPrimary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Passo 1: Aplicação da Fórmula de Gordon
                        </h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-dark-bg/40 p-3 rounded-lg border border-dark-border/30">
                          <p className="text-xs font-bold text-dark-textSecondary font-mono">Fórmula de Gordon: P₀ = D₁ / (k - g)</p>
                        </div>
                        
                        <div className="bg-dark-bg/60 p-4 rounded-xl border border-dark-border/50 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-dark-bg/55 p-3 rounded-lg border border-dark-border/40">
                              <span className="text-[9px] font-bold text-dark-textSecondary uppercase block">Dividendo Projetado (D₁)</span>
                              <span className="text-sm font-extrabold text-dark-textPrimary block mt-0.5">{formatCurrency(inputs.d1)}</span>
                            </div>
                            <div className="bg-dark-bg/55 p-3 rounded-lg border border-dark-border/40">
                              <span className="text-[9px] font-bold text-dark-textSecondary uppercase block">Custo de Capital (k)</span>
                              <span className="text-sm font-extrabold text-brand-danger block mt-0.5">{calc.kPerc.toFixed(4)}%</span>
                            </div>
                            <div className="bg-dark-bg/55 p-3 rounded-lg border border-dark-border/40">
                              <span className="text-[9px] font-bold text-dark-textSecondary uppercase block">Crescimento Constante (g)</span>
                              <span className="text-sm font-extrabold text-brand-success block mt-0.5">{calc.gPerc.toFixed(4)}%</span>
                            </div>
                          </div>

                          <div className="bg-dark-bg/60 p-4 rounded-xl border border-dark-border/50 space-y-2 mt-4">
                            <span className="text-[10px] font-bold text-dark-textSecondary uppercase block">Resolução Matemática</span>
                            <p className="text-xs font-bold text-dark-textSecondary leading-relaxed font-mono">
                              P₀ = {formatCurrency(inputs.d1)} / ({(calc.kPerc / 100).toFixed(4)} - {(calc.gPerc / 100).toFixed(4)})
                            </p>
                            <p className="text-xs font-bold text-dark-textSecondary leading-relaxed font-mono">
                              P₀ = {formatCurrency(inputs.d1)} / {((calc.kPerc - calc.gPerc) / 100).toFixed(6)}
                            </p>
                          </div>

                          <div className="flex flex-col border-2 border-emerald-500/20 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.15)] mt-4">
                            {/* PARTE SUPERIOR: COMPARAÇÃO (INPUT) */}
                            <div className="bg-emerald-500/10 p-5 border-b border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                              <span className="text-sm font-black text-emerald-400 uppercase tracking-widest text-center sm:text-left">
                                Comparação com Cotação de Mercado
                              </span>
                              <div className="flex items-center justify-center bg-dark-bg/80 border border-emerald-500/30 focus-within:border-emerald-400 rounded-lg px-4 py-2 w-full sm:max-w-[220px] transition-colors">
                                <span className="text-emerald-400/70 text-lg font-mono mr-2">{currencySymbol}</span>
                                <input 
                                  type="number" step="0.01" min="0" 
                                  value={currentPriceInput}
                                  onChange={(e) => setCurrentPriceInput(e.target.value)}
                                  placeholder="Preço Atual"
                                  className="w-full bg-transparent text-center font-mono text-lg font-bold outline-none border-none p-0 focus:ring-0 focus:outline-none text-emerald-400 placeholder:text-emerald-400/30"
                                />
                              </div>
                            </div>

                            {/* PARTE INFERIOR: RESULTADOS (P0 e STATUS) */}
                            <div className="flex flex-col md:flex-row items-stretch">
                              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-emerald-500/5">
                                <span className="text-xs font-black text-emerald-400/80 uppercase tracking-widest mb-2">
                                  Preço Justo Final Calculado (P₀)
                                </span>
                                <span className="text-5xl font-black text-emerald-400 font-mono drop-shadow-sm">
                                  {formatCurrency(calc.p0)}
                                </span>
                              </div>

                              {(() => {
                                      const currentPriceNum = parseFloat(currentPriceInput);
                                      if (!isNaN(currentPriceNum) && currentPriceNum > 0) {
                                        // Upside Potential: quanto a ação pode subir para chegar no preço justo
                                        const upside = ((calc.p0 - currentPriceNum) / currentPriceNum) * 100;
                                        
                                        let bgColor = 'bg-dark-card border-t md:border-t-0 md:border-l border-emerald-500/20';
                                        let textColor = 'text-brand-primary';
                                        let statusText = 'NO PREÇO JUSTO';
                                        let confetti = '';

                                        if (upside >= 15) {
                                          bgColor = 'bg-[radial-gradient(circle,_rgba(16,185,129,0.35)_0%,_transparent_100%)] border-t md:border-t-0 md:border-l border-emerald-500/30';
                                          textColor = 'text-emerald-400 drop-shadow-sm';
                                          statusText = 'OPORTUNIDADE (DESCONTADA)';
                                          confetti = '🎊 🎉 🎊';
                                        } else if (upside <= -15) {
                                          bgColor = 'bg-[radial-gradient(circle,_rgba(136,19,55,0.4)_0%,_transparent_100%)] border-t md:border-t-0 md:border-l border-rose-900/40';
                                          textColor = 'text-rose-400 drop-shadow-sm';
                                          statusText = 'CARA (ÁGIO ALTO)';
                                        } else if (upside > 0 && upside < 15) {
                                          bgColor = 'bg-[radial-gradient(circle,_rgba(234,179,8,0.25)_0%,_transparent_100%)] border-t md:border-t-0 md:border-l border-yellow-500/20';
                                          textColor = 'text-yellow-500 drop-shadow-sm';
                                          statusText = 'MARGEM CURTA (DESCONTO PEQUENO)';
                                        } else if (upside < 0 && upside > -15) {
                                          bgColor = 'bg-[radial-gradient(circle,_rgba(234,179,8,0.25)_0%,_transparent_100%)] border-t md:border-t-0 md:border-l border-yellow-500/20';
                                          textColor = 'text-yellow-500 drop-shadow-sm';
                                          statusText = 'LEVEMENTE CARA (ÁGIO PEQUENO)';
                                        }

                                        return (
                                          <div className={`relative overflow-hidden flex-1 p-8 flex flex-col items-center justify-center text-center transition-all duration-500 ${bgColor}`}>
                                            {upside <= -15 && (
                                              <AlertTriangle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] text-rose-950/40 w-44 h-44 pointer-events-none" strokeWidth={3} />
                                            )}
                                            {confetti && <div className="relative z-10 text-3xl animate-bounce mb-3">{confetti}</div>}
                                            <span className={`relative z-10 text-lg font-black uppercase tracking-wider mb-2 ${textColor}`}>
                                              {statusText}
                                            </span>
                                            <span className={`relative z-10 text-4xl font-black font-mono ${textColor}`}>
                                              {upside > 0 ? '+' : ''}{upside.toFixed(2)}%
                                            </span>
                                            <span className={`relative z-10 text-[10px] font-bold uppercase mt-1 opacity-70 ${textColor}`}>
                                              {upside > 0 ? 'Potencial de Valorização' : 'Risco de Queda'}
                                            </span>
                                          </div>
                                        );
                                      }
                                      return (
                                        <div className="flex-1 p-8 flex items-center justify-center text-center bg-dark-bg/40 border-t md:border-t-0 md:border-l border-emerald-500/20">
                                          <p className="text-sm text-emerald-400/40 italic font-medium">Insira a cotação atual acima para avaliar o status.</p>
                                        </div>
                                      );
                                    })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bloco de Justificativas Editáveis */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-premium space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-dark-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
                    <FileText className="w-4 h-4 text-brand-primary" />
                  </span>
                  <h3 className="text-sm font-black text-dark-textPrimary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Notas & Justificativas para o PDF
                  </h3>
                </div>
                <span className="text-[10px] text-dark-textSecondary font-bold bg-dark-bg/60 border border-dark-border/50 px-2 py-0.5 rounded">
                  Editável
                </span>
              </div>
              <p className="text-2xs text-dark-textSecondary leading-relaxed">
                Adicione notas justificando as taxas adotadas abaixo. Elas serão incluídas no memorial de cálculo do relatório impresso. Use o botão <strong className="text-brand-danger">X</strong> para desativar e excluir uma nota do PDF.
              </p>
              
              <div className="space-y-4">
                {Object.entries(justifications)
                  .filter(([key]) => {
                    // Filter variables based on selected valuation mode to keep it relevant
                    if (valuationMode === 'GORDON') {
                      return ['rf', 'beta', 'erp', 'k', 'roe', 'payout', 'g'].includes(key);
                    } else {
                      return ['d0', 'g1', 'g2', 'k', 'rf', 'beta', 'erp'].includes(key);
                    }
                  })
                  .map(([key, item]) => {
                    const justificationKey = key as keyof typeof initialJustifications;
                    // Get current value to show next to label
                    let currentValStr = '';
                    if (justificationKey === 'rf') currentValStr = `${inputs.rf.toFixed(2)}%`;
                    else if (justificationKey === 'beta') currentValStr = inputs.beta.toFixed(2);
                    else if (justificationKey === 'erp') currentValStr = `${inputs.erp.toFixed(2)}%`;
                    else if (justificationKey === 'k') currentValStr = `${calc.kPerc.toFixed(2)}%`;
                    else if (justificationKey === 'roe') currentValStr = `${inputs.roe.toFixed(2)}%`;
                    else if (justificationKey === 'payout') currentValStr = `${inputs.payout.toFixed(2)}%`;
                    else if (justificationKey === 'g') currentValStr = `${inputs.g.toFixed(2)}%`;
                    else if (justificationKey === 'd0') currentValStr = formatCurrency(inputs.d0);
                    else if (justificationKey === 'g1') currentValStr = `${inputs.g1.toFixed(2)}%`;
                    else if (justificationKey === 'g2') currentValStr = `${inputs.g2.toFixed(2)}%`;

                    return (
                      <div key={key} className={`space-y-1.5 transition-all duration-300 ${!item.active ? 'opacity-40' : ''}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-extrabold text-dark-textPrimary flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                            {item.label}
                            <span className="font-mono text-dark-textSecondary text-[10px] ml-1 bg-dark-bg/60 border border-dark-border/40 px-1.5 py-0.2 rounded">
                              {currentValStr}
                            </span>
                          </span>
                          
                          <button
                            onClick={() => toggleJustification(justificationKey)}
                            className={`p-1 rounded text-2xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                              item.active 
                                ? 'bg-brand-danger/10 hover:bg-brand-danger/25 text-brand-danger border border-brand-danger/20' 
                                : 'bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20'
                            }`}
                            title={item.active ? "Remover do relatório" : "Incluir no relatório"}
                            style={{ width: '22px', height: '22px' }}
                          >
                            {item.active ? '✕' : '＋'}
                          </button>
                        </div>
                        
                        <textarea
                          value={item.text}
                          disabled={!item.active}
                          onChange={(e) => updateJustificationText(justificationKey, e.target.value)}
                          placeholder={item.active ? `Justifique o valor de ${currentValStr}...` : "Nota inativa. Clique no '＋' para reativar e imprimir no PDF."}
                          rows={2}
                          className="w-full text-xs bg-dark-bg/60 border border-dark-border/60 rounded-lg p-2.5 outline-none focus:border-brand-purple disabled:bg-dark-bg/20 disabled:border-dark-border/30 disabled:text-dark-textSecondary/40 resize-none font-medium leading-relaxed transition-all duration-300"
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* ─── COL 3: Outputs / Resultados ─── */}
          <div className="space-y-6">
            
            {/* Painel de Resultados Intermediários */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-premium space-y-6">
              <h3 className="text-xs font-extrabold text-dark-textSecondary uppercase tracking-wider text-center border-b border-dark-border/40 pb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Valores Calculados em 2º Plano
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-dark-bg/60 border border-dark-border/50">
                  <span className="text-sm text-dark-textSecondary font-medium">Custo de Cap. (k)</span>
                  <span className="text-lg font-black font-mono text-brand-purple">{calc.kPerc.toFixed(2)}%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-xl bg-dark-bg/60 border border-dark-border/50">
                  <span className="text-sm text-dark-textSecondary font-medium">{valuationMode === 'GORDON' ? 'Taxa de Cresc. (g)' : 'Cresc. Perpétuo (g2)'}</span>
                  <span className="text-lg font-black font-mono text-brand-primary">{calc.gPerc.toFixed(2)}%</span>
                </div>
                
                {valuationMode === 'VARIADO' && calc.isValid && (
                  <>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-dark-bg/60 border border-dark-border/50">
                      <span className="text-sm text-dark-textSecondary font-medium">VP Estágio 1</span>
                      <span className="text-lg font-black font-mono text-emerald-400">{currencySymbol} {calc.vpEstagio1.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-dark-bg/60 border border-dark-border/50">
                      <span className="text-sm text-dark-textSecondary font-medium">VP Perpetuidade (TV)</span>
                      <span className="text-lg font-black font-mono text-emerald-400">{currencySymbol} {calc.vpTV.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Painel de Erro ou Preço Justo */}
            {!calc.isValid ? (
              <div className="bg-brand-danger/10 border-2 border-brand-danger/30 rounded-xl p-6 shadow-xl animate-fadeIn">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-brand-danger/20 flex items-center justify-center border border-brand-danger/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    <AlertTriangle className="w-8 h-8 text-brand-danger" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-brand-danger" style={{ fontFamily: 'Outfit, sans-serif' }}>Erro de Premissa</h3>
                    <p className="text-sm text-dark-textSecondary font-medium leading-relaxed">
                      O Custo de Capital Exigido (k) deve ser <strong className="text-dark-textPrimary">estritamente maior</strong> do que a Taxa de Crescimento Perpétuo ({valuationMode === 'GORDON' ? 'g' : 'g2'}) para que o modelo seja válido.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-dark-bg/50 rounded-lg text-xs font-mono text-dark-textSecondary">
                      k ({calc.kPerc.toFixed(2)}%) ≤ {valuationMode === 'GORDON' ? 'g' : 'g2'} ({calc.gPerc.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl p-1 overflow-hidden group shadow-premium animate-fadeIn">
                {/* Animated border gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-brand-primary to-brand-purple opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-brand-primary to-brand-purple blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
                
                <div className="relative bg-dark-card w-full h-full rounded-[14px] p-6 flex flex-col items-center text-center justify-center gap-3">
                  <h3 className="text-sm font-black text-dark-textSecondary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Preço Justo da Ação (P₀)
                  </h3>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-dark-textSecondary/60">{currencySymbol}</span>
                    <span className="text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-emerald-500 drop-shadow-sm">
                      {calc.p0.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="text-2xs text-dark-textSecondary font-medium mt-2 bg-dark-bg/80 px-3 py-1.5 rounded-lg border border-dark-border">
                    {valuationMode === 'GORDON' ? 'P₀ = D₁ / (k - g)' : 'P₀ = VP(Estágio 1) + VP(Perpetuidade)'}
                  </div>
                </div>
              </div>
            )}

            {/* Glossário Dinâmico */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-premium space-y-4">
              <h3 className="text-xs font-extrabold text-brand-purple uppercase tracking-wider border-b border-dark-border/40 pb-2 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Fundamentação do Modelo
              </h3>
              <div className="space-y-3">
                <div className="bg-dark-bg/40 p-3 rounded-lg border border-dark-border/30">
                  <p className="text-xs text-dark-textPrimary font-bold mb-1">k (Custo de Capital Exigido)</p>
                  <p className="text-2xs text-dark-textSecondary leading-relaxed">
                    Derivado do CAPM (Rf + β * ERP). É o retorno mínimo que o investidor exige para compensar o risco do ativo. Rf representa o Tesouro (Selic), ERP representa o Prêmio de Risco da Bolsa/País de Damodaran e β (Beta) a volatilidade do ativo.
                  </p>
                </div>
                {valuationMode === 'GORDON' ? (
                  <div className="bg-dark-bg/40 p-3 rounded-lg border border-dark-border/30">
                    <p className="text-xs text-dark-textPrimary font-bold mb-1">g (Crescimento Constante)</p>
                    <p className="text-2xs text-dark-textSecondary leading-relaxed">
                      A taxa na qual os dividendos crescerão para sempre. Calculado como ROE * Taxa de Retenção (1 - Payout). Reflete a capacidade da empresa de reinvestir o lucro para gerar crescimento futuro sustentável.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                    <div className="bg-dark-bg/40 p-4 rounded-lg border border-dark-border/30 space-y-2">
                      <p className="text-xs text-brand-purple font-bold">1. O Estágio 1: A "Arrancada" (Crescimento Anormal)</p>
                      <div className="text-2xs text-dark-textSecondary leading-relaxed space-y-2">
                        <p><strong className="text-dark-textPrimary">A Lógica:</strong> Aqui a empresa está em expansão acelerada. O numerador projeta os dividendos crescendo a uma taxa forte (g1) ano após ano. O denominador desconta o valor de cada um desses dividendos pela taxa exigida (k) de volta para o presente.</p>
                        <p><strong className="text-dark-textPrimary">Na prática:</strong> É o somatório puro e simples de fluxos de caixa não uniformes. Em uma planilha, seria o uso direto da função =VPL() para os primeiros {inputs.n} anos.</p>
                      </div>
                    </div>
                    
                    <div className="bg-dark-bg/40 p-4 rounded-lg border border-dark-border/30 space-y-2">
                      <p className="text-xs text-emerald-400 font-bold">2. O Estágio 2: A "Órbita" (Valor Terminal)</p>
                      <div className="text-2xs text-dark-textSecondary leading-relaxed space-y-2">
                        <p><strong className="text-dark-textPrimary">A. Empacotando o infinito:</strong> Quando a empresa atinge a maturidade no ano {inputs.n}, ela passa a crescer a uma taxa constante (g2) para sempre. Esse "pacote" de todos os dividendos futuros somados recebe o nome de Valor Terminal (TV).</p>
                        <p><strong className="text-dark-textPrimary">B. Trazendo para hoje:</strong> O problema é que aquele Valor Terminal calculado é um dinheiro que só existirá no ano {inputs.n}. Nós precisamos trazê-lo para o ano zero (dividindo o montante por (1 + k)^n) para poder somá-lo com os dividendos do Estágio 1.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Print / Export PDF Button */}
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-extrabold uppercase tracking-wider text-white shadow-premium transition-all hover:scale-[1.02] active:scale-95 print:hidden"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}
            >
              <Printer className="w-5 h-5" />
              Gerar Relatório em PDF
            </button>

          </div>
        </div>
      {/* ═══════════════════════════════════════════════ */}
      {/* GRÁFICO FINAL                                   */}
      {/* ═══════════════════════════════════════════════ */}
      {calc.isValid && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-premium animate-fadeIn">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-brand-primary/10 rounded-lg border border-brand-primary/20">
              <Calculator className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-dark-textPrimary" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Projeção de Dividendos ({valuationMode === 'GORDON' ? 'Gordon' : 'Crescimento Variado'})
              </h3>
              <p className="text-xs text-dark-textSecondary mt-0.5">
                {valuationMode === 'GORDON' 
                  ? `Visão do crescimento constante de ${calc.gPerc.toFixed(2)}% ao ano`
                  : `Crescimento acelerado de ${inputs.g1}% por ${inputs.n} anos, seguido de perpetuidade a ${inputs.g2}%`}
              </p>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={calc.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  stroke="rgba(255,255,255,0.3)" 
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'monospace' }} 
                  tickFormatter={(val) => `${currencySymbol}${val}`}
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                  itemStyle={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}
                  formatter={(value: any) => [`${currencySymbol} ${Number(value).toFixed(2)}`, 'Dividendo Projetado']}
                />
                <Bar 
                  dataKey="dividendo" 
                  fill="url(#barGrad)" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* LAYOUT DE IMPRESSÃO (PDF EXCLUSIVO)             */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="hidden print:block w-full bg-white text-black font-sans">
        
        {/* Header do Relatório */}
        <div className="border-b-2 border-gray-800 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">RELATÓRIO DE VALUATION</h1>
            <p className="text-lg text-gray-600 font-bold mt-1">
              Ativo Analisado: {stockData?.symbol || 'N/A'} {stockData?.longName ? `— ${stockData.longName}` : ''}
            </p>
            <p className="text-sm text-gray-500 mt-1">Data da Análise: {new Date().toLocaleDateString('pt-BR')} • Cotação Base: {currencySymbol} {stockData?.regularMarketPrice?.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-emerald-600 font-mono">
              {currencySymbol} {calc.p0.toFixed(2)}
            </p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Preço Justo Projetado (P₀)</p>
          </div>
        </div>

        {/* Bloco de Premissas */}
        <div className="mb-8">
          <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">Premissas Utilizadas</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
              <p className="text-xs font-bold text-gray-500 uppercase">Custo (k)</p>
              <p className="text-xl font-bold font-mono text-gray-900">{calc.kPerc.toFixed(2)}%</p>
            </div>
            {valuationMode === 'VARIADO' ? (
              <>
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                  <p className="text-xs font-bold text-gray-500 uppercase">A Arrancada (g1)</p>
                  <p className="text-xl font-bold font-mono text-gray-900">{inputs.g1.toFixed(2)}%</p>
                </div>
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                  <p className="text-xs font-bold text-gray-500 uppercase">Duração (n)</p>
                  <p className="text-xl font-bold font-mono text-gray-900">{inputs.n} anos</p>
                </div>
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                  <p className="text-xs font-bold text-gray-500 uppercase">A Órbita (g2)</p>
                  <p className="text-xl font-bold font-mono text-gray-900">{inputs.g2.toFixed(2)}%</p>
                </div>
              </>
            ) : (
               <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg col-span-3">
                  <p className="text-xs font-bold text-gray-500 uppercase">Crescimento Constante (g)</p>
                  <p className="text-xl font-bold font-mono text-gray-900">{calc.gPerc.toFixed(2)}%</p>
                </div>
            )}
          </div>
        </div>

        {/* Memorial de Cálculo */}
        {valuationMode === 'VARIADO' && calc.isValid && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">O Caminho do Dinheiro</h2>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                <p className="text-sm font-bold text-blue-800 mb-2">1. A "Arrancada"</p>
                <p className="text-xs text-blue-600 mb-2">(Valor Presente do Estágio 1)</p>
                <p className="text-2xl font-black font-mono text-blue-900">{currencySymbol} {calc.vpEstagio1.toFixed(2)}</p>
              </div>
              <div className="text-2xl font-black text-gray-400">+</div>
              <div className="flex-1 bg-teal-50 p-6 rounded-xl border border-teal-100 text-center">
                <p className="text-sm font-bold text-teal-800 mb-2">2. A "Órbita"</p>
                <p className="text-xs text-teal-600 mb-2">(Valor Presente do Terminal Value)</p>
                <p className="text-2xl font-black font-mono text-teal-900">{currencySymbol} {calc.vpTV.toFixed(2)}</p>
              </div>
              <div className="text-2xl font-black text-gray-400">=</div>
              <div className="flex-1 bg-gray-900 p-6 rounded-xl text-center shadow-premium print:border print:border-gray-800 print:bg-white print:text-black">
                <p className="text-sm font-bold print:text-black text-white mb-2">Preço Justo Final</p>
                <p className="text-xs print:text-gray-600 text-gray-400 mb-2">(P₀)</p>
                <p className="text-2xl font-black font-mono print:text-black text-emerald-400">{currencySymbol} {calc.p0.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico no Print */}
        {calc.isValid && (
           <div className="mt-8 border border-gray-200 rounded-xl p-6 bg-white break-inside-avoid">
             <h3 className="text-base font-bold text-gray-800 mb-4 text-center">
                Projeção de Dividendos ({valuationMode === 'GORDON' ? 'Crescimento Constante' : 'Estágio 1 + Perpetuidade'})
             </h3>
             <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={calc.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                   <XAxis dataKey="year" stroke="#9ca3af" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                   <YAxis stroke="#9ca3af" tick={{ fill: '#4b5563', fontSize: 11, fontFamily: 'monospace' }} tickFormatter={(val) => `${currencySymbol}${val}`} axisLine={false} tickLine={false} />
                   <Bar dataKey="dividendo" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={40} />
                 </ComposedChart>
               </ResponsiveContainer>
             </div>
            </div>
         )}

        {/* Memorial de Premissas e Justificativas */}
        <div className="mt-8 border-t-2 border-gray-800 pt-6 break-inside-avoid">
          <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">
            Memorial de Adopção de Taxas & Justificativas
          </h2>
          
          <div className="space-y-4">
            {Object.entries(justifications)
              .filter(([key, item]) => {
                // Only show active and non-empty justifications relevant to current mode
                const isRelevant = valuationMode === 'GORDON' 
                  ? ['rf', 'beta', 'erp', 'k', 'roe', 'payout', 'g'].includes(key)
                  : ['d0', 'g1', 'g2', 'k', 'rf', 'beta', 'erp'].includes(key);
                return isRelevant && item.active && item.text.trim() !== '';
              })
              .map(([key, item]) => {
                const justificationKey = key as keyof typeof initialJustifications;
                let valStr = '';
                let sourceStr = '';
                if (justificationKey === 'rf') {
                  valStr = `${inputs.rf.toFixed(2)}%`;
                  sourceStr = `Taxa de juros livre de risco padrão para ativos nacionais de longo prazo.`;
                } else if (justificationKey === 'beta') {
                  valStr = inputs.beta.toFixed(2);
                  sourceStr = `Volatilidade histórica calculada versus o Ibovespa (B3).`;
                } else if (justificationKey === 'erp') {
                  valStr = `${inputs.erp.toFixed(2)}%`;
                  sourceStr = `Equity Risk Premium atualizado conforme banco de dados de A. Damodaran.`;
                } else if (justificationKey === 'k') {
                  valStr = `${calc.kPerc.toFixed(2)}%`;
                  sourceStr = `Custo de Capital exigido calculado pela fórmula: Rf + (β × ERP).`;
                } else if (justificationKey === 'roe') {
                  valStr = `${inputs.roe.toFixed(2)}%`;
                  sourceStr = `Retorno sobre Patrimônio Líquido histórico apurado.`;
                } else if (justificationKey === 'payout') {
                  valStr = `${inputs.payout.toFixed(2)}%`;
                  sourceStr = `Percentual médio de lucros distribuído de forma histórica.`;
                } else if (justificationKey === 'g') {
                  valStr = `${inputs.g.toFixed(2)}%`;
                  sourceStr = `Crescimento constante estimado de longo prazo pela taxa de retenção: ROE × (1 - Payout).`;
                } else if (justificationKey === 'd0') {
                  valStr = formatCurrency(inputs.d0);
                  sourceStr = `Dividendo base distribuído nos últimos 12 meses.`;
                } else if (justificationKey === 'g1') {
                  valStr = `${inputs.g1.toFixed(2)}%`;
                  sourceStr = `Crescimento acelerado projetado para os próximos 3 anos.`;
                } else if (justificationKey === 'g2') {
                  valStr = `${inputs.g2.toFixed(2)}%`;
                  sourceStr = `Crescimento de longo prazo na perpetuidade alinhado à inflação histórica.`;
                }

                return (
                  <div key={key} className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-baseline mb-2 border-b border-gray-200 pb-1">
                      <span className="font-bold text-gray-800 text-sm">{item.label}</span>
                      <span className="font-mono font-bold text-gray-900 text-sm bg-gray-200 px-2 py-0.5 rounded">
                        {valStr}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-2xs text-gray-500 italic">
                        <strong className="text-gray-600">Como é obtido:</strong> {sourceStr}
                      </p>
                      <p className="text-xs text-gray-700 font-medium">
                        <strong className="text-gray-800">Justificativa Adotada:</strong> {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* MODAL: Salvar Cálculo */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn print:hidden">
          <div className="bg-dark-card border border-dark-border rounded-xl shadow-premium w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-dark-border/50">
              <h3 className="text-lg font-bold text-dark-textPrimary" style={{ fontFamily: 'Outfit, sans-serif' }}>Salvar Cálculo</h3>
              <button onClick={() => setIsSaveModalOpen(false)} className="text-dark-textSecondary hover:text-dark-textPrimary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-dark-textSecondary uppercase tracking-wider mb-2">Nome do Cálculo</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Ex: Cenário Conservador PETR4"
                  className="w-full bg-dark-bg border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none rounded-xl py-3 px-4 text-sm text-dark-textPrimary transition-all"
                  autoFocus
                />
                <p className="text-3xs text-dark-textSecondary mt-2">
                  Será salvo apenas para a aba de <strong>{valuationMode === 'GORDON' ? 'Gordon' : 'Crescimento Variado'}</strong>.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsSaveModalOpen(false)} className="flex-1 py-3 rounded-xl border border-dark-border text-dark-textSecondary hover:bg-dark-bg transition-colors font-bold text-xs uppercase tracking-wider">
                  Cancelar
                </button>
                <button onClick={handleSaveCalculation} className="flex-1 py-3 rounded-xl bg-brand-primary hover:bg-brand-purple text-white transition-colors font-bold text-xs uppercase tracking-wider shadow-premium shadow-brand-primary/20">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* (Modal de carregar foi movido para virar dropdown logo abaixo do botão) */}
    </>
  );
};
