import { useCart } from '../../application/cart/cart-context';
import { copy } from '../../copy';
import { PageHeading } from '../components/page-heading/page-heading';

/** Cart lines, total and actions arrive in chunk 7. */
export function CartPage() {
  const { count } = useCart();
  return (
    <>
      <title>{copy.documentTitle.cart(count)}</title>
      <PageHeading>{copy.cart.heading(count)}</PageHeading>
    </>
  );
}
