import type { ProductDetailDto, ProductSummaryDto } from '@mbst/contracts';
import type { ProductDetailResult } from '../../application/get-product-detail';
import type { ProductSummary } from '../../domain/product';

export function toProductSummaryDto(product: ProductSummary): ProductSummaryDto {
  return {
    id: product.id,
    brand: product.brand,
    name: product.name,
    basePriceInCents: product.basePrice,
    imageUrl: product.imageUrl,
  };
}

export function toProductDetailDto(product: ProductDetailResult): ProductDetailDto {
  const dto: ProductDetailDto = {
    id: product.id,
    brand: product.brand,
    name: product.name,
    description: product.description,
    basePriceInCents: product.basePrice,
    specs: { ...product.specs },
    colorOptions: product.colorOptions.map((color) => ({ ...color })),
    storageOptions: product.storageOptions.map((storage) => ({
      capacity: storage.capacity,
      priceInCents: storage.price,
    })),
  };
  if (product.similarProducts !== undefined) {
    dto.similarProducts = product.similarProducts.map(toProductSummaryDto);
  }
  return dto;
}
