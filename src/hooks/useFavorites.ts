import { useState, useCallback } from "react";

const STORAGE_KEY = "vento-sul-favorites";

export interface FavoriteItem {
  state: string;
  city: string;
  subLocation?: string; // optional: beach or district name
  type?: "city" | "praia" | "bairro";
}

// Backward compat alias
export type FavoriteCity = FavoriteItem;

function loadFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs: FavoriteItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

function match(a: FavoriteItem, b: FavoriteItem) {
  return a.state === b.state && a.city === b.city && (a.subLocation || "") === (b.subLocation || "");
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(loadFavorites);

  const isFavorite = useCallback(
    (state: string, city: string, subLocation?: string) =>
      favorites.some(f => match(f, { state, city, subLocation })),
    [favorites]
  );

  const toggleFavorite = useCallback((state: string, city: string, subLocation?: string, type?: "city" | "praia" | "bairro") => {
    setFavorites(prev => {
      const item: FavoriteItem = { state, city, subLocation, type: type || "city" };
      const exists = prev.some(f => match(f, item));
      const next = exists
        ? prev.filter(f => !match(f, item))
        : [...prev, item];
      saveFavorites(next);
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
