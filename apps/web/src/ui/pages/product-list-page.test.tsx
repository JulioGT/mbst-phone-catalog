import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { aProductSummary } from '../../../test/builders';
import { InMemoryCatalogGateway } from '../../../test/in-memory-catalog-gateway';
import { renderApp } from '../../../test/render-app';
import { moneyFromCents } from '../../domain/money';

const catalog = [
  aProductSummary({
    id: 'SMG-S24U',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    basePrice: moneyFromCents(132900),
  }),
  aProductSummary({
    id: 'SMG-A25',
    brand: 'Samsung',
    name: 'Galaxy A25 5G',
    basePrice: moneyFromCents(23900),
  }),
  aProductSummary({
    id: 'XMI-13TPro',
    brand: 'Xiaomi',
    name: '13T Pro',
    basePrice: moneyFromCents(55331),
  }),
];

describe('ProductListPage', () => {
  it('shows every product as a card with image, brand, name and base price, and the count', async () => {
    renderApp('/', { gateway: new InMemoryCatalogGateway(catalog) });

    expect(await screen.findByRole('status')).toHaveTextContent('3 RESULTS');
    const cards = within(screen.getByRole('list')).getAllByRole('link');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAttribute('href', '/products/SMG-S24U');
    expect(cards[0]).toHaveTextContent('Samsung');
    expect(cards[0]).toHaveTextContent('Galaxy S24 Ultra');
    expect(cards[0]).toHaveTextContent('1329 EUR');
    expect(
      within(cards[2] as HTMLElement).getByRole('img', { name: 'Xiaomi 13T Pro' }),
    ).toBeInTheDocument();
    expect(cards[2]).toHaveTextContent('553,31 EUR');
  });

  it('shows placeholders while loading, hidden from screen readers, which hear a loading message', async () => {
    renderApp('/', { gateway: new InMemoryCatalogGateway(catalog) });

    expect(screen.getByTestId('product-grid-skeleton')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Loading phones');
    expect(await screen.findByText('3 RESULTS')).toBeInTheDocument();
    expect(screen.queryByTestId('product-grid-skeleton')).not.toBeInTheDocument();
  });

  it('filters through the API as the user types, and keeps the term in the URL', async () => {
    const user = userEvent.setup();
    const gateway = new InMemoryCatalogGateway(catalog);
    const { router } = renderApp('/', { gateway });
    await screen.findByText('3 RESULTS');

    await user.type(screen.getByRole('searchbox'), 'xiaomi');

    expect(await screen.findByText('1 RESULT')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?q=xiaomi');
    expect(gateway.searches).toEqual(['', 'xiaomi']);
  });

  it('runs the search in the URL when opened from a shared link', async () => {
    renderApp('/?q=galaxy', { gateway: new InMemoryCatalogGateway(catalog) });

    expect(await screen.findByText('2 RESULTS')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveValue('galaxy');
  });

  it('says so when nothing matches', async () => {
    renderApp('/?q=nokia', { gateway: new InMemoryCatalogGateway(catalog) });

    expect(await screen.findByText('No phones match "nokia".')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 RESULTS');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('explains a failure and recovers on retry', async () => {
    const user = userEvent.setup();
    const gateway = new InMemoryCatalogGateway(catalog);
    gateway.failNext();
    renderApp('/', { gateway });

    expect(await screen.findByRole('alert')).toHaveTextContent('We could not load the phones.');
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('3 RESULTS')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('opens the product detail when a card is chosen', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/', { gateway: new InMemoryCatalogGateway(catalog) });

    await user.click(await screen.findByRole('link', { name: /13T Pro/ }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/products/XMI-13TPro'));
  });

  it('has no accessibility violations with results', async () => {
    const { container } = renderApp('/', { gateway: new InMemoryCatalogGateway(catalog) });
    await screen.findByText('3 RESULTS');

    expect(await axe(container)).toHaveNoViolations();
  });
});
