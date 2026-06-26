// src/components/RiskAnalysis.tsx
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Sparkles, Coins } from 'lucide-react';
import { saveUserOverride, getUserOverrides } from '../services/api';
import type { StockData } from '../services/api';

interface RiskAnalysisProps {
  data: StockData;
  onUpdateData: (newData: Partial<StockData>) => void;
}

// 1. RISK ANALYSIS COMPONENT
export const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ data }) => {
  const getRiskDetails = (vol: number) => {
    if (vol < 18) {
      return { 
        level: 'Baixo' as const, 
        color: 'text-brand-success border-brand-success/20 bg-emerald-950/15', 
        barColor: 'bg-brand-success',
        pointerPercent: 20,
        desc: 'Ativo com baixa oscilação recente de preços. Geralmente associado a setores estáveis como energia ou saneamento.' 
      };
    } else if (vol <= 32) {
      return { 
        level: 'Médio' as const, 
        color: 'text-brand-warning border-brand-warning/20 bg-amber-950/15', 
        barColor: 'bg-brand-warning',
        pointerPercent: 55,
        desc: 'Oscilação moderada. Enquadra-se no comportamento médio de mercado para empresas cíclicas de grande porte.' 
      };
    } else {
      return { 
        level: 'Alto' as const, 
        color: 'text-brand-danger border-brand-danger/20 bg-rose-950/15', 
        barColor: 'bg-brand-danger',
        pointerPercent: 85,
        desc: 'Ativo altamente volátil. Movimentações bruscas causadas por ciclos setoriais fortes, alavancagem ou reestruturação.' 
      };
    }
  };

  const risk = getRiskDetails(data.volatility);

  return (
    <div className="glass-card rounded-2xl p-6 lg:p-8 shadow-xl space-y-6 flex flex-col justify-between h-full">
      {/* Title */}
      <div>
        <span className="text-2xs font-bold text-brand-purple uppercase tracking-wider block mb-1">Avaliação Avançada</span>
        <h3 className="text-lg font-bold text-dark-textPrimary tracking-tight">Métricas de Risco de Preço</h3>
      </div>

      {/* Description */}
      <div className="bg-dark-bg/25 border border-dark-border/40 rounded-xl p-4.5 space-y-2">
        <h4 className="text-xs font-bold text-dark-textPrimary uppercase tracking-wider">Perfil de Oscilação</h4>
        <p className="text-xs text-dark-textSecondary leading-relaxed">{risk.desc}</p>
      </div>

      {/* Thermometer Slider */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-2xs font-bold text-dark-textSecondary uppercase tracking-wider">
          <span>Termômetro de Risco</span>
          <span className={`px-2.5 py-0.5 rounded-full border text-4xs font-mono font-bold tracking-wide uppercase ${risk.color}`}>
            Risco: {risk.level}
          </span>
        </div>
        
        <div className="relative pt-4 pb-2">
          {/* Colored track */}
          <div className="h-2.5 w-full bg-gradient-to-r from-brand-success via-brand-warning to-brand-danger rounded-full relative">
            {/* Pointer indicator */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -ml-2.5 w-5 h-5 bg-white border-2 border-dark-card shadow-lg rounded-full transition-all duration-500 flex items-center justify-center cursor-pointer"
              style={{ left: `${risk.pointerPercent}%` }}
            >
              <div className="w-1.5 h-1.5 bg-dark-bg rounded-full" />
            </div>
          </div>
          
          <div className="flex justify-between text-3xs font-semibold text-dark-textSecondary pt-2 font-mono">
            <span>Baixo</span>
            <span>Médio</span>
            <span>Alto</span>
          </div>
        </div>
      </div>

      {/* Volatility Grid */}
      <div className="border-t border-dark-border/45 pt-5 grid grid-cols-2 gap-4">
        <div className="bg-dark-bg/35 border border-dark-border/45 p-4 rounded-xl space-y-1">
          <span className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider">Volatilidade (1M)</span>
          <span className="text-base font-extrabold text-dark-textPrimary font-mono leading-none">
            {data.volatility.toFixed(2)}% <span className="text-4xs text-dark-textSecondary font-sans font-medium">a.a.</span>
          </span>
        </div>
        <div className="bg-dark-bg/35 border border-dark-border/45 p-4 rounded-xl space-y-1 flex flex-col justify-center">
          <span className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider">Desvio Padrão</span>
          <span className="text-4xs text-brand-purple font-mono font-bold uppercase tracking-wider block">Cálculo Diário</span>
        </div>
      </div>
    </div>
  );
};


// 2. VALUATION ANALYSIS COMPONENT
export const ValuationAnalysis: React.FC<RiskAnalysisProps> = ({ data, onUpdateData }) => {
  const overrides = (getUserOverrides()[data.symbol] || {}) as any;
  
  const [valuationMethod, setValuationMethod] = useState<'graham' | 'bazin' | 'manual'>(
    overrides.valuationMethod || (data.fairPriceManual !== undefined ? 'manual' : 'graham')
  );

  const [lpaInput, setLpaInput] = useState(data.lpa.toString());
  const [vpaInput, setVpaInput] = useState(data.vpa.toString());
  
  const [dyInput, setDyInput] = useState(
    overrides.dyBazinOverride?.toString() || data.dy.toString()
  );
  const [targetDyInput, setTargetDyInput] = useState(
    overrides.targetDyBazinOverride?.toString() || '6.0'
  );

  const [manualPriceInput, setManualPriceInput] = useState(data.fairPriceManual?.toString() || '');

  // Reset inputs when switching tickers
  useEffect(() => {
    const symbolOverrides = (getUserOverrides()[data.symbol] || {}) as any;
    setLpaInput(data.lpa.toString());
    setVpaInput(data.vpa.toString());
    setManualPriceInput(data.fairPriceManual?.toString() || '');
    setValuationMethod(symbolOverrides.valuationMethod || (data.fairPriceManual !== undefined ? 'manual' : 'graham'));
    setDyInput(symbolOverrides.dyBazinOverride?.toString() || data.dy.toString());
    setTargetDyInput(symbolOverrides.targetDyBazinOverride?.toString() || '6.0');
  }, [data.symbol, data.lpa, data.vpa, data.dy, data.fairPriceManual]);

  const calculateGrahamPrice = (lpa: number, vpa: number): number | null => {
    if (lpa <= 0 || vpa <= 0) return null;
    const value = Math.sqrt(22.5 * lpa * vpa);
    return isNaN(value) ? null : Number(value.toFixed(2));
  };

  const handleUpdateValuationParams = () => {
    const lpaVal = parseFloat(lpaInput);
    const vpaVal = parseFloat(vpaInput);
    
    if (!isNaN(lpaVal) && !isNaN(vpaVal)) {
      saveUserOverride(data.symbol, { lpa: lpaVal, vpa: vpaVal });
      onUpdateData({ lpa: lpaVal, vpa: vpaVal });
    }
  };

  const handleUpdateBazinParams = () => {
    const dyVal = parseFloat(dyInput);
    const targetDyVal = parseFloat(targetDyInput);
    if (!isNaN(dyVal) && !isNaN(targetDyVal)) {
      saveUserOverride(data.symbol, { 
        dyBazinOverride: dyVal,
        targetDyBazinOverride: targetDyVal
      } as any);
      onUpdateData({ dy: dyVal });
    }
  };

  const handleMethodChange = (method: 'graham' | 'bazin' | 'manual') => {
    setValuationMethod(method);
    saveUserOverride(data.symbol, { valuationMethod: method } as any);
    
    if (method === 'manual') {
      const val = parseFloat(manualPriceInput);
      if (!isNaN(val)) {
        saveUserOverride(data.symbol, { fairPriceManual: val });
        onUpdateData({ fairPriceManual: val });
      }
    } else {
      saveUserOverride(data.symbol, { fairPriceManual: undefined });
      onUpdateData({ fairPriceManual: undefined });
    }
  };

  const handleSaveManualPrice = () => {
    const val = parseFloat(manualPriceInput);
    if (!isNaN(val)) {
      saveUserOverride(data.symbol, { fairPriceManual: val });
      onUpdateData({ fairPriceManual: val });
    } else if (manualPriceInput === '') {
      saveUserOverride(data.symbol, { fairPriceManual: undefined });
      onUpdateData({ fairPriceManual: undefined });
    }
  };

  // Valuation computations
  const grahamPrice = calculateGrahamPrice(data.lpa, data.vpa);
  
  const symbolOverrides = (getUserOverrides()[data.symbol] || {}) as any;
  const activeDyBazin = symbolOverrides.dyBazinOverride ?? data.dy;
  const activeTargetDy = symbolOverrides.targetDyBazinOverride ?? 6.0;

  const calculateBazinPrice = (dy: number, targetDy: number, price: number): number | null => {
    if (dy <= 0 || targetDy <= 0) return null;
    const priceBRL = (price * dy) / 100;
    const value = priceBRL / (targetDy / 100);
    return isNaN(value) ? null : Number(value.toFixed(2));
  };
  const bazinPrice = calculateBazinPrice(activeDyBazin, activeTargetDy, data.regularMarketPrice);

  let chosenFairPrice = 0;
  let methodLabel = '';
  if (valuationMethod === 'graham') {
    chosenFairPrice = grahamPrice || 0;
    methodLabel = 'Fórmula de Graham (V.I.)';
  } else if (valuationMethod === 'bazin') {
    chosenFairPrice = bazinPrice || 0;
    methodLabel = 'Preço Teto Bazin';
  } else if (valuationMethod === 'manual') {
    chosenFairPrice = data.fairPriceManual || 0;
    methodLabel = 'Preço Justo Manual';
  }

  const discountPercent = chosenFairPrice > 0 
    ? ((chosenFairPrice - data.regularMarketPrice) / chosenFairPrice) * 100 
    : 0;

  return (
    <div className="glass-card rounded-2xl p-6 lg:p-8 shadow-xl space-y-6 flex flex-col justify-between h-full">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-2xs font-bold text-brand-purple uppercase tracking-wider block mb-1">Estratégia de Valuation</span>
          <h3 className="text-lg font-bold text-dark-textPrimary tracking-tight">Preço Justo Estimado</h3>
        </div>
        
        {/* Toggle switch */}
        <div className="flex bg-dark-bg/60 border border-dark-border p-1 rounded-xl text-3xs font-extrabold uppercase tracking-wide shrink-0">
          <button
            onClick={() => handleMethodChange('graham')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${valuationMethod === 'graham' ? 'bg-brand-primary text-white shadow-sm' : 'text-dark-textSecondary hover:text-dark-textPrimary'}`}
          >
            Graham
          </button>
          <button
            onClick={() => handleMethodChange('bazin')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${valuationMethod === 'bazin' ? 'bg-brand-primary text-white shadow-sm' : 'text-dark-textSecondary hover:text-dark-textPrimary'}`}
          >
            Bazin
          </button>
          <button
            onClick={() => handleMethodChange('manual')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${valuationMethod === 'manual' ? 'bg-brand-primary text-white shadow-sm' : 'text-dark-textSecondary hover:text-dark-textPrimary'}`}
          >
            Manual
          </button>
        </div>
      </div>

      {/* Value Display Card */}
      <div className="bg-dark-bg/25 border border-dark-border/60 p-5 rounded-2xl space-y-4">
        <div className="space-y-1">
          <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">
            {methodLabel}
          </span>
          <span className="text-2xl font-black text-dark-textPrimary font-mono tracking-tight leading-none block">
            {chosenFairPrice > 0 
              ? `R$ ${chosenFairPrice.toFixed(2).replace('.', ',')}` 
              : 'N/A'}
          </span>
        </div>

        <div className="border-t border-dark-border/40 pt-3 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-3xs font-bold text-dark-textSecondary uppercase tracking-wider block">Margem de Segurança</span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
            discountPercent >= 15 ? 'bg-emerald-950/20 border-brand-success/30 text-brand-success' : 
            discountPercent > 0 ? 'bg-blue-950/20 border-brand-info/30 text-brand-info' : 
            'bg-rose-950/20 border-brand-danger/30 text-brand-danger'
          }`}>
            {discountPercent > 0 ? `${discountPercent.toFixed(1)}% de Desconto` : `${Math.abs(discountPercent).toFixed(1)}% de Ágio`}
          </span>
        </div>
      </div>

      {/* Valuation calculator controls */}
      {valuationMethod === 'graham' && (
        <div className="space-y-4 pt-1">
          <div className="bg-dark-bg/30 border border-dark-border/40 p-4 rounded-xl space-y-2 text-2xs text-dark-textSecondary leading-relaxed">
            <p className="font-bold text-dark-textPrimary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" /> Fórmula de Graham
            </p>
            <p>
              Calcula o valor intrínseco teórico através de: <span className="font-mono font-bold text-brand-purple">√ (22.5 × LPA × VPA)</span>.
              Esta fórmula clássica assume um P/L máximo de 15x e um P/VP de 1.5x.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider">LPA (Lucro P/ Ação)</label>
              <input
                type="number"
                value={lpaInput}
                onChange={(e) => setLpaInput(e.target.value)}
                onBlur={handleUpdateValuationParams}
                className="w-full bg-dark-card border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none py-2 px-3.5 rounded-xl text-sm font-mono font-bold text-dark-textPrimary text-center transition-all"
                step="0.01"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider">VPA (Valor Patr. P/ Ação)</label>
              <input
                type="number"
                value={vpaInput}
                onChange={(e) => setVpaInput(e.target.value)}
                onBlur={handleUpdateValuationParams}
                className="w-full bg-dark-card border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none py-2 px-3.5 rounded-xl text-sm font-mono font-bold text-dark-textPrimary text-center transition-all"
                step="0.01"
              />
            </div>
          </div>
          
          {grahamPrice === null && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-950/20 border border-brand-danger/20 rounded-xl text-xs text-brand-danger font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Graham indefinido para múltiplos nulos ou negativos.</span>
            </div>
          )}
        </div>
      )}

      {valuationMethod === 'bazin' && (
        <div className="space-y-4 pt-1">
          <div className="bg-dark-bg/30 border border-dark-border/40 p-4 rounded-xl space-y-2 text-2xs text-dark-textSecondary leading-relaxed">
            <p className="font-bold text-dark-textPrimary flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-brand-purple" /> Método de Décio Bazin
            </p>
            <p>
              Calcula o Preço Teto baseado em dividendos pagos: <span className="font-mono font-bold text-brand-purple">Preço = Proventos / DY Alvo</span>.
              Popularizado por Décio Bazin, propõe comprar ativos se eles pagam dividendos consistentes de no mínimo 6% ao ano.
            </p>
            <p className="text-3xs text-dark-textSecondary font-mono border-t border-dark-border/40 pt-2 mt-1">
              Proventos Anuais Calculados: <span className="text-dark-textPrimary font-semibold">R$ {((data.regularMarketPrice * activeDyBazin) / 100).toFixed(2)}</span>
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider">DY do Ativo (%)</label>
              <input
                type="number"
                value={dyInput}
                onChange={(e) => setDyInput(e.target.value)}
                onBlur={handleUpdateBazinParams}
                className="w-full bg-dark-card border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none py-2 px-3.5 rounded-xl text-sm font-mono font-bold text-dark-textPrimary text-center transition-all"
                step="0.01"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider">DY Alvo Desejado (%)</label>
              <input
                type="number"
                value={targetDyInput}
                onChange={(e) => setTargetDyInput(e.target.value)}
                onBlur={handleUpdateBazinParams}
                className="w-full bg-dark-card border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none py-2 px-3.5 rounded-xl text-sm font-mono font-bold text-dark-textPrimary text-center transition-all"
                step="0.1"
              />
            </div>
          </div>
        </div>
      )}

      {valuationMethod === 'manual' && (
        <div className="space-y-4 pt-1">
          <div className="bg-dark-bg/30 border border-dark-border/40 p-4 rounded-xl space-y-1.5 text-2xs text-dark-textSecondary leading-relaxed">
            <p className="font-bold text-dark-textPrimary">✏️ Avaliação Manual Customizada</p>
            <p>
              Defina o seu próprio preço teto máximo de entrada para este ativo. O upside e a margem de segurança serão calculados com base neste valor.
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider">
              Definir Preço Máximo Justo Manual
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-2.5 text-xs font-mono text-dark-textSecondary">R$</span>
                <input
                  type="number"
                  value={manualPriceInput}
                  onChange={(e) => setManualPriceInput(e.target.value)}
                  onBlur={handleSaveManualPrice}
                  placeholder="Ex: 45.00"
                  className="w-full bg-dark-card border border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none py-2.5 pl-9 pr-3 rounded-xl text-sm font-mono font-bold text-dark-textPrimary transition-all"
                  step="0.01"
                />
              </div>
              <button
                onClick={handleSaveManualPrice}
                className="px-5 py-2.5 bg-brand-primary hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-primary/20 cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
