import React, { useState, useMemo } from 'react';
import { Calculator, Percent, TrendingUp, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export const FixedIncomeCalculator: React.FC = () => {
  // Inputs
  const [assetType, setAssetType] = useState<'cdb' | 'lci'>('cdb');
  const [indexer, setIndexer] = useState<'pre' | 'cdi' | 'ipca'>('cdi');
  const [rate, setRate] = useState<number>(115); // e.g. 115% for CDI, 12 for PRE, 6 for IPCA+
  const [amount, setAmount] = useState<number>(10000);
  const [durationMonths, setDurationMonths] = useState<number>(24);
  const [custodyFee, setCustodyFee] = useState<number>(0); // % a.a
  
  // Projections
  const [cdiProj, setCdiProj] = useState<number>(10.50); // % a.a
  const [ipcaProj, setIpcaProj] = useState<number>(4.50); // % a.a

  // Math Logic
  const results = useMemo(() => {
    const years = durationMonths / 12;
    
    // 1. Determine gross annual rate based on indexer
    let annualGrossRate = 0;
    if (indexer === 'pre') {
      annualGrossRate = rate / 100;
    } else if (indexer === 'cdi') {
      annualGrossRate = (rate / 100) * (cdiProj / 100);
    } else if (indexer === 'ipca') {
      // (1 + IPCA) * (1 + Rate) - 1
      annualGrossRate = ((1 + ipcaProj / 100) * (1 + rate / 100)) - 1;
    }

    // 2. Gross Final Amount
    const grossFinal = amount * Math.pow(1 + annualGrossRate, years);
    const grossProfit = grossFinal - amount;

    // 3. Custody Fee (approximated on total over years)
    const annualCustodyTotal = (amount * Math.pow(1 + (custodyFee / 100), years)) - amount;
    // We deduct custody fee from gross profit
    const profitAfterCustody = Math.max(0, grossProfit - annualCustodyTotal);

    // 4. IR (Income Tax)
    let irRate = 0;
    if (assetType === 'cdb') { // Taxable
      const days = durationMonths * 30;
      if (days <= 180) irRate = 0.225;
      else if (days <= 360) irRate = 0.20;
      else if (days <= 720) irRate = 0.175;
      else irRate = 0.15;
    }
    
    const taxAmount = profitAfterCustody * irRate;
    const netProfit = profitAfterCustody - taxAmount;
    const netFinal = amount + netProfit;

    // 5. Equivalent metrics
    const annualNetRate = Math.pow(netFinal / amount, 1 / years) - 1;
    const equivalentCdiPercent = (annualNetRate / (cdiProj / 100)) * 100;

    // 6. Real Return (discounting inflation)
    const inflationAccum = Math.pow(1 + (ipcaProj / 100), years);
    const amountCorrected = amount * inflationAccum;
    const realProfit = netFinal - amountCorrected;
    const annualRealRate = ((1 + annualNetRate) / (1 + ipcaProj / 100)) - 1;

    // CDI Benchmark for chart
    const cdiFinal = amount * Math.pow(1 + (cdiProj / 100), years);
    const cdiProfit = cdiFinal - amount;
    const cdiTax = cdiProfit * irRate;
    const cdiNet = amount + (cdiProfit - cdiTax);

    return {
      grossProfit,
      taxAmount,
      custodyTotal: annualCustodyTotal,
      netProfit,
      netFinal,
      irRate: irRate * 100,
      annualNetRate: annualNetRate * 100,
      equivalentCdiPercent,
      annualRealRate: annualRealRate * 100,
      realProfit,
      cdiNet
    };
  }, [assetType, indexer, rate, amount, durationMonths, custodyFee, cdiProj, ipcaProj]);

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const chartData = [
    {
      name: 'No Prazo Final',
      'Seu Ativo (Líquido)': Number(results.netFinal.toFixed(2)),
      '100% do CDI (Líquido)': Number(results.cdiNet.toFixed(2)),
      'Inflação (Corrigido)': Number((amount * Math.pow(1 + (ipcaProj / 100), durationMonths / 12)).toFixed(2))
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-dark-bg text-dark-textPrimary custom-scrollbar h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-dark-card border border-dark-border p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl shadow-lg">
              <Calculator className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white">Calculadora de Renda Fixa</h2>
              <p className="text-xs text-dark-textSecondary font-medium mt-1">Rentabilidade Real, Impostos e Comparativo CDI</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Inputs Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Asset Inputs */}
            <div className="bg-dark-card border border-dark-border p-5 rounded-2xl shadow-lg space-y-5">
              <h3 className="text-sm font-bold flex items-center gap-2 border-b border-dark-border/40 pb-3">
                <ShieldCheck className="w-4 h-4 text-brand-primary" /> Parâmetros do Título
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider mb-2">Tributação (IR)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAssetType('cdb')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${assetType === 'cdb' ? 'bg-brand-primary text-white shadow-md' : 'bg-dark-bg border border-dark-border text-dark-textSecondary hover:bg-dark-bg/60'}`}
                    >
                      CDB / Debênture
                    </button>
                    <button
                      onClick={() => setAssetType('lci')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${assetType === 'lci' ? 'bg-brand-primary text-white shadow-md' : 'bg-dark-bg border border-dark-border text-dark-textSecondary hover:bg-dark-bg/60'}`}
                    >
                      LCI / LCA / CRI
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider mb-2">Indexador</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => { setIndexer('pre'); setRate(12); }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${indexer === 'pre' ? 'bg-emerald-500 text-white' : 'bg-dark-bg border border-dark-border text-dark-textSecondary hover:bg-dark-bg/60'}`}
                    >
                      Pré-fixado
                    </button>
                    <button
                      onClick={() => { setIndexer('cdi'); setRate(115); }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${indexer === 'cdi' ? 'bg-emerald-500 text-white' : 'bg-dark-bg border border-dark-border text-dark-textSecondary hover:bg-dark-bg/60'}`}
                    >
                      Pós (%CDI)
                    </button>
                    <button
                      onClick={() => { setIndexer('ipca'); setRate(6); }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${indexer === 'ipca' ? 'bg-emerald-500 text-white' : 'bg-dark-bg border border-dark-border text-dark-textSecondary hover:bg-dark-bg/60'}`}
                    >
                      IPCA+
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider mb-1.5">Taxa / Prêmio</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg pl-3 pr-8 py-2 text-sm font-mono font-bold focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-textSecondary font-bold text-xs">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider mb-1.5">Prazo (Meses)</label>
                    <input 
                      type="number"
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(Number(e.target.value))}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm font-mono font-bold focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider mb-1.5">Aporte Inicial</label>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm font-mono font-bold focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider mb-1.5">Taxa B3/Custódia</label>
                    <div className="relative">
                      <input 
                        type="number"
                        step="0.01"
                        value={custodyFee}
                        onChange={(e) => setCustodyFee(Number(e.target.value))}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg pl-3 pr-8 py-2 text-sm font-mono font-bold focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-textSecondary font-bold text-xs">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Macro Projections */}
            <div className="bg-dark-card border border-dark-border p-5 rounded-2xl shadow-lg space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2 border-b border-dark-border/40 pb-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Projeções Macro (a.a.)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider mb-1.5">CDI Médio</label>
                  <div className="relative">
                    <input 
                      type="number"
                      step="0.1"
                      value={cdiProj}
                      onChange={(e) => setCdiProj(Number(e.target.value))}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg pl-3 pr-8 py-2 text-sm font-mono font-bold focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-textSecondary font-bold text-xs">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-3xs font-bold text-dark-textSecondary uppercase tracking-wider mb-1.5">IPCA Médio</label>
                  <div className="relative">
                    <input 
                      type="number"
                      step="0.1"
                      value={ipcaProj}
                      onChange={(e) => setIpcaProj(Number(e.target.value))}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg pl-3 pr-8 py-2 text-sm font-mono font-bold focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-textSecondary font-bold text-xs">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-card border border-dark-border p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:border-brand-primary/50 transition-colors">
                <div className="absolute -right-6 -top-6 w-20 h-20 bg-brand-primary/5 rounded-full blur-xl group-hover:bg-brand-primary/10 transition-colors" />
                <p className="text-3xs text-dark-textSecondary font-bold uppercase tracking-wider mb-1">Montante Líquido</p>
                <p className="text-lg font-black text-white font-mono">{formatCurrency(results.netFinal)}</p>
                <p className="text-2xs text-brand-success font-bold mt-1">
                  Lucro: +{formatCurrency(results.netProfit)}
                </p>
              </div>

              <div className="bg-dark-card border border-dark-border p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                <div className="absolute -right-6 -top-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
                <p className="text-3xs text-dark-textSecondary font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Percent className="w-3 h-3"/> Rentabilidade Real</p>
                <p className="text-lg font-black text-emerald-400 font-mono">
                  {results.annualRealRate >= 0 ? '+' : ''}{results.annualRealRate.toFixed(2)}% a.a.
                </p>
                <p className="text-2xs text-dark-textSecondary font-medium mt-1">Acima da inflação</p>
              </div>

              <div className="bg-dark-card border border-dark-border p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                <div className="absolute -right-6 -top-6 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
                <p className="text-3xs text-dark-textSecondary font-bold uppercase tracking-wider mb-1">Equivalente CDI</p>
                <p className="text-lg font-black text-purple-400 font-mono">
                  {results.equivalentCdiPercent.toFixed(1)}%
                </p>
                <p className="text-2xs text-dark-textSecondary font-medium mt-1">Líquido de impostos</p>
              </div>

              <div className="bg-dark-card border border-dark-border p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:border-brand-danger/50 transition-colors">
                <div className="absolute -right-6 -top-6 w-20 h-20 bg-brand-danger/5 rounded-full blur-xl group-hover:bg-brand-danger/10 transition-colors" />
                <p className="text-3xs text-dark-textSecondary font-bold uppercase tracking-wider mb-1">Deduções (IR + Taxas)</p>
                <p className="text-lg font-black text-brand-danger font-mono">
                  {formatCurrency(results.taxAmount + results.custodyTotal)}
                </p>
                <p className="text-2xs text-dark-textSecondary font-medium mt-1">Alíquota IR: {results.irRate}%</p>
              </div>
            </div>

            {/* Chart and Details */}
            <div className="bg-dark-card border border-dark-border p-6 rounded-2xl shadow-lg h-[400px] flex flex-col">
              <h3 className="text-sm font-bold text-dark-textPrimary mb-6 flex items-center gap-2">
                Comparativo de Evolução Patrimonial
              </h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                    <XAxis dataKey="name" stroke="#a0aec0" tick={{ fill: '#a0aec0', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis 
                      stroke="#a0aec0" 
                      tick={{ fill: '#a0aec0', fontSize: 12, fontFamily: 'monospace' }} 
                      tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`}
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#2d3748', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: '#1a202c', borderColor: '#4a5568', borderRadius: '12px', fontWeight: 600 }}
                      itemStyle={{ fontFamily: 'monospace', fontWeight: 700 }}
                      formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }} />
                    <Bar dataKey="Inflação (Corrigido)" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={60} />
                    <Bar dataKey="100% do CDI (Líquido)" fill="#4a5568" radius={[6, 6, 0, 0]} maxBarSize={60} />
                    <Bar dataKey="Seu Ativo (Líquido)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
