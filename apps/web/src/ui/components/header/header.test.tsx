import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { aCartLine } from '../../../../test/builders';
import { renderApp } from '../../../../test/render-app';

describe('Header', () => {
  it('links the logo to the product list', async () => {
    renderApp('/cart');

    expect(await screen.findByRole('link', { name: 'MBST, home' })).toHaveAttribute('href', '/');
  });

  it('shows the cart count and names it for screen readers', async () => {
    renderApp('/', { cart: [aCartLine({ lineId: 'a' }), aCartLine({ lineId: 'b' })] });

    const cartLink = await screen.findByRole('link', { name: 'Cart, 2 phones' });
    expect(cartLink).toHaveAttribute('href', '/cart');
    expect(cartLink).toHaveTextContent('2');
  });

  it('uses the singular for one phone and shows zero for an empty cart', async () => {
    const { unmount } = renderApp('/', { cart: [aCartLine()] });
    expect(await screen.findByRole('link', { name: 'Cart, 1 phone' })).toBeInTheDocument();
    unmount();

    renderApp('/');
    expect(await screen.findByRole('link', { name: 'Cart, 0 phones' })).toHaveTextContent('0');
  });

  it('hides the cart link on the cart page', async () => {
    renderApp('/cart');

    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByRole('link', { name: /^Cart,/ })).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderApp('/');
    await screen.findByRole('link', { name: /^Cart,/ });

    expect(await axe(container)).toHaveNoViolations();
  });
});
