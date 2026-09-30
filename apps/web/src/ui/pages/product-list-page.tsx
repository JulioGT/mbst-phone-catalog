import { copy } from '../../copy';
import { PageHeading } from '../components/page-heading/page-heading';

/** Search box, result count and grid arrive in chunk 5. */
export function ProductListPage() {
  return (
    <>
      <title>{copy.documentTitle.list}</title>
      <PageHeading visuallyHidden>{copy.list.heading}</PageHeading>
    </>
  );
}
