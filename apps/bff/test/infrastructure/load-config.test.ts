import { expect } from 'chai';
import { InvalidConfigError, loadConfig } from '../../src/infrastructure/config/load-config';

const valid = {
  CATALOG_API_BASE_URL: 'https://catalog.test/',
  CATALOG_API_KEY: 'secret-key-value',
};

describe('loadConfig', () => {
  it('reads the environment and applies defaults', () => {
    expect(loadConfig(valid)).to.deep.equal({
      catalogApiBaseUrl: 'https://catalog.test',
      catalogApiKey: 'secret-key-value',
      catalogApiTimeoutMs: 15000,
      port: 3000,
      featureFlags: '',
    });
  });

  it('parses numbers and flags', () => {
    const config = loadConfig({
      ...valid,
      CATALOG_API_TIMEOUT_MS: '5000',
      PORT: '8080',
      FEATURE_FLAGS: 'similar-products',
    });

    expect(config).to.include({
      catalogApiTimeoutMs: 5000,
      port: 8080,
      featureFlags: 'similar-products',
    });
  });

  it('refuses to start without an API key', () => {
    expect(() => loadConfig({ CATALOG_API_BASE_URL: valid.CATALOG_API_BASE_URL }))
      .to.throw(InvalidConfigError)
      .with.property('message')
      .that.includes('CATALOG_API_KEY');
  });

  it('refuses the placeholder key from .env.example', () => {
    expect(() =>
      loadConfig({ ...valid, CATALOG_API_KEY: 'replace-with-the-key-from-the-challenge' }),
    ).to.throw(InvalidConfigError, /placeholder/);
  });

  it('refuses a base URL that is not http(s)', () => {
    expect(() => loadConfig({ ...valid, CATALOG_API_BASE_URL: 'ftp://catalog.test' })).to.throw(
      InvalidConfigError,
      /CATALOG_API_BASE_URL/,
    );
  });

  it('never echoes a value in its error message', () => {
    expect(() => loadConfig({ ...valid, PORT: 'secret-key-value' }))
      .to.throw(InvalidConfigError)
      .with.property('message')
      .that.does.not.include('secret-key-value');
  });
});
