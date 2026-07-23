import React from 'react';
import { Bell, X, TrendingUp, TrendingDown } from 'lucide-react';

interface AlertNotification {
  id: string;
  message: string;
  type: 'above' | 'below';
  timestamp: string;
}

interface AlertBannerProps {
  notifications: AlertNotification[];
  onDismiss: (id: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] space-y-2 max-w-sm w-full pointer-events-none">
      {notifications.slice(0, 3).map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto bg-dark-card/95 backdrop-blur-xl border border-dark-border rounded-2xl p-4 shadow-2xl animate-fadeIn flex items-start gap-3"
          style={{
            borderLeft: `3px solid ${notif.type === 'above' ? '#10b981' : '#ef4444'}`,
          }}
        >
          <div className={`p-2 rounded-xl shrink-0 ${
            notif.type === 'above' 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : 'bg-red-500/10 text-red-400'
          }`}>
            {notif.type === 'above' 
              ? <TrendingUp className="w-4 h-4" />
              : <TrendingDown className="w-4 h-4" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-3 h-3 text-brand-primary" />
              <span className="text-3xs font-bold text-brand-primary uppercase tracking-wider">Alerta de Preço</span>
            </div>
            <p className="text-xs text-dark-textPrimary font-semibold leading-relaxed">{notif.message}</p>
            <p className="text-3xs text-dark-textSecondary mt-1 font-mono">
              {new Date(notif.timestamp).toLocaleString('pt-BR')}
            </p>
          </div>
          <button
            onClick={() => onDismiss(notif.id)}
            className="p-1 text-dark-textSecondary hover:text-white hover:bg-dark-bg/50 rounded-lg transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
