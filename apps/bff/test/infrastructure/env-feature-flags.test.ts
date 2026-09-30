import { expect } from 'chai';
import { EnvFeatureFlags } from '../../src/infrastructure/flags/env-feature-flags';

describe('EnvFeatureFlags', () => {
  it('switches on the flags in the list, ignoring spaces', () => {
    const flags = new EnvFeatureFlags(' similar-products , ');

    expect(flags.isEnabled('similar-products')).to.equal(true);
    expect(flags.unknownNames).to.deep.equal([]);
  });

  it('switches every flag off when the list is empty or missing', () => {
    expect(new EnvFeatureFlags('').isEnabled('similar-products')).to.equal(false);
    expect(new EnvFeatureFlags(undefined).isEnabled('similar-products')).to.equal(false);
  });

  it('collects unknown names so typos can be reported', () => {
    const flags = new EnvFeatureFlags('similar-product,similar-products');

    expect(flags.unknownNames).to.deep.equal(['similar-product']);
    expect(flags.isEnabled('similar-products')).to.equal(true);
  });
});
