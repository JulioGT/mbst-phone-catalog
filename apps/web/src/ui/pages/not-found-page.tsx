import { Link } from 'react-router';
import { copy } from '../../copy';
import { PageHeading } from '../components/page-heading/page-heading';
import styles from './not-found-page.module.css';

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <title>{copy.documentTitle.notFound}</title>
      <PageHeading>{copy.notFound.heading}</PageHeading>
      <p>{copy.notFound.message}</p>
      <Link to="/">{copy.notFound.backLink}</Link>
    </div>
  );
}
