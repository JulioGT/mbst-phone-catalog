import type { Ref } from "react";
import { copy } from "../../../copy";
import type { CartLine as CartLineModel } from "../../../domain/cart";
import { formatPrice } from "../../format-price";
import styles from "./cart-line.module.css";

export interface CartLineProps {
  readonly line: CartLineModel;
  readonly onRemove: (line: CartLineModel) => void;
  readonly removeButtonRef?: Ref<HTMLButtonElement>;
}

export function CartLine({ line, onRemove, removeButtonRef }: CartLineProps) {
  return (
    <article className={styles.line}>
      <img
        className={styles.image}
        src={line.imageUrl}
        alt={copy.cart.image(line.brand, line.name, line.colorName)}
        width={262}
        height={324}
      />
      <div className={styles.details}>
        <div className={styles.text}>
          <h2 className={styles.name}>{line.name}</h2>
          <p>{copy.cart.lineSpecs(line.storage, line.colorName)}</p>
          <p className={styles.price}>{formatPrice(line.unitPrice)}</p>
        </div>
        <button
          ref={removeButtonRef}
          type="button"
          className={styles.remove}
          aria-label={copy.cart.removeLabel(
            line.name,
            line.storage,
            line.colorName,
          )}
          onClick={() => onRemove(line)}
        >
          {copy.cart.remove}
        </button>
      </div>
    </article>
  );
}
