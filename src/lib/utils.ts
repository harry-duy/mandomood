import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely — giống shadcn/ui */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format date thành "Hôm nay, 28/05/2026" */
export function formatDateVN(date: Date): string {
  const now = new Date();
  const isToday =
    date.toDateString() === now.toDateString();

  if (isToday) {
    return `Hôm nay, ${date.toLocaleDateString("vi-VN")}`;
  }

  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Map mood sang màu */
export const MOOD_COLORS: Record<string, string> = {
  romantic: "#C9878A",
  healing: "#8FAF8F",
  motivation: "#D4AF37",
  sad: "#7A8E9F",
  friendship: "#7AB8D4",
  aesthetic: "#9B8BBF",
  funny: "#E8A94A",
};

/** Map mood sang emoji */
export const MOOD_EMOJI: Record<string, string> = {
  romantic: "💌",
  healing: "🌿",
  motivation: "🔥",
  sad: "🌧️",
  friendship: "💚",
  aesthetic: "🌙",
  funny: "😂",
};

/** Map mood sang tên tiếng Việt */
export const MOOD_LABEL: Record<string, string> = {
  romantic: "Lãng mạn",
  healing: "Chữa lành",
  motivation: "Động lực",
  sad: "Tâm trạng",
  friendship: "Tình bạn",
  aesthetic: "Aesthetic",
  funny: "Hài hước",
};

/** Map level sang badge */
export const LEVEL_LABEL: Record<string, string> = {
  beginner: "Mới bắt đầu",
  hsk1: "HSK 1",
  hsk2: "HSK 2",
  hsk3: "HSK 3",
  hsk4: "HSK 4",
  hsk5: "HSK 5",
  hsk6: "HSK 6",
};
