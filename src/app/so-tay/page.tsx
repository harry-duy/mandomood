"use client";

/**
 * /so-tay — Sổ tay từ đã lưu (đóng vòng tính năng "lưu từ vào flashcard").
 * Đọc localStorage mm_saved_words (không cần đăng nhập): xem, nghe phát âm,
 * lật để ôn nghĩa, xoá. Triết lý MandoMood: ôn nhẹ nhàng, không ép buộc.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Trash2, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { playTTS } from "@/hooks/useTTS";
import { getSavedWords, removeSavedWord, type SavedWord } from "@/lib/savedWords";
import { autoSyncOncePerSession } from "@/lib/cloudSync";

export default function SavedWordsPage() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setWords(getSavedWords());
    // Kéo dữ liệu cloud về (1 lần/phiên, best-effort) rồi refresh danh sách
    autoSyncOncePerSession().then(() => setWords(getSavedWords()));
  }, []);

  const remove = (hanzi: string) => {
    removeSavedWord(hanzi);
    setWords((w) => w.filter((x) => x.hanzi !== hanzi));
  };

  const toggle = (hanzi: string) =>
    setRevealed((r) => ({ ...r, [hanzi]: !r[hanzi] }));

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Ôn tập từ vựng</p>
        <h1 className="font-playfair text-2xl font-bold">Sổ tay từ 📒</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {words.length > 0 ? `${words.length} từ đã lưu — nhấn để xem nghĩa` : "Chưa có từ nào"}
        </p>
      </div>

      {words.length === 0 ? (
        <div className="rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-6 text-center">
          <div className="text-4xl mb-3">📖</div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Khi đọc truyện, nhấn vào từ rồi bấm 🔖 để lưu vào đây ôn sau.
          </p>
          <Link
            href="/reading"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl btn-primary font-semibold text-sm"
          >
            <BookOpen size={16} /> Đọc truyện ngay <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {words.map((w) => (
              <motion.div
                key={w.hanzi}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 rounded-2xl bg-surface border border-[rgba(255,255,255,0.07)] p-3"
              >
                <button
                  onClick={() => toggle(w.hanzi)}
                  className="flex-1 text-left"
                  aria-label={`Xem nghĩa của ${w.hanzi}`}
                >
                  <span lang="zh-CN" className="font-chinese text-xl font-bold">{w.hanzi}</span>
                  <span className="text-xs text-mm-gold/80 ml-2">{w.pinyin}</span>
                  <div className="text-sm text-[var(--text-muted)] mt-0.5">
                    {revealed[w.hanzi] ? w.meaning : "•••• (nhấn để xem)"}
                  </div>
                </button>
                <button
                  onClick={() => void playTTS(w.hanzi)}
                  aria-label="Nghe phát âm"
                  className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.08)]"
                >
                  <Volume2 size={16} className="text-mm-red/80" />
                </button>
                <button
                  onClick={() => remove(w.hanzi)}
                  aria-label="Xoá từ"
                  className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.08)]"
                >
                  <Trash2 size={16} className="text-[var(--text-muted)]" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <Link
            href="/flashcards"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-2xl btn-primary font-semibold text-sm"
          >
            <Sparkles size={16} /> Ôn tập với Flashcard <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
