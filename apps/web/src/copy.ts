/**
 * Every user-facing string. Figma text is copied verbatim, including its mix of
 * English and Spanish. Strings we added (not in the designs) are listed under
 * "Copy we add" in docs/product-language.md.
 */
export const copy = {
  appName: 'MBST',
  skipToContent: 'Skip to content',
  header: {
    homeLink: 'MBST, home',
    cartLink: (count: number) => `Cart, ${count} ${count === 1 ? 'phone' : 'phones'}`,
    navigation: 'Main',
  },
  documentTitle: {
    list: 'Phones | MBST',
    detail: 'Phone | MBST',
    cart: (count: number) => `Cart (${count}) | MBST`,
    notFound: 'Page not found | MBST',
  },
  list: {
    heading: 'MBST phones',
  },
  detail: {
    heading: 'Phone',
  },
  cart: {
    heading: (count: number) => `CART (${count})`,
  },
  notFound: {
    heading: 'Page not found',
    message: 'The page you are looking for does not exist.',
    backLink: 'Back to all phones',
  },
} as const;
