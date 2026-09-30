import type { Cart } from '../domain/cart';
export interface CartStorage { load(): Cart }
export const useCart = (storage: CartStorage): Cart => storage.load();
