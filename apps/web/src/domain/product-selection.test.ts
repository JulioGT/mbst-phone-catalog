import { moneyFromCents } from './money';
import type { ProductDetail } from './product';
import {
  cartLineFor,
  displayedColor,
  displayedPrice,
  initialSelection,
  missingChoices,
} from './product-selection';

const black = { name: 'Negro Titanium', hexCode: '#000', imageUrl: 'https://x.test/black.webp' };
const violet = {
  name: 'Violeta Titanium',
  hexCode: '#8E6F96',
  imageUrl: 'https://x.test/violet.webp',
};
const gb256 = { capacity: '256 GB', price: moneyFromCents(122900) };
const gb512 = { capacity: '512 GB', price: moneyFromCents(132900) };

/** Local builder: domain code (tests included) may only import the domain. */
function aProduct(overrides: Partial<ProductDetail> = {}): ProductDetail {
  return {
    id: 'SMG-S24U',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    description: 'El Samsung Galaxy S24 Ultra.',
    basePrice: moneyFromCents(132900),
    specs: {},
    colorOptions: [black, violet],
    storageOptions: [gb256, gb512],
    ...overrides,
  };
}

describe('product selection', () => {
  it('starts with nothing chosen when there are several options', () => {
    expect(initialSelection(aProduct())).toEqual({});
  });

  it('chooses a single storage or color for the shopper', () => {
    expect(initialSelection(aProduct({ storageOptions: [gb512] }))).toEqual({ storage: gb512 });
    expect(initialSelection(aProduct({ colorOptions: [violet] }))).toEqual({ color: violet });
  });

  it('shows the base price as a starting price until a storage is chosen', () => {
    expect(displayedPrice(aProduct(), {})).toEqual({ amount: 132900, isStartingPrice: true });
  });

  it('shows the chosen storage price exactly once a storage is chosen', () => {
    expect(displayedPrice(aProduct(), { storage: gb256 })).toEqual({
      amount: 122900,
      isStartingPrice: false,
    });
  });

  it('shows the first color until one is chosen, then the chosen one', () => {
    expect(displayedColor(aProduct(), {})).toBe(black);
    expect(displayedColor(aProduct(), { color: violet })).toBe(violet);
    expect(displayedColor(aProduct({ colorOptions: [] }), {})).toBeUndefined();
  });

  it('names what is still missing before the phone can be added', () => {
    expect(missingChoices({})).toEqual(['storage', 'color']);
    expect(missingChoices({ color: black })).toEqual(['storage']);
    expect(missingChoices({ storage: gb256 })).toEqual(['color']);
    expect(missingChoices({ storage: gb256, color: black })).toEqual([]);
  });

  it('builds a cart line only when storage and color are chosen', () => {
    expect(cartLineFor(aProduct(), { storage: gb256 })).toBeNull();
    expect(cartLineFor(aProduct(), { storage: gb256, color: violet })).toEqual({
      productId: 'SMG-S24U',
      brand: 'Samsung',
      name: 'Galaxy S24 Ultra',
      imageUrl: 'https://x.test/violet.webp',
      storage: '256 GB',
      colorName: 'Violeta Titanium',
      unitPrice: 122900,
    });
  });
});
