import type { CartStorage } from '../src/application/ports/cart-storage';
import { type Cart, EMPTY_CART } from '../src/domain/cart';

/** Cart storage for tests and for rendering where no browser storage exists. */
export class InMemoryCartStorage implements CartStorage {
  saved: Cart;

  constructor(initial: Cart = EMPTY_CART) {
    this.saved = initial;
  }

  load(): Cart {
    return this.saved;
  }

  save(cart: Cart): void {
    this.saved = cart;
  }
}
