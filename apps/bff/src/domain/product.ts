import type { Money } from './money';

/** The short form of a product, used in the grid and in similar products. */
export interface ProductSummary {
  readonly id: string;
  readonly brand: string;
  readonly name: string;
  /** The lowest price, shown before any storage is chosen. */
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
  /** Absolute price of the phone with this capacity, not a surcharge. */
  readonly price: Money;
}

/**
 * Technical attributes. Values are display text, kept verbatim (including
 * placeholders such as "No especificado"). Any of them may be missing: the
 * remote catalog does not fill every attribute for every phone.
 */
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
  readonly similarProducts: readonly ProductSummary[];
}
