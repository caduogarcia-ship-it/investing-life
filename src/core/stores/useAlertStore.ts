import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PriceAlert {
  id: string;
  ticker: string;
  targetPrice: number;
  direction: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface AlertState {
  alerts: PriceAlert[];
  notifications: Notification[];
  addAlert: (ticker: string, targetPrice: number, direction: 'above' | 'below') => void;
  removeAlert: (id: string) => void;
  checkAlerts: (currentPrices: Record<string, number>) => void;
  dismissNotification: (id: string) => void;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: [],
      notifications: [],
      addAlert: (ticker, targetPrice, direction) => {
        const newAlert: PriceAlert = {
          id: crypto.randomUUID(),
          ticker,
          targetPrice,
          direction,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ alerts: [...state.alerts, newAlert] }));
      },
      removeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        })),
      checkAlerts: (currentPrices) => {
        const { alerts, notifications } = get();
        let changed = false;

        const newAlerts = alerts.map((alert) => {
          if (!alert.isActive) return alert;

          const currentPrice = currentPrices[alert.ticker];
          if (currentPrice === undefined) return alert;

          let isTriggered = false;
          if (alert.direction === 'above' && currentPrice >= alert.targetPrice) {
            isTriggered = true;
          } else if (alert.direction === 'below' && currentPrice <= alert.targetPrice) {
            isTriggered = true;
          }

          if (isTriggered) {
            changed = true;
            const newNotification: Notification = {
              id: crypto.randomUUID(),
              message: `Alerta: ${alert.ticker} cruzou o preço alvo de R$ ${alert.targetPrice.toFixed(2)} (${alert.direction === 'above' ? 'acima' : 'abaixo'})`,
              type: 'info',
              timestamp: new Date().toISOString(),
            };
            notifications.push(newNotification);

            return {
              ...alert,
              isActive: false,
              triggeredAt: new Date().toISOString(),
            };
          }
          return alert;
        });

        if (changed) {
          set({ alerts: newAlerts, notifications: [...notifications] });
        }
      },
      dismissNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'investing-life-alerts',
    }
  )
);
