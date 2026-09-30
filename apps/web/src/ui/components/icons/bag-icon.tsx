export interface BagIconProps {
  /** Filled when the cart has lines, outline when it is empty (as in the designs). */
  readonly filled: boolean;
}

/** Decorative: the link around it carries the accessible name. */
export function BagIcon({ filled }: BagIconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M3.5 5.5h11l-1 11h-9z" fill={filled ? 'currentColor' : 'none'} />
      <path d="M6.5 7V4a2.5 2.5 0 0 1 5 0v3" />
    </svg>
  );
}
