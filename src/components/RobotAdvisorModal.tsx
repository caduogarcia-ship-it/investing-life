import React, { useState } from 'react';
import { Bot, ShieldCheck, Target, Zap, Clock, X, CheckCircle2 } from 'lucide-react';

interface RecommendedAsset {
  ticker: string;
  weight: number;
  class: string;
}

interface ProfileConfig {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
  allocation: {
    fixed: number;
    variableBr: number;
    international: number;
  };
  assets: RecommendedAsset[];
}

const PROFILES: ProfileConfig[] = [
  {
    id: 'segura',
    name: 'Segura',
    icon: ShieldCheck,
    description: 'Foco total em preservação de patrimônio e baixa volatilidade. Ideal para prazos curtos ou perfil conservador.',
    color: 'emerald',
    allocation: { fixed: 80, variableBr: 15, international: 5 },
    assets: [
      { ticker: 'Tesouro Selic', weight: 50, class: 'Renda Fixa' },
      { ticker: 'Tesouro IPCA+', weight: 30, class: 'Renda Fixa' },
      { ticker: 'BOVA11', weight: 10, class: 'Ações BR (Índice)' },
      { ticker: 'ITUB4', weight: 5, class: 'Ações BR (Segurança)' },
      { ticker: 'IVVB11', weight: 5, class: 'Exterior (S&P 500)' },
    ]
  },
  {
    id: 'moderada',
    name: 'Moderada',
    icon: Target,
    description: 'Equilíbrio entre proteção e crescimento. Busca retornos acima da inflação aceitando oscilações controladas.',
    color: 'blue',
    allocation: { fixed: 50, variableBr: 30, international: 20 },
    assets: [
      { ticker: 'Tesouro IPCA+', weight: 30, class: 'Renda Fixa' },
      { ticker: 'CDB 120% CDI', weight: 20, class: 'Renda Fixa' },
      { ticker: 'BOVA11', weight: 15, class: 'Ações BR (Índice)' },
      { ticker: 'WEGE3', weight: 10, class: 'Ações BR (Crescimento)' },
      { ticker: 'VALE3', weight: 5, class: 'Ações BR (Dividendos)' },
      { ticker: 'IVVB11', weight: 20, class: 'Exterior (S&P 500)' },
    ]
  },
  {
    id: 'arrojada',
    name: 'Arrojada',
    icon: Zap,
    description: 'Foco na maximização de retornos no longo prazo. Carteira com alta exposição a risco e volatilidade.',
    color: 'purple',
    allocation: { fixed: 20, variableBr: 50, international: 30 },
    assets: [
      { ticker: 'Tesouro IPCA+', weight: 20, class: 'Renda Fixa' },
      { ticker: 'BOVA11', weight: 20, class: 'Ações BR (Índice)' },
      { ticker: 'PETR4', weight: 15, class: 'Ações BR (Dividendos)' },
      { ticker: 'WEGE3', weight: 15, class: 'Ações BR (Crescimento)' },
      { ticker: 'IVVB11', weight: 20, class: 'Exterior (S&P 500)' },
      { ticker: 'QQQ', weight: 10, class: 'Exterior (Tecnologia)' },
    ]
  },
  {
    id: 'previdencia',
    name: 'Previdência',
    icon: Clock,
    description: 'Construção de renda passiva para o futuro. Alta concentração em pagadoras de dividendos constantes e juros reais.',
    color: 'amber',
    allocation: { fixed: 40, variableBr: 50, international: 10 },
    assets: [
      { ticker: 'Tesouro IPCA+ Longo', weight: 40, class: 'Renda Fixa (Juro Real)' },
      { ticker: 'ITUB4', weight: 15, class: 'Ações BR (Dividendos)' },
      { ticker: 'BBAS3', weight: 15, class: 'Ações BR (Dividendos)' },
      { ticker: 'TAEE11', weight: 10, class: 'Ações BR (Dividendos)' },
      { ticker: 'KNIP11', weight: 10, class: 'FII (Papel)' },
      { ticker: 'IVVB11', weight: 10, class: 'Exterior (Proteção)' },
    ]
  }
];

interface RobotAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RobotAdvisorModal: React.FC<RobotAdvisorModalProps> = ({ isOpen, onClose }) => {
  const [activeProfileId, setActiveProfileId] = useState<string>('moderada');

  if (!isOpen) return null;

  const activeProfile = PROFILES.find(p => p.id === activeProfileId)!;

  const getColorClass = (color: string) => {
    switch(color) {
      case 'emerald': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'blue': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'purple': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'amber': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      default: return 'text-brand-primary bg-brand-primary/10 border-brand-primary/30';
    }
  };

  const getBgClass = (color: string) => {
    switch(color) {
      case 'emerald': return 'bg-emerald-500';
      case 'blue': return 'bg-blue-500';
      case 'purple': return 'bg-purple-500';
      case 'amber': return 'bg-amber-500';
      default: return 'bg-brand-primary';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark-bg/80 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-dark-card border border-dark-border rounded-2xl shadow-2xl flex flex-col overflow-hidden shadow-brand-primary/10">
        
        {/* Header */}
        <div className="p-5 border-b border-dark-border/50 flex items-center justify-between shrink-0" style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(15,18,30,0.95))' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-dark-textPrimary tracking-tight">Robô Advisor</h2>
              <p className="text-2xs text-dark-textSecondary font-bold">Recomendação Inteligente de Alocação</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-dark-textSecondary hover:text-white hover:bg-dark-bg/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          
          {/* Profile Selector */}
          <div>
            <h3 className="text-xs font-bold text-dark-textSecondary uppercase tracking-wider mb-4">1. Selecione a Estratégia do Cliente</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PROFILES.map((profile) => {
                const isActive = activeProfileId === profile.id;
                const Icon = profile.icon;
                return (
                  <button
                    key={profile.id}
                    onClick={() => setActiveProfileId(profile.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer select-none active-scale ${
                      isActive 
                        ? `bg-dark-bg ${getColorClass(profile.color)} shadow-lg` 
                        : 'bg-dark-bg/40 border-dark-border/50 text-dark-textSecondary hover:border-dark-border hover:bg-dark-bg/60'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <span className="text-xs font-black tracking-tight">{profile.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Macro Allocation */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-dark-textSecondary uppercase tracking-wider">2. Alocação Macro Ideal</h3>
              
              <div className="bg-dark-bg/40 border border-dark-border/50 rounded-2xl p-5 h-[320px] flex flex-col justify-between">
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-3xs font-black uppercase tracking-wider border ${getColorClass(activeProfile.color)} mb-3`}>
                    <activeProfile.icon className="w-3 h-3" />
                    Perfil {activeProfile.name}
                  </div>
                  <p className="text-xs text-dark-textSecondary font-medium leading-relaxed">
                    {activeProfile.description}
                  </p>
                </div>

                <div className="space-y-4 mt-6">
                  {/* Renda Fixa */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-dark-textPrimary">Renda Fixa</span>
                      <span className="font-mono">{activeProfile.allocation.fixed}%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-card rounded-full overflow-hidden border border-dark-border/50">
                      <div className={`h-full rounded-full transition-all duration-500 ease-out ${getBgClass(activeProfile.color)}`} style={{ width: `${activeProfile.allocation.fixed}%` }} />
                    </div>
                  </div>
                  {/* Renda Variável BR */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-dark-textPrimary">Renda Variável (Brasil)</span>
                      <span className="font-mono">{activeProfile.allocation.variableBr}%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-card rounded-full overflow-hidden border border-dark-border/50">
                      <div className={`h-full rounded-full transition-all duration-500 ease-out opacity-80 ${getBgClass(activeProfile.color)}`} style={{ width: `${activeProfile.allocation.variableBr}%` }} />
                    </div>
                  </div>
                  {/* Exterior */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-dark-textPrimary">Exterior (EUA/Global)</span>
                      <span className="font-mono">{activeProfile.allocation.international}%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-card rounded-full overflow-hidden border border-dark-border/50">
                      <div className={`h-full rounded-full transition-all duration-500 ease-out opacity-60 ${getBgClass(activeProfile.color)}`} style={{ width: `${activeProfile.allocation.international}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Assets */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-dark-textSecondary uppercase tracking-wider">3. Sugestão de Ativos</h3>
              
              <div className="bg-dark-bg/40 border border-dark-border/50 rounded-2xl overflow-hidden h-[320px] flex flex-col">
                <div className="p-3 border-b border-dark-border/40 bg-dark-card/30 text-3xs font-bold text-dark-textSecondary uppercase tracking-wider grid grid-cols-12 gap-2">
                  <div className="col-span-8 pl-2">Ativo / Classe</div>
                  <div className="col-span-4 text-right pr-4">Peso Alvo</div>
                </div>
                
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <div className="divide-y divide-dark-border/30">
                    {activeProfile.assets.map((asset, idx) => (
                      <div key={idx} className="p-3 grid grid-cols-12 gap-2 items-center hover:bg-dark-card/40 transition-colors">
                        <div className="col-span-8 pl-2">
                          <p className="text-sm font-black text-dark-textPrimary font-mono">{asset.ticker}</p>
                          <p className="text-3xs text-dark-textSecondary font-medium">{asset.class}</p>
                        </div>
                        <div className="col-span-4 text-right pr-4">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-bold font-mono border ${getColorClass(activeProfile.color)}`}>
                            {asset.weight}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-dark-border/50 bg-dark-bg/60 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-2 text-3xs text-dark-textSecondary font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Estas recomendações podem servir de base para a carteira deste cliente.
          </div>
          <button 
            onClick={onClose}
            className={`px-6 py-2.5 w-full sm:w-auto rounded-xl text-xs font-bold transition-all shadow-lg active-scale text-dark-bg ${getBgClass(activeProfile.color)}`}
          >
            Concluir Análise
          </button>
        </div>

      </div>
    </div>
  );
};
