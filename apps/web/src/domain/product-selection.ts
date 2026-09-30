import type { CartLine } from './cart';
import type { Money } from './money';
import type { ColorOption, ProductDetail, StorageOption } from './product';

/** What the shopper has chosen so far on the detail page. Either may be missing. */
export interface ProductSelection {
  readonly storage?: StorageOption;
  readonly color?: ColorOption;
}

export type MissingChoice = 'storage' | 'color';

/** A single available option is chosen for the shopper (ADR 0007). */
export function initialSelection(product: ProductDetail): ProductSelection {
  const [onlyStorage] = product.storageOptions.length === 1 ? product.storageOptions : [];
  const [onlyColor] = product.colorOptions.length === 1 ? product.colorOptions : [];
  return {
    ...(onlyStorage === undefined ? {} : { storage: onlyStorage }),
    ...(onlyColor === undefined ? {} : { color: onlyColor }),
  };
}

export interface DisplayedPrice {
  readonly amount: Money;
  /** True before a storage is chosen: the price is then shown as "From X EUR". */
  readonly isStartingPrice: boolean;
}

/**
 * The chosen storage's price, or the catalog's base price as "From" before a
 * choice, as in the designs. The base price is not always the cheapest storage
 * (docs/api-contract.md); showing it as designed was the product owner's call.
 */
export function displayedPrice(
  product: ProductDetail,
  selection: ProductSelection,
): DisplayedPrice {
  return selection.storage === undefined
    ? { amount: product.basePrice, isStartingPrice: true }
    : { amount: selection.storage.price, isStartingPrice: false };
}

/** The chosen color's image, or the first color's before a choice. */
export function displayedColor(
  product: ProductDetail,
  selection: ProductSelection,
): ColorOption | undefined {
  return selection.color ?? product.colorOptions[0];
}

export function missingChoices(selection: ProductSelection): readonly MissingChoice[] {
  return [
    ...(selection.storage === undefined ? (['storage'] as const) : []),
    ...(selection.color === undefined ? (['color'] as const) : []),
  ];
}

/** The cart line to add, or null while a choice is missing. */
export function cartLineFor(
  product: ProductDetail,
  selection: ProductSelection,
): Omit<CartLine, 'lineId'> | null {
  const { storage, color } = selection;
  if (storage === undefined || color === undefined) {
    return null;
  }
  return {
    productId: product.id,
    brand: product.brand,
    name: product.name,
    imageUrl: color.imageUrl,
    storage: storage.capacity,
    colorName: color.name,
    unitPrice: storage.price,
  };
}
