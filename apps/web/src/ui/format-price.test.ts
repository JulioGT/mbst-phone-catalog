import { moneyFromCents } from '../domain/money';
import { formatPrice } from './format-price';

describe('formatPrice', () => {
  it('prints whole amounts without decimals or grouping, as in the designs', () => {
    expect(formatPrice(moneyFromCents(121900))).toBe('1219 EUR');
    expect(formatPrice(moneyFromCents(0))).toBe('0 EUR');
  });

  it('prints cents with a decimal comma', () => {
    expect(formatPrice(moneyFromCents(55331))).toBe('553,31 EUR');
    expect(formatPrice(moneyFromCents(11790))).toBe('117,90 EUR');
  });

  it('groups thousands from 10 000 up', () => {
    expect(formatPrice(moneyFromCents(1234500))).toBe('12.345 EUR');
  });
});
