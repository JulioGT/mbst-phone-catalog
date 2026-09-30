import { addLine, type CartLine, cartCount, cartTotal, EMPTY_CART, removeLine } from './cart';
import { moneyFromCents } from './money';

/** Local builder: domain code (tests included) may only import the domain. */
function aCartLine(overrides: Partial<CartLine> = {}): CartLine {
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

describe('cart', () => {
  it('adds every phone as its own line, even the same phone twice', () => {
    const cart = addLine(
      addLine(EMPTY_CART, aCartLine({ lineId: 'a' })),
      aCartLine({ lineId: 'b' }),
    );

    expect(cart.map((line) => line.lineId)).toEqual(['a', 'b']);
    expect(cartCount(cart)).toBe(2);
  });

  it('removes only the chosen line', () => {
    const cart = [
      aCartLine({ lineId: 'a' }),
      aCartLine({ lineId: 'b' }),
      aCartLine({ lineId: 'c' }),
    ];

    expect(removeLine(cart, 'b').map((line) => line.lineId)).toEqual(['a', 'c']);
  });

  it('leaves the cart unchanged when removing an unknown line', () => {
    const cart = [aCartLine({ lineId: 'a' })];

    expect(removeLine(cart, 'nope')).toEqual(cart);
  });

  it('never changes the cart it was given', () => {
    const cart = [aCartLine({ lineId: 'a' })];

    addLine(cart, aCartLine({ lineId: 'b' }));
    removeLine(cart, 'a');

    expect(cart).toHaveLength(1);
  });

  it('totals the unit prices in exact cents', () => {
    const cart = [
      aCartLine({ lineId: 'a', unitPrice: moneyFromCents(55331) }),
      aCartLine({ lineId: 'b', unitPrice: moneyFromCents(11729) }),
    ];

    expect(cartTotal(cart)).toBe(67060);
  });

  it('has a count and total of zero when empty', () => {
    expect(cartCount(EMPTY_CART)).toBe(0);
    expect(cartTotal(EMPTY_CART)).toBe(0);
  });
});
