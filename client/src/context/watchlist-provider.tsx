"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "cobalt-stream-watchlist";

type WatchlistContextValue = {
  ids: Set<string>;
  toggle: (titleId: string) => void;
  add: (titleId: string) => void;
  remove: (titleId: string) => void;
  isInWatchlist: (titleId: string) => boolean;
  count: number;
};

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

function loadInitialIds(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      return new Set(parsed);
    }
  } catch {
    /* ignore */
  }
  return new Set();
}

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(() => loadInitialIds());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setIds(loadInitialIds());
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  }, [ids, hydrated]);

  const toggle = useCallback((titleId: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(titleId)) next.delete(titleId);
      else next.add(titleId);
      return next;
    });
  }, []);

  const add = useCallback((titleId: string) => {
    setIds((prev) => new Set(prev).add(titleId));
  }, []);

  const remove = useCallback((titleId: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      next.delete(titleId);
      return next;
    });
  }, []);

  const isInWatchlist = useCallback(
    (titleId: string) => ids.has(titleId),
    [ids],
  );

  const value = useMemo<WatchlistContextValue>(
    () => ({
      ids,
      toggle,
      add,
      remove,
      isInWatchlist,
      count: ids.size,
    }),
    [ids, toggle, add, remove, isInWatchlist],
  );

  return (
    <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    throw new Error("useWatchlist must be used within WatchlistProvider");
  }
  return ctx;
}
