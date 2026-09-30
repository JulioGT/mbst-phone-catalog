import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { useCart } from "../../application/cart/cart-context";
import { copy } from "../../copy";
import type { CartLine as CartLineModel } from "../../domain/cart";
import { CartLine } from "../components/cart-line/cart-line";
import { PageHeading } from "../components/page-heading/page-heading";
import { formatPrice } from "../format-price";
import styles from "./cart-page.module.css";

type FocusTarget = { readonly lineId: string } | "continue" | null;

export function CartPage() {
  const { lines, count, total, isLoaded, remove } = useCart();
  const [announcement, setAnnouncement] = useState("");
  const payNoteId = useId();

  const removeButtons = useRef(new Map<string, HTMLButtonElement>());
  const continueLink = useRef<HTMLAnchorElement>(null);
  const focusAfterRemove = useRef<FocusTarget>(null);

  useEffect(() => {
    const target = focusAfterRemove.current;
    if (target === null) {
      return;
    }
    focusAfterRemove.current = null;
    if (target === "continue") {
      continueLink.current?.focus();
    } else {
      removeButtons.current.get(target.lineId)?.focus();
    }
  });

  function handleRemove(line: CartLineModel) {
    const index = lines.findIndex(
      (candidate) => candidate.lineId === line.lineId,
    );
    const neighbour = lines[index + 1] ?? lines[index - 1];
    focusAfterRemove.current =
      neighbour === undefined ? "continue" : { lineId: neighbour.lineId };
    remove(line.lineId);
    setAnnouncement(copy.cart.removed(line.name, line.storage, line.colorName));
  }

  return (
    <div className={styles.page}>
      <title>{copy.documentTitle.cart(count)}</title>

      <div className={styles.content}>
        <PageHeading className={styles.heading}>
          {copy.cart.heading(count)}
        </PageHeading>

        {isLoaded && lines.length === 0 && (
          <p className={styles.empty}>{copy.cart.empty}</p>
        )}

        {lines.length > 0 && (
          <ul className={styles.lines}>
            {lines.map((line) => (
              <li key={line.lineId}>
                <CartLine
                  line={line}
                  onRemove={handleRemove}
                  removeButtonRef={(button) => {
                    if (button === null) {
                      removeButtons.current.delete(line.lineId);
                    } else {
                      removeButtons.current.set(line.lineId, button);
                    }
                  }}
                />
              </li>
            ))}
          </ul>
        )}

        <p role="status" className="visually-hidden">
          {announcement}
        </p>
      </div>

      <div className={styles.footer}>
        {lines.length > 0 && (
          <p className={styles.total}>
            <span>{copy.cart.total}</span>
            <span>{formatPrice(total)}</span>
          </p>
        )}
        <Link ref={continueLink} to="/" className={styles.continue}>
          {copy.cart.continueShopping}
        </Link>
        {lines.length > 0 && (
          <div className={styles.payBox}>
            <button
              type="button"
              className={styles.pay}
              aria-disabled="true"
              aria-describedby={payNoteId}
            >
              {copy.cart.pay}
            </button>
            <p id={payNoteId} className={styles.payNote}>
              {copy.cart.payUnavailable}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
