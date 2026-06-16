"use client";

/**
 * /practice-sheet?level=N — Trang luyện viết IN ĐƯỢC (田字格), lấy ý tưởng từ
 * nhaikanji ("Tải file luyện viết"). Người học bấm "In / Lưu PDF" → dùng hộp thoại
 * in của trình duyệt để lưu PDF hoặc in ra giấy, viết tay offline.
 *
 * - Mỗi từ: 1 dòng gồm ô có chữ mẫu mờ + các ô 田字格 trống để chép.
 * - CSS @media print: ẩn nút điều khiển, nền trắng, đường kẻ rõ — sạch khi in.
 */

import { useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import { HSK_DATA } from "@/lib/hsk-data";
import { uniqueCharsFromWords, clampLevel } from "@/lib/practiceSheet";

const CELLS_PER_CHAR = 5; // số ô tập chép cho mỗi chữ (sau ô mẫu)

function TianZiGe({ char, guide }: { char?: string; guide?: boolean }) {
  // Ô 田字格: viền ngoài + 2 đường kẻ chấm chia 4 (canh giữa nét chữ)
  return (
    <div className="tzg">
      <span className={guide ? "tzg-guide" : "tzg-empty"}>{char ?? ""}</span>
    </div>
  );
}

function PracticeSheetInner() {
  const params = useSearchParams();
  const level = clampLevel(params.get("level"));
  const words = useMemo(() => HSK_DATA[level] ?? [], [level]);

  // Tách thành từng chữ đơn để tập viết (你好 → 你, 好) — logic thuần, có unit test
  const chars = useMemo(() => uniqueCharsFromWords(words), [words]);

  return (
    <main className="practice-sheet min-h-screen bg-[var(--bg)] text-[var(--text)] px-4 py-6 max-w-3xl mx-auto pb-24">
      {/* Thanh điều khiển — ẩn khi in */}
      <div className="no-print mb-6 flex items-center justify-between gap-3">
        <Link href="/hsk" className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-mm-red transition-colors">
          <ArrowLeft size={16} /> HSK
        </Link>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((l) => (
            <Link
              key={l}
              href={`/practice-sheet?level=${l}`}
              className={
                "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors " +
                (l === level ? "bg-mm-red text-white" : "bg-surface2 text-[var(--text-muted)] hover:text-[var(--text)]")
              }
            >
              {l}
            </Link>
          ))}
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full bg-mm-red px-4 py-2 text-sm font-semibold text-white hover:bg-[#d4532a] transition-colors"
        >
          <Printer size={15} /> In / Lưu PDF
        </button>
      </div>

      {/* Tiêu đề trang in */}
      <div className="mb-5">
        <h1 className="text-xl font-bold">Luyện viết chữ Hán · HSK {level}</h1>
        <p className="text-sm text-[var(--text-muted)]">
          {chars.length} chữ · Chép theo ô mẫu mờ bên trái · MandoMood
        </p>
      </div>

      {/* Các dòng luyện viết */}
      <div className="space-y-3">
        {chars.map((c, i) => (
          <div key={i} className="practice-row flex items-stretch gap-2">
            <div className="w-20 shrink-0 flex flex-col justify-center pr-1">
              <span className="text-xs font-semibold text-mm-gold leading-tight">{c.pinyin}</span>
              <span className="text-[10px] text-[var(--text-muted)] leading-tight line-clamp-2">{c.meaning}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <TianZiGe char={c.char} guide />
              {Array.from({ length: CELLS_PER_CHAR }).map((_, k) => (
                <TianZiGe key={k} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .practice-sheet .tzg {
          position: relative;
          width: 44px;
          height: 44px;
          border: 1px solid #c9352b;
          background-image:
            linear-gradient(to right, transparent 49.5%, rgba(201,53,43,0.35) 49.5%, rgba(201,53,43,0.35) 50.5%, transparent 50.5%),
            linear-gradient(to bottom, transparent 49.5%, rgba(201,53,43,0.35) 49.5%, rgba(201,53,43,0.35) 50.5%, transparent 50.5%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .practice-sheet .tzg-guide {
          font-family: "Noto Serif SC", serif;
          font-size: 30px;
          color: rgba(120,113,108,0.45);
        }
        .practice-sheet .tzg-empty { font-size: 30px; }

        @media print {
          .no-print { display: none !important; }
          .practice-sheet {
            background: #ffffff !important;
            color: #000000 !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
          .practice-sheet .tzg { border-color: #999 !important; page-break-inside: avoid; }
          .practice-sheet .tzg-guide { color: rgba(0,0,0,0.30) !important; }
          .practice-sheet .practice-row { page-break-inside: avoid; }
          @page { margin: 1.2cm; }
        }
      `}</style>
    </main>
  );
}

export default function PracticeSheetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <PracticeSheetInner />
    </Suspense>
  );
}
