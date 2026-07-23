import { useState, useEffect, useCallback } from 'react';
import type { StockData } from '../../../services/api';
import { BrapiMarketDataAdapter } from '../driven/BrapiMarketDataAdapter';
import { ValuationService } from '../../domain/services/ValuationService';
import type { ValuationResult } from '../../domain/services/ValuationService';

const marketAdapter = new BrapiMarketDataAdapter();

export function useStockAnalysis(initialTicker: string = 'PETR4') {
  const [ticker, setTicker] = useState<string>(initialTicker);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStock = useCallback(async (symbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await marketAdapter.fetchStockDetails(symbol);
      setStockData(data);

      // Calcular Valuation via Domain Service puro
      const valResult = ValuationService.evaluateStock({
        currentPrice: data.regularMarketPrice,
        lpa: data.lpa,
        vpa: data.vpa,
        dyPercent: data.dy,
      });
      setValuation(valResult);

    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do ativo');
      setStockData(null);
      setValuation(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ticker) {
      loadStock(ticker);
    }
  }, [ticker, loadStock]);

  return {
    ticker,
    setTicker,
    stockData,
    valuation,
    loading,
    error,
    reload: () => loadStock(ticker),
  };
}
