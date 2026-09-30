import { copy } from '../copy';
import type { Money } from '../domain/money';

/**
 * Spanish number format, as on the store: no decimals when the amount is whole
 * ("1219 EUR"), two with a comma otherwise ("553,31 EUR"), and no grouping
 * separator below 10 000. Money is formatted here, at the UI edge, and nowhere else.
 */
const wholeEuros = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });
const euroCents = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(amount: Money): string {
  const euros = amount / 100;
  const formatter = amount % 100 === 0 ? wholeEuros : euroCents;
  return copy.price.amount(formatter.format(euros));
}
