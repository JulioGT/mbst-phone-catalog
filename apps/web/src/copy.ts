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
    loading: 'Loading | MBST',
    cart: (count: number) => `Cart (${count}) | MBST`,
    notFound: 'Page not found | MBST',
  },
  list: {
    heading: 'MBST phones',
    searchLabel: 'Search for a smartphone',
    searchPlaceholder: 'Search for a smartphone...',
    clearSearch: 'Clear search',
    resultCount: (count: number) => `${count} ${count === 1 ? 'RESULT' : 'RESULTS'}`,
    loading: 'Loading phones',
    noResults: (searchTerm: string) => `No phones match "${searchTerm}".`,
    noResultsHint: 'Try a brand such as Samsung, or part of a model name.',
    error: 'We could not load the phones.',
    retry: 'Try again',
    productImage: (brand: string, name: string) => `${brand} ${name}`,
  },
  price: {
    amount: (formatted: string) => `${formatted} EUR`,
  },
  detail: {
    back: 'BACK',
    documentTitle: (brand: string, name: string) => `${brand} ${name} | MBST`,
    startingPrice: (price: string) => `From ${price}`,
    storageLegend: 'STORAGE ¿HOW MUCH SPACE DO YOU NEED?',
    colorLegend: 'COLOR. PICK YOUR FAVOURITE.',
    addToCart: 'AÑADIR',
    missing: {
      storage: 'Choose a storage to add this phone.',
      color: 'Choose a color to add this phone.',
      both: 'Choose a storage and a color to add this phone.',
    },
    added: (name: string, storage: string, color: string) =>
      `Added to your cart: ${name}, ${storage}, ${color}.`,
    image: (brand: string, name: string, color: string) => `${brand} ${name}, ${color}`,
    specificationsHeading: 'SPECIFICATIONS',
    specificationLabels: {
      brand: 'BRAND',
      name: 'NAME',
      description: 'DESCRIPTION',
      screen: 'SCREEN',
      resolution: 'RESOLUTION',
      processor: 'PROCESSOR',
      mainCamera: 'MAIN CAMERA',
      selfieCamera: 'SELFIE CAMERA',
      battery: 'BATTERY',
      os: 'OS',
      screenRefreshRate: 'SCREEN REFRESH RATE',
    },
    notAvailable: 'Not available',
    similarHeading: 'SIMILAR ITEMS',
    loading: 'Loading phone',
    error: 'We could not load this phone.',
    retry: 'Try again',
    notFoundHeading: 'Product not found',
    notFoundMessage: 'This phone is not in our catalog.',
    notFoundBack: 'Back to all phones',
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
