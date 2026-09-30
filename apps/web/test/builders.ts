import type { CartLine } from '../src/domain/cart';
import { moneyFromCents } from '../src/domain/money';
import type { ProductDetail, ProductSummary } from '../src/domain/product';

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

export function aProductDetail(overrides: Partial<ProductDetail> = {}): ProductDetail {
  return {
    id: 'SMG-S24U',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    description: 'El Samsung Galaxy S24 Ultra es un smartphone de gama alta.',
    basePrice: moneyFromCents(132900),
    specs: {
      screen: '6.8" Dynamic AMOLED 2X',
      resolution: '3120 x 1440 pixels',
      processor: 'Snapdragon 8 Gen 3',
      mainCamera: '200 MP',
      selfieCamera: '12 MP',
      battery: '5000 mAh',
      os: 'Android 14',
      screenRefreshRate: '120 Hz',
    },
    colorOptions: [
      { name: 'Negro Titanium', hexCode: '#000000', imageUrl: 'https://catalog.test/black.webp' },
      {
        name: 'Violeta Titanium',
        hexCode: '#8E6F96',
        imageUrl: 'https://catalog.test/violet.webp',
      },
    ],
    storageOptions: [
      { capacity: '256 GB', price: moneyFromCents(122900) },
      { capacity: '512 GB', price: moneyFromCents(132900) },
    ],
    similarProducts: [
      aProductSummary({ id: 'SMG-A25', name: 'Galaxy A25 5G', basePrice: moneyFromCents(23900) }),
    ],
    ...overrides,
  };
}
