import { copy } from '../../copy';
import { PageHeading } from '../components/page-heading/page-heading';

/** Product data, selectors and similar products arrive in chunk 6. */
export function ProductDetailPage() {
  return (
    <>
      <title>{copy.documentTitle.detail}</title>
      <PageHeading>{copy.detail.heading}</PageHeading>
    </>
  );
}
