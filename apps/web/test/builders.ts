import type { CartLine } from '../src/domain/cart';
import { moneyFromCents } from '../src/domain/money';
import type { ProductSummary } from '../src/domain/product';

export function aCartLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    lineId: 'line-1',
    productId: 'SMG-S24U',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    imageUrl: 'https://catalog.test/images/SMG-S24U-violet.webp',
    storage: '512 GB',
    colorName: 'Violeta Titanium',
    unitPrice: moneyFromCents(119900),
    ...overrides,
  };
}

export function aProductSummary(overrides: Partial<ProductSummary> = {}): ProductSummary {
  return {
    id: 'SMG-S24U',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    basePrice: moneyFromCents(132900),
    imageUrl: 'https://catalog.test/images/SMG-S24U-violet.webp',
    ...overrides,
  };
}
