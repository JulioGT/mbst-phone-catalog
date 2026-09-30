import { useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { copy } from '../copy';
import styles from './app-layout.module.css';
import { Header } from './components/header/header';
import { HeadingFocusContext } from './heading-focus';

/**
 * Moves focus to the new page's h1 after a client-side navigation, so keyboard
 * and screen-reader users notice the page changed. Not on the first load (the
 * browser handles that) and not when only the query string changes (search).
 * A page that is still loading has no h1 yet: focus waits on <main>, and the
 * h1 takes it when it appears (PageHeading reads `pendingHeadingFocus`).
 */
function useFocusHeadingOnNavigation() {
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);
  const pendingHeadingFocus = useRef(false);

  useEffect(() => {
    // Comparing paths (not "is this the first render?") stays correct when StrictMode re-runs effects.
    if (previousPathname.current === pathname) {
      return;
    }
    previousPathname.current = pathname;
    const heading = document.querySelector<HTMLElement>('main h1');
    if (heading === null) {
      pendingHeadingFocus.current = true;
      document.querySelector<HTMLElement>('main')?.focus();
    } else {
      pendingHeadingFocus.current = false;
      heading.focus();
    }
  }, [pathname]);

  return pendingHeadingFocus;
}

export function AppLayout() {
  const pendingHeadingFocus = useFocusHeadingOnNavigation();

  return (
    <HeadingFocusContext.Provider value={pendingHeadingFocus}>
      <a href="#main" className={styles.skipLink}>
        {copy.skipToContent}
      </a>
      <Header />
      <main id="main" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      {/* New pages start at the top; Back returns to the previous scroll position. */}
      <ScrollRestoration />
    </HeadingFocusContext.Provider>
  );
}
