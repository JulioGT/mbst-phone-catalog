import { type ReactNode, useEffect, useRef } from 'react';
import { usePendingHeadingFocus } from '../../heading-focus';

export interface PageHeadingProps {
  readonly children: ReactNode;
  /** For pages whose visible design has no title (the list); screen readers still get one. */
  readonly visuallyHidden?: boolean;
  readonly className?: string | undefined;
}

/**
 * The page's single h1. It can take focus (tabIndex -1) so that, after a
 * client-side navigation, focus lands on it and screen readers announce the
 * new page (see AppLayout).
 */
export function PageHeading({ children, visuallyHidden = false, className }: PageHeadingProps) {
  const classes = [visuallyHidden ? 'visually-hidden' : undefined, className].filter(Boolean);
  const pendingFocus = usePendingHeadingFocus();
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (pendingFocus?.current) {
      pendingFocus.current = false;
      ref.current?.focus();
    }
  }, [pendingFocus]);

  return (
    <h1 ref={ref} tabIndex={-1} className={classes.length > 0 ? classes.join(' ') : undefined}>
      {children}
    </h1>
  );
}
