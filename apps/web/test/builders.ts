import type { CartLine } from '../src/domain/cart';
import { moneyFromCents } from '../src/domain/money';

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
