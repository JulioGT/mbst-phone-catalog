import { Link } from 'react-router';
import { copy } from '../../../copy';
import type { ProductSummary } from '../../../domain/product';
import { formatPrice } from '../../format-price';
import styles from './product-card.module.css';

export interface ProductCardProps {
  readonly product: ProductSummary;
  /** Images near the top load eagerly: they are the page's largest content. */
  readonly eagerImage?: boolean;
}

/** The whole card is one link, so it is a single stop for keyboard users. */
export function ProductCard({ product, eagerImage = false }: ProductCardProps) {
  return (
    <Link to={`/products/${encodeURIComponent(product.id)}`} className={styles.card}>
      <img
        className={styles.image}
        src={product.imageUrl}
        alt={copy.list.productImage(product.brand, product.name)}
        width={312}
        height={257}
        loading={eagerImage ? 'eager' : 'lazy'}
        decoding="async"
      />
      <span className={styles.details}>
        <span className={styles.brand}>{product.brand}</span>
        <span className={styles.nameRow}>
          <span className={styles.name}>{product.name}</span>
          <span className={styles.price}>{formatPrice(product.basePrice)}</span>
        </span>
      </span>
    </Link>
  );
}
