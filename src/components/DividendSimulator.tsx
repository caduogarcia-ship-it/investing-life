// src/components/DividendSimulator.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Landmark, ShieldCheck, DollarSign, Search, ChevronRight } from 'lucide-react';
import { fetchStockData, ALL_B3_TICKERS, searchTickers } from '../services/api';

export const DividendSimulator: React.FC = () => {
  const [targetIncome, setTargetIncome] = useState<number>(5000); // desired monthly passive income
  const [initialCapital, setInitialCapital] = useState<number>(10000); // initial capital
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1000); // monthly savings
  const [ticker, setTicker] = useState<string>('BBAS3'); // reference stock
  const [dy, setDy] = useState<number>(9.5); // pre-filled annual dividend yield
  const [stockPrice, setStockPrice] = useState<number>(27.50); // pre-filled price
  const [years, setYears] = useState<number>(15); // investment horizon in years

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof ALL_B3_TICKERS>([]);

  // Sync search suggestions
  useEffect(() => {
    setSuggestions(searchTickers(searchQuery, 5));
  }, [searchQuery]);

  // Load ticker defaults on selection
  const handleSelectTicker = async (sym: string) => {
    setTicker(sym);
    setSearchQuery(sym);
    setShowSuggestions(false);
    try {
      const data = await fetchStockData(sym);
      setStockPrice(data.regularMarketPrice);
      if (data.dy > 0) {
        setDy(data.dy);
      } else {
        setDy(6.0); // fallback default
      }
    } catch (e) {
      console.warn('Failed to load simulator data for', sym);
    }
  };

  // Run the projection calculations year-by-year
  const projections = useMemo(() => {
    const dataPoints: Array<{
      year: number;
      accumulatedContributions: number;
      reinvestedDividends: number;
      totalCapital: number;
      monthlyIncome: number;
    }> = [];

    let totalCapital = initialCapital;
    let accumulatedContributions = initialCapital;
    let reinvestedDividends = 0;
    const monthlyRate = (dy / 100) / 12; // approximate monthly DY rate

    for (let y = 1; y <= years; y++) {
      let annualDividendsForYear = 0;
      
      // Calculate month by month for accuracy
      for (let m = 0; m < 12; m++) {
        // Dividend payment
        const divEarned = totalCapital * monthlyRate;
        annualDividendsForYear += divEarned;
        reinvestedDividends += divEarned;
        
        // Reinvest dividends immediately + monthly contribution
        totalCapital += divEarned + monthlyContribution;
        accumulatedContributions += monthlyContribution;
      }

      dataPoints.push({
        year: y,
        accumulatedContributions: Math.round(accumulatedContributions),
        reinvestedDividends: Math.round(reinvestedDividends),
        totalCapital: Math.round(totalCapital),
        monthlyIncome: Math.round((totalCapital * (dy / 100)) / 12),
      });
    }

    // Calculate goals metrics
    // Magic number of shares needed for target income:
    // targetIncome * 12 = annual income.
    // annual income / (stockPrice * (dy / 100)) = number of shares
    const annualTarget = targetIncome * 12;
    const dividendPerShare = stockPrice * (dy / 100);
    const sharesNeeded = dividendPerShare > 0 ? Math.ceil(annualTarget / dividendPerShare) : 0;
    const targetCapitalNeeded = sharesNeeded * stockPrice;

    // Time to reach snowball effect (when monthly dividends >= monthly contribution)
    let snowballYear = -1;
    for (const point of dataPoints) {
      if (point.monthlyIncome >= monthlyContribution) {
        snowballYear = point.year;
        break;
      }
    }

    // Time to reach the target passive income
    let targetAchievedYear = -1;
    for (const point of dataPoints) {
      if (point.monthlyIncome >= targetIncome) {
        targetAchievedYear = point.year;
        break;
      }
    }

    return {
      points: dataPoints,
      sharesNeeded,
      targetCapitalNeeded,
      snowballYear,
      targetAchievedYear,
      finalCapital: totalCapital,
      finalMonthlyIncome: (totalCapital * (dy / 100)) / 12,
    };
  }, [initialCapital, monthlyContribution, dy, stockPrice, years, targetIncome]);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Info Panel */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl">
              <Calculator className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-dark-textPrimary tracking-tight">Simulador de Liberdade Financeira</h2>
              <p className="text-xs text-dark-textSecondary font-medium">Projete o Efeito Bola de Neve reinvestindo dividendos ao longo do tempo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Controls (5 cols) */}
        <div className="lg:col-span-5 bg-dark-card border border-dark-border rounded-2xl p-6 lg:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            
            {/* Stock Prefiller */}
            <div className="space-y-2 relative">
              <label className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Ativo de Referência (Preencher Automático)</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-textSecondary/70" />
                <input
                  type="text"
                  placeholder="Buscar ação B3... (Ex: BBAS3, TAEE11)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-xs text-dark-textPrimary placeholder:text-dark-textSecondary/50 focus:outline-none focus:border-brand-primary/50 transition-all font-mono"
                />
              </div>
              
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-30 mt-1 w-full bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {suggestions.map((t) => (
                    <button
                      key={t.symbol}
                      onClick={() => handleSelectTicker(t.symbol)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-dark-cardHover transition-all text-left border-b border-dark-border/20 last:border-b-0 cursor-pointer"
                    >
                      <div>
                        <span className="font-mono font-bold text-xs text-dark-textPrimary">{t.symbol}</span>
                        <span className="text-4xs text-dark-textSecondary ml-2">{t.name}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-dark-textSecondary" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Slider: Target Monthly Income */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold font-sans">
                <span className="text-dark-textSecondary flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-brand-primary" /> Renda Mensal Desejada
                </span>
                <span className="text-brand-primary font-mono">R$ {targetIncome.toLocaleString('pt-BR')}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="30000"
                step="500"
                value={targetIncome}
                onChange={(e) => setTargetIncome(parseInt(e.target.value))}
                className="w-full h-1.5 bg-dark-border rounded-lg appearance-none cursor-pointer accent-brand-primary"
              />
            </div>

            {/* Slider: Monthly Contribution */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold font-sans">
                <span className="text-dark-textSecondary flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Aporte Mensal
                </span>
                <span className="text-emerald-400 font-mono">R$ {monthlyContribution.toLocaleString('pt-BR')}</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(parseInt(e.target.value))}
                className="w-full h-1.5 bg-dark-border rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Grid of Inputs */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-4xs font-bold text-dark-textSecondary uppercase tracking-wider block">Patrimônio Inicial</label>
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-dark-textPrimary focus:outline-none focus:border-brand-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-4xs font-bold text-dark-textSecondary uppercase tracking-wider block">Tempo (Anos)</label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Math.min(40, parseInt(e.target.value) || 1)))}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-dark-textPrimary focus:outline-none focus:border-brand-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-4xs font-bold text-dark-textSecondary uppercase tracking-wider block">DY% Estimado (a.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dy}
                  onChange={(e) => setDy(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-dark-textPrimary focus:outline-none focus:border-brand-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-4xs font-bold text-dark-textSecondary uppercase tracking-wider block">Preço do Ativo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={stockPrice}
                  onChange={(e) => setStockPrice(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-dark-textPrimary focus:outline-none focus:border-brand-primary/50"
                />
              </div>
            </div>

          </div>

          <div className="text-4xs text-dark-textSecondary font-bold bg-dark-bg/40 border border-dark-border/40 p-3.5 rounded-xl leading-normal">
            💡 <strong>Efeito Bola de Neve:</strong> Quando os dividendos mensais pagos pela sua carteira superam o seu aporte mensal, a carteira passa a crescer de forma exponencial sem que você precise aumentar a sua contribuição.
          </div>
        </div>

        {/* Right Column: Projection Charts & Metrics (7 cols) */}
        <div className="lg:col-span-7 bg-dark-card border border-dark-border rounded-2xl p-6 lg:p-8 shadow-xl flex flex-col justify-between space-y-6">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-dark-bg/40 border border-dark-border/50 rounded-xl p-4.5">
              <span className="text-4xs font-bold text-dark-textSecondary uppercase tracking-wider block">Patrimônio Final</span>
              <span className="text-md font-black text-dark-textPrimary font-mono block mt-1">R$ {projections.finalCapital.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="bg-dark-bg/40 border border-dark-border/50 rounded-xl p-4.5">
              <span className="text-4xs font-bold text-dark-textSecondary uppercase tracking-wider block">Renda Mensal Final</span>
              <span className="text-md font-black text-emerald-400 font-mono block mt-1">R$ {projections.finalMonthlyIncome.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="bg-dark-bg/40 border border-dark-border/50 rounded-xl p-4.5 col-span-2">
              <span className="text-4xs font-bold text-dark-textSecondary uppercase tracking-wider block">Meta: {targetIncome.toLocaleString('pt-BR')}/mês</span>
              <span className="text-2xs font-extrabold text-dark-textPrimary mt-1.5 flex items-center gap-1.5 font-mono">
                {projections.sharesNeeded.toLocaleString('pt-BR')} ações ({ticker})
              </span>
              <span className="text-4xs text-dark-textSecondary block">Patrimônio total: R$ {projections.targetCapitalNeeded.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          {/* Goal Milestones Section */}
          <div className="space-y-3.5 bg-dark-bg/60 border border-dark-border/60 rounded-xl p-4.5">
            <h4 className="text-3xs font-bold text-dark-textPrimary uppercase tracking-wider">Metas e Inflexões da Projeção</h4>
            
            <div className="space-y-2.5">
              {/* Snowball Goal */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-dark-textSecondary flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-brand-primary" /> Efeito Bola de Neve (R$ {monthlyContribution.toLocaleString('pt-BR')}/mês)
                </span>
                {projections.snowballYear > 0 ? (
                  <span className="font-mono text-3xs px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary font-black uppercase">
                    Atingido no Ano {projections.snowballYear}
                  </span>
                ) : (
                  <span className="font-mono text-4xs px-2 py-0.5 rounded bg-dark-border text-dark-textSecondary font-bold">
                    Fora do Horizonte
                  </span>
                )}
              </div>

              {/* Income Target Goal */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-dark-textSecondary flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-success" /> Meta de Aposentadoria (R$ {targetIncome.toLocaleString('pt-BR')}/mês)
                </span>
                {projections.targetAchievedYear > 0 ? (
                  <span className="font-mono text-3xs px-2 py-0.5 rounded bg-brand-success/10 text-brand-success font-black uppercase">
                    Atingido no Ano {projections.targetAchievedYear}
                  </span>
                ) : (
                  <span className="font-mono text-4xs px-2 py-0.5 rounded bg-dark-border text-dark-textSecondary font-bold">
                    Mais de {years} anos
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Visual Custom Column Chart (SVG-based for simplicity, zero dependencies, responsive) */}
          <div className="space-y-2.5">
            <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Evolução do Patrimônio (Aportes vs Proventos Reinvestidos)</span>
            
            <div className="h-44 w-full relative flex items-end justify-between gap-1 pt-6 pb-2 select-none border-b border-dark-border/40">
              {projections.points.map((pt, idx) => {
                const maxCap = Math.max(...projections.points.map(p => p.totalCapital)) || 1;
                const totalHeight = Math.max(8, (pt.totalCapital / maxCap) * 120);
                const contribHeight = (pt.accumulatedContributions / pt.totalCapital) * totalHeight;
                const divHeight = totalHeight - contribHeight;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    
                    {/* Tooltip on hover */}
                    <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-dark-card border border-dark-border rounded-xl shadow-2xl p-2.5 min-w-[140px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity font-mono text-left leading-normal">
                      <div className="text-4xs text-dark-textSecondary font-bold">ANO {pt.year}</div>
                      <div className="text-xs font-black text-dark-textPrimary mt-0.5">R$ {pt.totalCapital.toLocaleString('pt-BR')}</div>
                      <div className="text-4xs text-brand-primary mt-1">Aportes: R$ {pt.accumulatedContributions.toLocaleString('pt-BR')}</div>
                      <div className="text-4xs text-emerald-400">Rendimentos: R$ {(pt.totalCapital - pt.accumulatedContributions).toLocaleString('pt-BR')}</div>
                    </div>

                    {/* Stacked bar */}
                    <div className="w-full max-w-[20px] flex flex-col justify-end" style={{ height: `${totalHeight}px` }}>
                      {/* Dividends segment */}
                      <div 
                        className="w-full bg-emerald-500 rounded-t-sm" 
                        style={{ height: `${divHeight}px` }} 
                        title={`Rendimentos: R$ ${(pt.totalCapital - pt.accumulatedContributions).toLocaleString('pt-BR')}`}
                      />
                      {/* Contributions segment */}
                      <div 
                        className="w-full bg-brand-primary" 
                        style={{ height: `${contribHeight}px` }} 
                        title={`Aportes: R$ ${pt.accumulatedContributions.toLocaleString('pt-BR')}`}
                      />
                    </div>

                    {/* Year Label */}
                    <span className="text-4xs font-mono text-dark-textSecondary font-bold mt-1.5">
                      {pt.year}a
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Custom Legend */}
            <div className="flex justify-between items-center text-4xs font-bold text-dark-textSecondary uppercase tracking-wider">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-brand-primary" /> Aportes Acumulados
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-emerald-500" /> Rendimentos Reinvestidos
                </span>
              </div>
              <span className="font-mono">Fim do Período: {years} anos</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
