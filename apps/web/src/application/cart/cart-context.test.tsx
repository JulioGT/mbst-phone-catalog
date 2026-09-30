import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { type ReactNode, StrictMode } from 'react';
import { aCartLine } from '../../../test/builders';
import { InMemoryCartStorage } from '../../../test/in-memory-cart-storage';
import type { Cart } from '../../domain/cart';
import { CartProvider, type NewCartLine, useCart } from './cart-context';

function setup(stored: Cart = []) {
  const storage = new InMemoryCartStorage(stored);
  let nextId = 0;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <StrictMode>
      <CartProvider storage={storage} createLineId={() => `line-${++nextId}`}>
        {children}
      </CartProvider>
    </StrictMode>
  );
  const hook = renderHook(() => useCart(), { wrapper });
  return { ...hook, storage };
}

function CartSummary() {
  const { count, isLoaded } = useCart();
  return isLoaded ? <p>{count === 1 ? '1 line' : `${count} lines`}</p> : null;
}

const { lineId: _unused, ...newLine } = aCartLine();
const aNewLine = (overrides: Partial<NewCartLine> = {}): NewCartLine => ({
  ...newLine,
  ...overrides,
});

describe('CartProvider', () => {
  it('loads the stored cart', async () => {
    const { result } = setup([aCartLine({ lineId: 'stored' })]);

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.lines.map((line) => line.lineId)).toEqual(['stored']);
    expect(result.current.count).toBe(1);
  });

  it('loads only once, even if loading runs again', async () => {
    const stored = [aCartLine({ lineId: 'stored' })];
    const view = render(
      <CartProvider storage={new InMemoryCartStorage(stored)}>
        <CartSummary />
      </CartProvider>,
    );
    await screen.findByText('1 line');

    // A new storage object re-runs the loading effect, as StrictMode can.
    view.rerender(
      <CartProvider storage={new InMemoryCartStorage(stored)}>
        <CartSummary />
      </CartProvider>,
    );

    await waitFor(() => expect(screen.getByText('1 line')).toBeInTheDocument());
  });

  it('never writes over the stored cart before reading it', async () => {
    const storage = new InMemoryCartStorage([aCartLine({ lineId: 'stored' })]);
    const writes: string[][] = [];
    const save = storage.save.bind(storage);
    storage.save = (cart) => {
      writes.push(cart.map((line) => line.lineId));
      save(cart);
    };

    render(
      <StrictMode>
        <CartProvider storage={storage}>
          <CartSummary />
        </CartProvider>
      </StrictMode>,
    );
    await screen.findByText('1 line');

    expect(writes.length).toBeGreaterThan(0);
    expect(writes.every((ids) => ids.join() === 'stored')).toBe(true);
  });

  it('adds a line with a new id, updates count and total, and saves it', async () => {
    const { result, storage } = setup();
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.add(aNewLine({ unitPrice: aCartLine().unitPrice })));
    act(() => result.current.add(aNewLine()));

    expect(result.current.lines.map((line) => line.lineId)).toEqual(['line-1', 'line-2']);
    expect(result.current.count).toBe(2);
    expect(result.current.total).toBe(239800);
    expect(storage.saved).toHaveLength(2);
  });

  it('removes a line and saves the result', async () => {
    const { result, storage } = setup([aCartLine({ lineId: 'a' }), aCartLine({ lineId: 'b' })]);
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => result.current.remove('a'));

    expect(result.current.lines.map((line) => line.lineId)).toEqual(['b']);
    expect(storage.saved.map((line) => line.lineId)).toEqual(['b']);
  });

  it('explains the mistake when used outside the provider', () => {
    function Orphan() {
      useCart();
      return null;
    }
    // React reports the thrown error on the console; that is the expected outcome here.
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Orphan />)).toThrow('useCart must be used inside <CartProvider>.');
    expect(screen.queryByText(/./)).toBeNull();
  });
});
