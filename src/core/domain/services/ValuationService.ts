/**
 * Domain Service responsável pelos algoritmos de Valuation.
 * Regras de Negócio puras (Graham, Bazin, Margem de Segurança, Preço Teto).
 */

export interface ValuationMetrics {
  currentPrice: number;
  lpa: number;
  vpa: number;
  dyPercent: number;
  payoutPercent?: number;
  cagr5Years?: number;
}

export interface ValuationResult {
  grahamPrice: number;
  grahamMargin: number; // % de desconto em relação ao preço atual
  bazinPrice: number;
  bazinMargin: number;
  suggestedTargetPrice: number;
  valuationVerdict: 'Subavaliado' | 'Preço Justo' | 'Sobreavaliado';
}

export class ValuationService {
  /**
   * Fórmula de Benjamin Graham: VI = sqrt(22.5 * LPA * VPA)
   */
  public static calculateGrahamPrice(lpa: number, vpa: number): number {
    if (lpa <= 0 || vpa <= 0) return 0;
    return Math.sqrt(22.5 * lpa * vpa);
  }

  /**
   * Fórmula de Décio Bazin: Preço Teto = DPA / 0.06 (Assumindo DY desejado de 6%)
   * Onde DPA (Dividendo Por Ação) = Preço * DY%
   */
  public static calculateBazinPrice(currentPrice: number, dyPercent: number, targetYieldPercent: number = 6): number {
    if (dyPercent <= 0 || currentPrice <= 0) return 0;
    const dpa = currentPrice * (dyPercent / 100);
    return dpa / (targetYieldPercent / 100);
  }

  /**
   * Calcula a Margem de Segurança (%) entre o Preço Justo e o Preço Atual
   */
  public static calculateSecurityMargin(fairPrice: number, currentPrice: number): number {
    if (currentPrice <= 0 || fairPrice <= 0) return 0;
    return ((fairPrice - currentPrice) / currentPrice) * 100;
  }

  /**
   * Executa a avaliação de Valuation completa para uma ação
   */
  public static evaluateStock(metrics: ValuationMetrics): ValuationResult {
    const grahamPrice = this.calculateGrahamPrice(metrics.lpa, metrics.vpa);
    const bazinPrice = this.calculateBazinPrice(metrics.currentPrice, metrics.dyPercent);

    const grahamMargin = this.calculateSecurityMargin(grahamPrice, metrics.currentPrice);
    const bazinMargin = this.calculateSecurityMargin(bazinPrice, metrics.currentPrice);

    // Preço Alvo Consolidado (Média ponderada quando ambos válidos)
    let suggestedTargetPrice = metrics.currentPrice;
    if (grahamPrice > 0 && bazinPrice > 0) {
      suggestedTargetPrice = (grahamPrice + bazinPrice) / 2;
    } else if (grahamPrice > 0) {
      suggestedTargetPrice = grahamPrice;
    } else if (bazinPrice > 0) {
      suggestedTargetPrice = bazinPrice;
    }

    let verdict: 'Subavaliado' | 'Preço Justo' | 'Sobreavaliado' = 'Preço Justo';
    const averageMargin = (grahamMargin + bazinMargin) / 2;

    if (averageMargin > 15) {
      verdict = 'Subavaliado';
    } else if (averageMargin < -15) {
      verdict = 'Sobreavaliado';
    }

    return {
      grahamPrice,
      grahamMargin,
      bazinPrice,
      bazinMargin,
      suggestedTargetPrice,
      valuationVerdict: verdict,
    };
  }
}
