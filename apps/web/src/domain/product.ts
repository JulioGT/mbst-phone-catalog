import type { Money } from './money';

/** The short form of a product, shown in the grid and in similar products. */
export interface ProductSummary {
  readonly id: string;
  readonly brand: string;
  readonly name: string;
  readonly basePrice: Money;
  readonly imageUrl: string;
}

export interface ColorOption {
  readonly name: string;
  readonly hexCode: string;
  readonly imageUrl: string;
}

export interface StorageOption {
  readonly capacity: string;
  /** Absolute price of the phone with this capacity. */
  readonly price: Money;
}

/** Technical attributes as display text; any of them may be missing. */
export interface Specifications {
  readonly screen?: string;
  readonly resolution?: string;
  readonly processor?: string;
  readonly mainCamera?: string;
  readonly selfieCamera?: string;
  readonly battery?: string;
  readonly os?: string;
  readonly screenRefreshRate?: string;
}

export interface ProductDetail {
  readonly id: string;
  readonly brand: string;
  readonly name: string;
  readonly description: string;
  readonly basePrice: Money;
  readonly specs: Specifications;
  readonly colorOptions: readonly ColorOption[];
  readonly storageOptions: readonly StorageOption[];
  /** Absent when the `similar-products` feature flag is off. */
  readonly similarProducts?: readonly ProductSummary[];
}
