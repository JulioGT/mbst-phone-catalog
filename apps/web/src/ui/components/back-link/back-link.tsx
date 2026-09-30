import type { MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { copy } from '../../../copy';
import styles from './back-link.module.css';

/**
 * Goes back in history when the shopper came from inside the site (so the
 * list keeps its search), otherwise to the list. It stays a real link to "/"
 * so it also works when opened in a new tab.
 */
export function BackLink() {
  const location = useLocation();
  const navigate = useNavigate();
  const cameFromThisSite = location.key !== 'default';

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (cameFromThisSite && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
      event.preventDefault();
      navigate(-1);
    }
  }

  return (
    <Link to="/" className={styles.back} onClick={handleClick}>
      <svg aria-hidden="true" focusable="false" width="8" height="8" viewBox="0 0 8 8">
        <path d="M5.5 1L2.5 4l3 3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      {copy.detail.back}
    </Link>
  );
}
