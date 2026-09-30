import type { ReactNode } from 'react';

export interface PageHeadingProps {
  readonly children: ReactNode;
  /** For pages whose visible design has no title (the list); screen readers still get one. */
  readonly visuallyHidden?: boolean;
  readonly className?: string;
}

/**
 * The page's single h1. It can take focus (tabIndex -1) so that, after a
 * client-side navigation, focus lands on it and screen readers announce the
 * new page (see AppLayout).
 */
export function PageHeading({ children, visuallyHidden = false, className }: PageHeadingProps) {
  const classes = [visuallyHidden ? 'visually-hidden' : undefined, className].filter(Boolean);
  return (
    <h1 tabIndex={-1} className={classes.length > 0 ? classes.join(' ') : undefined}>
      {children}
    </h1>
  );
}
