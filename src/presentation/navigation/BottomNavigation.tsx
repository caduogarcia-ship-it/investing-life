import React from 'react';
import { Wallet, LineChart, Landmark, Trophy, Star, Shield } from 'lucide-react';
import type { TabType } from '../../components/Sidebar';

interface BottomNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAdmin: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
}) => {
  const navItems = [
    { id: 'carteira', label: 'Carteira', icon: Wallet },
    { id: 'analise', label: 'Análise', icon: LineChart },
    { id: 'tesouro', label: 'R. Fixa', icon: Landmark },
    { id: 'rankings', label: 'Rankings', icon: Trophy },
    { id: 'recomendadas', label: 'Dicas', icon: Star },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-dark-card/90 backdrop-blur-xl border-t border-dark-border/40 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] select-none">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            activeTab === item.id ||
            (item.id === 'analise' && ['candles', 'dividendos', 'calculos'].includes(activeTab)) ||
            (item.id === 'tesouro' && activeTab === 'calculos_rf');

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-brand-primary font-black bg-brand-primary/10'
                  : 'text-dark-textSecondary hover:text-dark-textPrimary font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_#6366f1]" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
