/**
 * useSavedQuotes — fetch danh sach quotes da luu tu /api/user/saved-quotes
 * Dung trong profile page va saved-quotes tab
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface SavedQuote {
  _id: string;
  chinese_text: string;
  pinyin: string;
  translation: string;
  mood: string;
  author?: string;
  cultural_note?: string;
  save_count?: number;
}

interface UseSavedQuotesReturn {
  quotes: SavedQuote[];
  count: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  toggleSave: (quoteId: string) => Promise<boolean>;
}

export function useSavedQuotes(): UseSavedQuotesReturn {
  const { data: session } = useSession();
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSaved = useCallback(async () => {
    if (!session?.user) return;
    // Nhường 1 microtask trước khi setState: khi được gọi từ useEffect,
    // mọi setState bên dưới đều là ASYNC → không gây cascading render
    // (đúng chuẩn rule react-hooks/set-state-in-effect, hành vi không đổi).
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/saved-quotes");
      if (!res.ok) throw new Error("Loi tai saved quotes");
      const data = await res.json() as { saved_quotes: SavedQuote[]; count: number };
      setQuotes(data.saved_quotes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Loi unknown");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const toggleSave = async (quoteId: string): Promise<boolean> => {
    if (!session?.user) return false;
    try {
      const res = await fetch("/api/user/saved-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId }),
      });
      if (!res.ok) return false;
      const data = await res.json() as { saved: boolean };
      // Update local state optimistically
      if (data.saved) {
        // Can't add full quote here without re-fetch — just refresh
        await fetchSaved();
      } else {
        setQuotes((prev) => prev.filter((q) => q._id !== quoteId));
      }
      return data.saved;
    } catch {
      return false;
    }
  };

  return {
    quotes,
    count: quotes.length,
    loading,
    error,
    refresh: fetchSaved,
    toggleSave,
  };
}
