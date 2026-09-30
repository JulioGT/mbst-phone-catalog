import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { aCartLine } from '../../test/builders';
import { renderApp } from '../../test/render-app';

describe('routes', () => {
  it.each([
    ['/', 'MBST phones', 'Phones | MBST'],
    ['/products/SMG-S24U', 'Phone', 'Phone | MBST'],
    ['/cart', 'CART (0)', 'Cart (0) | MBST'],
    ['/no/such/page', 'Page not found', 'Page not found | MBST'],
  ])('renders %s with one h1 and its own document title', async (path, heading, title) => {
    renderApp(path);

    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    await waitFor(() => expect(document.title).toBe(title));
  });

  it('shows the cart count in the cart page heading and title', async () => {
    renderApp('/cart', { cart: [aCartLine()] });

    expect(await screen.findByRole('heading', { level: 1, name: 'CART (1)' })).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Cart (1) | MBST'));
  });

  it('moves focus to the new page heading after navigating', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.click(await screen.findByRole('link', { name: /^Cart,/ }));

    const heading = await screen.findByRole('heading', { level: 1, name: 'CART (0)' });
    await waitFor(() => expect(heading).toHaveFocus());
  });

  it('offers a way back from the not-found page', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/nope');

    await user.click(await screen.findByRole('link', { name: 'Back to all phones' }));

    expect(router.state.location.pathname).toBe('/');
  });

  it('lets keyboard users skip straight to the content', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await screen.findByRole('heading', { level: 1 });

    await user.tab();

    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus();
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
  });

  it('has landmarks and no accessibility violations', async () => {
    const { container } = renderApp('/nope');
    await screen.findByRole('heading', { level: 1 });

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
