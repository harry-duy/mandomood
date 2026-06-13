"use client";

import { useState } from "react";
import { useTTS } from "@/hooks/useTTS";
import { Heart, Volume2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOOD_COLORS, MOOD_EMOJI, MOOD_LABEL, LEVEL_LABEL } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ShareCard from "@/components/ui/ShareCard";

interface QuoteCardProps {
  quote: {
    _id: string;
    chinese_text: string;
    pinyin: string;
    translation: string;
    mood: string;
    level: string;
    cultural_note?: string;
    author?: string;
  };
  isDaily?: boolean;
  className?: string;
}

export default function QuoteCard({ quote, isDaily = false, className }: QuoteCardProps) {
  const { showPinyin, togglePinyin, isQuoteSaved, toggleSaveQuote } = useAppStore();
  const { data: session } = useSession();
  const [showNote, setShowNote] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saving, setSaving] = useState(false);

  const saved = isQuoteSaved(quote._id);
  const moodColor = MOOD_COLORS[quote.mood] ?? "#8A8078";
  const moodEmoji = MOOD_EMOJI[quote.mood] ?? "✨";

  const handleSave = async () => {
    // Optimistic update in Zustand (instant UI feedback)
    toggleSaveQuote(quote._id);
    const nowSaved = !saved;

    // If logged in: sync with server
    if (session?.user) {
      setSaving(true);
      try {
        const res = await fetch("/api/user/saved-quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quoteId: quote._id }),
        });
        if (!res.ok) throw new Error("API error");
        toast(nowSaved ? "Đã lưu vào bộ sưu tập" : "Đã bỏ lưu", { duration: 1500 });
      } catch {
        // Revert optimistic update on failure
        toggleSaveQuote(quote._id);
        toast("Lỗi lưu — thử lại sau", { duration: 2000 });
      } finally {
        setSaving(false);
      }
    } else {
      // Not logged in: save locally only
      toast(
        nowSaved
          ? "Đã lưu (đăng nhập để lưu vĩnh viễn)"
          : "Đã bỏ lưu",
        { duration: 1800 }
      );
    }
  };

  const { speak, speaking: audioPlaying } = useTTS();
  const handleAudio = () => {
    setIsPlaying(true);
    void speak(quote.chinese_text).then?.(() => setIsPlaying(false));
    setTimeout(() => setIsPlaying(false), 4000); // safety timeout
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-6",
        "bg-surface border border-[rgba(255,255,255,0.08)]",
        "transition-all duration-300 hover:border-[rgba(232,99,74,0.2)]",
        className
      )}
    >
      {/* Glow */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: moodColor }}
      />

      {/* Header badges */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {isDaily && (
            <span className="badge bg-mm-red/10 text-mm-red text-[10px]">
              Hôm nay
            </span>
          )}
          <span
            className="badge text-[10px]"
            style={{ background: `${moodColor}20`, color: moodColor }}
          >
            {moodEmoji} {MOOD_LABEL[quote.mood] ?? quote.mood}
          </span>
          <span className="badge bg-white/5 text-[var(--text-muted)] text-[10px]">
            {LEVEL_LABEL[quote.level] ?? quote.level}
          </span>
        </div>

        <button
          onClick={togglePinyin}
          className="text-[10px] text-[var(--text-muted)] hover:text-white border border-[rgba(255,255,255,0.08)] px-2.5 py-1 rounded-full transition-colors"
        >
          {showPinyin ? "Ẩn pinyin" : "Hiện pinyin"}
        </button>
      </div>

      {/* Chinese text */}
      <p className="font-chinese text-3xl font-bold text-[#F5F0EB] leading-relaxed mb-2 tracking-wider">
        {quote.chinese_text}
      </p>

      {/* Pinyin */}
      <div
        className={cn(
          "transition-all duration-300 overflow-hidden",
          showPinyin ? "max-h-20 opacity-100 mb-2" : "max-h-0 opacity-0 mb-0"
        )}
      >
        <p className="text-sm text-mm-gold/70 tracking-wider">{quote.pinyin}</p>
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-[rgba(255,255,255,0.1)] mb-3" />

      {/* Translation */}
      <p className="text-[var(--text-muted)] text-base font-light italic leading-relaxed mb-1">
        &ldquo;{quote.translation}&rdquo;
      </p>

      {quote.author && (
        <p className="text-xs text-[var(--text-muted)]/60 mb-4">&mdash; {quote.author}</p>
      )}

      {/* Cultural note */}
      {quote.cultural_note && (
        <div className="mb-4">
          <button
            onClick={() => setShowNote(!showNote)}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <ChevronDown
              size={14}
              className={cn("transition-transform", showNote && "rotate-180")}
            />
            Ghi chú văn hóa
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              showNote ? "max-h-40 mt-2" : "max-h-0"
            )}
          >
            <p className="text-xs text-[var(--text-muted)] leading-relaxed bg-surface2 rounded-xl p-3">
              {quote.cultural_note}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={handleAudio}
          className={cn(
            "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all",
            isPlaying
              ? "bg-mm-red text-white"
              : "bg-surface2 text-[var(--text-muted)] hover:text-white"
          )}
        >
          <Volume2 size={15} className={cn(isPlaying && "animate-pulse")} />
          {isPlaying ? "Đang phát..." : "Nghe"}
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-all",
            saved
              ? "bg-mm-red/20 text-mm-red"
              : "bg-surface2 text-[var(--text-muted)] hover:text-mm-red",
            saving && "opacity-50"
          )}
          aria-label="Lưu"
        >
          <Heart
            size={16}
            fill={saved ? "currentColor" : "none"}
            className={cn(saving && "animate-pulse")}
          />
        </button>

        <ShareCard quote={quote} />

        {/* Login hint khi chua dang nhap */}
        {!session?.user && saved && (
          <span className="text-[9px] text-[#5A5450] ml-auto">Đăng nhập để lưu vĩnh viễn</span>
        )}
      </div>
    </div>
  );
}
