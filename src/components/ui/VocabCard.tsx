"use client";

import { useState } from "react";
import { useTTS } from "@/hooks/useTTS";
import { Volume2, ChevronDown, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VocabItem {
  hanzi: string;
  pinyin: string;
  meaning: string;
  example?: string;
}

interface VocabCardProps {
  vocab: VocabItem;
  index: number;
  sourceLesson?: string;
}

export function VocabCard({ vocab, index, sourceLesson }: VocabCardProps) {
  const { data: session } = useSession();
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const { speak } = useTTS();
  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    void speak(vocab.hanzi);
  };

  const addToDeck = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user) {
      toast("Đăng nhập để lưu flashcard");
      return;
    }
    if (added || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/user/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hanzi: vocab.hanzi,
          pinyin: vocab.pinyin,
          meaning: vocab.meaning,
          example_sentence: vocab.example,
          source_lesson: sourceLesson,
        }),
      });
      if (res.ok) {
        setAdded(true);
        toast(`Đã thêm "${vocab.hanzi}" vào bộ thẻ ✨`);
      }
    } catch {
      toast("Lỗi thêm flashcard");
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className={cn(
        "bg-surface2 rounded-2xl overflow-hidden cursor-pointer",
        "border border-transparent transition-all duration-200",
        expanded && "border-[rgba(232,80,74,0.2)]"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 p-4">
        {/* Hanzi big */}
        <div className="w-12 h-12 rounded-xl bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] flex items-center justify-center flex-shrink-0">
          <span className="font-chinese text-2xl text-mm-gold font-bold">
            {vocab.hanzi}
          </span>
        </div>

        {/* Pinyin + meaning */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-mm-gold/70 tracking-wider mb-0.5">
            {vocab.pinyin}
          </p>
          <p className="text-sm font-medium text-[#F5F0EB] truncate">
            {vocab.meaning}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Add to deck */}
          <button
            onClick={addToDeck}
            disabled={adding}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
              added
                ? "bg-mm-gold/20 text-mm-gold"
                : "bg-surface text-[var(--text-muted)] hover:text-mm-gold hover:bg-mm-gold/10"
            )}
            title={added ? "Đã thêm vào bộ thẻ" : "Thêm vào flashcard"}
          >
            {added ? <Check size={13} /> : <Plus size={13} />}
          </button>
          {/* Audio */}
          <button
            onClick={playAudio}
            className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-[var(--text-muted)] hover:text-mm-red transition-colors"
          >
            <Volume2 size={13} />
          </button>
          <ChevronDown
            size={14}
            className={cn(
              "text-[var(--text-muted)] transition-transform duration-300",
              expanded && "rotate-180"
            )}
          />
        </div>
      </div>

      {/* Expanded — example sentence */}
      <AnimatePresence>
        {expanded && vocab.example && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-[rgba(255,255,255,0.05)]">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1.5 pt-3">
                Ví dụ
              </p>
              <p
                className="font-chinese text-base text-[#F5F0EB] cursor-pointer hover:text-mm-gold transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  void speak(vocab.example ?? "");
                }}
              >
                {vocab.example}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Hiển thị danh sách vocab */
interface VocabListProps {
  vocabulary: VocabItem[];
  sourceLesson?: string;
}

export function VocabList({ vocabulary, sourceLesson }: VocabListProps) {
  if (!vocabulary || vocabulary.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
        📚 Từ vựng ({vocabulary.length} từ)
      </p>
      {vocabulary.map((v, i) => (
        <VocabCard key={i} vocab={v} index={i} sourceLesson={sourceLesson} />
      ))}
    </div>
  );
}
