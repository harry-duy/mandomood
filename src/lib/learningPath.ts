/**
 * learningPath.ts — tạo lộ trình học cá nhân hoá dựa trên điểm 5 kỹ năng.
 *
 * Không cứng nhắc theo HSK 1→2→3. Thay vào đó, gợi ý tập trung vào kỹ năng
 * yếu nhất và công cụ phù hợp nhất với người học.
 */

import { SKILL_LABELS, type SkillScores } from "@/lib/skillScores";

export interface Milestone {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  href: string;
  priority: "high" | "medium" | "low";
  skillKey: keyof SkillScores;
}

/** Tất cả milestone có thể gợi ý — lọc theo điểm kỹ năng. */
const ALL_MILESTONES: (Omit<Milestone, "priority"> & { threshold: number })[] = [
  // Từ vựng
  {
    id: "hsk1-vocab", skillKey: "vocab", threshold: 25,
    emoji: "📚", title: "Quiz từ vựng HSK 1",
    desc: "Nắm vững 150 từ căn bản — nền tảng mọi kỹ năng.",
    href: "/hsk?level=hsk1",
  },
  {
    id: "hsk2-vocab", skillKey: "vocab", threshold: 50,
    emoji: "📖", title: "Mở rộng lên HSK 2–3",
    desc: "300–600 từ: đủ để hiểu C-drama với phụ đề.",
    href: "/hsk?level=hsk2",
  },
  {
    id: "flashcard-habit", skillKey: "vocab", threshold: 40,
    emoji: "🃏", title: "Lập thói quen Flashcard SRS",
    desc: "Ôn đúng lúc não sắp quên — hiệu quả gấp 3 học thông thường.",
    href: "/my-decks",
  },
  {
    id: "save-words", skillKey: "vocab", threshold: 30,
    emoji: "🔖", title: "Lưu từ mới vào Sổ tay",
    desc: "Khi gặp từ lạ → lưu ngay, ôn lại sau. Mục tiêu 30 từ.",
    href: "/so-tay",
  },

  // Nghe
  {
    id: "tones-master", skillKey: "listening", threshold: 40,
    emoji: "🎵", title: "Chinh phục thanh điệu",
    desc: "Phân biệt 4 thanh là bước đầu tiên để nghe tiếng Trung.",
    href: "/tones",
  },
  {
    id: "karaoke-listen", skillKey: "listening", threshold: 35,
    emoji: "🎤", title: "Nghe nhạc & nhận diện chữ",
    desc: "Mode Nghe của Karaoke: nhìn chữ Hán theo nhịp bài hát.",
    href: "/karaoke",
  },
  {
    id: "dictation-habit", skillKey: "listening", threshold: 55,
    emoji: "📝", title: "Luyện chính tả qua nghe",
    desc: "Nghe rồi viết lại — bài kiểm tra thật sự cho kỹ năng nghe.",
    href: "/dictation",
  },

  // Nói
  {
    id: "pronunciation-start", skillKey: "speaking", threshold: 30,
    emoji: "🎙️", title: "Luyện phát âm chuẩn",
    desc: "28 câu HSK 1–6 — bắt đầu từ câu đơn giản nhất.",
    href: "/pronunciation",
  },
  {
    id: "shadowing-habit", skillKey: "speaking", threshold: 45,
    emoji: "🎭", title: "Shadowing theo người bản ngữ",
    desc: "Nghe và nhái lại ngay — phương pháp người học nhanh nhất dùng.",
    href: "/shadowing",
  },
  {
    id: "ai-tutor-convo", skillKey: "speaking", threshold: 60,
    emoji: "🤖", title: "Hội thoại với AI Tutor",
    desc: "Luyện nói trong tình huống thực tế không sợ ngại ngùng.",
    href: "/ai-tutor",
  },

  // Đọc
  {
    id: "reading-start", skillKey: "reading", threshold: 20,
    emoji: "📄", title: "Đọc bài học đầu tiên",
    desc: "Truyện ngắn HSK 1 với từ vựng + dịch nghĩa — dễ hiểu và cảm xúc.",
    href: "/reading",
  },
  {
    id: "story-daily", skillKey: "reading", threshold: 35,
    emoji: "✨", title: "Tạo truyện AI mỗi ngày",
    desc: "Đọc truyện do AI viết về chủ đề bạn yêu thích — nhớ nhanh hơn nhiều.",
    href: "/generate",
  },
  {
    id: "grammar-reading", skillKey: "reading", threshold: 55,
    emoji: "📐", title: "Ngữ pháp & đọc hiểu",
    desc: "Hiểu cấu trúc câu giúp đọc nhanh và chính xác hơn.",
    href: "/grammar",
  },

  // Viết
  {
    id: "handwriting-start", skillKey: "writing", threshold: 20,
    emoji: "✍️", title: "Luyện viết chữ Hán tay",
    desc: "Nét bút giúp nhớ mặt chữ lâu gấp đôi so với chỉ đọc.",
    href: "/luyen-viet",
  },
  {
    id: "story-write", skillKey: "writing", threshold: 30,
    emoji: "🖊️", title: "Tạo câu chuyện của riêng bạn",
    desc: "Dùng từ bạn đã học để AI giúp viết truyện — vừa ôn vừa sáng tạo.",
    href: "/generate",
  },
  {
    id: "custom-deck-write", skillKey: "writing", threshold: 45,
    emoji: "🗂️", title: "Tạo bộ thẻ flashcard riêng",
    desc: "Viết ví dụ câu cho từng từ mới — tăng cả viết lẫn từ vựng.",
    href: "/my-decks",
  },
];

/**
 * Tạo danh sách milestone cá nhân hoá (tối đa 3 gợi ý ưu tiên cao/trung).
 * Logic: ưu tiên kỹ năng yếu nhất, sau đó kỹ năng yếu thứ 2.
 */
export function getPersonalizedMilestones(scores: SkillScores): Milestone[] {
  // Sắp xếp kỹ năng từ yếu → mạnh
  const sorted = [...SKILL_LABELS].sort((a, b) => scores[a.key] - scores[b.key]);

  const result: Milestone[] = [];
  const used = new Set<string>();

  for (const skill of sorted) {
    const skillScore = scores[skill.key];
    // Gợi ý milestone chưa đạt threshold (ngưỡng vượt qua) cho kỹ năng này
    const candidates = ALL_MILESTONES.filter(
      (m) => m.skillKey === skill.key && skillScore < m.threshold && !used.has(m.id)
    ).sort((a, b) => a.threshold - b.threshold); // ưu tiên ngưỡng thấp trước

    for (const m of candidates.slice(0, 2)) {
      used.add(m.id);
      const priority: Milestone["priority"] =
        result.length === 0 ? "high" : result.length === 1 ? "medium" : "low";
      result.push({ ...m, priority });
      if (result.length >= 3) break;
    }
    if (result.length >= 3) break;
  }

  return result;
}

/** Thông điệp động lực dựa trên điểm tổng. */
export function getMotivationalMessage(overall: number): string {
  if (overall === 0) return "Hành trình nghìn dặm bắt đầu từ một bước 🚀";
  if (overall < 20) return "Khởi đầu tốt! Mỗi ngày học một chút là đủ 🌱";
  if (overall < 40) return "Đang tiến bộ đều đặn — cứ giữ đà này nhé! 🔥";
  if (overall < 60) return "Kỹ năng đang hình thành rõ ràng — impressive! 💪";
  if (overall < 80) return "Trình độ tốt! Đang tiến gần đến level nâng cao 🌟";
  return "Xuất sắc! Bạn đang học như người bản ngữ rồi 🏆";
}
