"use client";

/**
 * /search — Trang tìm kiếm
 * Realtime search (debounce 300ms) qua quotes + lessons
 * Filter tabs: Tất cả / Câu nói / Bài học
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, BookOpen, Quote, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuoteResult {
  _id: string;
  chinese: string;
  pinyin: string;
  meaning: string;
  translation?: string;
  mood?: string;
  level?: string;
}

interface LessonResult {
  _id: string;
  title: string;
  description: string;
  level?: string;
  mood?: string;
}

interface SearchResults {
  quotes: QuoteResult[];
  lessons: LessonResult[];
  total: number;
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────
type FilterType = "all" | "quotes" | "lessons";
const FILTERS: { label: string; value: FilterType; icon: React.ReactNode }[] = [
  { label: "Tất cả", value: "all", icon: <Search size={14} /> },
  { label: "Câu nói", value: "quotes", icon: <Quote size={14} /> },
  { label: "Bài học", value: "lessons", icon: <BookOpen size={14} /> },
];

// ─── Keyword suggestions ──────────────────────────────────────────────────────
const SUGGESTIONS = ["yêu", "hạnh phúc", "tình yêu", "hy vọng", "buồn", "mạnh mẽ", "bình yên"];

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto focus khi mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  const doSearch = useCallback(
    async (q: string, type: FilterType) => {
      if (!q.trim()) {
        setResults(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&type=${type}&limit=15`
        );
        const data: SearchResults = await res.json();
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Trigger search khi query hoặc filter thay đổi
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, filter);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, filter, doSearch]);

  const clearQuery = () => {
    setQuery("");
    setResults(null);
    inputRef.current?.focus();
  };

  const isEmpty = !loading && results !== null && results.total === 0;
  const hasResults = results && results.total > 0;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]">
      {/* ── Search Bar ── */}
      <div className="sticky top-16 z-30 bg-[rgba(13,13,13,0.95)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="text-[#8A8078] hover:text-white transition-colors shrink-0"
            aria-label="Quay lại"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Search input */}
          <div
            className={cn(
              "flex-1 flex items-center gap-2 rounded-2xl px-4 py-2.5",
              "bg-[#1A1A1A] border transition-all duration-200",
              focused
                ? "border-[#E8504A]/60 ring-2 ring-[#E8504A]/10"
                : "border-[rgba(255,255,255,0.08)]"
            )}
          >
            <Search size={16} className="text-[#8A8078] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Tìm câu nói, bài học, ký tự…"
              className="flex-1 bg-transparent text-sm text-[#F5F0EB] placeholder:text-[#5A5450] outline-none"
            />
            {loading && <Loader2 size={15} className="text-[#8A8078] animate-spin shrink-0" />}
            {!loading && query && (
              <button onClick={clearQuery} className="text-[#5A5450] hover:text-[#8A8078] transition-colors">
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-2.5 max-w-2xl mx-auto">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                filter === f.value
                  ? "bg-[#E8504A] text-white"
                  : "bg-[#1A1A1A] text-[#8A8078] hover:text-white border border-[rgba(255,255,255,0.06)]"
              )}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 pb-24">

        {/* Empty state — chưa gõ gì */}
        {!query && (
          <div className="pt-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5A5450] mb-4">
              Gợi ý tìm kiếm
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-4 py-2 rounded-full bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] text-sm text-[#8A8078] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {isEmpty && (
          <div className="pt-20 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-[#F5F0EB] font-medium">Không tìm thấy kết quả</p>
            <p className="text-sm text-[#5A5450] mt-1">
              Thử từ khoá khác như "yêu", "hạnh phúc"...
            </p>
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <div className="pt-5 space-y-5">
            {/* Quotes results */}
            {results.quotes.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Quote size={14} className="text-[#E8504A]" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#8A8078]">
                    Câu nói ({results.quotes.length})
                  </p>
                </div>
                <div className="space-y-2">
                  {results.quotes.map((quote) => (
                    <QuoteResultCard key={quote._id} quote={quote} query={query} />
                  ))}
                </div>
              </section>
            )}

            {/* Lessons results */}
            {results.lessons.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={14} className="text-[#D4AF37]" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#8A8078]">
                    Bài học ({results.lessons.length})
                  </p>
                </div>
                <div className="space-y-2">
                  {results.lessons.map((lesson) => (
                    <LessonResultCard key={lesson._id} lesson={lesson} query={query} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quote Result Card ────────────────────────────────────────────────────────
function QuoteResultCard({ quote, query }: { quote: QuoteResult; query: string }) {
  return (
    <Link
      href={`/feed`}
      className={cn(
        "block rounded-2xl p-4 border transition-all",
        "bg-[#141414] border-[rgba(255,255,255,0.06)]",
        "hover:border-[rgba(232,80,74,0.3)] hover:bg-[#1A1414]"
      )}
    >
      <p className="text-xl font-bold text-[#F5F0EB] mb-0.5">
        <Highlight text={quote.chinese} query={query} />
      </p>
      <p className="text-xs text-[#8A8078] mb-1">
        <Highlight text={quote.pinyin} query={query} />
      </p>
      <p className="text-sm text-[#C4B9B0]">
        <Highlight text={quote.meaning} query={query} />
      </p>
      {quote.mood && (
        <span className="inline-block mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#242424] text-[#5A5450]">
          {quote.mood}
        </span>
      )}
    </Link>
  );
}

// ─── Lesson Result Card ───────────────────────────────────────────────────────
function LessonResultCard({ lesson, query }: { lesson: LessonResult; query: string }) {
  return (
    <Link
      href={`/lesson/${lesson._id}`}
      className={cn(
        "flex items-start gap-3 rounded-2xl p-4 border transition-all",
        "bg-[#141414] border-[rgba(255,255,255,0.06)]",
        "hover:border-[rgba(212,175,55,0.3)] hover:bg-[#14140A]"
      )}
    >
      <div className="w-9 h-9 rounded-xl bg-[#1E1B09] flex items-center justify-center shrink-0 mt-0.5">
        <BookOpen size={16} className="text-[#D4AF37]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#F5F0EB] truncate">
          <Highlight text={lesson.title} query={query} />
        </p>
        <p className="text-xs text-[#8A8078] mt-0.5 line-clamp-2">
          <Highlight text={lesson.description} query={query} />
        </p>
        {lesson.level && (
          <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#242424] text-[#5A5450]">
            {lesson.level}
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Highlight matched text ───────────────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-[#E8504A]/25 text-[#E8504A] rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
