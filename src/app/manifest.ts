import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MandoMood — Học tiếng Trung qua cảm xúc",
    short_name: "MandoMood",
    description: "Học tiếng Trung qua câu chuyện, cảm xúc và cuộc sống thật.",
    start_url: "/",
    display: "standalone",
    background_color: "#0D0D0D",
    theme_color: "#E8504A",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["education", "lifestyle"],
    lang: "vi",
    shortcuts: [
      {
        name: "Học hôm nay",
        short_name: "Học",
        description: "Mở feed bài học theo cảm xúc",
        url: "/feed",
      },
      {
        name: "Flashcard ôn tập",
        short_name: "Flashcard",
        description: "Ôn từ vựng theo lịch SRS",
        url: "/flashcards",
      },
      {
        name: "Luyện viết chữ Hán",
        short_name: "Luyện viết",
        description: "Tạo bảng 田字格 in / lưu PDF",
        url: "/luyen-viet",
      },
      {
        name: "Luyện chính tả",
        short_name: "Chính tả",
        description: "Nghe phát âm và gõ lại từ / câu",
        url: "/dictation",
      },
      {
        name: "AI Gia sư",
        short_name: "AI Tutor",
        description: "Trò chuyện luyện tiếng Trung với AI",
        url: "/ai-tutor",
      },
    ],
  };
}
