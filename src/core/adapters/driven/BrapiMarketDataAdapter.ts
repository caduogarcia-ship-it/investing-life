import type { IMarketDataGateway } from '../../application/ports/IMarketDataGateway';
import type { StockData, NewsItem, ConsensusData, B3Ticker } from '../../../services/api';
import { fetchStockData, searchTickers, fetchUSDBRL } from '../../../services/api';

/**
 * Adaptador de Saída (Driven Adapter) que se conecta à API do Brapi/Yahoo/Scrapers.
 */
export class BrapiMarketDataAdapter implements IMarketDataGateway {
  public async fetchStockDetails(symbol: string): Promise<StockData> {
    return await fetchStockData(symbol);
  }

  public searchTickers(query: string): B3Ticker[] {
    return searchTickers(query);
  }

  public async fetchStockNews(symbol: string): Promise<NewsItem[]> {
    // Stub / Delegado para notícias
    return [
      {
        id: '1',
        title: `${symbol}: Divulgação dos Resultados do Trimestre`,
        source: 'RI Oficial',
        date: new Date().toLocaleDateString('pt-BR'),
        url: '#',
        isRelevantFact: true,
        summary: `Fato relevante publicado pela diretoria de relação com investidores de ${symbol}.`,
        sourceCategory: 'ri'
      }
    ];
  }

  public async fetchStockConsensus(_symbol: string): Promise<ConsensusData> {
    return {
      recommendation: 'Compra',
      targetHigh: 45.0,
      targetLow: 30.0,
      targetMean: 38.5,
      buys: 8,
      holds: 3,
      sells: 1
    };
  }

  public async fetchUSDBRLRate(): Promise<number> {
    return await fetchUSDBRL();
  }
}
