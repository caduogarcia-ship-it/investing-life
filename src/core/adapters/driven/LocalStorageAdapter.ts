import type { IPersistenceGateway } from '../../application/ports/IPersistenceGateway';
import type { Client } from '../../../types/crm';

const WATCHLIST_KEY = 'b3_analise_watchlist';
const CLIENTS_KEY = 'b3_analise_clients';
const OVERRIDES_KEY = 'b3_analise_user_overrides';

/**
 * Adaptador de Saída (Driven Adapter) que implementa a persistência local (LocalStorage).
 */
export class LocalStorageAdapter implements IPersistenceGateway {
  public loadWatchlist(): string[] {
    try {
      const saved = localStorage.getItem(WATCHLIST_KEY);
      return saved ? JSON.parse(saved) : ['PETR4', 'VALE3', 'WEGE3', 'CURY3', 'TEND3', 'ITUB4'];
    } catch {
      return ['PETR4', 'VALE3', 'WEGE3', 'CURY3', 'TEND3', 'ITUB4'];
    }
  }

  public saveWatchlist(tickers: string[]): void {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(tickers));
    } catch (e) {
      console.error('Erro ao salvar watchlist:', e);
    }
  }

  public loadClients(): Client[] {
    try {
      const saved = localStorage.getItem(CLIENTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public saveClients(clients: Client[]): void {
    try {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    } catch (e) {
      console.error('Erro ao salvar clientes:', e);
    }
  }

  public loadUserOverrides(): Record<string, any> {
    try {
      const saved = localStorage.getItem(OVERRIDES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  public saveUserOverride(ticker: string, overrideData: any): void {
    try {
      const all = this.loadUserOverrides();
      all[ticker] = { ...all[ticker], ...overrideData };
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
    } catch (e) {
      console.error('Erro ao salvar override de usuário:', e);
    }
  }
}
