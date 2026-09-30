import { getProduct } from '../../application/get-product';
import type { Product } from '../../domain/product';
export const route = (id: string): Product => getProduct(id);
