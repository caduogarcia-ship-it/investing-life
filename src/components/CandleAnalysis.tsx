// src/components/CandleAnalysis.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Sliders, Activity, AlertTriangle, ShieldCheck, Calendar, TrendingUp, BarChart2 } from 'lucide-react';
import { fetchStockData, fetchCandleChartData } from '../services/api';
import type { StockData, CandleTimeframe, CandleDataPoint } from '../services/api';
import { LocalCandleChart } from './LocalCandleChart';

interface CandleAnalysisProps {
  ticker: string;
}

const TIMEFRAME_OPTIONS: { key: CandleTimeframe; label: string; desc: string }[] = [
  { key: 'daily',   label: 'Diário',  desc: '6 meses • Candles diários' },
  { key: 'weekly',  label: 'Semanal', desc: '2 anos • Candles semanais' },
  { key: 'monthly', label: 'Mensal',  desc: '5 anos • Candles mensais' },
];

export const CandleAnalysis: React.FC<CandleAnalysisProps> = ({ ticker }) => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [candleHistory, setCandleHistory] = useState<CandleDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<CandleTimeframe>('daily');

  // Projections Sliders State
  const [desiredYield, setDesiredYield] = useState<number>(6); // Default 6%
  const [marginOfSafety, setMarginOfSafety] = useState<number>(10); // Default 10%

  // Load stock fundamentals data
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStockData(ticker);
        if (active) {
          setStockData(data);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Erro ao carregar dados do ativo.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [ticker]);

  // Load candle chart data (separate from stock data, supports timeframe switching)
  useEffect(() => {
    let active = true;
    const loadCandles = async () => {
      setChartLoading(true);
      try {
        const history = await fetchCandleChartData(ticker, timeframe);
        if (active) {
          setCandleHistory(history);
        }
      } catch (err) {
        console.warn('Candle chart data fetch error:', err);
      } finally {
        if (active) {
          setChartLoading(false);
        }
      }
    };
    loadCandles();
    return () => {
      active = false;
    };
  }, [ticker, timeframe]);

  // Calculations for Technical levels (uses candle data for current timeframe)
  const technicalLevels = useMemo(() => {
    const history = candleHistory.length > 0 ? candleHistory : (stockData?.history || []);
    if (history.length === 0) {
      return { resistance30d: 0, support30d: 0, resistance60d: 0, support60d: 0 };
    }

    // Last 22 data points (roughly 1 month of daily data)
    const history30d = history.slice(-22);
    // Last 44 data points
    const history60d = history.slice(-44);

    const getLevels = (list: typeof history) => {
      let maxHigh = -Infinity;
      let minLow = Infinity;
      list.forEach(p => {
        const h = p.high !== undefined ? p.high : p.price;
        const l = p.low !== undefined ? p.low : p.price;
        if (h > maxHigh) maxHigh = h;
        if (l < minLow) minLow = l;
      });
      return { resistance: maxHigh, support: minLow };
    };

    const lvl30d = getLevels(history30d);
    const lvl60d = getLevels(history60d);

    return {
      resistance30d: lvl30d.resistance,
      support30d: lvl30d.support,
      resistance60d: lvl60d.resistance,
      support60d: lvl60d.support
    };
  }, [candleHistory, stockData]);

  // Calculations for Bazin Ceiling Price (Preço Teto)
  const valuationProjections = useMemo(() => {
    if (!stockData) return { annualDividend: 0, precoTetoBazin: 0, precoTetoSafety: 0, upside: 0 };

    const currentPrice = stockData.regularMarketPrice;
    // Calculate dividend paid per year from DY % and current price
    const annualDividend = currentPrice * (stockData.dy / 100);
    
    // Preço Teto Bazin = Proventos / desiredYield (expressed as decimal)
    const precoTetoBazin = desiredYield > 0 ? annualDividend / (desiredYield / 100) : 0;
    
    // Apply margin of safety discount
    const precoTetoSafety = precoTetoBazin * (1 - marginOfSafety / 100);

    const upside = precoTetoSafety > 0 
      ? ((precoTetoSafety - currentPrice) / currentPrice) * 100 
      : 0;

    return {
      annualDividend,
      precoTetoBazin,
      precoTetoSafety,
      upside
    };
  }, [stockData, desiredYield, marginOfSafety]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-24 bg-dark-card border border-dark-border rounded-2xl" />
        <div className="h-[560px] bg-dark-card border border-dark-border rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[300px] bg-dark-card border border-dark-border rounded-2xl" />
          <div className="h-[300px] bg-dark-card border border-dark-border rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="p-8 bg-rose-950/20 border border-brand-danger/30 text-brand-danger rounded-2xl flex flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="w-10 h-10" />
        <div>
          <h4 className="text-md font-bold">Falha ao Carregar Gráfico de Candles</h4>
          <p className="text-xs text-dark-textSecondary mt-1 max-w-md">{error || 'Ativo não disponível para análise gráfica.'}</p>
        </div>
      </div>
    );
  }

  const { resistance30d, support30d } = technicalLevels;
  const { annualDividend, precoTetoBazin, precoTetoSafety, upside } = valuationProjections;
  const currentPrice = stockData.regularMarketPrice;
  const activeTimeframeOption = TIMEFRAME_OPTIONS.find(t => t.key === timeframe)!;

  // Determine which data to pass to the chart
  const chartHistoryData = candleHistory.length > 0 ? candleHistory : stockData.history;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Visual Title / Asset Panel */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-2xl text-dark-textPrimary tracking-wider bg-dark-bg px-3.5 py-1 rounded-xl border border-dark-border/80">
              {stockData.symbol}
            </span>
            <div>
              <h2 className="text-lg font-bold text-dark-textPrimary">{stockData.longName}</h2>
              <span className="text-4xs text-dark-textSecondary font-bold uppercase tracking-wider">Análise Técnica de Candles &amp; Projeções de Preço</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 font-mono select-none">
          <div>
            <span className="text-4xs text-dark-textSecondary font-bold block uppercase tracking-wider">Preço Atual</span>
            <span className="text-xl font-black text-dark-textPrimary">
              R$ {currentPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="h-8 w-px bg-dark-border/60" />
          <div>
            <span className="text-4xs text-dark-textSecondary font-bold block uppercase tracking-wider">Máxima (Resistência)</span>
            <span className="text-sm font-bold text-brand-success">
              R$ {resistance30d.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="h-8 w-px bg-dark-border/60" />
          <div>
            <span className="text-4xs text-dark-textSecondary font-bold block uppercase tracking-wider">Mínima (Suporte)</span>
            <span className="text-sm font-bold text-brand-danger">
              R$ {support30d.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>

      {/* ========== FULL-WIDTH CHART SECTION ========== */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 lg:p-8 shadow-xl flex flex-col space-y-5">
        
        {/* Chart Header with Timeframe Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/10 border border-brand-primary/20 rounded-xl">
              <BarChart2 className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-dark-textPrimary tracking-tight">Gráfico Técnico de Candles</h3>
              <p className="text-xs text-dark-textSecondary font-medium flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {activeTimeframeOption.desc} • Yahoo Finance
              </p>
            </div>
          </div>

          {/* Timeframe Toggle */}
          <div className="flex items-center bg-dark-bg border border-dark-border p-1 rounded-xl">
            {TIMEFRAME_OPTIONS.map(tf => (
              <button
                key={tf.key}
                onClick={() => setTimeframe(tf.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeframe === tf.key
                    ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/20'
                    : 'text-dark-textSecondary hover:text-dark-textPrimary hover:bg-dark-cardHover'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual indicators legend */}
        <div className="flex items-center gap-5 text-3xs font-semibold text-dark-textSecondary flex-wrap border-b border-dark-border/30 pb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-brand-danger border-t border-dashed" />
            <span>Resistência (R$ {resistance30d.toFixed(2)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-brand-success border-t border-dashed" />
            <span>Suporte (R$ {support30d.toFixed(2)})</span>
          </div>
          {precoTetoSafety > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500 border-t border-dashed" />
              <span>Preço Teto (R$ {precoTetoSafety.toFixed(2)})</span>
            </div>
          )}
          {chartLoading && (
            <span className="text-brand-primary animate-pulse ml-auto">Carregando candles...</span>
          )}
        </div>

        {/* CHART — FULL WIDTH, LARGE HEIGHT */}
        <div className="h-[540px] w-full relative">
          {chartLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-bg/40 rounded-2xl backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-dark-textSecondary font-bold">Carregando {activeTimeframeOption.label.toLowerCase()}...</span>
              </div>
            </div>
          ) : null}
          <LocalCandleChart 
            data={chartHistoryData} 
            resistance={resistance30d} 
            support={support30d} 
            precoTeto={precoTetoSafety} 
          />
        </div>

        <div className="pt-2 border-t border-dark-border/40 text-4xs font-bold text-dark-textSecondary uppercase tracking-wider flex items-center justify-between">
          <span>Dados históricos do Yahoo Finance • Intervalo: {activeTimeframeOption.label}</span>
          <span>Motor de Gráfico: Lightweight Charts (TradingView Engine)</span>
        </div>

      </div>

      {/* ========== BOTTOM: PROJECTIONS & TECHNICAL ANALYSIS SIDE-BY-SIDE ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Left: Projection Controls & Report */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 lg:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-purple/10 border border-brand-purple/20 rounded-xl">
                <TrendingUp className="w-5 h-5 text-brand-purple" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark-textPrimary tracking-tight">Projeções e Ajustes</h3>
                <p className="text-xs text-dark-textSecondary font-medium">Ajuste os parâmetros para simular o preço teto ideal</p>
              </div>
            </div>

            {/* Sliders Area */}
            <div className="space-y-5 bg-dark-bg/40 border border-dark-border/50 rounded-xl p-4.5">
              
              {/* Yield slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-dark-textSecondary flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-brand-primary" /> DY Mínimo Desejado
                  </span>
                  <span className="text-brand-primary font-mono">{desiredYield}% a.a.</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={desiredYield}
                  onChange={(e) => setDesiredYield(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-dark-border rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
              </div>

              {/* Safety Margin slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-dark-textSecondary flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-brand-purple" /> Margem de Segurança
                  </span>
                  <span className="text-brand-purple font-mono">{marginOfSafety}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={marginOfSafety}
                  onChange={(e) => setMarginOfSafety(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-dark-border rounded-lg appearance-none cursor-pointer accent-brand-purple"
                />
              </div>

            </div>

            {/* Performance analysis report */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-dark-textSecondary uppercase tracking-wider">Resumo das Projeções</h4>
              
              {stockData.dy === 0 ? (
                <div className="p-4 bg-amber-950/15 border border-amber-500/20 text-amber-500 rounded-xl flex gap-3 text-xs leading-relaxed">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Dividendo Indisponível</span>
                    <p className="text-3xs text-dark-textSecondary mt-0.5">
                      Este ativo possui Dividend Yield zerado. Para calcular o Preço Teto Bazin, é necessário que a empresa distribua proventos.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Dynamic comparison badge */}
                  <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                    upside >= 0
                      ? 'bg-emerald-950/15 border-brand-success/20 text-brand-success'
                      : 'bg-rose-950/15 border-brand-danger/20 text-brand-danger'
                  }`}>
                    {upside >= 0 ? (
                      <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-brand-success" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-brand-danger" />
                    )}
                    <div className="text-xs leading-relaxed">
                      <span className="font-bold font-sans">
                        {upside >= 0 
                          ? 'Margem de Segurança OK' 
                          : 'Abaixo da Margem de Segurança'}
                      </span>
                      <p className="text-3xs text-dark-textSecondary mt-0.5">
                        {upside >= 0 
                          ? `O preço atual está abaixo do preço teto sugerido. Há uma margem de valorização de +${upside.toFixed(1)}% para atingir a rentabilidade mínima.`
                          : `O preço atual está acima do preço teto sugerido de R$ ${precoTetoSafety.toFixed(2)}. Risco de margem de valorização negativo em ${upside.toFixed(1)}%.`}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Breakdown list */}
                  <div className="divide-y divide-dark-border/40 text-2xs font-semibold select-none">
                    <div className="flex justify-between py-2.5">
                      <span className="text-dark-textSecondary">Dividendo Anual Estimado:</span>
                      <span className="text-dark-textPrimary font-mono">R$ {annualDividend.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-dark-textSecondary flex items-center gap-1">
                        Preço Teto Bazin puro:
                      </span>
                      <span className="text-dark-textPrimary font-mono">R$ {precoTetoBazin.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-dark-textSecondary font-bold">Preço Teto c/ Margem:</span>
                      <span className="text-amber-500 font-mono font-extrabold text-xs">R$ {precoTetoSafety.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-dark-textSecondary">Potencial de Upside:</span>
                      <span className={`font-mono font-bold ${upside >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                        {upside >= 0 ? '+' : ''}{upside.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right: Technical Analysis Report & Operational Guidance */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 lg:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-success/10 border border-brand-success/20 rounded-xl">
                  <Activity className="w-5 h-5 text-brand-success" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-dark-textPrimary tracking-tight">Estudo Técnico Operacional</h3>
                  <p className="text-xs text-dark-textSecondary font-medium">Pontos de compra/venda baseados em suporte e resistência</p>
                </div>
              </div>

              {/* Dynamic Operational Signal Badge */}
              {(() => {
                const range = resistance30d - support30d;
                const position = range > 0 ? ((currentPrice - support30d) / range) * 100 : 50;
                let signalText = 'Aguardar (Neutro)';
                let badgeClass = 'bg-dark-bg border-dark-border text-dark-textSecondary';
                
                if (position <= 15) {
                  signalText = 'Compra (Suporte)';
                  badgeClass = 'bg-emerald-950/20 border-brand-success/45 text-brand-success animate-pulse';
                } else if (position >= 85) {
                  signalText = 'Venda (Resistência)';
                  badgeClass = 'bg-rose-950/20 border-brand-danger/45 text-brand-danger';
                }
                
                return (
                  <span className={`px-3 py-1.5 rounded-lg border text-4xs font-black uppercase tracking-wider font-mono ${badgeClass}`}>
                    Sinal: {signalText}
                  </span>
                );
              })()}
            </div>

            {/* Key levels grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-bg/40 border border-dark-border/50 rounded-xl p-4 space-y-1">
                <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Resistência Curta (Alvo)</span>
                <span className="text-lg font-black text-brand-danger font-mono">R$ {resistance30d.toFixed(2)}</span>
                <span className="text-3xs text-dark-textSecondary block">Região de realização / Venda</span>
              </div>
              <div className="bg-dark-bg/40 border border-dark-border/50 rounded-xl p-4 space-y-1">
                <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Suporte Curto (Entrada)</span>
                <span className="text-lg font-black text-brand-success font-mono">R$ {support30d.toFixed(2)}</span>
                <span className="text-3xs text-dark-textSecondary block">Região de compra com baixo risco</span>
              </div>
            </div>

            {/* Trading Guidelines Table */}
            <div className="bg-dark-bg/60 border border-dark-border/60 rounded-xl p-4.5 space-y-3">
              <span className="text-3xs font-bold text-dark-textPrimary uppercase tracking-wider block">Diretrizes Operacionais</span>
              
              <div className="grid grid-cols-3 gap-2.5 text-center text-3xs font-mono font-bold select-none">
                <div className="bg-emerald-950/10 border border-brand-success/15 rounded-lg p-2">
                  <span className="text-dark-textSecondary block mb-1">Zona de Compra</span>
                  <span className="text-brand-success text-2xs">R$ {(support30d * 0.995).toFixed(2)} - R$ {(support30d * 1.02).toFixed(2)}</span>
                </div>
                <div className="bg-rose-950/10 border border-brand-danger/15 rounded-lg p-2">
                  <span className="text-dark-textSecondary block mb-1">Zona de Venda</span>
                  <span className="text-brand-danger text-2xs">R$ {(resistance30d * 0.98).toFixed(2)} - R$ {(resistance30d * 1.005).toFixed(2)}</span>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-lg p-2">
                  <span className="text-dark-textSecondary block mb-1">Stop Loss Sugerido</span>
                  <span className="text-dark-textPrimary text-2xs">R$ {(support30d * 0.97).toFixed(2)} (-3%)</span>
                </div>
              </div>

              {/* Dynamic Risk-Reward Text */}
              {(() => {
                // Risk is entry - stop loss. If entering here, risk is (currentPrice - stopLoss)
                const stopLossPrice = support30d * 0.97;
                const risk = currentPrice - stopLossPrice;
                const reward = resistance30d - currentPrice;
                const ratio = risk > 0 ? (reward / risk) : 0;

                const isGoodRatio = ratio >= 1.5;

                return (
                  <div className="border-t border-dark-border/40 pt-2.5 mt-2.5 text-2xs text-dark-textSecondary leading-relaxed font-semibold">
                    <p className="flex justify-between items-center mb-1">
                      <span>Relação Risco x Retorno atual:</span>
                      <strong className={`font-mono text-3xs px-2 py-0.5 rounded ${isGoodRatio ? 'bg-brand-success/10 text-brand-success' : 'bg-amber-500/10 text-amber-500'}`}>
                        {ratio.toFixed(2)} (1 a {ratio.toFixed(1)})
                      </strong>
                    </p>
                    <p className="text-3xs text-dark-textSecondary font-medium">
                      {ratio >= 1.5 
                        ? '🟢 Relação favorável para novas entradas de compra: o retorno potencial até a resistência supera amplamente o risco do stop loss.' 
                        : '🟡 Relação desfavorável ou neutra para compras no preço atual. Aguarde maior proximidade com o suporte ou realize lucros parciais.'}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Current position analysis */}
            <div className="space-y-2">
              <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Posição Atual no Canal</span>
              {(() => {
                const range = resistance30d - support30d;
                const position = range > 0 ? ((currentPrice - support30d) / range) * 100 : 50;
                const clampedPos = Math.max(0, Math.min(100, position));
                return (
                  <div className="space-y-2">
                    <div className="relative h-3 bg-dark-bg border border-dark-border/50 rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${clampedPos}%`,
                          background: `linear-gradient(90deg, #10B981, ${clampedPos > 70 ? '#EF4444' : '#F59E0B'})`,
                        }}
                      />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-dark-bg rounded-full shadow-lg"
                        style={{ left: `calc(${clampedPos}% - 5px)` }}
                      />
                    </div>
                    <div className="flex justify-between text-3xs font-mono text-dark-textSecondary">
                      <span className="text-brand-success">Suporte</span>
                      <span className="text-dark-textPrimary font-bold">{clampedPos.toFixed(0)}% do canal</span>
                      <span className="text-brand-danger">Resistência</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
