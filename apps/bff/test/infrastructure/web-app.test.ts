import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect } from 'chai';
import request from 'supertest';
import { GetProductDetail } from '../../src/application/get-product-detail';
import { ListProducts } from '../../src/application/list-products';
import { createApp } from '../../src/infrastructure/http/create-app';
import { aProductSummary } from '../builders';
import { InMemoryFeatureFlags } from '../doubles/in-memory-feature-flags';
import { InMemoryLogger } from '../doubles/in-memory-logger';
import { InMemoryProductCatalog } from '../doubles/in-memory-product-catalog';

describe('serving the built web app', () => {
  let directory: string;

  before(() => {
    directory = mkdtempSync(path.join(tmpdir(), 'mbst-web-'));
    mkdirSync(path.join(directory, 'static', 'js'), { recursive: true });
    writeFileSync(path.join(directory, 'index.html'), '<!doctype html><title>MBST</title>');
    writeFileSync(path.join(directory, 'static', 'js', 'index.1a2b3c.js'), 'console.log(1)');
    writeFileSync(path.join(directory, 'favicon.svg'), '<svg/>');
  });

  after(() => rmSync(directory, { recursive: true, force: true }));

  function app({ serve = true } = {}) {
    const catalog = new InMemoryProductCatalog({ summaries: [aProductSummary()] });
    return createApp({
      listProducts: new ListProducts(catalog),
      getProductDetail: new GetProductDetail(catalog, new InMemoryFeatureFlags()),
      logger: new InMemoryLogger(),
      imageOrigins: ['https://catalog.test'],
      ...(serve ? { webAppDirectory: directory } : {}),
    });
  }

  it('serves the page for the home and for any page URL, so direct links work', async () => {
    for (const url of ['/', '/products/SMG-S24U', '/cart']) {
      const response = await request(app()).get(url).set('Accept', 'text/html').expect(200);
      expect(response.text).to.contain('<title>MBST</title>');
      expect(response.headers['cache-control']).to.equal('no-cache');
    }
  });

  it('lets browsers keep hashed assets for a year', async () => {
    const response = await request(app()).get('/static/js/index.1a2b3c.js').expect(200);

    expect(response.headers['cache-control'])
      .to.contain('max-age=31536000')
      .and.contain('immutable');
  });

  it('answers 404 for a missing asset instead of sending the page', async () => {
    await request(app()).get('/static/js/missing.js').expect(404);
  });

  it('serves other public files such as the favicon', async () => {
    await request(app()).get('/favicon.svg').expect(200);
  });

  it('keeps the API in JSON, including unknown API routes', async () => {
    await request(app())
      .get('/api/products')
      .set('Accept', 'text/html')
      .expect('Content-Type', /json/)
      .expect(200);
    await request(app())
      .get('/api/nope')
      .set('Accept', 'text/html')
      .expect('Content-Type', /json/)
      .expect(404);
  });

  it('allows product images from the catalog host and nothing else external', async () => {
    const response = await request(app()).get('/').set('Accept', 'text/html');

    expect(response.headers['content-security-policy']).to.contain(
      "img-src 'self' data: https://catalog.test",
    );
    expect(response.headers['content-security-policy']).to.contain("script-src 'self'");
  });

  it('serves only the API when no build is given (development)', async () => {
    await request(app({ serve: false }))
      .get('/cart')
      .set('Accept', 'text/html')
      .expect(404);
  });
});
