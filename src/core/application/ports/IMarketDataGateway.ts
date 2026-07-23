import type { StockData, NewsItem, ConsensusData, B3Ticker } from '../../../services/api';

/**
 * Secondary Port (Outbound) para obtenção de dados do mercado financeiro.
 * Desacopla o domínio de APIs específicas (Brapi, Yahoo, Netlify functions, etc.).
 */
export interface IMarketDataGateway {
  fetchStockDetails(symbol: string): Promise<StockData>;
  searchTickers(query: string): B3Ticker[];
  fetchStockNews(symbol: string): Promise<NewsItem[]>;
  fetchStockConsensus(symbol: string): Promise<ConsensusData>;
  fetchUSDBRLRate(): Promise<number>;
}
