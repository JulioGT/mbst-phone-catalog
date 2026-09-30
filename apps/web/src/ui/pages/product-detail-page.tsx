import { useParams } from 'react-router';
import { useProductDetail } from '../../application/catalog/use-product-detail';
import { copy } from '../../copy';
import { BackLink } from '../components/back-link/back-link';
import { PageHeading } from '../components/page-heading/page-heading';
import { ProductPurchase } from '../components/product-purchase/product-purchase';
import { SimilarProducts } from '../components/similar-products/similar-products';
import { SpecificationsTable } from '../components/specifications-table/specifications-table';
import styles from './product-detail-page.module.css';

export function ProductDetailPage() {
  const { productId = '' } = useParams();
  const detail = useProductDetail(productId);

  return (
    <div className={styles.page}>
      <BackLink />

      {detail.status === 'loading' && (
        <>
          <title>{copy.documentTitle.loading}</title>
          <div
            className={styles.skeleton}
            aria-hidden="true"
            data-testid="product-detail-skeleton"
          />
          <p role="status" className="visually-hidden">
            {copy.detail.loading}
          </p>
        </>
      )}

      {detail.status === 'not-found' && (
        <div className={styles.message}>
          <title>{copy.documentTitle.notFound}</title>
          <PageHeading>{copy.detail.notFoundHeading}</PageHeading>
          <p>{copy.detail.notFoundMessage}</p>
        </div>
      )}

      {detail.status === 'error' && (
        <div className={styles.message} role="alert">
          <title>{copy.documentTitle.loading}</title>
          <p>{copy.detail.error}</p>
          <button type="button" className={styles.retry} onClick={detail.retry}>
            {copy.detail.retry}
          </button>
        </div>
      )}

      {detail.status === 'success' && (
        <>
          <title>{copy.detail.documentTitle(detail.product.brand, detail.product.name)}</title>
          <ProductPurchase key={detail.product.id} product={detail.product} />
          <SpecificationsTable product={detail.product} />
          {detail.product.similarProducts !== undefined &&
            detail.product.similarProducts.length > 0 && (
              <SimilarProducts products={detail.product.similarProducts} />
            )}
        </>
      )}
    </div>
  );
}
