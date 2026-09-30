import { moneyFromCents } from '../src/domain/money';
import type { ProductDetail, ProductSummary } from '../src/domain/product';

export function aProductSummary(overrides: Partial<ProductSummary> = {}): ProductSummary {
  return {
    id: 'APL-IP13-128',
    brand: 'Apple',
    name: 'iPhone 13',
    basePrice: moneyFromCents(61900),
    imageUrl: 'https://example.test/images/APL-IP13-128-medianoche.webp',
    ...overrides,
  };
}

export function aProductDetail(overrides: Partial<ProductDetail> = {}): ProductDetail {
  return {
    id: 'MTE-EDGE50PRO',
    brand: 'Motorola',
    name: 'edge 50 Pro',
    description: 'Más allá de los límites.',
    basePrice: moneyFromCents(64900),
    specs: {
      screen: '6.67" Super HD (1220p)',
      resolution: '2712 x 1220 pixels',
      processor: 'Snapdragon® 7 Gen 3',
      mainCamera: '50 MP',
      selfieCamera: '50 MP',
      battery: '4500 mAh',
      os: 'Android 14',
      screenRefreshRate: 'No especificado',
    },
    colorOptions: [
      {
        name: 'Negro',
        hexCode: '#000000',
        imageUrl: 'https://example.test/images/MTE-EDGE50PRO-negro.webp',
      },
    ],
    storageOptions: [{ capacity: '512 GB', price: moneyFromCents(64900) }],
    similarProducts: [aProductSummary({ id: 'SMG-A15', brand: 'Samsung', name: 'Galaxy A15 LTE' })],
    ...overrides,
  };
}

/** Awaits a promise that must reject and returns the rejection reason. */
export async function rejectionOf(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('Expected the promise to reject, but it resolved.');
}
