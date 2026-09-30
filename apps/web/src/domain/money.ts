declare const moneyBrand: unique symbol;

/** An amount in integer euro cents (ADR 0006). Formatting happens only in the UI. */
export type Money = number & { readonly [moneyBrand]: 'Money' };

export function moneyFromCents(cents: number): Money {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new RangeError(`Money must be a non-negative whole number of cents, got ${cents}.`);
  }
  return cents as Money;
}

export const ZERO_MONEY = moneyFromCents(0);

export function sumMoney(amounts: readonly Money[]): Money {
  return moneyFromCents(amounts.reduce((total, amount) => total + amount, 0));
}
