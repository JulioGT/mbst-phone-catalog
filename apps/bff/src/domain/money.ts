declare const moneyBrand: unique symbol;

/**
 * An amount in integer euro cents (ADR 0006). The brand stops a plain number,
 * such as a decimal euro price from the remote API, from being used as Money
 * by accident: build it with `moneyFromCents` or `moneyFromEuros`.
 */
export type Money = number & { readonly [moneyBrand]: 'Money' };

export function moneyFromCents(cents: number): Money {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new RangeError(`Money must be a non-negative whole number of cents, got ${cents}.`);
  }
  return cents as Money;
}

/** Converts a decimal euro amount (553.31) to cents (55331), rounding float noise away. */
export function moneyFromEuros(euros: number): Money {
  if (!Number.isFinite(euros) || euros < 0) {
    throw new RangeError(`A price must be a non-negative finite number of euros, got ${euros}.`);
  }
  return moneyFromCents(Math.round(euros * 100));
}
