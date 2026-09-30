import { expect } from 'chai';
import { InvalidProductQueryError } from '../../src/domain/errors';
import {
  createProductQuery,
  DEFAULT_PRODUCT_LIMIT,
  MAX_SEARCH_TERM_LENGTH,
} from '../../src/domain/product-query';

describe('createProductQuery', () => {
  it('asks for the first 20 products when no limit is given', () => {
    expect(createProductQuery({})).to.deep.equal({ limit: DEFAULT_PRODUCT_LIMIT });
    expect(DEFAULT_PRODUCT_LIMIT).to.equal(20);
  });

  it('trims the search term', () => {
    expect(createProductQuery({ searchTerm: '  iphone ' })).to.deep.equal({
      searchTerm: 'iphone',
      limit: 20,
    });
  });

  it('treats a blank search term as no search at all', () => {
    expect(createProductQuery({ searchTerm: '   ' })).to.deep.equal({ limit: 20 });
    expect(createProductQuery({ searchTerm: undefined })).to.deep.equal({ limit: 20 });
  });

  it('accepts limits from 1 to 50', () => {
    expect(createProductQuery({ limit: 1 }).limit).to.equal(1);
    expect(createProductQuery({ limit: 50 }).limit).to.equal(50);
  });

  for (const limit of [0, 51, 2.5, Number.NaN]) {
    it(`rejects a limit of ${limit}`, () => {
      expect(() => createProductQuery({ limit }))
        .to.throw(InvalidProductQueryError)
        .with.property('field', 'limit');
    });
  }

  it('rejects a search term longer than 100 characters', () => {
    const searchTerm = 'a'.repeat(MAX_SEARCH_TERM_LENGTH + 1);

    expect(() => createProductQuery({ searchTerm }))
      .to.throw(InvalidProductQueryError)
      .with.property('field', 'searchTerm');
  });

  it('measures the search term length after trimming', () => {
    const searchTerm = ` ${'a'.repeat(MAX_SEARCH_TERM_LENGTH)} `;

    expect(createProductQuery({ searchTerm }).searchTerm).to.have.length(MAX_SEARCH_TERM_LENGTH);
  });
});
