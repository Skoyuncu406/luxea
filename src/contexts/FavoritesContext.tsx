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

type FavoritesContextValue = {
  favoriteIds: string[];
  favoriteCount: number;
  isLoaded: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
};

type FavoritesProviderProps = {
  children: ReactNode;
};

const FAVORITES_STORAGE_KEY = "luxea-favorites";

const FavoritesContext =
  createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({
  children,
}: FavoritesProviderProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedFavorites = window.localStorage.getItem(
        FAVORITES_STORAGE_KEY
      );

      if (!storedFavorites) {
        return;
      }

      const parsedFavorites: unknown =
        JSON.parse(storedFavorites);

      if (
        Array.isArray(parsedFavorites) &&
        parsedFavorites.every(
          (item): item is string =>
            typeof item === "string"
        )
      ) {
        setFavoriteIds([...new Set(parsedFavorites)]);
      }
    } catch {
      setFavoriteIds([]);
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
        FAVORITES_STORAGE_KEY,
        JSON.stringify(favoriteIds)
      );
    } catch {
      // localStorage erişilemezse uygulama çalışmaya devam eder.
    }
  }, [favoriteIds, isLoaded]);

  const isFavorite = useCallback(
    (productId: string) =>
      favoriteIds.includes(productId),
    [favoriteIds]
  );

  const addFavorite = useCallback(
    (productId: string) => {
      setFavoriteIds((currentIds) => {
        if (currentIds.includes(productId)) {
          return currentIds;
        }

        return [...currentIds, productId];
      });
    },
    []
  );

  const removeFavorite = useCallback(
    (productId: string) => {
      setFavoriteIds((currentIds) =>
        currentIds.filter(
          (currentId) => currentId !== productId
        )
      );
    },
    []
  );

  const toggleFavorite = useCallback(
    (productId: string) => {
      setFavoriteIds((currentIds) => {
        if (currentIds.includes(productId)) {
          return currentIds.filter(
            (currentId) => currentId !== productId
          );
        }

        return [...currentIds, productId];
      });
    },
    []
  );

  const clearFavorites = useCallback(() => {
    setFavoriteIds([]);
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      favoriteCount: favoriteIds.length,
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
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error(
      "useFavorites, FavoritesProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
}