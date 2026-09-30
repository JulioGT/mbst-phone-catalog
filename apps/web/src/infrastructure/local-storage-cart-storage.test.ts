import { aCartLine } from '../../test/builders';
import { CART_STORAGE_KEY, LocalStorageCartStorage } from './local-storage-cart-storage';

const storage = () => new LocalStorageCartStorage(() => window.localStorage);

describe('LocalStorageCartStorage', () => {
  it('reads back the cart it saved', () => {
    const cart = [aCartLine({ lineId: 'a' }), aCartLine({ lineId: 'b', storage: '256 GB' })];

    storage().save(cart);

    expect(storage().load()).toEqual(cart);
  });

  it('stores prices as integer cents in a versioned format', () => {
    storage().save([aCartLine()]);

    const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '');
    expect(stored.version).toBe(1);
    expect(stored.lines[0].unitPriceInCents).toBe(119900);
  });

  it('starts with an empty cart when nothing is stored', () => {
    expect(storage().load()).toEqual([]);
  });

  it.each([
    ['text that is not JSON', '{not json'],
    ['a different shape', JSON.stringify({ items: [] })],
    ['an unknown version', JSON.stringify({ version: 2, lines: [] })],
    [
      'a line with a fractional price',
      JSON.stringify({ version: 1, lines: [{ ...aCartLine(), unitPriceInCents: 1.5 }] }),
    ],
  ])('treats %s as an empty cart instead of crashing', (_case, raw) => {
    window.localStorage.setItem(CART_STORAGE_KEY, raw);

    expect(storage().load()).toEqual([]);
  });

  it('works without crashing when the browser blocks storage', () => {
    const blocked = new LocalStorageCartStorage(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    expect(blocked.load()).toEqual([]);
    expect(() => blocked.save([aCartLine()])).not.toThrow();
  });

  it('keeps working when storage is full', () => {
    const full = new LocalStorageCartStorage(() => ({
      ...window.localStorage,
      getItem: () => null,
      setItem: () => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      },
    }));

    expect(() => full.save([aCartLine()])).not.toThrow();
  });
});
