import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import { CART_STORAGE_KEY, MAX_CART_QUANTITY, normalizeCart } from "@/lib/cart";

const CartContext = createContext(null);
const CART_CHANGE_EVENT = "fanhub-cart-change";

function subscribeToCart(onStoreChange) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CART_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CART_CHANGE_EVENT, onStoreChange);
  };
}

function getCartSnapshot() {
  return window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]";
}

function parseSnapshot(snapshot) {
  try {
    return normalizeCart(JSON.parse(snapshot));
  } catch {
    return [];
  }
}

function writeCart(lines) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

function updateCart(update) {
  writeCart(update(parseSnapshot(getCartSnapshot())));
}

const subscribeToHydration = () => () => undefined;
const getHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

export function CartProvider({ children }) {
  const snapshot = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    () => "[]",
  );
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );
  const lines = useMemo(() => parseSnapshot(snapshot), [snapshot]);

  const value = useMemo(
    () => ({
      lines,
      hydrated,
      itemCount: lines.reduce((total, line) => total + line.quantity, 0),
      addItem(product) {
        updateCart((current) => {
          const match = current.find((line) => line.id === product.id);
          if (!match) return [...current, { ...product, quantity: 1 }];
          return current.map((line) =>
            line.id === product.id
              ? {
                  ...line,
                  quantity: Math.min(MAX_CART_QUANTITY, line.quantity + 1),
                }
              : line,
          );
        });
      },
      removeItem(id) {
        updateCart((current) => current.filter((line) => line.id !== id));
      },
      setQuantity(id, quantity) {
        const nextQuantity = Math.min(
          MAX_CART_QUANTITY,
          Math.max(1, Math.round(quantity)),
        );
        updateCart((current) =>
          current.map((line) =>
            line.id === id ? { ...line, quantity: nextQuantity } : line,
          ),
        );
      },
      clearCart() {
        writeCart([]);
      },
    }),
    [hydrated, lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider");
  return cart;
}
