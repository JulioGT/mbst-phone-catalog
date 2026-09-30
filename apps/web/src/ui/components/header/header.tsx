import { Link, useLocation } from 'react-router';
import { useCart } from '../../../application/cart/cart-context';
import { copy } from '../../../copy';
import { BagIcon } from '../icons/bag-icon';
import styles from './header.module.css';

export function Header() {
  const { count } = useCart();
  const { pathname } = useLocation();
  // Deviation 6 (design-system.md): no bag on the cart page, as in two of the three cart frames.
  const showCartLink = pathname !== '/cart';

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label={copy.header.navigation}>
        <Link to="/" className={styles.logo} aria-label={copy.header.homeLink}>
          {copy.appName}
        </Link>
        {showCartLink && (
          <Link to="/cart" className={styles.cart} aria-label={copy.header.cartLink(count)}>
            <BagIcon filled={count > 0} />
            <span aria-hidden="true">{count}</span>
          </Link>
        )}
      </nav>
    </header>
  );
}
