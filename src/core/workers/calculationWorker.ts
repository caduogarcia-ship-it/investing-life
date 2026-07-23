interface GrahamPayload {
  type: 'graham';
  lpa: number;
  vpa: number;
}

interface BazinPayload {
  type: 'bazin';
  currentPrice: number;
  dy: number;
}

interface FixedIncomePayload {
  type: 'fixedIncome';
  principal: number;
  rate: number;
  months: number;
  indexerType: 'pre' | 'cdi' | 'ipca';
  indexerValue: number; // expected yearly rate for CDI/IPCA
  custodyFeeRate: number; // yearly
}

interface DividendProjectionPayload {
  type: 'dividendProjection';
  initialYield: number;
  growthRate: number; // yearly percentage
  years: number;
  currentPrincipal: number;
}

export type CalculationPayload =
  | GrahamPayload
  | BazinPayload
  | FixedIncomePayload
  | DividendProjectionPayload;

self.onmessage = (event: MessageEvent<CalculationPayload>) => {
  const data = event.data;

  try {
    switch (data.type) {
      case 'graham': {
        const intrinsicValue = Math.sqrt(22.5 * data.lpa * data.vpa);
        self.postMessage({ type: 'grahamResult', result: intrinsicValue });
        break;
      }
      case 'bazin': {
        const dividend = data.currentPrice * (data.dy / 100);
        const fairPrice = dividend / 0.06;
        self.postMessage({ type: 'bazinResult', result: fairPrice });
        break;
      }
      case 'fixedIncome': {
        let effectiveYearlyRate = data.rate;
        if (data.indexerType === 'cdi') {
          effectiveYearlyRate = (data.rate / 100) * data.indexerValue;
        } else if (data.indexerType === 'ipca') {
          effectiveYearlyRate = data.rate + data.indexerValue;
        }

        const effectiveMonthlyRate = Math.pow(1 + effectiveYearlyRate / 100, 1 / 12) - 1;

        let grossAmount = data.principal;
        for (let i = 0; i < data.months; i++) {
          grossAmount *= (1 + effectiveMonthlyRate);
        }

        const profit = grossAmount - data.principal;

        const days = data.months * 30;
        let irRate = 0;
        if (days <= 180) irRate = 0.225;
        else if (days <= 360) irRate = 0.20;
        else if (days <= 720) irRate = 0.175;
        else irRate = 0.15;

        const tax = profit * irRate;

        const custodyFee = grossAmount * (data.custodyFeeRate / 100) * (data.months / 12);

        const netAmount = grossAmount - tax - custodyFee;

        self.postMessage({
          type: 'fixedIncomeResult',
          result: { grossAmount, netAmount, tax, custodyFee }
        });
        break;
      }
      case 'dividendProjection': {
        const projection = [];
        let currentDividend = data.currentPrincipal * (data.initialYield / 100);
        let accumulated = 0;

        for (let year = 1; year <= data.years; year++) {
          projection.push({
            year,
            dividend: currentDividend,
            accumulated: accumulated + currentDividend
          });
          accumulated += currentDividend;
          currentDividend *= (1 + data.growthRate / 100);
        }

        self.postMessage({ type: 'dividendProjectionResult', result: projection });
        break;
      }
      default: {
        self.postMessage({ type: 'error', message: 'Unknown calculation type' });
      }
    }
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
};
