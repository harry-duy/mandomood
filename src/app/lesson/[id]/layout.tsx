import type { Metadata } from "next";

const LESSON_TITLES: Record<string, string> = {
  l1: "Cuộc gọi lúc nửa đêm",
  l2: "Buổi sáng quán cà phê",
  l3: "Người không nên yêu",
  l4: "Ngày mai sẽ tốt hơn",
  l5: "Cuộc trò chuyện với bà",
  l6: "Đêm nhìn sao trời",
  l7: "Hôm nay uống trà",
  l8: "Tình bạn thực sự",
  l9: "Tuổi thanh xuân",
  l10: "Mùa xuân về rồi",
  l11: "Khoảng lặng để nghỉ ngơi",
  l12: "Ngụ ngôn về con đường",
};

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const lessonTitle = LESSON_TITLES[id];
  const title = lessonTitle
    ? `${lessonTitle} | MandoMood`
    : "Bài học | MandoMood";
  const description = lessonTitle
    ? `Học tiếng Trung qua câu chuyện "${lessonTitle}" — từ vựng, ngữ pháp và cảm xúc trong từng câu.`
    : "Học tiếng Trung qua câu chuyện cảm xúc — từ vựng, ngữ pháp và văn hóa trong từng bài.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood — Bài học" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    alternates: { canonical: `/lesson/${id}` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
