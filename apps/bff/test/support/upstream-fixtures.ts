// Payloads in the remote API's own shape (docs/api-contract.md).

export function anUpstreamSummary(overrides: Record<string, unknown> = {}) {
  return {
    id: 'SMG-S24U',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    basePrice: 1329,
    imageUrl: 'http://catalog.test/images/SMG-S24U-titanium-violet.webp',
    ...overrides,
  };
}

export function anUpstreamDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: 'SMG-S24U',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    description: 'El Samsung Galaxy S24 Ultra.',
    basePrice: 1329,
    rating: 4.6,
    specs: {
      screen: '6.8" Dynamic AMOLED 2X',
      resolution: '3120 x 1440 pixels',
      processor: 'Snapdragon 8 Gen 3',
      mainCamera: '200 MP',
      selfieCamera: '12 MP',
      battery: '5000 mAh',
      os: 'Android 14',
      screenRefreshRate: '120 Hz',
    },
    colorOptions: [
      {
        name: 'Titanium Violet',
        hexCode: '#8E6F96',
        imageUrl: 'http://catalog.test/images/SMG-S24U-titanium-violet.webp',
      },
    ],
    storageOptions: [
      { capacity: '256 GB', price: 1229 },
      { capacity: '512 GB', price: 1329 },
    ],
    similarProducts: [anUpstreamSummary({ id: 'SMG-A15', name: 'Galaxy A15 LTE', basePrice: 159 })],
    ...overrides,
  };
}
