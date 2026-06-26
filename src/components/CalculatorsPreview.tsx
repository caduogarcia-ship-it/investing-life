import React, { useState, useEffect, useMemo } from 'react';
import { Sliders, Calculator, Info, RotateCcw, AlertTriangle, TrendingUp, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { StockData } from '../services/api';

interface CalculatorsPreviewProps {
  stockData: StockData | null;
}

export const CalculatorsPreview: React.FC<CalculatorsPreviewProps> = ({ stockData }) => {
  // --- VALUATION MODE TOGGLE ---
  const [valuationMode, setValuationMode] = useState<'DDM' | 'FCFE'>('DDM');

  // --- DEFAULT FALLBACKS & RECOMMENDED PARAMETERS ---
  const recommendedParams = useMemo(() => {
    if (!stockData) {
      return {
        price: 30.00,
        dy: 4.5,
        roe: 12.0,
        roic: 10.0,
        beta: 1.0,
        rf: 10.75, // Tesouro 10Y Brasil
        premium: 5.0, // Prêmio de Risco de Mercado (Rm - Rf)
        payout: 40.0,
        cagr: 8.0,
        div0: 1.35,
        fcfe0: 3.38,
      };
    }

    const price = stockData.regularMarketPrice || 30.00;
    const dy = stockData.dy || 4.5;
    const roe = stockData.roe || 12.0;
    const roic = stockData.roic || 10.0;
    const beta = stockData.volatility ? Number((stockData.volatility / 25).toFixed(2)) : 1.0; // Estimate beta based on volatility
    
    // Check if US stock or B3 BDR
    const isUS = stockData.currency === 'USD' || /^[A-Z]{1,5}$/.test(stockData.symbol) || stockData.symbol.endsWith('34');
    const rf = isUS ? 4.25 : 10.75; // US 10Y vs BR 10Y
    const premium = isUS ? 4.5 : 5.5; // PRM US vs BR

    // Payout estimation from DY & ROE
    let payout = 45.0;
    if (roe > 0) {
      payout = Math.min(95, Math.max(10, Number(((dy / roe) * 100).toFixed(1))));
    }

    const cagr = stockData.cagrLucros5Anos || stockData.cagrReceitas5Anos || 8.0;
    
    // Base Values
    const div0 = price * (dy / 100);
    const fcfe0 = payout > 0 ? div0 / (payout / 100) : price * 0.08;

    return {
      price,
      dy,
      roe,
      roic,
      beta: Math.max(0.5, Math.min(2.0, beta)),
      rf,
      premium,
      payout,
      cagr: Math.max(1, Math.min(25, cagr)),
      div0: Number(div0.toFixed(2)),
      fcfe0: Number(fcfe0.toFixed(2)),
    };
  }, [stockData]);

  // --- INTERACTIVE / CUSTOMIZABLE STATES ---
  const [customBeta, setCustomBeta] = useState(recommendedParams.beta);
  const [customRf, setCustomRf] = useState(recommendedParams.rf);
  const [customPremium, setCustomPremium] = useState(recommendedParams.premium);
  const [customRoe, setCustomRoe] = useState(recommendedParams.roe);
  const [customRoic, setCustomRoic] = useState(recommendedParams.roic);
  const [customPayout, setCustomPayout] = useState(recommendedParams.payout);
  const [customCagr, setCustomCagr] = useState(recommendedParams.cagr);
  const [customDiv0, setCustomDiv0] = useState(recommendedParams.div0);
  const [customFcfe0, setCustomFcfe0] = useState(recommendedParams.fcfe0);

  // Sincronizar com WACC manual (opcional, para visualização de contraste)
  const [customWacc, setCustomWacc] = useState(8.5);

  // --- GROWTH SCENARIO STATES (PESSIMISTA / OTIMISTA) ---
  const [growthScenario, setGrowthScenario] = useState<'otimista' | 'pessimista'>('otimista');
  const [pessimisticDiscount, setPessimisticDiscount] = useState(30); // 30% default haircut

  // Sync inputs when stockData or recommended parameters change
  useEffect(() => {
    setCustomBeta(recommendedParams.beta);
    setCustomRf(recommendedParams.rf);
    setCustomPremium(recommendedParams.premium);
    setCustomRoe(recommendedParams.roe);
    setCustomRoic(recommendedParams.roic);
    setCustomPayout(recommendedParams.payout);
    setCustomCagr(recommendedParams.cagr);
    setCustomDiv0(recommendedParams.div0);
    setCustomFcfe0(recommendedParams.fcfe0);
  }, [recommendedParams]);

  // Reset helper
  const handleReset = () => {
    setCustomBeta(recommendedParams.beta);
    setCustomRf(recommendedParams.rf);
    setCustomPremium(recommendedParams.premium);
    setCustomRoe(recommendedParams.roe);
    setCustomRoic(recommendedParams.roic);
    setCustomPayout(recommendedParams.payout);
    setCustomCagr(recommendedParams.cagr);
    setCustomDiv0(recommendedParams.div0);
    setCustomFcfe0(recommendedParams.fcfe0);
    setCustomWacc(8.5);
    setGrowthScenario('otimista');
    setPessimisticDiscount(30);
  };

  // --- CALCULATIONS FOR RECOMMENDED SET ---
  const calcRecommended = useMemo(() => {
    const p = recommendedParams;
    const baseValue = valuationMode === 'DDM' ? p.div0 : p.fcfe0;

    // 1. Ke (Cost of Equity) via CAPM: Ke = Rf + beta * (Rm - Rf)
    const ke = p.rf + p.beta * p.premium;

    // Scenario Growth Multiplier
    const multiplier = growthScenario === 'pessimista' ? (1 - pessimisticDiscount / 100) : 1;

    // 2. Growth (g) for Perpetuity: g = ROE * (1 - Payout/100)
    const gPerp = p.roe * (1 - p.payout / 100) * multiplier;

    // Gordon Model Price: P0 = [BaseValue * (1 + g)] / (Ke - g)
    let gGordon = gPerp;
    let gWarning = false;
    if (gGordon >= ke) {
      gGordon = ke - 1.5; // Cap to make formula work
      gWarning = true;
    }

    const gordonVal = gGordon > 0 ? (baseValue * (1 + gGordon / 100)) / ((ke - gGordon) / 100) : 0;

    // 3. Two-Stage Model
    // Stage 1 (Years 1-10): Val_t = Val_0 * (1 + CAGR)^t
    let sumPV = 0;
    const historyDivs: Array<{ year: number; div: number; pv: number }> = [];
    let lastVal = baseValue;
    const keRate = ke / 100;
    const cagrRate = (p.cagr * multiplier) / 100;

    for (let t = 1; t <= 10; t++) {
      const valT = lastVal * (1 + cagrRate);
      const pvT = valT / Math.pow(1 + keRate, t);
      sumPV += pvT;
      historyDivs.push({
        year: t,
        div: Number(valT.toFixed(2)),
        pv: Number(pvT.toFixed(2))
      });
      lastVal = valT;
    }

    // Stage 2 (Perpetuity at Year 11+): gn = ROIC * (1 - Payout)
    const gn = p.roic * (1 - p.payout / 100) * multiplier;
    let gnCap = gn;
    let gnWarning = false;
    if (gnCap >= ke) {
      gnCap = ke - 1.5;
      gnWarning = true;
    }

    // P(10) = [Val10 * (1 + gn)] / (Ke - gn)
    const val10 = historyDivs[9].div;
    const p10 = gnCap > 0 ? (val10 * (1 + gnCap / 100)) / ((ke - gnCap) / 100) : 0;
    const pvTerminal = p10 / Math.pow(1 + keRate, 10);
    const twoStageVal = sumPV + pvTerminal;

    return {
      ke,
      gPerp,
      gGordon,
      gWarning,
      gordonVal: Number(gordonVal.toFixed(2)),
      twoStageVal: Number(twoStageVal.toFixed(2)),
      pvStage1: Number(sumPV.toFixed(2)),
      pvTerminal: Number(pvTerminal.toFixed(2)),
      p10: Number(p10.toFixed(2)),
      gn: gnCap,
      gnWarning,
      historyDivs
    };
  }, [recommendedParams, valuationMode, growthScenario, pessimisticDiscount]);

  // --- CALCULATIONS FOR CUSTOM / USER SET ---
  const calcCustom = useMemo(() => {
    const ke = customRf + customBeta * customPremium;
    const baseValue = valuationMode === 'DDM' ? customDiv0 : customFcfe0;

    // Scenario Growth Multiplier
    const multiplier = growthScenario === 'pessimista' ? (1 - pessimisticDiscount / 100) : 1;

    // 2. Growth Gordon
    const gPerp = customRoe * (1 - customPayout / 100) * multiplier;
    let gGordon = gPerp;
    let gWarning = false;
    if (gGordon >= ke) {
      gGordon = ke - 1.5;
      gWarning = true;
    }

    const gordonVal = gGordon > 0 ? (baseValue * (1 + gGordon / 100)) / ((ke - gGordon) / 100) : 0;

    // 3. Two-Stage DCF
    let sumPV = 0;
    const historyDivs: Array<{ year: number; div: number; pv: number }> = [];
    let lastVal = baseValue;
    const keRate = ke / 100;
    const cagrRate = (customCagr * multiplier) / 100;

    for (let t = 1; t <= 10; t++) {
      const valT = lastVal * (1 + cagrRate);
      const pvT = valT / Math.pow(1 + keRate, t);
      sumPV += pvT;
      historyDivs.push({
        year: t,
        div: Number(valT.toFixed(2)),
        pv: Number(pvT.toFixed(2))
      });
      lastVal = valT;
    }

    // Stage 2: gn = ROIC * (1 - Payout)
    const gn = customRoic * (1 - customPayout / 100) * multiplier;
    let gnCap = gn;
    let gnWarning = false;
    if (gnCap >= ke) {
      gnCap = ke - 1.5;
      gnWarning = true;
    }

    const val10 = historyDivs[9].div;
    const p10 = gnCap > 0 ? (val10 * (1 + gnCap / 100)) / ((ke - gnCap) / 100) : 0;
    const pvTerminal = p10 / Math.pow(1 + keRate, 10);
    const twoStageVal = sumPV + pvTerminal;

    return {
      ke,
      gPerp,
      gGordon,
      gWarning,
      gordonVal: Number(gordonVal.toFixed(2)),
      twoStageVal: Number(twoStageVal.toFixed(2)),
      pvStage1: Number(sumPV.toFixed(2)),
      pvTerminal: Number(pvTerminal.toFixed(2)),
      p10: Number(p10.toFixed(2)),
      gn: gnCap,
      gnWarning,
      historyDivs
    };
  }, [customBeta, customRf, customPremium, customRoe, customRoic, customPayout, customCagr, customDiv0, customFcfe0, valuationMode, growthScenario, pessimisticDiscount]);

  // Recharts representation data
  const chartData = useMemo(() => {
    return calcCustom.historyDivs.map((d, index) => {
      const recD = calcRecommended.historyDivs[index] || { div: 0, pv: 0 };
      return {
        year: `Ano ${d.year}`,
        valueRec: recD.div,
        valueCust: d.div,
        pvRec: recD.pv,
        pvCust: d.pv,
      };
    });
  }, [calcCustom, calcRecommended]);

  const currencySymbol = stockData?.currency === 'USD' ? '$' : 'R$';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ═══════════════════════════════════════════════ */}
      {/* HEADER CARD                                     */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-dark-border shadow-xl" style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(15,18,30,0.98))' }}>
        {/* Decorative glow orb */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />

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
            <p className="text-sm text-dark-textSecondary/80 max-w-xl leading-relaxed">
              Calcule o preço justo com base nos modelos clássicos de Fluxo de Caixa Descontado (DCF) e Desconto de Dividendos (DDM).
            </p>
          </div>

          {/* Toggle + Reset */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Mode Switcher — pill style */}
            <div className="flex p-1 rounded-xl select-none shrink-0" style={{ background: 'rgba(9,13,22,0.7)', border: '1px solid rgba(31,41,55,0.8)' }}>
              <button
                onClick={() => setValuationMode('DDM')}
                className={`px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  valuationMode === 'DDM'
                    ? 'text-white shadow-lg'
                    : 'text-dark-textSecondary hover:text-dark-textPrimary'
                }`}
                style={valuationMode === 'DDM' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' } : {}}
              >
                ● Dividendos (DDM)
              </button>
              <button
                onClick={() => setValuationMode('FCFE')}
                className={`px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  valuationMode === 'FCFE'
                    ? 'text-white shadow-lg'
                    : 'text-dark-textSecondary hover:text-dark-textPrimary'
                }`}
                style={valuationMode === 'FCFE' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' } : {}}
              >
                ● Caixa Livre (FCFE)
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

      {/* ═══════════════════════════════════════════════ */}
      {/* MAIN GRID: INPUTS (2/3) + OUTPUTS (1/3)        */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── COL 1 & 2: Parameters ─── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-2xl shadow-lg overflow-hidden">
            {/* Section Header */}
            <div className="px-6 py-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid rgba(31,41,55,0.6)', background: 'linear-gradient(90deg, rgba(99,102,241,0.04), transparent)' }}>
              <div className="p-1.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Sliders className="w-4 h-4 text-brand-purple" />
              </div>
              <h3 className="text-sm font-black text-dark-textPrimary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Parâmetros das Fórmulas</h3>
            </div>

            <div className="p-6 space-y-7">

              {/* ── Section A: CAPM ── */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-brand-purple" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>1</span>
                  <span className="text-sm font-extrabold text-brand-purple uppercase tracking-wider">Custo de Capital Próprio (Ke via CAPM)</span>
                  <span title="Ke = Rf + β × (Rm − Rf)">
                    <HelpCircle className="w-4 h-4 text-dark-textSecondary/60" />
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* ── Rf ── */}
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(31,41,55,0.5)' }}>
                    <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #8b5cf6, #6366f1)' }} />
                    <div className="p-3.5 space-y-3" style={{ background: 'rgba(9,13,22,0.35)' }}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-dark-textSecondary">Taxa Livre de Risco (Rf)</span>
                        <div className="flex items-center bg-dark-bg/80 border border-dark-border/60 focus-within:border-brand-purple rounded-lg px-2.5 py-1">
                          <input type="number" step="0.01" min="1" max="25" value={customRf}
                            onChange={(e) => { const v = parseFloat(e.target.value); setCustomRf(isNaN(v) ? 0 : v); }}
                            className="w-14 bg-transparent text-right font-mono text-sm text-dark-textPrimary outline-none border-none p-0 focus:ring-0 focus:outline-none"
                          />
                          <span className="text-dark-textSecondary text-sm font-mono ml-1">%</span>
                        </div>
                      </div>
                      <input type="range" min="2" max="16" step="0.05" value={customRf}
                        onChange={(e) => setCustomRf(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-dark-bg rounded-full appearance-none cursor-pointer accent-brand-purple"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-dark-textSecondary/70">Rec: {recommendedParams.rf}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <button type="button" onClick={() => setCustomRf(10.75)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-dark-textPrimary cursor-pointer active-scale transition-all hover:border-brand-purple/60"
                          style={{ background: 'rgba(9,13,22,0.6)', border: '1px solid rgba(31,41,55,0.7)' }}>
                          🇧🇷 BR 10Y
                        </button>
                        <button type="button" onClick={() => setCustomRf(4.25)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-dark-textPrimary cursor-pointer active-scale transition-all hover:border-brand-purple/60"
                          style={{ background: 'rgba(9,13,22,0.6)', border: '1px solid rgba(31,41,55,0.7)' }}>
                          🇺🇸 US 10Y
                        </button>
                        <button type="button" onClick={() => setCustomRf(10.50)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-dark-textPrimary cursor-pointer active-scale transition-all hover:border-brand-purple/60"
                          style={{ background: 'rgba(9,13,22,0.6)', border: '1px solid rgba(31,41,55,0.7)' }}>
                          Selic
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── Beta ── */}
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(31,41,55,0.5)' }}>
                    <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                    <div className="p-3.5 space-y-3" style={{ background: 'rgba(9,13,22,0.35)' }}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-dark-textSecondary">Beta do Ativo (&beta;)</span>
                        <div className="flex items-center bg-dark-bg/80 border border-dark-border/60 focus-within:border-brand-purple rounded-lg px-2.5 py-1">
                          <input type="number" step="0.01" min="0.1" max="5" value={customBeta}
                            onChange={(e) => { const v = parseFloat(e.target.value); setCustomBeta(isNaN(v) ? 0 : v); }}
                            className="w-14 bg-transparent text-right font-mono text-sm text-dark-textPrimary outline-none border-none p-0 focus:ring-0 focus:outline-none"
                          />
                        </div>
                      </div>
                      <input type="range" min="0.4" max="2.5" step="0.05" value={customBeta}
                        onChange={(e) => setCustomBeta(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-dark-bg rounded-full appearance-none cursor-pointer accent-brand-purple"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-dark-textSecondary/70">Rec: {recommendedParams.beta}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <button type="button" onClick={() => setCustomBeta(0.75)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-dark-textPrimary cursor-pointer active-scale transition-all hover:border-brand-purple/60"
                          style={{ background: 'rgba(9,13,22,0.6)', border: '1px solid rgba(31,41,55,0.7)' }}>
                          Defensivo
                        </button>
                        <button type="button" onClick={() => setCustomBeta(1.0)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-dark-textPrimary cursor-pointer active-scale transition-all hover:border-brand-purple/60"
                          style={{ background: 'rgba(9,13,22,0.6)', border: '1px solid rgba(31,41,55,0.7)' }}>
                          Neutro
                        </button>
                        <button type="button" onClick={() => setCustomBeta(1.35)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-dark-textPrimary cursor-pointer active-scale transition-all hover:border-brand-purple/60"
                          style={{ background: 'rgba(9,13,22,0.6)', border: '1px solid rgba(31,41,55,0.7)' }}>
                          Agressivo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── Premium (Rm - Rf) ── */}
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(31,41,55,0.5)' }}>
                    <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }} />
                    <div className="p-3.5 space-y-3" style={{ background: 'rgba(9,13,22,0.35)' }}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-dark-textSecondary">Prêmio (Rm − Rf)</span>
                        <div className="flex items-center bg-dark-bg/80 border border-dark-border/60 focus-within:border-brand-purple rounded-lg px-2.5 py-1">
                          <input type="number" step="0.01" min="1" max="20" value={customPremium}
                            onChange={(e) => { const v = parseFloat(e.target.value); setCustomPremium(isNaN(v) ? 0 : v); }}
                            className="w-14 bg-transparent text-right font-mono text-sm text-dark-textPrimary outline-none border-none p-0 focus:ring-0 focus:outline-none"
                          />
                          <span className="text-dark-textSecondary text-sm font-mono ml-1">%</span>
                        </div>
                      </div>
                      <input type="range" min="2" max="10" step="0.05" value={customPremium}
                        onChange={(e) => setCustomPremium(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-dark-bg rounded-full appearance-none cursor-pointer accent-brand-purple"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-dark-textSecondary/70">Rec: {recommendedParams.premium}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <button type="button" onClick={() => setCustomPremium(5.5)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-dark-textPrimary cursor-pointer active-scale transition-all hover:border-brand-purple/60"
                          style={{ background: 'rgba(9,13,22,0.6)', border: '1px solid rgba(31,41,55,0.7)' }}>
                          🇧🇷 Brasil
                        </button>
                        <button type="button" onClick={() => setCustomPremium(4.5)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-dark-textPrimary cursor-pointer active-scale transition-all hover:border-brand-purple/60"
                          style={{ background: 'rgba(9,13,22,0.6)', border: '1px solid rgba(31,41,55,0.7)' }}>
                          🇺🇸 EUA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Ke Result + WACC Contrast ── */}
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
                  <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)' }} />
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.02))' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-dark-textSecondary font-semibold">Custo do Capital Próprio (Ke):</span>
                      <span className="text-xl font-black font-mono gradient-text">{calcCustom.ke.toFixed(2)}%</span>
                      <span className="text-xs text-dark-textSecondary/60 font-mono">(Rec: {calcRecommended.ke.toFixed(2)}%)</span>
                    </div>
                    <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-dark-border/30 pt-3 sm:pt-0 sm:pl-4">
                      <span className="text-sm text-dark-textSecondary font-medium">WACC:</span>
                      <div className="flex items-center bg-dark-bg/80 border border-dark-border/60 focus-within:border-brand-purple rounded-lg px-2.5 py-1">
                        <input type="number" step="0.1" min="2" max="20" value={customWacc}
                          onChange={(e) => setCustomWacc(parseFloat(e.target.value) || 0)}
                          className="w-14 bg-transparent text-right font-mono text-sm text-dark-textPrimary outline-none border-none p-0 focus:ring-0 focus:outline-none"
                        />
                        <span className="text-dark-textSecondary text-sm font-mono ml-1">%</span>
                      </div>
                      {calcCustom.ke > customWacc ? (
                        <span className="text-xs px-3 py-1 rounded-lg font-bold" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>Ke &gt; WACC</span>
                      ) : (
                        <span className="text-xs px-3 py-1 rounded-lg font-bold" style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>Ke &le; WACC</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section B: Growth & Payout ── */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-brand-primary" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>2</span>
                  <span className="text-sm font-extrabold text-brand-primary uppercase tracking-wider">Retorno, Reinvestimento e Crescimento (g)</span>
                  <span title="g = ROE × (1 − Payout)">
                    <HelpCircle className="w-3.5 h-3.5 text-dark-textSecondary/60" />
                  </span>
                </div>

                {/* ── Cenário de Crescimento (G) ── */}
                <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid rgba(31,41,55,0.5)' }}>
                  <div className="h-[2px]" style={{ background: growthScenario === 'otimista' ? 'linear-gradient(90deg, #10b981, #6366f1)' : 'linear-gradient(90deg, #ef4444, #f59e0b)' }} />
                  <div className="p-4 space-y-4" style={{ background: 'rgba(9,13,22,0.35)' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-sm font-extrabold text-dark-textPrimary block">Cenário de Crescimento (G)</span>
                        <span className="text-xs text-dark-textSecondary mt-0.5 block">Escolha entre taxas nominais ou com margem de segurança conservadora.</span>
                      </div>
                      
                      {/* Toggle Pill */}
                      <div className="flex p-1 rounded-xl select-none shrink-0" style={{ background: 'rgba(9,13,22,0.7)', border: '1px solid rgba(31,41,55,0.8)' }}>
                        <button
                          type="button"
                          onClick={() => setGrowthScenario('otimista')}
                          className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                            growthScenario === 'otimista'
                              ? 'text-white shadow-lg'
                              : 'text-dark-textSecondary hover:text-dark-textPrimary'
                          }`}
                          style={growthScenario === 'otimista' ? { background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 2px 8px rgba(16,185,129,0.35)' } : {}}
                        >
                          Otimista (100%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setGrowthScenario('pessimista')}
                          className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                            growthScenario === 'pessimista'
                              ? 'text-white shadow-lg'
                              : 'text-dark-textSecondary hover:text-dark-textPrimary'
                          }`}
                          style={growthScenario === 'pessimista' ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 2px 8px rgba(239,68,68,0.35)' } : {}}
                        >
                          Pessimista
                        </button>
                      </div>
                    </div>

                    {growthScenario === 'pessimista' && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-dark-border/40 animate-fadeIn">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-dark-textSecondary block">Haircut / Desconto de Crescimento</span>
                          <span className="text-[11px] text-dark-textSecondary/50 font-mono">Reduz g, CAGR e g_n em {pessimisticDiscount}%</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <input
                            type="range"
                            min="10"
                            max="60"
                            step="5"
                            value={pessimisticDiscount}
                            onChange={(e) => setPessimisticDiscount(parseInt(e.target.value))}
                            className="w-28 sm:w-36 h-1 bg-dark-bg rounded-full appearance-none cursor-pointer accent-brand-danger"
                          />
                          <div className="flex items-center bg-dark-bg/80 border border-dark-border/60 focus-within:border-brand-danger rounded-lg px-2.5 py-1">
                            <input
                              type="number"
                              min="10"
                              max="60"
                              value={pessimisticDiscount}
                              onChange={(e) => setPessimisticDiscount(Math.max(10, Math.min(60, parseInt(e.target.value) || 30)))}
                              className="w-10 bg-transparent text-right font-mono text-xs text-dark-textPrimary outline-none border-none p-0 focus:ring-0 focus:outline-none"
                            />
                            <span className="text-xs text-dark-textSecondary font-mono ml-1">%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ── ROE ── */}
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(31,41,55,0.5)' }}>
                    <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #6366f1, #10b981)' }} />
                    <div className="p-3.5 space-y-3" style={{ background: 'rgba(9,13,22,0.35)' }}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-dark-textSecondary">Retorno sobre Patrimônio (ROE)</span>
                        <div className="flex items-center bg-dark-bg/80 border border-dark-border/60 focus-within:border-brand-primary rounded-lg px-2.5 py-1">
                          <input type="number" step="0.1" min="1" max="100" value={customRoe}
                            onChange={(e) => { const v = parseFloat(e.target.value); setCustomRoe(isNaN(v) ? 0 : v); }}
                            className="w-14 bg-transparent text-right font-mono text-sm text-dark-textPrimary outline-none border-none p-0 focus:ring-0 focus:outline-none"
                          />
                          <span className="text-dark-textSecondary text-sm font-mono ml-1">%</span>
                        </div>
                      </div>
                      <input type="range" min="2" max="45" step="0.5" value={customRoe}
                        onChange={(e) => setCustomRoe(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-dark-bg rounded-full appearance-none cursor-pointer accent-brand-primary"
                      />
                      <span className="text-[11px] font-mono text-dark-textSecondary/70">Rec: {recommendedParams.roe}%</span>
                    </div>
                  </div>

                  {/* ── Payout ── */}
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(31,41,55,0.5)' }}>
                    <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #10b981, #6366f1)' }} />
                    <div className="p-3.5 space-y-3" style={{ background: 'rgba(9,13,22,0.35)' }}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-dark-textSecondary">Taxa de Payout</span>
                        <div className="flex items-center bg-dark-bg/80 border border-dark-border/60 focus-within:border-brand-primary rounded-lg px-2.5 py-1">
                          <input type="number" step="1" min="0" max="100" value={customPayout}
                            onChange={(e) => { const v = parseFloat(e.target.value); setCustomPayout(isNaN(v) ? 0 : v); }}
                            className="w-14 bg-transparent text-right font-mono text-sm text-dark-textPrimary outline-none border-none p-0 focus:ring-0 focus:outline-none"
                          />
                          <span className="text-dark-textSecondary text-sm font-mono ml-1">%</span>
                        </div>
                      </div>
                      <input type="range" min="5" max="95" step="1" value={customPayout}
                        onChange={(e) => setCustomPayout(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-dark-bg rounded-full appearance-none cursor-pointer accent-brand-primary"
                      />
                      <div className="flex justify-between">
                        <span className="text-[11px] font-mono text-dark-textSecondary/70">Rec: {recommendedParams.payout}%</span>
                        <span className="text-[11px] font-mono text-brand-success/70">Retenção: {(100 - customPayout).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* ── ROIC ── */}
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(31,41,55,0.5)' }}>
                    <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #a78bfa, #6366f1)' }} />
                    <div className="p-3.5 space-y-3" style={{ background: 'rgba(9,13,22,0.35)' }}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-dark-textSecondary">ROIC (para g_n terminal)</span>
                        <div className="flex items-center bg-dark-bg/80 border border-dark-border/60 focus-within:border-brand-primary rounded-lg px-2.5 py-1">
                          <input type="number" step="0.1" min="1" max="100" value={customRoic}
                            onChange={(e) => { const v = parseFloat(e.target.value); setCustomRoic(isNaN(v) ? 0 : v); }}
                            className="w-14 bg-transparent text-right font-mono text-sm text-dark-textPrimary outline-none border-none p-0 focus:ring-0 focus:outline-none"
                          />
                          <span className="text-dark-textSecondary text-sm font-mono ml-1">%</span>
                        </div>
                      </div>
                      <input type="range" min="2" max="40" step="0.5" value={customRoic}
                        onChange={(e) => setCustomRoic(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-dark-bg rounded-full appearance-none cursor-pointer accent-brand-primary"
                      />
                      <span className="text-[11px] font-mono text-dark-textSecondary/70">Rec: {recommendedParams.roic}%</span>
                    </div>
                  </div>

                  {/* ── CAGR ── */}
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(31,41,55,0.5)' }}>
                    <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #6366f1, #f59e0b)' }} />
                    <div className="p-3.5 space-y-3" style={{ background: 'rgba(9,13,22,0.35)' }}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-dark-textSecondary">CAGR Estágio 1 (Anos 1-10)</span>
                        <div className="flex items-center bg-dark-bg/80 border border-dark-border/60 focus-within:border-brand-primary rounded-lg px-2.5 py-1">
                          <input type="number" step="0.1" min="0.5" max="30" value={customCagr}
                            onChange={(e) => { const v = parseFloat(e.target.value); setCustomCagr(isNaN(v) ? 0 : v); }}
                            className="w-14 bg-transparent text-right font-mono text-sm text-dark-textPrimary outline-none border-none p-0 focus:ring-0 focus:outline-none"
                          />
                          <span className="text-dark-textSecondary text-sm font-mono ml-1">%</span>
                        </div>
                      </div>
                      <input type="range" min="1" max="25" step="0.5" value={customCagr}
                        onChange={(e) => setCustomCagr(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-dark-bg rounded-full appearance-none cursor-pointer accent-brand-primary"
                      />
                      <span className="text-[11px] font-mono text-dark-textSecondary/70">Rec: {recommendedParams.cagr}%</span>
                    </div>
                  </div>
                </div>

                {/* ── Base Value (DIV0 or FCFE0) ── */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(9,13,22,0.35)', border: '1px solid rgba(31,41,55,0.5)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-dark-textSecondary">
                        {valuationMode === 'DDM' ? 'Dividendo Base (DIV₀) por Ação' : 'FCFE Base (FCFE₀) por Ação'}
                      </span>
                      <div className="text-xs font-mono text-dark-textSecondary/60">
                        {valuationMode === 'DDM'
                          ? `Rec. pelo DY atual: ${currencySymbol} ${recommendedParams.div0}`
                          : `Rec. (DIV₀ / Payout): ${currencySymbol} ${recommendedParams.fcfe0}`}
                      </div>
                    </div>
                    <div className="flex items-center bg-dark-bg/80 border border-dark-border/60 focus-within:border-brand-primary rounded-xl px-3 py-2">
                      <span className="text-base text-dark-textSecondary/60 font-mono mr-1.5 select-none">{currencySymbol}</span>
                      <input type="number" step="0.10" min="0.05"
                        value={valuationMode === 'DDM' ? customDiv0 : customFcfe0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          if (valuationMode === 'DDM') { setCustomDiv0(val); } else { setCustomFcfe0(val); }
                        }}
                        className="w-24 bg-transparent font-mono text-base text-dark-textPrimary outline-none border-none p-0 focus:ring-0 focus:outline-none text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ─── COL 3: Valuation Output Cards ─── */}
        <div className="space-y-6">

          {/* ── Card 1: Gordon Growth Model ── */}
          <div className="card-shine rounded-2xl overflow-hidden shadow-lg" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #4f46e5, #6366f1, #818cf8)' }} />
            <div className="p-5 space-y-4" style={{ background: 'linear-gradient(180deg, rgba(17,24,39,0.98), rgba(15,18,30,1))' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  <h3 className="text-sm font-black text-dark-textPrimary uppercase tracking-wider">
                    {valuationMode === 'DDM' ? 'Perpetuidade Gordon DDM' : 'Perpetuidade Gordon FCFE'}
                  </h3>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(79,70,229,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                  {valuationMode === 'DDM' ? 'GGM' : 'FCFE'}
                </span>
              </div>

              <div className="text-xs py-2.5 px-3.5 rounded-lg text-center font-mono text-dark-textSecondary" style={{ background: 'rgba(9,13,22,0.5)', border: '1px solid rgba(31,41,55,0.4)' }}>
                {valuationMode === 'DDM' ? 'P₀ = [DIV₀ × (1 + g)] / (Ke − g)' : 'P₀ = [FCFE₀ × (1 + g)] / (Ke − g)'}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl space-y-1.5" style={{ background: 'rgba(9,13,22,0.4)', border: '1px solid rgba(31,41,55,0.5)' }}>
                  <span className="text-xs font-bold text-dark-textSecondary/80">Recomendado</span>
                  <p className="text-2xl font-black text-dark-textPrimary font-mono tracking-tight">{currencySymbol} {calcRecommended.gordonVal}</p>
                  <span className="text-[11px] text-dark-textSecondary/60 font-mono">g = {calcRecommended.gordonVal > 0 ? `${calcRecommended.gGordon.toFixed(1)}%` : '0%'}</span>
                </div>
                <div className="p-3.5 rounded-xl space-y-1.5" style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <span className="text-xs font-bold text-indigo-400">Personalizado</span>
                  <p className="text-2xl font-black text-indigo-400 font-mono tracking-tight">{currencySymbol} {calcCustom.gordonVal}</p>
                  <span className="text-[11px] text-indigo-300/60 font-mono">g = {calcCustom.gordonVal > 0 ? `${calcCustom.gGordon.toFixed(1)}%` : '0%'}</span>
                </div>
              </div>

              {(calcRecommended.gWarning || calcCustom.gWarning) && (
                <div className="p-3.5 rounded-xl flex gap-2 items-start text-xs text-amber-400 leading-relaxed" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <p><strong>Aviso:</strong> g foi limitada para ser inferior ao Ke.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Card 2: Two-Stage Model ── */}
          <div className="card-shine rounded-2xl overflow-hidden shadow-lg" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)' }} />
            <div className="p-5 space-y-4" style={{ background: 'linear-gradient(180deg, rgba(17,24,39,0.98), rgba(15,18,30,1))' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
                  <h3 className="text-sm font-black text-dark-textPrimary uppercase tracking-wider">
                    {valuationMode === 'DDM' ? 'DDM de Dois Estágios' : 'FCFE de Dois Estágios'}
                  </h3>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(99,102,241,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                  {valuationMode === 'DDM' ? 'DDM 2S' : 'FCFE 2S'}
                </span>
              </div>

              <div className="text-xs py-2.5 px-3.5 rounded-lg text-center font-mono text-dark-textSecondary" style={{ background: 'rgba(9,13,22,0.5)', border: '1px solid rgba(31,41,55,0.4)' }}>
                P₀ = PV(Estágio 1–10) + PV(Terminal)
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl space-y-1.5" style={{ background: 'rgba(9,13,22,0.4)', border: '1px solid rgba(31,41,55,0.5)' }}>
                  <span className="text-xs font-bold text-dark-textSecondary/80">Recomendado</span>
                  <p className="text-2xl font-black text-dark-textPrimary font-mono tracking-tight">{currencySymbol} {calcRecommended.twoStageVal}</p>
                  <span className="text-[11px] text-dark-textSecondary/60 font-mono">g_n = {calcRecommended.gn.toFixed(1)}%</span>
                </div>
                <div className="p-3.5 rounded-xl space-y-1.5" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <span className="text-xs font-bold text-purple-400">Personalizado</span>
                  <p className="text-2xl font-black text-purple-400 font-mono tracking-tight">{currencySymbol} {calcCustom.twoStageVal}</p>
                  <span className="text-[11px] text-purple-300/60 font-mono">g_n = {calcCustom.gn.toFixed(1)}%</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 pt-3 text-xs font-mono text-dark-textSecondary/70" style={{ borderTop: '1px solid rgba(31,41,55,0.4)' }}>
                <div className="flex justify-between">
                  <span>{valuationMode === 'DDM' ? 'VP Estágio Dividendos (1-10):' : 'VP Estágio FCFE (1-10):'}</span>
                  <span className="text-dark-textPrimary font-bold">{currencySymbol} {calcCustom.pvStage1}</span>
                </div>
                <div className="flex justify-between">
                  <span>VP Terminal (Perpetuidade):</span>
                  <span className="text-dark-textPrimary font-bold">{currencySymbol} {calcCustom.pvTerminal}</span>
                </div>
                <div className="flex justify-between text-dark-textSecondary/50 italic">
                  <span>P(10) = {currencySymbol} {calcCustom.p10}</span>
                </div>
              </div>

              {(calcRecommended.gnWarning || calcCustom.gnWarning) && (
                <div className="p-3.5 rounded-xl flex gap-2 items-start text-xs text-amber-400 leading-relaxed" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <p><strong>Aviso:</strong> g_n terminal foi limitada para ser inferior ao Ke.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* PROJECTION CHART                                */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="rounded-2xl overflow-hidden shadow-lg" style={{ border: '1px solid rgba(31,41,55,0.6)' }}>
        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #10b981, #6366f1, #f59e0b)' }} />
        <div className="p-6 space-y-5" style={{ background: 'linear-gradient(180deg, rgba(17,24,39,0.98), rgba(15,18,30,1))' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-black text-dark-textPrimary uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {valuationMode === 'DDM' ? 'Projeção dos Dividendos' : 'Projeção do FCFE'} — Estágio 1
              </h3>
            </div>
            {/* Chart legend */}
            <div className="flex items-center gap-5 text-xs text-dark-textSecondary font-mono">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: '#4f46e5' }} /> Rec. Bruto</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: '#6366f1' }} /> Pers. Bruto</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-1 rounded-full bg-emerald-500" /> VP Rec.</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-1 rounded-full bg-amber-500" /> VP Pers.</div>
            </div>
          </div>

          <div className="h-72 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="recBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.08}/>
                  </linearGradient>
                  <linearGradient id="custBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.08}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.4} />
                <XAxis dataKey="year" stroke="#4b5563" fontSize={12} className="font-mono" />
                <YAxis stroke="#4b5563" fontSize={12} className="font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1218', border: '1px solid rgba(31,41,55,0.8)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                  labelStyle={{ color: '#f9fafb', fontWeight: 'bold', fontSize: '14px', fontFamily: 'Outfit' }}
                  itemStyle={{ fontSize: '13px', fontFamily: 'JetBrains Mono' }}
                />
                <Bar name={valuationMode === 'DDM' ? "Rec. Dividendo" : "Rec. FCFE"} dataKey="valueRec" fill="url(#recBarGradient)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar name={valuationMode === 'DDM' ? "Pers. Dividendo" : "Pers. FCFE"} dataKey="valueCust" fill="url(#custBarGradient)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Line name="VP Rec." type="monotone" dataKey="pvRec" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} />
                <Line name="VP Pers." type="monotone" dataKey="pvCust" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Explanatory notes */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(9,13,22,0.4)', border: '1px solid rgba(31,41,55,0.4)' }}>
            <div className="flex gap-3 items-start">
              <div className="p-1.5 rounded-lg shrink-0 mt-0.5" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <Info className="w-3.5 h-3.5 text-brand-primary" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-dark-textPrimary" style={{ fontFamily: 'Outfit, sans-serif' }}>Como interpretar:</p>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-dark-textSecondary/80 leading-relaxed">
                  {valuationMode === 'DDM' ? (
                    <>
                      <li>O <strong className="text-dark-textPrimary">Modelo DDM/Gordon</strong> assume que a riqueza do minoritário é gerada puramente pelo fluxo de dividendos descontado.</li>
                      <li>As barras representam o dividendo bruto projetado; as linhas representam seu <strong className="text-dark-textPrimary">Valor Presente</strong> trazido ao ano zero pelo Ke.</li>
                    </>
                  ) : (
                    <>
                      <li>O <strong className="text-dark-textPrimary">Modelo FCFE</strong> captura o valor total do caixa gerado para o acionista, independente de ser distribuído hoje.</li>
                      <li>Mais indicado para empresas de <strong className="text-dark-textPrimary">alto crescimento</strong> com baixo DY inicial e alta geração de caixa operacional.</li>
                    </>
                  )}
                  <li>No <strong className="text-dark-textPrimary">Estágio 2</strong>, g_n é regido pela rentabilidade corporativa reinvestida (ROIC × Retenção), simulando expansão estável de longo prazo.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

