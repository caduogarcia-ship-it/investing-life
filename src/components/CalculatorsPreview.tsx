import React, { useState, useEffect, useMemo } from 'react';
import { Sliders, Calculator, RotateCcw, AlertTriangle, Zap, HelpCircle, Lock, Unlock } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { StockData } from '../services/api';

interface CalculatorsPreviewProps {
  stockData: StockData | null;
}

export const CalculatorsPreview: React.FC<CalculatorsPreviewProps> = ({ stockData }) => {
  // --- VALUATION MODE TOGGLE ---
  const [valuationMode, setValuationMode] = useState<'GORDON' | 'VARIADO'>('GORDON');

  // --- DEFAULT FALLBACKS & RECOMMENDED PARAMETERS ---
  const recommendedParams = useMemo(() => {
    if (!stockData) {
      return {
        rf: 10.75,
        beta: 1.0,
        rm: 16.25,
        roe: 12.0,
        payout: 40.0,
        d1: 1.35,
      };
    }

    const price = stockData.regularMarketPrice || 30.00;
    const dy = stockData.dy || 4.5;
    const roe = stockData.roe || 12.0;
    const beta = stockData.volatility ? Number((stockData.volatility / 25).toFixed(2)) : 1.0; 
    
    // Check if US stock or B3 BDR
    const isUS = stockData.currency === 'USD' || /^[A-Z]{1,5}$/.test(stockData.symbol) || stockData.symbol.endsWith('34');
    const rf = isUS ? 4.25 : 10.75; 
    const premium = isUS ? 4.5 : 5.5; 
    const rm = rf + premium;

    // Payout estimation from DY & ROE
    let payout = 45.0;
    if (roe > 0) {
      payout = Math.min(95, Math.max(10, Number(((dy / roe) * 100).toFixed(1))));
    }
    
    const d0 = price * (dy / 100);
    // Simple projection for D1
    const ret = 1 - (payout / 100);
    const gEst = (roe / 100) * ret;
    const d1 = d0 * (1 + gEst);

    return {
      rf: Number(rf.toFixed(2)),
      beta: Math.max(0.5, Math.min(2.5, beta)),
      rm: Number(rm.toFixed(2)),
      roe: Number(roe.toFixed(2)),
      payout: Number(payout.toFixed(2)),
      d1: Number(d1.toFixed(2)),
    };
  }, [stockData]);

  // --- INTERACTIVE / CUSTOMIZABLE STATES ---
  const [inputs, setInputs] = useState(recommendedParams);
  const [locks, setLocks] = useState({
    rf: false,
    beta: false,
    rm: false,
    roe: false,
    payout: false,
    d1: false,
  });

  const [growthScenario, setGrowthScenario] = useState<'otimista' | 'pessimista' | 'manual'>('manual');

  // Sync initial state
  useEffect(() => {
    setInputs(recommendedParams);
    setLocks({ rf: false, beta: false, rm: false, roe: false, payout: false, d1: false });
    setGrowthScenario('manual');
  }, [recommendedParams]);

  // --- HANDLERS ---
  const handleInputChange = (key: keyof typeof inputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
    setGrowthScenario('manual');
  };

  const toggleLock = (key: keyof typeof locks) => {
    setLocks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReset = () => {
    setInputs(recommendedParams);
    setLocks({ rf: false, beta: false, rm: false, roe: false, payout: false, d1: false });
    setGrowthScenario('manual');
  };

  const handleScenario = (scenario: 'otimista' | 'pessimista') => {
    setGrowthScenario(scenario);
    setInputs(prev => {
      const next = { ...prev };
      if (scenario === 'otimista') {
        if (!locks.rf) next.rf = Math.max(2, prev.rf * 0.9);
        if (!locks.beta) next.beta = Math.max(0.4, prev.beta * 0.85);
        if (!locks.rm) next.rm = Math.min(25, prev.rm * 1.1);
        if (!locks.roe) next.roe = Math.min(50, prev.roe * 1.2);
        if (!locks.payout) next.payout = Math.max(10, prev.payout * 0.8);
        if (!locks.d1) next.d1 = prev.d1 * 1.15;
      } else {
        if (!locks.rf) next.rf = Math.min(20, prev.rf * 1.1);
        if (!locks.beta) next.beta = Math.min(3.0, prev.beta * 1.15);
        if (!locks.rm) next.rm = Math.max(5, prev.rm * 0.9);
        if (!locks.roe) next.roe = Math.max(2, prev.roe * 0.8);
        if (!locks.payout) next.payout = Math.min(95, prev.payout * 1.2);
        if (!locks.d1) next.d1 = Math.max(0, prev.d1 * 0.85);
      }
      return next;
    });
  };

  // --- ENGINE DE CÁLCULO ---
  const calc = useMemo(() => {
    // Passo 2: Cálculo de k (CAPM)
    // k = Rf + Beta * (Rm - Rf)
    const k = (inputs.rf / 100) + inputs.beta * ((inputs.rm / 100) - (inputs.rf / 100));
    const kPerc = k * 100;

    // Passo 3: Cálculo de g
    // b = 1 - Payout Ratio
    const b = 1 - (inputs.payout / 100);
    // g = ROE * b
    const g = (inputs.roe / 100) * b;
    const gPerc = g * 100;

    // Passo 4: Validação Crítica
    const isValid = k > g;

    // Passo 5: Cálculo de P0
    let p0 = 0;
    if (isValid) {
      p0 = inputs.d1 / (k - g);
    }

    // Gerar dados para o Gráfico (Projeção de 10 anos)
    const chartData = [];
    let currentD = inputs.d1;
    for (let year = 1; year <= 10; year++) {
      chartData.push({
        year: `Ano ${year}`,
        dividendo: Number(currentD.toFixed(2)),
      });
      // Crescimento projetado para o próximo ano
      currentD = currentD * (1 + g);
    }

    return {
      kPerc,
      gPerc,
      isValid,
      p0,
      chartData
    };
  }, [inputs]);

  const currencySymbol = stockData?.currency === 'USD' ? '$' : 'R$';

  // --- SUB-COMPONENT: Lockable Input ---
  const LockableInput = ({ 
    label, 
    value, 
    min, 
    max, 
    step, 
    unit, 
    objKey,
    tooltip 
  }: { 
    label: string, 
    value: number, 
    min: number, 
    max: number, 
    step: number, 
    unit: string, 
    objKey: keyof typeof inputs,
    tooltip?: string
  }) => {
    const isLocked = locks[objKey];
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(31,41,55,0.5)' }}>
        <div className="h-[2px]" style={{ background: isLocked ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
        <div className="p-3.5 space-y-3" style={{ background: 'rgba(9,13,22,0.35)' }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-dark-textSecondary">{label}</span>
              {tooltip && (
                <span title={tooltip}>
                  <HelpCircle className="w-3 h-3 text-dark-textSecondary/50" />
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toggleLock(objKey)}
                className={`p-1.5 rounded-lg transition-colors ${isLocked ? 'bg-brand-danger/20 text-brand-danger' : 'bg-dark-bg/60 text-dark-textSecondary hover:text-dark-textPrimary'}`}
                title={isLocked ? "Destravar valor" : "Travar valor contra Auto-Preenchimento"}
              >
                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
              <div className={`flex items-center bg-dark-bg/80 border ${isLocked ? 'border-brand-danger/40' : 'border-dark-border/60 focus-within:border-brand-purple'} rounded-lg px-2.5 py-1`}>
                <input 
                  type="number" step={step} min={min} max={max} 
                  value={value}
                  disabled={isLocked}
                  onChange={(e) => { const v = parseFloat(e.target.value); handleInputChange(objKey, isNaN(v) ? 0 : v); }}
                  className={`w-14 bg-transparent text-right font-mono text-sm outline-none border-none p-0 focus:ring-0 focus:outline-none ${isLocked ? 'text-dark-textSecondary' : 'text-dark-textPrimary'}`}
                />
                <span className="text-dark-textSecondary text-sm font-mono ml-1">{unit}</span>
              </div>
            </div>
          </div>
          <input 
            type="range" min={min} max={max} step={step} 
            value={value}
            disabled={isLocked}
            onChange={(e) => handleInputChange(objKey, parseFloat(e.target.value))}
            className={`w-full h-1.5 rounded-full appearance-none accent-brand-purple ${isLocked ? 'bg-brand-danger/20 opacity-50 cursor-not-allowed' : 'bg-dark-bg cursor-pointer'}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ═══════════════════════════════════════════════ */}
      {/* HEADER CARD                                     */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-dark-border shadow-xl" style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(15,18,30,0.98))' }}>
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
                    ? 'text-white shadow-lg'
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
                    ? 'text-white shadow-lg'
                    : 'text-dark-textSecondary hover:text-dark-textPrimary'
                }`}
                style={valuationMode === 'VARIADO' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' } : {}}
              >
                ● Variado (Em Breve)
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

      {valuationMode === 'VARIADO' ? (
        <div className="bg-dark-card border border-dark-border p-12 rounded-2xl text-center space-y-4 shadow-lg">
          <Calculator className="w-12 h-12 text-brand-purple mx-auto opacity-50" />
          <h3 className="text-xl font-bold text-dark-textPrimary">Modelo de Crescimento Variado</h3>
          <p className="text-dark-textSecondary max-w-lg mx-auto">
            Este modelo está aguardando as novas especificações matemáticas e será implementado em breve. Por favor, utilize o modelo de Crescimento Constante (Gordon) enquanto isso.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── COL 1 & 2: Parameters ─── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Auto-fill Preset Buttons */}
            <div className="flex flex-wrap items-center gap-3 bg-dark-card border border-dark-border p-4 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-dark-textSecondary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Preenchimento Rápido:</span>
              <button
                type="button"
                onClick={() => handleScenario('otimista')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer select-none active-scale transition-all ${growthScenario === 'otimista' ? 'text-white shadow-lg' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20'}`}
                style={growthScenario === 'otimista' ? { background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 3px 12px rgba(16,185,129,0.3)' } : {}}
              >
                <Zap className="w-3.5 h-3.5" />
                Otimista
              </button>
              <button
                type="button"
                onClick={() => handleScenario('pessimista')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer select-none active-scale transition-all ${growthScenario === 'pessimista' ? 'text-white shadow-lg' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20'}`}
                style={growthScenario === 'pessimista' ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 3px 12px rgba(239,68,68,0.3)' } : {}}
              >
                <Zap className="w-3.5 h-3.5" />
                Pessimista
              </button>
              <span className="text-[10px] text-dark-textSecondary ml-auto flex items-center gap-1">
                <Lock className="w-3 h-3" /> Valores com cadeado não serão afetados
              </span>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid rgba(31,41,55,0.6)', background: 'linear-gradient(90deg, rgba(99,102,241,0.04), transparent)' }}>
                <div className="p-1.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <Sliders className="w-4 h-4 text-brand-purple" />
                </div>
                <h3 className="text-sm font-black text-dark-textPrimary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Parâmetros da Fórmula de Gordon</h3>
              </div>

              <div className="p-6 space-y-7">

                {/* ── Bloco A: CAPM ── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-brand-purple" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>A</span>
                    <span className="text-sm font-extrabold text-brand-purple uppercase tracking-wider">Variáveis do CAPM (k)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <LockableInput label="Rf (Livre Risco)" value={inputs.rf} min={1} max={25} step={0.1} unit="%" objKey="rf" tooltip="Taxa Livre de Risco" />
                    <LockableInput label="Beta (β)" value={inputs.beta} min={0.1} max={4.0} step={0.05} unit="" objKey="beta" tooltip="Volatilidade do Ativo vs Mercado" />
                    <LockableInput label="Rm (Retorno Merc.)" value={inputs.rm} min={2} max={35} step={0.1} unit="%" objKey="rm" tooltip="Retorno Esperado do Mercado" />
                  </div>
                </div>

                {/* ── Bloco B: Fundamentos ── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-brand-primary" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>B</span>
                    <span className="text-sm font-extrabold text-brand-primary uppercase tracking-wider">Variáveis Fundamentais (g)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LockableInput label="ROE" value={inputs.roe} min={1} max={60} step={0.5} unit="%" objKey="roe" tooltip="Return on Equity" />
                    <LockableInput label="Payout Ratio" value={inputs.payout} min={0} max={100} step={1} unit="%" objKey="payout" tooltip="Porcentagem do Lucro Distribuída" />
                  </div>
                </div>

                {/* ── Bloco C: Fluxo de Caixa ── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-emerald-400" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>C</span>
                    <span className="text-sm font-extrabold text-emerald-400 uppercase tracking-wider">Variável de Fluxo (Base)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LockableInput label="Dividendo Esperado (D1)" value={inputs.d1} min={0.01} max={100} step={0.05} unit={currencySymbol} objKey="d1" tooltip="Dividendo Projetado para o Ano 1" />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ─── COL 3: Outputs / Resultados ─── */}
          <div className="space-y-6">
            
            {/* Painel de Resultados Intermediários */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg space-y-6">
              <h3 className="text-xs font-extrabold text-dark-textSecondary uppercase tracking-wider text-center border-b border-dark-border/40 pb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Valores Calculados em 2º Plano
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-dark-bg/60 border border-dark-border/50">
                  <span className="text-sm text-dark-textSecondary font-medium">Custo de Cap. (k)</span>
                  <span className="text-lg font-black font-mono text-brand-purple">{calc.kPerc.toFixed(2)}%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-xl bg-dark-bg/60 border border-dark-border/50">
                  <span className="text-sm text-dark-textSecondary font-medium">Taxa de Cresc. (g)</span>
                  <span className="text-lg font-black font-mono text-brand-primary">{calc.gPerc.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Painel de Erro ou Preço Justo */}
            {!calc.isValid ? (
              <div className="bg-brand-danger/10 border-2 border-brand-danger/30 rounded-2xl p-6 shadow-xl animate-fadeIn">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-brand-danger/20 flex items-center justify-center border border-brand-danger/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    <AlertTriangle className="w-8 h-8 text-brand-danger" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-brand-danger" style={{ fontFamily: 'Outfit, sans-serif' }}>Erro de Premissa</h3>
                    <p className="text-sm text-dark-textSecondary font-medium leading-relaxed">
                      O Custo de Capital Exigido (k) deve ser <strong className="text-dark-textPrimary">estritamente maior</strong> do que a Taxa de Crescimento Perpétuo (g) para que o modelo seja válido.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-dark-bg/50 rounded-lg text-xs font-mono text-dark-textSecondary">
                      k ({calc.kPerc.toFixed(2)}%) ≤ g ({calc.gPerc.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl p-1 overflow-hidden group shadow-2xl animate-fadeIn">
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
                    P₀ = D₁ / (k - g)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* GRÁFICO FINAL                                   */}
      {/* ═══════════════════════════════════════════════ */}
      {valuationMode === 'GORDON' && calc.isValid && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-brand-primary/10 rounded-lg border border-brand-primary/20">
              <Calculator className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-dark-textPrimary" style={{ fontFamily: 'Outfit, sans-serif' }}>Projeção de Dividendos (Gordon)</h3>
              <p className="text-xs text-dark-textSecondary mt-0.5">Visão do crescimento constante de {calc.gPerc.toFixed(2)}% ao ano</p>
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
  );
};
