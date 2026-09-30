import { type CSSProperties, type UIEvent, useState } from 'react';
import { copy } from '../../../copy';
import type { ProductSummary } from '../../../domain/product';
import { ProductCard } from '../product-card/product-card';
import styles from './similar-products.module.css';

/**
 * A horizontally scrolling row of cards with a progress bar under it, as in
 * the designs. Keyboard users reach every card with Tab; the browser scrolls
 * the focused card into view.
 */
export function SimilarProducts({ products }: { readonly products: readonly ProductSummary[] }) {
  const [progress, setProgress] = useState(0);

  function handleScroll(event: UIEvent<HTMLUListElement>) {
    const { scrollLeft, scrollWidth, clientWidth } = event.currentTarget;
    const scrollable = scrollWidth - clientWidth;
    setProgress(scrollable > 0 ? scrollLeft / scrollable : 1);
  }

  return (
    <section className={styles.section} aria-labelledby="similar-heading">
      <h2 id="similar-heading" className={styles.heading}>
        {copy.detail.similarHeading}
      </h2>
      <ul className={styles.track} onScroll={handleScroll}>
        {products.map((product) => (
          <li key={product.id} className={styles.cell}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
      <div className={styles.progress} aria-hidden="true">
        <span className={styles.bar} style={{ '--progress': progress } as CSSProperties} />
      </div>
    </section>
  );
}
