/**
 * Domain Service responsável pelos cálculos de Renda Fixa.
 * Tabela regressiva de IR, cálculo de rentabilidade bruta/líquida/real e equivalente CDI.
 */

export interface FixedIncomeInput {
  assetType: 'cdb' | 'lci'; // cdb = tributado (CDB/Debênture), lci = isento (LCI/LCA/CRI/CRA)
  indexer: 'pre' | 'cdi' | 'ipca';
  rate: number; // ex: 115 (% CDI), 12 (% pre), 6 (% IPCA+)
  amount: number;
  durationMonths: number;
  custodyFeePercent?: number; // Taxa de custódia B3 ou corretora (% a.a.)
  cdiProjectionPercent?: number; // % a.a. do CDI esperado
  ipcaProjectionPercent?: number; // % a.a. do IPCA esperado
}

export interface FixedIncomeResult {
  grossProfit: number;
  grossFinalAmount: number;
  taxRatePercent: number;
  taxAmount: number;
  custodyTotal: number;
  netProfit: number;
  netFinalAmount: number;
  annualNetRatePercent: number;
  equivalentCdiPercent: number;
  realRatePercent: number;
  realProfitAmount: number;
  cdiNetFinalAmount: number;
}

export class FixedIncomeService {
  /**
   * Tabela Regressiva do Imposto de Renda para Renda Fixa:
   * - Até 180 dias: 22,5%
   * - De 181 a 360 dias: 20%
   * - De 361 a 720 dias: 17,5%
   * - Acima de 720 dias: 15%
   */
  public static getTaxRate(durationMonths: number, isTaxExempt: boolean): number {
    if (isTaxExempt) return 0;
    const days = durationMonths * 30;
    if (days <= 180) return 0.225;
    if (days <= 360) return 0.20;
    if (days <= 720) return 0.175;
    return 0.15;
  }

  public static calculate(input: FixedIncomeInput): FixedIncomeResult {
    const years = input.durationMonths / 12;
    const custodyFee = input.custodyFeePercent || 0;
    const cdiProj = input.cdiProjectionPercent ?? 10.50;
    const ipcaProj = input.ipcaProjectionPercent ?? 4.50;

    // 1. Taxa Anual Bruta
    let annualGrossRate = 0;
    if (input.indexer === 'pre') {
      annualGrossRate = input.rate / 100;
    } else if (input.indexer === 'cdi') {
      annualGrossRate = (input.rate / 100) * (cdiProj / 100);
    } else if (input.indexer === 'ipca') {
      annualGrossRate = ((1 + ipcaProj / 100) * (1 + input.rate / 100)) - 1;
    }

    // 2. Montante Bruto Final
    const grossFinalAmount = input.amount * Math.pow(1 + annualGrossRate, years);
    const grossProfit = Math.max(0, grossFinalAmount - input.amount);

    // 3. Custódia
    const custodyTotal = (input.amount * Math.pow(1 + (custodyFee / 100), years)) - input.amount;
    const profitAfterCustody = Math.max(0, grossProfit - custodyTotal);

    // 4. Imposto de Renda
    const isTaxExempt = input.assetType === 'lci';
    const taxRate = this.getTaxRate(input.durationMonths, isTaxExempt);
    const taxAmount = profitAfterCustody * taxRate;

    const netProfit = profitAfterCustody - taxAmount;
    const netFinalAmount = input.amount + netProfit;

    // 5. Métricas Equivalentes
    const annualNetRate = Math.pow(netFinalAmount / input.amount, 1 / years) - 1;
    const equivalentCdiPercent = (annualNetRate / (cdiProj / 100)) * 100;

    // 6. Rentabilidade Real (Descontando IPCA)
    const inflationAccum = Math.pow(1 + (ipcaProj / 100), years);
    const amountCorrected = input.amount * inflationAccum;
    const realProfitAmount = netFinalAmount - amountCorrected;
    const realRatePercent = (((1 + annualNetRate) / (1 + ipcaProj / 100)) - 1) * 100;

    // 7. Benchmark 100% CDI Líquido
    const cdiFinalGross = input.amount * Math.pow(1 + (cdiProj / 100), years);
    const cdiProfitGross = cdiFinalGross - input.amount;
    const cdiTaxRate = this.getTaxRate(input.durationMonths, false);
    const cdiNetFinalAmount = input.amount + (cdiProfitGross * (1 - cdiTaxRate));

    return {
      grossProfit,
      grossFinalAmount,
      taxRatePercent: taxRate * 100,
      taxAmount,
      custodyTotal,
      netProfit,
      netFinalAmount,
      annualNetRatePercent: annualNetRate * 100,
      equivalentCdiPercent,
      realRatePercent,
      realProfitAmount,
      cdiNetFinalAmount,
    };
  }
}
