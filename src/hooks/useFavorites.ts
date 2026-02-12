import { useState, useCallback } from "react";

const STORAGE_KEY = "sulista-favorites";

export interface FavoriteCity {
  state: string;
  city: string;
}

function loadFavorites(): FavoriteCity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs: FavoriteCity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteCity[]>(loadFavorites);

  const isFavorite = useCallback(
    (state: string, city: string) =>
      favorites.some(f => f.state === state && f.city === city),
    [favorites]
  );

  const toggleFavorite = useCallback((state: string, city: string) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.state === state && f.city === city);
      const next = exists
        ? prev.filter(f => !(f.state === state && f.city === city))
        : [...prev, { state, city }];
      saveFavorites(next);
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
