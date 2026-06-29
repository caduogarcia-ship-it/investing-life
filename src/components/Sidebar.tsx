import React, { useState, useEffect } from 'react';
import { 
  LineChart, Wallet, CandlestickChart, DollarSign, Calculator, 
  Landmark, Trophy, Star, Shield, Settings, LogOut, ChevronLeft, 
  ChevronRight, BarChart2
} from 'lucide-react';

export type TabType = 'analise' | 'carteira' | 'candles' | 'dividendos' | 'rankings' | 'recomendadas' | 'calculos' | 'tesouro' | 'admin';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAdmin: boolean;
  onOpenSettings: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  onOpenSettings,
  onLogout,
  isLoggedIn
}) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isLoggedIn) return null;

  const tabs = [
    { id: 'analise', label: 'Análise de Ativo', icon: LineChart },
    { id: 'carteira', label: 'Minha Carteira', icon: Wallet },
    { id: 'candles', label: 'Análise Gráfica', icon: CandlestickChart },
    { id: 'dividendos', label: 'Dividendos', icon: DollarSign },
    { id: 'calculos', label: 'Cálculos', icon: Calculator },
    { id: 'tesouro', label: 'Tesouro', icon: Landmark },
    { id: 'rankings', label: 'Rankings', icon: Trophy },
    { id: 'recomendadas', label: 'Recomendações', icon: Star },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <div 
      className={`h-screen bg-gradient-to-r from-dark-card/95 to-dark-card/20 backdrop-blur-xl border-r border-dark-border/30 flex flex-col transition-all duration-300 ease-in-out select-none relative z-50 shadow-2xl ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      style={{ fontFamily: 'Outfit, sans-serif' }}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-6 bg-dark-bg border border-dark-border text-dark-textSecondary hover:text-white rounded-full p-1.5 shadow-lg z-50 transition-colors"
      >
        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Logo Area */}
      <div className={`p-6 flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} border-b border-dark-border/40 gap-3`}>
        <div className="p-2 bg-gradient-to-tr from-brand-primary to-brand-purple rounded-xl shadow-lg shrink-0">
          <BarChart2 className="w-5 h-5 text-white" />
        </div>
        {isExpanded && (
          <h1 className="text-lg font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Investing Life
          </h1>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          let bgStyle = {};
          if (isActive) {
            bgStyle = tab.id === 'admin' 
              ? { background: 'linear-gradient(135deg, #ef4444, #f59e0b)', boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }
              : { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' };
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              title={!isExpanded ? tab.label : ''}
              className={`w-full flex items-center ${isExpanded ? 'justify-start px-4' : 'justify-center'} py-3 rounded-xl transition-all duration-300 cursor-pointer active-scale group ${
                isActive 
                  ? 'text-white font-bold' 
                  : 'text-dark-textSecondary hover:text-dark-textPrimary hover:bg-dark-bg/50 font-semibold'
              }`}
              style={bgStyle}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isExpanded ? 'mr-3' : ''} ${!isActive && 'group-hover:scale-110 transition-transform'}`} />
              {isExpanded && <span className="text-sm truncate">{tab.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Bottom Actions (Settings & Logout) */}
      <div className="p-4 border-t border-dark-border/40 space-y-2">
        <button
          onClick={onOpenSettings}
          title={!isExpanded ? 'Configurações' : ''}
          className={`w-full flex items-center ${isExpanded ? 'justify-start px-4' : 'justify-center'} py-3 rounded-xl transition-all duration-300 cursor-pointer hover:bg-dark-bg/50 text-dark-textSecondary hover:text-white font-semibold group`}
        >
          <Settings className={`w-5 h-5 shrink-0 ${isExpanded ? 'mr-3' : ''} group-hover:rotate-90 transition-transform duration-500`} />
          {isExpanded && <span className="text-sm">Configurações</span>}
        </button>

        <button
          onClick={onLogout}
          title={!isExpanded ? 'Sair' : ''}
          className={`w-full flex items-center ${isExpanded ? 'justify-start px-4' : 'justify-center'} py-3 rounded-xl transition-all duration-300 cursor-pointer hover:bg-brand-danger/10 text-dark-textSecondary hover:text-brand-danger font-semibold group`}
        >
          <LogOut className={`w-5 h-5 shrink-0 ${isExpanded ? 'mr-3' : ''} group-hover:-translate-x-1 transition-transform`} />
          {isExpanded && <span className="text-sm">Sair da Conta</span>}
        </button>
      </div>
    </div>
  );
};
