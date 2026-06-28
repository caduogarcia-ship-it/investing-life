import React, { useState, useMemo } from 'react';
import { Landmark, Calculator, Percent, Info, AlertTriangle, TrendingUp, ShieldCheck, Wallet, Calendar } from 'lucide-react';

interface Bond {
  id: string;
  name: string;
  type: 'Selic' | 'Prefixado' | 'IPCA' | 'Renda+' | 'Educa+';
  maturityDate: string;
  price: number;
  rate: number; // For Prefixado it's the nominal rate. For IPCA/Renda/Educa it's the real premium. For Selic it's the premium.
}

const BONDS_DATA: Bond[] = [
  // Tesouro Selic
  { id: 'selic27', name: 'Tesouro Selic 2027', type: 'Selic', maturityDate: '2027-03-01', price: 14782.50, rate: 0.08 },
  { id: 'selic29', name: 'Tesouro Selic 2029', type: 'Selic', maturityDate: '2029-03-01', price: 14690.30, rate: 0.15 },
  
  // Tesouro Prefixado
  { id: 'pre27', name: 'Tesouro Prefixado 2027', type: 'Prefixado', maturityDate: '2027-01-01', price: 785.45, rate: 11.20 },
  { id: 'pre31', name: 'Tesouro Prefixado 2031', type: 'Prefixado', maturityDate: '2031-01-01', price: 520.10, rate: 11.85 },
  { id: 'pre35j', name: 'Tesouro Prefixado com Juros Semestrais 2035', type: 'Prefixado', maturityDate: '2035-01-01', price: 950.25, rate: 11.95 },
  
  // Tesouro IPCA+
  { id: 'ipca29', name: 'Tesouro IPCA+ 2029', type: 'IPCA', maturityDate: '2029-05-15', price: 3240.15, rate: 6.20 },
  { id: 'ipca35', name: 'Tesouro IPCA+ 2035', type: 'IPCA', maturityDate: '2035-05-15', price: 2310.80, rate: 6.35 },
  { id: 'ipca45', name: 'Tesouro IPCA+ 2045', type: 'IPCA', maturityDate: '2045-05-15', price: 1250.35, rate: 6.45 },
  { id: 'ipca40j', name: 'Tesouro IPCA+ com Juros Semestrais 2040', type: 'IPCA', maturityDate: '2040-08-15', price: 4150.20, rate: 6.30 },
  { id: 'ipca55j', name: 'Tesouro IPCA+ com Juros Semestrais 2055', type: 'IPCA', maturityDate: '2055-05-15', price: 4100.90, rate: 6.35 },
  
  // Tesouro Renda+
  { id: 'renda30', name: 'Tesouro Renda+ Aposentadoria Extra 2030', type: 'Renda+', maturityDate: '2049-12-15', price: 1850.20, rate: 6.40 },
  { id: 'renda40', name: 'Tesouro Renda+ Aposentadoria Extra 2040', type: 'Renda+', maturityDate: '2059-12-15', price: 980.50, rate: 6.45 },
  
  // Tesouro Educa+
  { id: 'educa30', name: 'Tesouro Educa+ 2030', type: 'Educa+', maturityDate: '2034-12-15', price: 3100.75, rate: 6.30 },
  { id: 'educa40', name: 'Tesouro Educa+ 2040', type: 'Educa+', maturityDate: '2044-12-15', price: 1750.40, rate: 6.45 },
];

export const TesouroDireto: React.FC = () => {
  const [ipcaProj, setIpcaProj] = useState<number>(4.0);
  const [selicProj, setSelicProj] = useState<number>(10.5);
  const [b3Fee, setB3Fee] = useState<number>(0.20);
  const [investAmount, setInvestAmount] = useState<number>(10000);

  // Calcula dias entre hoje e o vencimento
  const getDaysToMaturity = (dateStr: string) => {
    const today = new Date();
    const maturity = new Date(dateStr);
    const diffTime = Math.abs(maturity.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Tabela regressiva de IR
  const getIrRate = (days: number) => {
    if (days <= 180) return 22.5;
    if (days <= 360) return 20.0;
    if (days <= 720) return 17.5;
    return 15.0;
  };

  const calculatedBonds = useMemo(() => {
    return BONDS_DATA.map(bond => {
      const days = getDaysToMaturity(bond.maturityDate);
      const irRate = getIrRate(days);
      
      let nominalYield = 0;
      let displayRate = '';
      let fee = b3Fee;

      // Calcular o rendimento nominal bruto
      if (bond.type === 'Prefixado') {
        nominalYield = bond.rate;
        displayRate = `${bond.rate.toFixed(2)}% a.a.`;
      } else if (bond.type === 'Selic') {
        nominalYield = selicProj + bond.rate;
        displayRate = `Selic + ${bond.rate.toFixed(4)}%`;
        // Isenção de taxa B3 para Selic até R$ 10.000
        if (investAmount <= 10000) fee = 0;
      } else {
        // IPCA+, Renda+, Educa+
        // Rendimento = (1 + IPCA) * (1 + TaxaPrefixada) - 1
        const ipcaDecimal = ipcaProj / 100;
        const rateDecimal = bond.rate / 100;
        nominalYield = ((1 + ipcaDecimal) * (1 + rateDecimal) - 1) * 100;
        displayRate = `IPCA + ${bond.rate.toFixed(2)}%`;
      }

      // Impostos e Taxas descontados do RENDIMENTO
      // Nota: A taxa da B3 (0.2%) incide sobre o total investido, o que na prática reduz a rentabilidade bruta.
      // Para fins didáticos, subtraímos diretamente da taxa nominal.
      const irDiscount = nominalYield * (irRate / 100);
      const liquidNominal = nominalYield - irDiscount - fee;
      
      // Taxa Real = (1 + NominalLíquida) / (1 + Inflação) - 1
      const liquidDecimal = liquidNominal / 100;
      const ipcaDecimal = ipcaProj / 100;
      const realYield = ((1 + liquidDecimal) / (1 + ipcaDecimal) - 1) * 100;

      return {
        ...bond,
        days,
        irRate,
        displayRate,
        nominalYield,
        liquidNominal,
        realYield,
        fee
      };
    });
  }, [ipcaProj, selicProj, b3Fee, investAmount]);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5 md:p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6" style={{ background: 'linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(15,23,42,1) 100%)' }}>
        <div>
          <h2 className="text-xl font-extrabold text-brand-primary tracking-tight flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Landmark className="w-6 h-6" />
            Tesouro Direto & Renda Fixa
          </h2>
          <p className="text-xs text-dark-textSecondary font-medium mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Analise os títulos públicos disponíveis, calcule o rendimento real descontando inflação, Imposto de Renda e taxa da B3.
          </p>
        </div>
      </div>

      {/* Control Panel (Simulador) */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-purple" />
        <h3 className="text-sm font-bold text-dark-textPrimary mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          <Calculator className="w-4.5 h-4.5 text-brand-purple" />
          Simulador de Cenário Macro (Inputs)
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-3xs font-extrabold text-dark-textSecondary uppercase tracking-wider">Inflação (IPCA) Projetada %</label>
            <div className="relative">
              <Percent className="absolute left-3 top-2.5 w-4 h-4 text-dark-textSecondary" />
              <input 
                type="number" 
                step="0.1"
                value={ipcaProj}
                onChange={e => setIpcaProj(Number(e.target.value))}
                className="w-full bg-dark-bg border border-dark-border focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-xl py-2 pl-9 pr-4 text-sm text-dark-textPrimary transition-all font-mono"
              />
            </div>
            <p className="text-[9px] text-dark-textSecondary">Usado para calcular a Taxa Real.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-3xs font-extrabold text-dark-textSecondary uppercase tracking-wider">Selic Projetada %</label>
            <div className="relative">
              <Percent className="absolute left-3 top-2.5 w-4 h-4 text-dark-textSecondary" />
              <input 
                type="number" 
                step="0.1"
                value={selicProj}
                onChange={e => setSelicProj(Number(e.target.value))}
                className="w-full bg-dark-bg border border-dark-border focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-xl py-2 pl-9 pr-4 text-sm text-dark-textPrimary transition-all font-mono"
              />
            </div>
            <p className="text-[9px] text-dark-textSecondary">Aplica-se ao Tesouro Selic.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-3xs font-extrabold text-dark-textSecondary uppercase tracking-wider">Taxa de Custódia (B3) %</label>
            <div className="relative">
              <Percent className="absolute left-3 top-2.5 w-4 h-4 text-dark-textSecondary" />
              <input 
                type="number" 
                step="0.01"
                value={b3Fee}
                onChange={e => setB3Fee(Number(e.target.value))}
                className="w-full bg-dark-bg border border-dark-border focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-xl py-2 pl-9 pr-4 text-sm text-dark-textPrimary transition-all font-mono"
              />
            </div>
            <p className="text-[9px] text-dark-textSecondary">Padrão: 0.20% a.a.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-3xs font-extrabold text-dark-textSecondary uppercase tracking-wider">Valor do Aporte (R$)</label>
            <div className="relative">
              <Wallet className="absolute left-3 top-2.5 w-4 h-4 text-dark-textSecondary" />
              <input 
                type="number" 
                step="100"
                value={investAmount}
                onChange={e => setInvestAmount(Number(e.target.value))}
                className="w-full bg-dark-bg border border-dark-border focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-xl py-2 pl-9 pr-4 text-sm text-dark-textPrimary transition-all font-mono"
              />
            </div>
            <p className="text-[9px] text-brand-success font-medium">Define se o Tesouro Selic é isento.</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-xl flex gap-3 items-start">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blue-100">Como funciona a Taxa Real?</h4>
            <p className="text-3xs text-blue-200/70 mt-1 leading-relaxed">
              O "rendimento real" é o que sobra no seu bolso após pagar impostos e descontar a inflação. 
              Mesmo títulos IPCA+ pagam IR sobre a parte da inflação, corroendo o ganho.
            </p>
          </div>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl flex gap-3 items-start">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-emerald-100">Tesouro Selic e Isenção</h4>
            <p className="text-3xs text-emerald-200/70 mt-1 leading-relaxed">
              Investimentos em Tesouro Selic até R$ 10.000 são isentos da taxa de custódia da B3 (0,20% a.a). 
              A isenção é aplicada automaticamente no cálculo da tabela se o valor for menor que 10k.
            </p>
          </div>
        </div>
        <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-100">Tabela Regressiva de IR</h4>
            <p className="text-3xs text-amber-200/70 mt-1 leading-relaxed">
              O imposto diminui com o tempo: 22,5% (até 6 meses), 20% (1 ano), 17,5% (2 anos) e 15% (acima de 2 anos). 
              Mantendo até o vencimento, você garante a menor alíquota.
            </p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 md:p-5 border-b border-dark-border/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-dark-bg/30">
          <h3 className="text-sm font-bold text-dark-textPrimary flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <TrendingUp className="w-4.5 h-4.5 text-brand-primary" />
            Títulos Disponíveis e Cálculo de Rentabilidade
          </h3>
          <span className="text-3xs font-mono text-dark-textSecondary">
            Simulação para o aporte de <strong>R$ {investAmount.toLocaleString('pt-BR')}</strong>
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-border/50 bg-dark-bg/50">
                <th className="py-3 px-4 text-3xs font-black text-dark-textSecondary uppercase tracking-wider">Título</th>
                <th className="py-3 px-4 text-3xs font-black text-dark-textSecondary uppercase tracking-wider">Vencimento</th>
                <th className="py-3 px-4 text-3xs font-black text-dark-textSecondary uppercase tracking-wider text-right">Preço Unitário</th>
                <th className="py-3 px-4 text-3xs font-black text-brand-purple uppercase tracking-wider text-right">Taxa (Bruta)</th>
                <th className="py-3 px-4 text-3xs font-black text-amber-500/80 uppercase tracking-wider text-right">IR Estimado</th>
                <th className="py-3 px-4 text-3xs font-black text-brand-success uppercase tracking-wider text-right">Tx. Real (Líquida)</th>
              </tr>
            </thead>
            <tbody>
              {calculatedBonds.map((bond, idx) => (
                <tr 
                  key={bond.id} 
                  className={`border-b border-dark-border/20 hover:bg-dark-cardHover transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-dark-bg/10'}`}
                >
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-dark-textPrimary truncate">{bond.name}</span>
                      <span className="text-4xs text-dark-textSecondary uppercase tracking-widest mt-0.5">{bond.type}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-dark-textSecondary font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {bond.maturityDate.split('-').reverse().join('/')}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-xs font-mono text-dark-textPrimary">
                      R$ {bond.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-xs font-mono font-bold text-brand-purple">
                      {bond.displayRate}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-xs font-mono text-amber-500/90 font-medium">
                      {bond.irRate.toFixed(1).replace('.', ',')}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-1 bg-brand-success/10 px-2.5 py-1 rounded-md border border-brand-success/20">
                      <span className="text-xs font-mono font-black text-brand-success">
                        {bond.realYield.toFixed(2)}% a.a.
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};
