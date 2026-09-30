import type { Cart } from '../../domain/cart';

/**
 * Where the cart survives reloads. `load` never throws: missing, corrupt or
 * unreadable data is an empty cart. `save` never throws either: if storage is
 * unavailable the cart simply lives in memory for this visit.
 */
export interface CartStorage {
  load(): Cart;
  save(cart: Cart): void;
}
