import { createContext, type ReactNode, useContext } from 'react';
import type { CatalogGateway } from '../ports/catalog-gateway';

const CatalogGatewayContext = createContext<CatalogGateway | null>(null);

/** Makes the catalog adapter chosen in main.tsx available to the hooks. */
export function CatalogGatewayProvider({
  gateway,
  children,
}: {
  readonly gateway: CatalogGateway;
  readonly children: ReactNode;
}) {
  return (
    <CatalogGatewayContext.Provider value={gateway}>{children}</CatalogGatewayContext.Provider>
  );
}

export function useCatalogGateway(): CatalogGateway {
  const gateway = useContext(CatalogGatewayContext);
  if (gateway === null) {
    throw new Error('useCatalogGateway must be used inside <CatalogGatewayProvider>.');
  }
  return gateway;
}
