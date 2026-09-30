import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import {
  addLine,
  type Cart,
  type CartLine,
  cartCount,
  cartTotal,
  EMPTY_CART,
  removeLine,
} from '../../domain/cart';
import type { Money } from '../../domain/money';
import type { CartStorage } from '../ports/cart-storage';

export type NewCartLine = Omit<CartLine, 'lineId'>;

export interface CartContextValue {
  readonly lines: Cart;
  readonly count: number;
  readonly total: Money;
  /** False until the stored cart has been read (after mount, so SSR and first render agree). */
  readonly isLoaded: boolean;
  add(line: NewCartLine): void;
  remove(lineId: string): void;
}

type State = { readonly isLoaded: boolean; readonly cart: Cart };
type Action =
  | { readonly type: 'loaded'; readonly cart: Cart }
  | { readonly type: 'added'; readonly line: CartLine }
  | { readonly type: 'removed'; readonly lineId: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loaded':
      /**
       * Load once (StrictMode runs effects twice in development). Lines added
       * before loading finished are kept after the stored ones.
       */
      return state.isLoaded ? state : { isLoaded: true, cart: [...action.cart, ...state.cart] };
    case 'added':
      return { ...state, cart: addLine(state.cart, action.line) };
    case 'removed':
      return { ...state, cart: removeLine(state.cart, action.lineId) };
  }
}

function randomLineId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
}

const CartContext = createContext<CartContextValue | null>(null);

export interface CartProviderProps {
  readonly storage: CartStorage;
  readonly createLineId?: () => string;
  readonly children: ReactNode;
}

export function CartProvider({
  storage,
  createLineId = randomLineId,
  children,
}: CartProviderProps) {
  const [state, dispatch] = useReducer(reducer, { isLoaded: false, cart: EMPTY_CART });

  useEffect(() => {
    dispatch({ type: 'loaded', cart: storage.load() });
  }, [storage]);

  useEffect(() => {
    // Never save before loading: it would overwrite the stored cart with an empty one.
    if (state.isLoaded) {
      storage.save(state.cart);
    }
  }, [state, storage]);

  const add = useCallback(
    (line: NewCartLine) => dispatch({ type: 'added', line: { ...line, lineId: createLineId() } }),
    [createLineId],
  );
  const remove = useCallback((lineId: string) => dispatch({ type: 'removed', lineId }), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.cart,
      count: cartCount(state.cart),
      total: cartTotal(state.cart),
      isLoaded: state.isLoaded,
      add,
      remove,
    }),
    [state, add, remove],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (value === null) {
    throw new Error('useCart must be used inside <CartProvider>.');
  }
  return value;
}
