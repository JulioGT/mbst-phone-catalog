/**
 * Checks the live catalog API against what the BFF assumes (docs/api-contract.md).
 * Run manually with `pnpm check:contract`; CI never calls a third-party host.
 * Exits 1 when a payload breaks our schemas or the API rejects the key; the
 * other findings are observations that the adapter already handles.
 */
import {
  upstreamProductDetailSchema,
  upstreamProductListSchema,
} from '../src/infrastructure/catalog/upstream-schemas';
import { loadConfig } from '../src/infrastructure/config/load-config';

const config = loadConfig(process.env);
const failures: string[] = [];
const say = (line: string) => process.stdout.write(`${line}\n`);

async function get(path: string, apiKey = config.catalogApiKey) {
  const response = await fetch(`${config.catalogApiBaseUrl}${path}`, {
    headers: { 'x-api-key': apiKey },
    signal: AbortSignal.timeout(60_000),
  });
  return { status: response.status, body: (await response.json()) as unknown };
}

function check(ok: boolean, message: string, { fatal = false } = {}) {
  say(`${ok ? 'ok  ' : fatal ? 'FAIL' : 'note'}  ${message}`);
  if (!ok && fatal) failures.push(message);
}

say(`Checking ${config.catalogApiBaseUrl} (the first request can take a while on a cold start)\n`);

const unauthorized = await get('/products?limit=1', 'not-a-valid-key');
check(unauthorized.status === 401, 'an invalid key is rejected with 401', { fatal: true });

const list = await get('/products?limit=1000');
check(list.status === 200, 'the list answers 200 with our key', { fatal: true });
const parsedList = upstreamProductListSchema.safeParse(list.body);
check(parsedList.success, 'every list item matches the list schema', { fatal: true });
const products = parsedList.success ? parsedList.data : [];

const ids = products.map((product) => product.id);
const uniqueIds = [...new Set(ids)];
check(
  ids.length === uniqueIds.length,
  `list has no duplicate ids (${ids.length} items, ${uniqueIds.length} unique)`,
);
check(
  products.every((product) => product.imageUrl.startsWith('https://')),
  'list images are already https',
);

const brand = products[0]?.brand ?? '';
const byBrand = await get(`/products?search=${encodeURIComponent(brand.toLowerCase())}&limit=50`);
const brandMatches = upstreamProductListSchema.safeParse(byBrand.body);
check(
  brandMatches.success &&
    brandMatches.data.length > 0 &&
    brandMatches.data.every(
      (product) =>
        product.brand.toLowerCase() === brand.toLowerCase() ||
        product.name.toLowerCase().includes(brand.toLowerCase()),
    ),
  `search matches brand, case-insensitively ("${brand.toLowerCase()}")`,
  { fatal: true },
);

const notFound = await get('/products/NOT-A-REAL-ID');
check(notFound.status === 404, 'an unknown id answers 404', { fatal: true });

const notes = { basePriceNotLowest: 0, duplicateSimilar: 0, missingSpecs: 0, noOptions: 0 };
for (const id of uniqueIds) {
  const detail = await get(`/products/${encodeURIComponent(id)}`);
  const parsed = upstreamProductDetailSchema.safeParse(detail.body);
  if (!parsed.success) {
    check(
      false,
      `detail ${id} matches the detail schema: ${parsed.error.issues[0]?.path.join('.')}`,
      {
        fatal: true,
      },
    );
    continue;
  }
  const product = parsed.data;
  const prices = product.storageOptions.map((option) => option.price);
  if (prices.length > 0 && product.basePrice !== Math.min(...prices)) notes.basePriceNotLowest += 1;
  const similarIds = product.similarProducts.map((similar) => similar.id);
  if (new Set(similarIds).size !== similarIds.length) notes.duplicateSimilar += 1;
  if (Object.keys(product.specs).length < 8) notes.missingSpecs += 1;
  if (product.colorOptions.length === 0 || product.storageOptions.length === 0)
    notes.noOptions += 1;
}
check(true, `${uniqueIds.length} product details match the detail schema`);
check(
  notes.basePriceNotLowest === 0,
  `basePrice is the lowest storage price (differs on ${notes.basePriceNotLowest})`,
);
check(
  notes.duplicateSimilar === 0,
  `similar products have no duplicates (duplicated on ${notes.duplicateSimilar})`,
);
check(
  notes.missingSpecs === 0,
  `every spec attribute is present (missing on ${notes.missingSpecs})`,
);
check(
  notes.noOptions === 0,
  `every product has a color and a storage option (${notes.noOptions} without)`,
  {
    fatal: true,
  },
);

say(failures.length === 0 ? '\nContract holds.' : `\n${failures.length} contract failure(s).`);
process.exitCode = failures.length === 0 ? 0 : 1;
