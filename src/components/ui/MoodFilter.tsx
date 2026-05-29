"use client";

import { cn } from "@/lib/utils";
import { MOOD_COLORS, MOOD_EMOJI, MOOD_LABEL } from "@/lib/utils";

const MOODS = ["romantic", "healing", "motivation", "sad", "friendship", "aesthetic", "funny"];

interface MoodFilterProps {
  selected: string | null;
  onChange: (mood: string | null) => void;
}

export default function MoodFilter({ selected, onChange }: MoodFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {/* All */}
      <button
        onClick={() => onChange(null)}
        className={cn(
          "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
          !selected
            ? "bg-mm-red text-white"
            : "bg-surface2 text-[var(--text-muted)] hover:text-white"
        )}
      >
        ✨ Tất cả
      </button>

      {MOODS.map((mood) => {
        const isSelected = selected === mood;
        const color = MOOD_COLORS[mood] ?? "#8A8078";
        return (
          <button
            key={mood}
            onClick={() => onChange(isSelected ? null : mood)}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
              isSelected
                ? "text-white border"
                : "bg-surface2 text-[var(--text-muted)] hover:text-white"
            )}
            style={
              isSelected
                ? { background: `${color}30`, borderColor: color, color }
                : {}
            }
          >
            {MOOD_EMOJI[mood]} {MOOD_LABEL[mood]}
          </button>
        );
      })}
    </div>
  );
}
