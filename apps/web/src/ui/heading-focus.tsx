import { createContext, type RefObject, useContext } from 'react';

/**
 * Set to true by AppLayout after a client-side navigation when the new page's
 * h1 is not there yet (the page is still loading). The h1 takes focus when it
 * mounts and sets it back to false.
 */
export const HeadingFocusContext = createContext<RefObject<boolean> | null>(null);

export function usePendingHeadingFocus(): RefObject<boolean> | null {
  return useContext(HeadingFocusContext);
}
