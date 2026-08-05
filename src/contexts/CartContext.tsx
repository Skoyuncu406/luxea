"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  productId: string;
  color: string;
  quantity: number;
};

type AddToCartInput = {
  productId: string;
  color: string;
  quantity: number;
  stock: number;
};

type CartContextValue = {
  cartItems: CartItem[];
  cartCount: number;
  isLoaded: boolean;
  addToCart: (input: AddToCartInput) => void;
  removeFromCart: (itemId: string) => void;
  increaseQuantity: (itemId: string, stock: number) => void;
  decreaseQuantity: (itemId: string) => void;
  setItemQuantity: (
    itemId: string,
    quantity: number,
    stock: number
  ) => void;
  clearCart: () => void;
};

type CartProviderProps = {
  children: ReactNode;
};

const CART_STORAGE_KEY = "luxea-cart";

const CartContext = createContext<CartContextValue | null>(null);

function createCartItemId(productId: string, color: string) {
  return `${productId}::${color}`;
}

export function CartProvider({
  children,
}: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedCart = window.localStorage.getItem(
        CART_STORAGE_KEY
      );

      if (!storedCart) {
        return;
      }

      const parsedCart: unknown = JSON.parse(storedCart);

      if (!Array.isArray(parsedCart)) {
        return;
      }

      const validItems = parsedCart.filter(
        (item): item is CartItem => {
          if (
            typeof item !== "object" ||
            item === null
          ) {
            return false;
          }

          const currentItem = item as Partial<CartItem>;

          return (
            typeof currentItem.id === "string" &&
            typeof currentItem.productId === "string" &&
            typeof currentItem.color === "string" &&
            typeof currentItem.quantity === "number" &&
            Number.isInteger(currentItem.quantity) &&
            currentItem.quantity > 0
          );
        }
      );

      setCartItems(validItems);
    } catch {
      setCartItems([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch {
      // localStorage kullanılamazsa uygulama çalışmaya devam eder.
    }
  }, [cartItems, isLoaded]);

  const addToCart = useCallback(
    ({
      productId,
      color,
      quantity,
      stock,
    }: AddToCartInput) => {
      if (
        !productId ||
        !color ||
        quantity <= 0 ||
        stock <= 0
      ) {
        return;
      }

      const itemId = createCartItemId(productId, color);

      setCartItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.id === itemId
        );

        if (!existingItem) {
          return [
            ...currentItems,
            {
              id: itemId,
              productId,
              color,
              quantity: Math.min(quantity, stock),
            },
          ];
        }

        return currentItems.map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          return {
            ...item,
            quantity: Math.min(
              item.quantity + quantity,
              stock
            ),
          };
        });
      });
    },
    []
  );

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
  }, []);

  const increaseQuantity = useCallback(
    (itemId: string, stock: number) => {
      setCartItems((currentItems) =>
        currentItems.map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          return {
            ...item,
            quantity: Math.min(item.quantity + 1, stock),
          };
        })
      );
    },
    []
  );

  const decreaseQuantity = useCallback(
    (itemId: string) => {
      setCartItems((currentItems) =>
        currentItems
          .map((item) => {
            if (item.id !== itemId) {
              return item;
            }

            return {
              ...item,
              quantity: item.quantity - 1,
            };
          })
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const setItemQuantity = useCallback(
    (
      itemId: string,
      quantity: number,
      stock: number
    ) => {
      if (quantity <= 0) {
        setCartItems((currentItems) =>
          currentItems.filter(
            (item) => item.id !== itemId
          )
        );

        return;
      }

      setCartItems((currentItems) =>
        currentItems.map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          return {
            ...item,
            quantity: Math.min(quantity, stock),
          };
        })
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [cartItems]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cartItems,
      cartCount,
      isLoaded,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      setItemQuantity,
      clearCart,
    }),
    [
      cartItems,
      cartCount,
      isLoaded,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      setItemQuantity,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart, CartProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
}