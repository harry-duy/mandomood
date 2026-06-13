"use client";

/**
 * MatchGame — game ghép đôi hanzi ↔ nghĩa (kiểu Quizlet Match).
 * Lật mở sẵn tất cả ô, chạm 2 ô để ghép cặp đúng; sai thì nháy đỏ.
 * Tính giờ — càng nhanh càng giỏi. Generic, dùng cho /my-decks và /hsk.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Timer, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { shuffle } from "@/lib/shuffle";
import type { QuizItem } from "@/components/ui/VocabQuiz";

interface Tile {
  id: string;
  pairId: number;
  text: string;
  kind: "front" | "back";
}

const DEFAULT_PAIRS = 6;

function buildTiles(items: QuizItem[], pairs: number): Tile[] {
  const pool = shuffle(items).slice(0, pairs);
  const tiles: Tile[] = [];
  pool.forEach((item, i) => {
    tiles.push({ id: `f${i}`, pairId: i, text: item.front, kind: "front" });
    tiles.push({ id: `b${i}`, pairId: i, text: item.back, kind: "back" });
  });
  return shuffle(tiles);
}

export default function MatchGame({
  items,
  pairs = DEFAULT_PAIRS,
  onDone,
  onExit,
}: {
  items: QuizItem[];
  pairs?: number;
  onDone?: (seconds: number, mistakes: number) => void;
  onExit?: () => void;
}) {
  const [seed, setSeed] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tiles = useMemo(() => buildTiles(items, pairs), [items, pairs, seed]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Tile | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const doneRef = useRef(false);

  const totalPairs = tiles.length / 2;

  // Đồng hồ
  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [finished, seed]);

  // Hoàn thành
  useEffect(() => {
    if (totalPairs > 0 && matched.size === totalPairs && !doneRef.current) {
      doneRef.current = true;
      setFinished(true);
      onDone?.(seconds, mistakes);
    }
  }, [matched, totalPairs, seconds, mistakes, onDone]);

  if (items.length < 3) {
    return (
      <p className="text-center py-8 text-sm text-[var(--text-muted)]">
        Cần ít nhất 3 từ để chơi ghép đôi 🙏
      </p>
    );
  }

  const tap = (tile: Tile) => {
    if (finished || matched.has(tile.pairId) || wrongIds.length > 0) return;
    if (!selected) {
      setSelected(tile);
      return;
    }
    if (selected.id === tile.id) {
      setSelected(null);
      return;
    }
    if (selected.pairId === tile.pairId && selected.kind !== tile.kind) {
      setMatched((m) => new Set(m).add(tile.pairId));
      setSelected(null);
    } else {
      setMistakes((x) => x + 1);
      setWrongIds([selected.id, tile.id]);
      setTimeout(() => {
        setWrongIds([]);
        setSelected(null);
      }, 450);
    }
  };

  const restart = () => {
    setSeed((s) => s + 1);
    setMatched(new Set());
    setSelected(null);
    setWrongIds([]);
    setMistakes(0);
    setSeconds(0);
    setFinished(false);
    doneRef.current = false;
  };

  if (finished) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
        <Trophy size={42} className="text-mm-gold mx-auto mb-3" />
        <p className="font-playfair text-xl font-bold mb-1">Ghép xong! ⚡</p>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          {seconds}s · {mistakes} lần sai
        </p>
        <div className="flex gap-2 justify-center">
          {onExit && (
            <button onClick={onExit} className="btn-ghost border border-[rgba(255,255,255,0.1)]">
              Thoát
            </button>
          )}
          <button onClick={restart} className="btn-primary flex items-center gap-2">
            <RotateCcw size={15} /> Chơi lại
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
          <Timer size={13} /> {seconds}s
        </p>
        <p className="text-xs text-mm-gold font-semibold">
          {matched.size}/{totalPairs} cặp
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tiles.map((tile) => {
          const isMatched = matched.has(tile.pairId);
          const isSelected = selected?.id === tile.id;
          const isWrong = wrongIds.includes(tile.id);
          return (
            <button
              key={tile.id}
              onClick={() => tap(tile)}
              disabled={isMatched}
              className={cn(
                "min-h-[72px] px-2 py-2 rounded-2xl border text-center transition-all duration-200 active:scale-95",
                tile.kind === "front" ? "font-chinese text-xl" : "text-xs leading-snug",
                isMatched && "opacity-0 pointer-events-none scale-90",
                !isMatched && !isSelected && !isWrong && "bg-surface border-[rgba(255,255,255,0.08)] hover:border-mm-gold/40",
                isSelected && "bg-mm-gold/15 border-mm-gold/60",
                isWrong && "bg-mm-red/20 border-mm-red/60 animate-pulse"
              )}
            >
              {tile.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
