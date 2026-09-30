import type { ProductSummary } from '../../../domain/product';
import { ProductCard } from '../product-card/product-card';
import styles from './product-grid.module.css';

/** Cards in the first desktop row (5 columns) load their images eagerly. */
const EAGER_IMAGES = 5;
const SKELETON_KEYS = Array.from({ length: 10 }, (_, index) => `skeleton-${index}`);

export function ProductGrid({ products }: { readonly products: readonly ProductSummary[] }) {
  return (
    <ul className={styles.grid}>
      {products.map((product, index) => (
        <li key={product.id} className={styles.cell}>
          <ProductCard product={product} eagerImage={index < EAGER_IMAGES} />
        </li>
      ))}
    </ul>
  );
}

/** Placeholder grid while products load; hidden from assistive technology. */
export function ProductGridSkeleton() {
  return (
    <ul className={styles.grid} aria-hidden="true" data-testid="product-grid-skeleton">
      {SKELETON_KEYS.map((key) => (
        <li key={key} className={`${styles.cell} ${styles.skeleton}`}>
          <span className={styles.skeletonImage} />
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonLine} />
        </li>
      ))}
    </ul>
  );
}
