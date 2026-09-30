import { useCart } from '../application/use-cart';
import type { Cart } from '../domain/cart';
export const CartPage = (): Cart => useCart({ load: () => ({ lines: [] }) });
