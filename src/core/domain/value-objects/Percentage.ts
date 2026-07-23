/**
 * Value Object representando Porcentagem (%).
 */
export class Percentage {
  private readonly percentValue: number;

  constructor(percentValue: number) {
    this.percentValue = isNaN(percentValue) || !isFinite(percentValue) ? 0 : percentValue;
  }

  public get value(): number {
    return this.percentValue;
  }

  public get decimal(): number {
    return this.percentValue / 100;
  }

  public format(decimals: number = 2): string {
    const formatted = this.percentValue.toFixed(decimals).replace('.', ',');
    return `${this.percentValue >= 0 ? '' : ''}${formatted}%`;
  }

  public static fromDecimal(decimalValue: number): Percentage {
    return new Percentage(decimalValue * 100);
  }
}
