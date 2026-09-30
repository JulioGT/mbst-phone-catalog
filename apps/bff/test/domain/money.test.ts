import { expect } from 'chai';
import { moneyFromCents, moneyFromEuros } from '../../src/domain/money';

describe('Money', () => {
  it('converts decimal euro prices from the API to exact integer cents', () => {
    expect(moneyFromEuros(553.31)).to.equal(55331);
    expect(moneyFromEuros(959.42)).to.equal(95942);
    expect(moneyFromEuros(0.29)).to.equal(29);
  });

  it('converts whole euro prices to cents', () => {
    expect(moneyFromEuros(1219)).to.equal(121900);
    expect(moneyFromEuros(0)).to.equal(0);
  });

  it('rejects negative and non-finite euro amounts', () => {
    expect(() => moneyFromEuros(-1)).to.throw(RangeError);
    expect(() => moneyFromEuros(Number.NaN)).to.throw(RangeError);
    expect(() => moneyFromEuros(Number.POSITIVE_INFINITY)).to.throw(RangeError);
  });

  it('rejects fractional or negative cents', () => {
    expect(() => moneyFromCents(10.5)).to.throw(RangeError);
    expect(() => moneyFromCents(-100)).to.throw(RangeError);
  });
});
