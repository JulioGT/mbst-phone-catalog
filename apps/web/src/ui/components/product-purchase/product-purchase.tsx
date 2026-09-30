import { useEffect, useId, useState } from 'react';
import { useCart } from '../../../application/cart/cart-context';
import { copy } from '../../../copy';
import type { ProductDetail } from '../../../domain/product';
import {
  cartLineFor,
  displayedColor,
  displayedPrice,
  initialSelection,
  missingChoices,
  type ProductSelection,
} from '../../../domain/product-selection';
import { formatPrice } from '../../format-price';
import { ColorSelector } from '../color-selector/color-selector';
import { PageHeading } from '../page-heading/page-heading';
import { StorageSelector } from '../storage-selector/storage-selector';
import styles from './product-purchase.module.css';

function missingMessage(product: ProductDetail, selection: ProductSelection): string | null {
  const missing = missingChoices(selection);
  if (missing.length === 0) {
    return null;
  }
  if (missing.length === 2) {
    return copy.detail.missing.both;
  }
  return missing[0] === 'storage' || product.colorOptions.length === 0
    ? copy.detail.missing.storage
    : copy.detail.missing.color;
}

/**
 * Image and buying options. Selection is local state; the page gives this
 * component a `key` per product, so moving to a similar product starts over.
 */
export function ProductPurchase({ product }: { readonly product: ProductDetail }) {
  const { add } = useCart();
  const [selection, setSelection] = useState<ProductSelection>(() => initialSelection(product));
  const [confirmation, setConfirmation] = useState('');
  const hintId = useId();

  // Preload every color's image so switching colors never shows the old one while loading.
  useEffect(() => {
    for (const option of product.colorOptions) {
      new Image().src = option.imageUrl;
    }
  }, [product.colorOptions]);

  const price = displayedPrice(product, selection);
  const color = displayedColor(product, selection);
  const line = cartLineFor(product, selection);
  const hint = missingMessage(product, selection);

  function choose(change: ProductSelection) {
    setSelection((current) => ({ ...current, ...change }));
    setConfirmation('');
  }

  function handleAdd() {
    if (line === null) {
      return;
    }
    add(line);
    setConfirmation(copy.detail.added(line.name, line.storage, line.colorName));
  }

  return (
    <div className={styles.purchase}>
      <div className={styles.imageBox}>
        {color !== undefined && (
          <img
            className={styles.image}
            src={color.imageUrl}
            alt={copy.detail.image(product.brand, product.name, color.name)}
            width={510}
            height={630}
          />
        )}
      </div>

      <div className={styles.options}>
        <div className={styles.titleBlock}>
          <PageHeading className={styles.name}>{product.name}</PageHeading>
          {/* Polite live region: choosing a storage announces the new price. */}
          <p className={styles.price} aria-live="polite">
            {price.isStartingPrice
              ? copy.detail.startingPrice(formatPrice(price.amount))
              : formatPrice(price.amount)}
          </p>
        </div>

        <StorageSelector
          legend={copy.detail.storageLegend}
          options={product.storageOptions}
          selected={selection.storage}
          onSelect={(storage) => choose({ storage })}
        />
        <ColorSelector
          legend={copy.detail.colorLegend}
          options={product.colorOptions}
          selected={selection.color}
          onSelect={(chosen) => choose({ color: chosen })}
        />

        <div className={styles.add}>
          {/* aria-disabled keeps the button focusable, so its hint can be read. */}
          <button
            type="button"
            className={styles.addButton}
            aria-disabled={line === null}
            aria-describedby={hint === null ? undefined : hintId}
            onClick={handleAdd}
            lang="es"
          >
            {copy.detail.addToCart}
          </button>
          {hint !== null && (
            <p id={hintId} className={styles.hint}>
              {hint}
            </p>
          )}
          <p className={styles.confirmation} role="status">
            {confirmation}
          </p>
        </div>
      </div>
    </div>
  );
}
