import { useSearchParams } from 'react-router';
import { useProductSearch } from '../../application/catalog/use-product-search';
import { copy } from '../../copy';
import { PageHeading } from '../components/page-heading/page-heading';
import { ProductGrid, ProductGridSkeleton } from '../components/product-grid/product-grid';
import { SearchBox } from '../components/search-box/search-box';
import styles from './product-list-page.module.css';

/** The search term lives in the URL (`/?q=samsung`), so Back/Forward and shared links keep it. */
export const SEARCH_PARAM = 'q';

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get(SEARCH_PARAM)?.trim() ?? '';
  const search = useProductSearch(searchTerm);

  function handleSearch(term: string) {
    // Replace, not push: every pause while typing is not a new history step.
    setSearchParams(term === '' ? {} : { [SEARCH_PARAM]: term }, { replace: true });
  }

  return (
    <div className={styles.page}>
      <title>{copy.documentTitle.list}</title>
      <PageHeading visuallyHidden>{copy.list.heading}</PageHeading>

      <SearchBox value={searchTerm} onSearch={handleSearch} />

      {/* Always rendered, so screen readers announce each new count. */}
      <p className={styles.status} role="status">
        {search.status === 'success' && copy.list.resultCount(search.products.length)}
        {search.status === 'loading' && (
          <span className="visually-hidden">{copy.list.loading}</span>
        )}
      </p>

      {search.status === 'loading' && <ProductGridSkeleton />}

      {search.status === 'error' && (
        <div className={styles.message} role="alert">
          <p>{copy.list.error}</p>
          <button type="button" className={styles.retry} onClick={search.retry}>
            {copy.list.retry}
          </button>
        </div>
      )}

      {search.status === 'success' && search.products.length === 0 && (
        <div className={styles.message}>
          <p>{copy.list.noResults(searchTerm)}</p>
          <p className={styles.hint}>{copy.list.noResultsHint}</p>
        </div>
      )}

      {search.status === 'success' && search.products.length > 0 && (
        <ProductGrid products={search.products} />
      )}
    </div>
  );
}
