import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { aCartLine } from '../../../test/builders';
import { renderApp } from '../../../test/render-app';
import { moneyFromCents } from '../../domain/money';

const s24 = aCartLine({
  lineId: 'a',
  name: 'Galaxy S24 Ultra',
  storage: '512 GB',
  colorName: 'Violeta Titanium',
  unitPrice: moneyFromCents(119900),
});
const a25 = aCartLine({
  lineId: 'b',
  productId: 'SMG-A25',
  name: 'Galaxy A25 5G',
  storage: '128 GB',
  colorName: 'Azul',
  unitPrice: moneyFromCents(23900),
});
const xperia = aCartLine({
  lineId: 'c',
  productId: 'SNY-XPERIA1V',
  brand: 'SONY',
  name: 'Xperia 1 V',
  storage: '256 GB',
  colorName: 'Negro',
  unitPrice: moneyFromCents(95942),
});

function renderCart(cart = [s24, a25, xperia]) {
  return { user: userEvent.setup(), ...renderApp('/cart', { cart }) };
}

describe('CartPage', () => {
  it('lists each line with image, name, storage | color and price, and the total', async () => {
    renderCart();

    expect(await screen.findByRole('heading', { level: 1, name: 'CART (3)' })).toBeInTheDocument();
    const lines = screen.getAllByRole('listitem');
    expect(lines).toHaveLength(3);
    const first = within(lines[0] as HTMLElement);
    expect(
      first.getByRole('img', { name: 'Samsung Galaxy S24 Ultra, Violeta Titanium' }),
    ).toBeInTheDocument();
    expect(first.getByRole('heading', { level: 2, name: 'Galaxy S24 Ultra' })).toBeInTheDocument();
    expect(first.getByText('512 GB | Violeta Titanium')).toBeInTheDocument();
    expect(first.getByText('1199 EUR')).toBeInTheDocument();
    expect(first.getByRole('button', { name: /^Eliminar/ })).toHaveAttribute('lang', 'es');
    expect(screen.getByText('TOTAL').parentElement).toHaveTextContent('2397,42 EUR');
    await waitFor(() => expect(document.title).toBe('Cart (3) | MBST'));
  });

  it('removes only the chosen line, updates count and total, saves, and says so', async () => {
    const { user, storage } = renderCart();

    await user.click(
      await screen.findByRole('button', { name: 'Eliminar Galaxy A25 5G, 128 GB, Azul' }),
    );

    expect(screen.getByRole('heading', { level: 1, name: 'CART (2)' })).toBeInTheDocument();
    expect(screen.queryByText('Galaxy A25 5G')).not.toBeInTheDocument();
    expect(screen.getByText('TOTAL').parentElement).toHaveTextContent('2158,42 EUR');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Removed from your cart: Galaxy A25 5G, 128 GB, Azul.',
    );
    expect(storage.saved.map((line) => line.lineId)).toEqual(['a', 'c']);
  });

  it('moves focus to the next line after a removal, or the previous one after the last line', async () => {
    const { user } = renderCart();

    await user.click(await screen.findByRole('button', { name: /^Eliminar Galaxy S24 Ultra/ }));
    expect(screen.getByRole('button', { name: /^Eliminar Galaxy A25 5G/ })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: /^Eliminar Xperia 1 V/ }));
    expect(screen.getByRole('button', { name: /^Eliminar Galaxy A25 5G/ })).toHaveFocus();
  });

  it('moves focus to CONTINUE SHOPPING when the last line is removed, and shows the empty cart', async () => {
    const { user } = renderCart([s24]);

    await user.click(await screen.findByRole('button', { name: /^Eliminar/ }));

    expect(screen.getByRole('link', { name: 'CONTINUE SHOPPING' })).toHaveFocus();
    expect(screen.getByRole('heading', { level: 1, name: 'CART (0)' })).toBeInTheDocument();
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.queryByText('TOTAL')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'PAY' })).not.toBeInTheDocument();
  });

  it('shows PAY as designed but explains that payment is not available', async () => {
    const { user } = renderCart();

    const pay = await screen.findByRole('button', { name: 'PAY' });
    expect(pay).toHaveAttribute('aria-disabled', 'true');
    expect(pay).toHaveAccessibleDescription('Payment is not available in this demo.');

    await user.click(pay);
    expect(screen.getByRole('heading', { level: 1, name: 'CART (3)' })).toBeInTheDocument();
  });

  it('continues shopping on the product list', async () => {
    const { user, router } = renderCart();

    await user.click(await screen.findByRole('link', { name: 'CONTINUE SHOPPING' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
  });

  it('has no accessibility violations, with lines and when empty', async () => {
    const { container, unmount } = renderCart();
    await screen.findByRole('heading', { level: 1, name: 'CART (3)' });
    expect(await axe(container)).toHaveNoViolations();
    unmount();

    const empty = renderCart([]);
    await screen.findByText('Your cart is empty.');
    expect(await axe(empty.container)).toHaveNoViolations();
  });
});
