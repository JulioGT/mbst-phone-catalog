import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { copy } from '../copy';
import styles from './app-layout.module.css';
import { Header } from './components/header/header';

/**
 * Moves focus to the new page's h1 after a client-side navigation, so keyboard
 * and screen-reader users notice the page changed. Not on the first load (the
 * browser handles that) and not when only the query string changes (search).
 */
function useFocusHeadingOnNavigation(): void {
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Comparing paths (not "is this the first render?") stays correct when StrictMode re-runs effects.
    if (previousPathname.current === pathname) {
      return;
    }
    previousPathname.current = pathname;
    document.querySelector<HTMLElement>('main h1')?.focus();
  }, [pathname]);
}

export function AppLayout() {
  useFocusHeadingOnNavigation();

  return (
    <>
      <a href="#main" className={styles.skipLink}>
        {copy.skipToContent}
      </a>
      <Header />
      <main id="main" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}
