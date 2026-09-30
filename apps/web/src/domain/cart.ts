import { type Money, sumMoney } from './money';

/**
 * One phone with a chosen storage and color, plus a snapshot of what the
 * shopper saw when adding it (ADR 0006). Every add is its own line; there is
 * no quantity.
 */
export interface CartLine {
  readonly lineId: string;
  readonly productId: string;
  readonly brand: string;
  readonly name: string;
  readonly imageUrl: string;
  readonly storage: string;
  readonly colorName: string;
  readonly unitPrice: Money;
}

export type Cart = readonly CartLine[];

export const EMPTY_CART: Cart = [];

export function addLine(cart: Cart, line: CartLine): Cart {
  return [...cart, line];
}

export function removeLine(cart: Cart, lineId: string): Cart {
  return cart.filter((line) => line.lineId !== lineId);
}

/** Number of lines, shown next to the bag icon. */
export function cartCount(cart: Cart): number {
  return cart.length;
}

export function cartTotal(cart: Cart): Money {
  return sumMoney(cart.map((line) => line.unitPrice));
}
