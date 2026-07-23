/**
 * Value Object representando Moeda (Dinheiro).
 * Encapsula a lógica de formatação e cálculos com imutabilidade.
 */
export class Money {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string = 'BRL') {
    this.amount = isNaN(amount) || !isFinite(amount) ? 0 : amount;
    this.currency = currency;
  }

  public get value(): number {
    return this.amount;
  }

  public get currencyCode(): string {
    return this.currency;
  }

  public add(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new Error(`Não é possível somar moedas diferentes: ${this.currency} e ${other.currency}`);
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  public subtract(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new Error(`Não é possível subtrair moedas diferentes: ${this.currency} e ${other.currency}`);
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  public multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  public format(locale: string = 'pt-BR'): string {
    if (this.currency === 'USD') {
      return `US$ ${this.amount.toFixed(2).replace('.', ',')}`;
    }
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(this.amount);
  }

  public static zero(currency: string = 'BRL'): Money {
    return new Money(0, currency);
  }
}
