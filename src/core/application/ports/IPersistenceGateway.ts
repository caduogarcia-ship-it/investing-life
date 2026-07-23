import type { Client } from '../../../types/crm';

/**
 * Secondary Port (Outbound) para persistência de dados de usuários e clientes (CRM).
 * Desacopla a UI de LocalStorage, Supabase ou outro banco de dados.
 */
export interface IPersistenceGateway {
  loadWatchlist(): string[];
  saveWatchlist(tickers: string[]): void;
  loadClients(): Client[];
  saveClients(clients: Client[]): void;
  loadUserOverrides(): Record<string, any>;
  saveUserOverride(ticker: string, overrideData: any): void;
}
