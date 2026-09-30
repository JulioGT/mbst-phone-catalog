import { z } from 'zod';
import type { CartStorage } from '../application/ports/cart-storage';
import { type Cart, EMPTY_CART } from '../domain/cart';
import { moneyFromCents } from '../domain/money';

export const CART_STORAGE_KEY = 'mbst.cart';

/** Stored shape. `version` lets a future format migrate old carts instead of losing them. */
const storedCartSchema = z.object({
  version: z.literal(1),
  lines: z.array(
    z.object({
      lineId: z.string().min(1),
      productId: z.string().min(1),
      brand: z.string(),
      name: z.string(),
      imageUrl: z.string(),
      storage: z.string(),
      colorName: z.string(),
      unitPriceInCents: z.number().int().nonnegative(),
    }),
  ),
});
type StoredCart = z.infer<typeof storedCartSchema>;

/**
 * The cart in the browser's localStorage. Everything read back is validated:
 * data edited by hand, left by an older version or cut short must not crash
 * the app, so it is treated as an empty cart.
 */
export class LocalStorageCartStorage implements CartStorage {
  readonly #getStorage: () => Storage;

  /**
   * Takes a getter, not the Storage itself: merely reading `window.localStorage`
   * throws in some browsers when site data is blocked.
   */
  constructor(getStorage: () => Storage) {
    this.#getStorage = getStorage;
  }

  load(): Cart {
    try {
      const raw = this.#getStorage().getItem(CART_STORAGE_KEY);
      if (raw === null) {
        return EMPTY_CART;
      }
      const stored = storedCartSchema.safeParse(JSON.parse(raw));
      if (!stored.success) {
        return EMPTY_CART;
      }
      return stored.data.lines.map(({ unitPriceInCents, ...line }) => ({
        ...line,
        unitPrice: moneyFromCents(unitPriceInCents),
      }));
    } catch {
      // Unparseable JSON, or storage disabled (for example by privacy settings).
      return EMPTY_CART;
    }
  }

  save(cart: Cart): void {
    const stored: StoredCart = {
      version: 1,
      lines: cart.map(({ unitPrice, ...line }) => ({ ...line, unitPriceInCents: unitPrice })),
    };
    try {
      this.#getStorage().setItem(CART_STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // Quota exceeded or storage disabled: the cart still works for this visit.
    }
  }
}
