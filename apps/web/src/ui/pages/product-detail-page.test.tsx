import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { aProductDetail, aProductSummary } from '../../../test/builders';
import { InMemoryCatalogGateway } from '../../../test/in-memory-catalog-gateway';
import { renderApp } from '../../../test/render-app';
import { moneyFromCents } from '../../domain/money';

const s24 = aProductDetail();
const a25 = aProductDetail({
  id: 'SMG-A25',
  name: 'Galaxy A25 5G',
  storageOptions: [{ capacity: '128 GB', price: moneyFromCents(23900) }],
  colorOptions: [{ name: 'Azul', hexCode: '#1E2A44', imageUrl: 'https://catalog.test/blue.webp' }],
  similarProducts: [],
});

function renderDetail(
  path = '/products/SMG-S24U',
  gateway = new InMemoryCatalogGateway([], [s24, a25]),
) {
  return { user: userEvent.setup(), ...renderApp(path, { gateway }) };
}

const addButton = () => screen.getByRole('button', { name: 'AÑADIR' });

describe('ProductDetailPage', () => {
  it('shows the name, the base price as a starting price, and the first color image', async () => {
    renderDetail();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Galaxy S24 Ultra' }),
    ).toBeInTheDocument();
    expect(screen.getByText('From 1329 EUR')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Samsung Galaxy S24 Ultra, Negro Titanium' }),
    ).toHaveAttribute('src', 'https://catalog.test/black.webp');
    await waitFor(() => expect(document.title).toBe('Samsung Galaxy S24 Ultra | MBST'));
  });

  it('keeps AÑADIR unavailable, and says why, until storage and color are chosen', async () => {
    const { user } = renderDetail();
    await screen.findByRole('heading', { level: 1 });

    expect(addButton()).toHaveAttribute('aria-disabled', 'true');
    expect(addButton()).toHaveAccessibleDescription(
      'Choose a storage and a color to add this phone.',
    );

    await user.click(screen.getByRole('radio', { name: '256 GB' }));
    expect(addButton()).toHaveAccessibleDescription('Choose a color to add this phone.');

    await user.click(screen.getByRole('radio', { name: 'Violeta Titanium' }));
    expect(addButton()).toHaveAttribute('aria-disabled', 'false');
    expect(addButton()).not.toHaveAccessibleDescription();
  });

  it('updates the price to the chosen storage and the image to the chosen color', async () => {
    const { user } = renderDetail();
    await screen.findByRole('heading', { level: 1 });

    await user.click(screen.getByRole('radio', { name: '256 GB' }));
    await user.click(screen.getByRole('radio', { name: 'Violeta Titanium' }));

    expect(screen.getByText('1229 EUR')).toBeInTheDocument();
    expect(screen.queryByText(/^From/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Samsung Galaxy S24 Ultra, Violeta Titanium' }),
    ).toHaveAttribute('src', 'https://catalog.test/violet.webp');
    expect(screen.getByRole('radio', { name: 'Violeta Titanium' })).toBeChecked();
  });

  it('adds the chosen phone to the cart, confirms it and updates the bag count', async () => {
    const { user, storage } = renderDetail();
    await screen.findByRole('heading', { level: 1 });

    await user.click(screen.getByRole('radio', { name: '512 GB' }));
    await user.click(screen.getByRole('radio', { name: 'Negro Titanium' }));
    await user.click(addButton());

    expect(screen.getByRole('status')).toHaveTextContent(
      'Added to your cart: Galaxy S24 Ultra, 512 GB, Negro Titanium.',
    );
    expect(screen.getByRole('link', { name: 'Cart, 1 phone' })).toBeInTheDocument();
    await waitFor(() =>
      expect(storage.saved).toEqual([
        expect.objectContaining({
          productId: 'SMG-S24U',
          storage: '512 GB',
          colorName: 'Negro Titanium',
          unitPrice: 132900,
        }),
      ]),
    );
  });

  it('does not add anything while a choice is missing', async () => {
    const { user } = renderDetail();
    await screen.findByRole('heading', { level: 1 });

    await user.click(addButton());

    expect(screen.getByRole('link', { name: 'Cart, 0 phones' })).toBeInTheDocument();
  });

  it('chooses single options for the shopper, so the phone can be added right away', async () => {
    renderDetail('/products/SMG-A25');
    await screen.findByRole('heading', { level: 1, name: 'Galaxy A25 5G' });

    expect(screen.getByRole('radio', { name: '128 GB' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Azul' })).toBeChecked();
    expect(screen.getByText('239 EUR')).toBeInTheDocument();
    expect(addButton()).toHaveAttribute('aria-disabled', 'false');
  });

  it('shows every specification row in the design order', async () => {
    renderDetail();
    await screen.findByRole('heading', { level: 1 });

    const table = screen.getByRole('table');
    const labels = within(table)
      .getAllByRole('rowheader')
      .map((cell) => cell.textContent);
    expect(labels).toEqual([
      'BRAND',
      'NAME',
      'DESCRIPTION',
      'SCREEN',
      'RESOLUTION',
      'PROCESSOR',
      'MAIN CAMERA',
      'SELFIE CAMERA',
      'BATTERY',
      'OS',
      'SCREEN REFRESH RATE',
    ]);
    expect(within(table).getByRole('row', { name: /SCREEN REFRESH RATE/ })).toHaveTextContent(
      '120 Hz',
    );
    expect(within(table).getByText(/gama alta/)).toHaveAttribute('lang', 'es');
    expect(addButton()).toHaveAttribute('lang', 'es');
  });

  it('marks a missing specification instead of leaving it blank', async () => {
    renderDetail(
      '/products/SMG-S24U',
      new InMemoryCatalogGateway([], [aProductDetail({ specs: {} })]),
    );

    const row = await screen.findByRole('row', { name: /BATTERY/ });
    expect(row).toHaveTextContent('Not available');
  });

  it('lists similar products that lead to their own detail page, which starts with a fresh selection', async () => {
    const { user } = renderDetail();
    await screen.findByRole('heading', { level: 1 });
    await user.click(screen.getByRole('radio', { name: '256 GB' }));

    const similar = screen.getByRole('region', { name: 'SIMILAR ITEMS' });
    await user.click(within(similar).getByRole('link', { name: /Galaxy A25 5G/ }));

    const heading = await screen.findByRole('heading', { level: 1, name: 'Galaxy A25 5G' });
    expect(screen.getByRole('radio', { name: '128 GB' })).toBeChecked();
    await waitFor(() => expect(heading).toHaveFocus());
  });

  it('hides the similar products section when there are none (feature flag off)', async () => {
    const { similarProducts: _hidden, ...withoutSimilar } = s24;
    renderDetail('/products/SMG-S24U', new InMemoryCatalogGateway([], [withoutSimilar]));
    await screen.findByRole('heading', { level: 1 });

    expect(screen.queryByRole('region', { name: 'SIMILAR ITEMS' })).not.toBeInTheDocument();
  });

  it('says so when the product does not exist', async () => {
    renderDetail('/products/NOPE');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Product not found' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'BACK' })).toHaveAttribute('href', '/');
  });

  it('explains a failure and recovers on retry', async () => {
    const gateway = new InMemoryCatalogGateway([], [s24]);
    gateway.failNext();
    const { user } = renderDetail('/products/SMG-S24U', gateway);

    expect(await screen.findByRole('alert')).toHaveTextContent('We could not load this phone.');
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Galaxy S24 Ultra' }),
    ).toBeInTheDocument();
  });

  it('goes back to the search the shopper came from', async () => {
    const gateway = new InMemoryCatalogGateway([aProductSummary()], [s24]);
    const user = userEvent.setup();
    const { router } = renderApp('/?q=galaxy', { gateway });

    await user.click(await screen.findByRole('link', { name: /Galaxy S24 Ultra/ }));
    await user.click(await screen.findByRole('link', { name: 'BACK' }));

    await waitFor(() => expect(router.state.location.search).toBe('?q=galaxy'));
  });

  it('moves focus to the phone name once it loads after opening it from the list', async () => {
    const gateway = new InMemoryCatalogGateway([aProductSummary()], [s24]);
    const user = userEvent.setup();
    renderApp('/', { gateway });

    await user.click(await screen.findByRole('link', { name: /Galaxy S24 Ultra/ }));

    const heading = await screen.findByRole('heading', { level: 1, name: 'Galaxy S24 Ultra' });
    await waitFor(() => expect(heading).toHaveFocus());
  });

  it('has no accessibility violations', async () => {
    const { container } = renderDetail();
    await screen.findByRole('heading', { level: 1 });

    expect(await axe(container)).toHaveNoViolations();
  });
});
