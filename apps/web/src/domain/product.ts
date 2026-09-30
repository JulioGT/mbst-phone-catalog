import type { Money } from './money';

/** The short form of a product, shown in the grid and in similar products. */
export interface ProductSummary {
  readonly id: string;
  readonly brand: string;
  readonly name: string;
  readonly basePrice: Money;
  readonly imageUrl: string;
}
