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

type FavoritesContextValue = {
  favoriteIds: string[];
  favoriteCount: number;
  isLoaded: boolean;

  isFavorite: (
    productId: string
  ) => boolean;

  toggleFavorite: (
    productId: string
  ) => void;

  addFavorite: (
    productId: string
  ) => void;

  removeFavorite: (
    productId: string
  ) => void;

  clearFavorites:
    () => void;
};

type FavoritesProviderProps = {
  children: ReactNode;
};

const LEGACY_STORAGE_KEY =
  "luxea-favorites";

const GUEST_STORAGE_KEY =
  "luxea-favorites:guest";

const FavoritesContext =
  createContext<FavoritesContextValue | null>(
    null
  );

function readStoredFavorites(
  storageKey: string
): string[] {
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

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    const validIds =
      parsed.filter(
        (
          item
        ): item is string =>
          typeof item ===
          "string"
      );

    return [
      ...new Set(
        validIds
      ),
    ];
  } catch {
    return [];
  }
}

export function FavoritesProvider({
  children,
}: FavoritesProviderProps) {
  const {
    user,
    isLoaded: isUserLoaded,
  } = useUser();

  const storageKey =
    user?.id
      ? `luxea-favorites:user:${user.id}`
      : GUEST_STORAGE_KEY;

  const [
    favoriteIds,
    setFavoriteIds,
  ] = useState<string[]>([]);

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
   * USER / GUEST FAVORİLERİNİ YÜKLE
   * =============================================================
   */

  useEffect(() => {
    if (!isUserLoaded) {
      return;
    }

    /*
     * Eski ortak storage artık kullanılmıyor.
     */
    try {
      window.localStorage.removeItem(
        LEGACY_STORAGE_KEY
      );
    } catch {
      // devam
    }

    const storedFavorites =
      readStoredFavorites(
        storageKey
      );

    setFavoriteIds(
      storedFavorites
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
   * FAVORİLERİ KAYDET
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
          favoriteIds
        )
      );
    } catch {
      // Storage kullanılamazsa devam.
    }
  }, [
    favoriteIds,
    isLoaded,
    isUserLoaded,
    loadedStorageKey,
    storageKey,
  ]);

  /*
   * =============================================================
   * IS FAVORITE
   * =============================================================
   */

  const isFavorite =
    useCallback(
      (
        productId: string
      ) =>
        favoriteIds.includes(
          productId
        ),

      [favoriteIds]
    );

  /*
   * =============================================================
   * ADD
   * =============================================================
   */

  const addFavorite =
    useCallback(
      (
        productId: string
      ) => {
        setFavoriteIds(
          (currentIds) => {
            if (
              currentIds.includes(
                productId
              )
            ) {
              return currentIds;
            }

            return [
              ...currentIds,
              productId,
            ];
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

  const removeFavorite =
    useCallback(
      (
        productId: string
      ) => {
        setFavoriteIds(
          (currentIds) =>
            currentIds.filter(
              (
                currentId
              ) =>
                currentId !==
                productId
            )
        );
      },
      []
    );

  /*
   * =============================================================
   * TOGGLE
   * =============================================================
   */

  const toggleFavorite =
    useCallback(
      (
        productId: string
      ) => {
        setFavoriteIds(
          (currentIds) => {
            if (
              currentIds.includes(
                productId
              )
            ) {
              return currentIds.filter(
                (
                  currentId
                ) =>
                  currentId !==
                  productId
              );
            }

            return [
              ...currentIds,
              productId,
            ];
          }
        );
      },
      []
    );

  /*
   * =============================================================
   * CLEAR
   * =============================================================
   */

  const clearFavorites =
    useCallback(() => {
      setFavoriteIds([]);
    }, []);

  /*
   * =============================================================
   * CONTEXT VALUE
   * =============================================================
   */

  const value =
    useMemo<FavoritesContextValue>(
      () => ({
        favoriteIds,

        favoriteCount:
          favoriteIds.length,

        isLoaded,

        isFavorite,

        toggleFavorite,

        addFavorite,

        removeFavorite,

        clearFavorites,
      }),
      [
        favoriteIds,
        isLoaded,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        clearFavorites,
      ]
    );

  return (
    <FavoritesContext.Provider
      value={value}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context =
    useContext(
      FavoritesContext
    );

  if (!context) {
    throw new Error(
      "useFavorites, FavoritesProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
}