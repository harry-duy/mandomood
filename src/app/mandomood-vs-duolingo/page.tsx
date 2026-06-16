import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";

export const metadata: Metadata = {
  title: "MandoMood vs Duolingo: học tiếng Trung cái nào hợp bạn? | MandoMood",
  description:
    "So sánh thẳng thắn MandoMood và Duolingo cho người Việt học tiếng Trung: phương pháp học, chữ Hán & luyện viết, chiết tự, AI cá nhân hóa, streak và giá. Chọn công cụ hợp mục tiêu của bạn.",
  keywords: [
    "MandoMood vs Duolingo", "học tiếng Trung Duolingo", "app học tiếng Trung tốt nhất",
    "Duolingo tiếng Trung có tốt không", "học tiếng Trung cho người Việt", "so sánh app học tiếng Trung",
  ],
  openGraph: {
    title: "MandoMood vs Duolingo: học tiếng Trung cái nào hợp bạn?",
    description: "So sánh thẳng thắn MandoMood và Duolingo cho người Việt học tiếng Trung — phương pháp, chữ Hán, AI, giá.",
    url: "/mandomood-vs-duolingo",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MandoMood vs Duolingo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MandoMood vs Duolingo: học tiếng Trung cái nào hợp bạn?",
    description: "So sánh thẳng thắn MandoMood và Duolingo cho người Việt học tiếng Trung.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/mandomood-vs-duolingo" },
};

// y = MandoMood có, n = không, p = một phần
type Mark = "y" | "n" | "p";
const ROWS: { feature: string; mando: Mark; duo: Mark; note: string }[] = [
  { feature: "Chuyên sâu tiếng Trung (HSK 1–6)", mando: "y", duo: "p",
    note: "MandoMood tập trung 100% vào tiếng Trung theo lộ trình HSK; Duolingo có khóa tiếng Trung nhưng là một trong nhiều ngôn ngữ." },
  { feature: "Học qua câu chuyện & cảm xúc", mando: "y", duo: "n",
    note: "MandoMood gắn mỗi câu với một cảm xúc/câu chuyện ngắn; Duolingo thiên về bài tập ngắn lặp lại." },
  { feature: "Chiết tự + bộ thủ chữ Hán", mando: "y", duo: "n",
    note: "Phân tích cấu tạo chữ Hán giúp nhớ mặt chữ — Duolingo gần như không có." },
  { feature: "Luyện viết tay (田字格, in PDF)", mando: "y", duo: "n",
    note: "MandoMood có luyện viết trên màn + file in 田字格; Duolingo không hỗ trợ viết tay." },
  { feature: "AI cá nhân hóa (tutor, tạo bài từ ảnh)", mando: "y", duo: "p",
    note: "MandoMood có AI tutor + tạo bài từ ảnh miễn phí; Duolingo có AI (Max) nhưng giới hạn gói trả phí." },
  { feature: "Spaced repetition (ôn đúng lúc)", mando: "y", duo: "p",
    note: "Cả hai đều có cơ chế ôn lại; thuật toán mỗi bên khác nhau." },
  { feature: "Giao diện & nội dung cho người Việt", mando: "y", duo: "p",
    note: "MandoMood thiết kế riêng cho người Việt (âm Hán Việt, giải thích tiếng Việt); Duolingo có tiếng Việt nhưng nội dung tiếng Trung chủ yếu qua tiếng Anh." },
  { feature: "Streak & gamification", mando: "y", duo: "y",
    note: "Cả hai đều có streak, XP, bảng xếp hạng — Duolingo là chuẩn mực ở mảng tạo thói quen." },
  { feature: "Hệ sinh thái & độ hoàn thiện lớn", mando: "p", duo: "y",
    note: "Duolingo có nhiều năm phát triển, cực kỳ trau chuốt và nội dung khổng lồ cho hàng chục ngôn ngữ." },
  { feature: "Đa ngôn ngữ (40+ ngôn ngữ)", mando: "n", duo: "y",
    note: "Nếu bạn muốn học nhiều ngôn ngữ trong một app, Duolingo phù hợp hơn." },
];

function Cell({ mark }: { mark: Mark }) {
  if (mark === "y") return <Check size={16} className="text-mm-sage mx-auto" aria-label="Có" />;
  if (mark === "n") return <Minus size={16} className="text-[var(--text-muted)] mx-auto" aria-label="Không" />;
  return <span className="text-[10px] text-mm-gold font-semibold" aria-label="Một phần">Một phần</span>;
}

export default function VsDuolingoPage() {
  return (
    <main className="min-h-screen pb-28 bg-[var(--bg-primary)]">
      <div className="max-w-2xl mx-auto px-4 pt-12">
        <header className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-mm-red font-semibold mb-2">So sánh</p>
          <h1 className="text-3xl font-bold mb-3 text-[var(--text)]">MandoMood vs Duolingo</h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Học tiếng Trung nên chọn cái nào? Đây là so sánh thẳng thắn cho người Việt — cả ưu điểm
            của Duolingo lẫn thế mạnh của MandoMood — để bạn chọn theo đúng mục tiêu.
          </p>
        </header>

        {/* Bảng so sánh */}
        <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-surface">
          <div className="grid grid-cols-[1fr_72px_72px] items-center px-4 py-3 bg-surface2 text-xs font-semibold">
            <span>Tính năng</span>
            <span className="text-center text-mm-red">MandoMood</span>
            <span className="text-center text-[var(--text-muted)]">Duolingo</span>
          </div>
          {ROWS.map((r, i) => (
            <div key={i} className="border-t border-[var(--border)]">
              <div className="grid grid-cols-[1fr_72px_72px] items-center px-4 py-3">
                <span className="text-sm text-[var(--text)] pr-2">{r.feature}</span>
                <span className="text-center"><Cell mark={r.mando} /></span>
                <span className="text-center"><Cell mark={r.duo} /></span>
              </div>
              <p className="px-4 pb-3 text-[11px] text-[var(--text-muted)] leading-relaxed">{r.note}</p>
            </div>
          ))}
        </div>

        {/* Kết luận cân bằng */}
        <section className="mt-8 space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-surface p-4">
            <h2 className="text-base font-bold text-mm-red mb-1.5">Chọn MandoMood nếu…</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Bạn học <strong className="text-[var(--text)]">chuyên tiếng Trung</strong>, muốn nhớ chữ Hán qua chiết tự &
              câu chuyện cảm xúc, cần luyện viết tay và thích nội dung giải thích bằng tiếng Việt.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-surface p-4">
            <h2 className="text-base font-bold text-[var(--text)] mb-1.5">Chọn Duolingo nếu…</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Bạn muốn một app <strong className="text-[var(--text)]">đa ngôn ngữ</strong> cực kỳ trau chuốt, hệ thống tạo
              thói quen hàng đầu và kho bài học khổng lồ — Duolingo là lựa chọn rất mạnh.
            </p>
          </div>
          <p className="text-xs text-[var(--text-muted)] text-center leading-relaxed">
            Nhiều người dùng cả hai: Duolingo để giữ thói quen mỗi ngày, MandoMood để học sâu chữ Hán và tiếng Trung.
          </p>
        </section>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-mm-red px-6 py-3 text-sm font-semibold text-white hover:bg-[#d4532a] transition-colors"
          >
            Thử MandoMood miễn phí →
          </Link>
        </div>
      </div>
    </main>
  );
}
