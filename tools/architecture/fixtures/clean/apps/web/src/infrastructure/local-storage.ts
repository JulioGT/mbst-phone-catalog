import type { CartStorage } from '../application/use-cart';
export const localStorageCart: CartStorage = { load: () => ({ lines: [] }) };
