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

import { useUser } from "@/contexts/UserContext";

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

  addToCart: (
    input: AddToCartInput
  ) => void;

  removeFromCart: (
    itemId: string
  ) => void;

  increaseQuantity: (
    itemId: string,
    stock: number
  ) => void;

  decreaseQuantity: (
    itemId: string
  ) => void;

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

const LEGACY_STORAGE_KEY =
  "luxea-cart";

const GUEST_STORAGE_KEY =
  "luxea-cart:guest";

const CartContext =
  createContext<CartContextValue | null>(
    null
  );

function createCartItemId(
  productId: string,
  color: string
) {
  return `${productId}::${color}`;
}

function isValidCartItem(
  item: unknown
): item is CartItem {
  if (
    typeof item !== "object" ||
    item === null
  ) {
    return false;
  }

  const currentItem =
    item as Partial<CartItem>;

  return (
    typeof currentItem.id ===
      "string" &&
    typeof currentItem.productId ===
      "string" &&
    typeof currentItem.color ===
      "string" &&
    typeof currentItem.quantity ===
      "number" &&
    Number.isInteger(
      currentItem.quantity
    ) &&
    currentItem.quantity > 0
  );
}

function readStoredCart(
  storageKey: string
): CartItem[] {
  try {
    const stored =
      window.localStorage.getItem(
        storageKey
      );

    if (!stored) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      isValidCartItem
    );
  } catch {
    return [];
  }
}

export function CartProvider({
  children,
}: CartProviderProps) {
  const {
    user,
    isLoaded: isUserLoaded,
  } = useUser();

  const storageKey =
    user?.id
      ? `luxea-cart:user:${user.id}`
      : GUEST_STORAGE_KEY;

  const [
    cartItems,
    setCartItems,
  ] = useState<CartItem[]>([]);

  const [
    isLoaded,
    setIsLoaded,
  ] = useState(false);

  const [
    loadedStorageKey,
    setLoadedStorageKey,
  ] = useState<string | null>(
    null
  );

  /*
   * =============================================================
   * STORAGE DEĞİŞİMİ
   * =============================================================
   *
   * Kullanıcı:
   *
   * guest -> login
   * login -> logout
   * user A -> user B
   *
   * durumlarında ilgili sepet yüklenir.
   */

  useEffect(() => {
    if (!isUserLoaded) {
      return;
    }

    /*
     * Eski ortak storage yapısını temizliyoruz.
     *
     * Böylece daha önce misafir/kullanıcı
     * arasında karışmış eski veriler tekrar
     * yüklenmez.
     */
    try {
      window.localStorage.removeItem(
        LEGACY_STORAGE_KEY
      );
    } catch {
      // Storage kullanılamıyorsa devam et.
    }

    const storedItems =
      readStoredCart(
        storageKey
      );

    setCartItems(
      storedItems
    );

    setLoadedStorageKey(
      storageKey
    );

    setIsLoaded(true);
  }, [
    isUserLoaded,
    storageKey,
  ]);

  /*
   * =============================================================
   * STORAGE'A KAYDET
   * =============================================================
   */

  useEffect(() => {
    if (
      !isUserLoaded ||
      !isLoaded ||
      loadedStorageKey !==
        storageKey
    ) {
      return;
    }

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(
          cartItems
        )
      );
    } catch {
      // localStorage erişilemezse
      // uygulama çalışmaya devam eder.
    }
  }, [
    cartItems,
    isLoaded,
    isUserLoaded,
    loadedStorageKey,
    storageKey,
  ]);

  /*
   * =============================================================
   * ADD TO CART
   * =============================================================
   */

  const addToCart =
    useCallback(
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

        const itemId =
          createCartItemId(
            productId,
            color
          );

        setCartItems(
          (currentItems) => {
            const existingItem =
              currentItems.find(
                (item) =>
                  item.id ===
                  itemId
              );

            if (
              !existingItem
            ) {
              return [
                ...currentItems,
                {
                  id: itemId,
                  productId,
                  color,

                  quantity:
                    Math.min(
                      quantity,
                      stock
                    ),
                },
              ];
            }

            return currentItems.map(
              (item) => {
                if (
                  item.id !==
                  itemId
                ) {
                  return item;
                }

                return {
                  ...item,

                  quantity:
                    Math.min(
                      item.quantity +
                        quantity,

                      stock
                    ),
                };
              }
            );
          }
        );
      },
      []
    );

  /*
   * =============================================================
   * REMOVE
   * =============================================================
   */

  const removeFromCart =
    useCallback(
      (
        itemId: string
      ) => {
        setCartItems(
          (currentItems) =>
            currentItems.filter(
              (item) =>
                item.id !==
                itemId
            )
        );
      },
      []
    );

  /*
   * =============================================================
   * INCREASE
   * =============================================================
   */

  const increaseQuantity =
    useCallback(
      (
        itemId: string,
        stock: number
      ) => {
        setCartItems(
          (currentItems) =>
            currentItems.map(
              (item) => {
                if (
                  item.id !==
                  itemId
                ) {
                  return item;
                }

                return {
                  ...item,

                  quantity:
                    Math.min(
                      item.quantity +
                        1,

                      stock
                    ),
                };
              }
            )
        );
      },
      []
    );

  /*
   * =============================================================
   * DECREASE
   * =============================================================
   */

  const decreaseQuantity =
    useCallback(
      (
        itemId: string
      ) => {
        setCartItems(
          (currentItems) =>
            currentItems
              .map(
                (item) => {
                  if (
                    item.id !==
                    itemId
                  ) {
                    return item;
                  }

                  return {
                    ...item,

                    quantity:
                      item.quantity -
                      1,
                  };
                }
              )
              .filter(
                (item) =>
                  item.quantity >
                  0
              )
        );
      },
      []
    );

  /*
   * =============================================================
   * SET QUANTITY
   * =============================================================
   */

  const setItemQuantity =
    useCallback(
      (
        itemId: string,
        quantity: number,
        stock: number
      ) => {
        if (
          quantity <= 0
        ) {
          setCartItems(
            (
              currentItems
            ) =>
              currentItems.filter(
                (item) =>
                  item.id !==
                  itemId
              )
          );

          return;
        }

        setCartItems(
          (currentItems) =>
            currentItems.map(
              (item) => {
                if (
                  item.id !==
                  itemId
                ) {
                  return item;
                }

                return {
                  ...item,

                  quantity:
                    Math.min(
                      quantity,
                      stock
                    ),
                };
              }
            )
        );
      },
      []
    );

  /*
   * =============================================================
   * CLEAR
   * =============================================================
   */

  const clearCart =
    useCallback(() => {
      setCartItems([]);
    }, []);

  /*
   * =============================================================
   * COUNT
   * =============================================================
   */

  const cartCount =
    useMemo(
      () =>
        cartItems.reduce(
          (
            total,
            item
          ) =>
            total +
            item.quantity,

          0
        ),

      [cartItems]
    );

  /*
   * =============================================================
   * CONTEXT VALUE
   * =============================================================
   */

  const value =
    useMemo<CartContextValue>(
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
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(
      CartContext
    );

  if (!context) {
    throw new Error(
      "useCart, CartProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
}