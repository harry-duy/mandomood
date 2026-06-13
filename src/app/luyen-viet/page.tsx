"use client";

/**
 * /luyen-viet — Trình tạo bảng luyện viết chữ Hán (田字格)
 *
 * Lấy cảm hứng từ "Luyện viết · Tải file luyện viết" của nhaikanji.com,
 * nhưng dành cho chữ Hán (tiếng Trung) theo tinh thần MandoMood:
 * - Nhập chữ tự do hoặc chọn nhanh bộ chữ theo cảm xúc.
 * - Ô 田字格 chuẩn (đường chữ thập + viền) để canh nét.
 * - Tùy chọn: hiện pinyin, số ô mẫu mờ (đồ theo), số ô trống để tự viết.
 * - Nút "In / Lưu PDF" dùng window.print() — không cần backend.
 *
 * Toàn bộ là client-side, không gọi API. Print CSS ẩn nav + chỉ in lưới.
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { Printer, Sparkles, ArrowLeft, Eraser, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import HanziWriterDisplay from "@/components/ui/HanziWriterDisplay";

// ─── Bộ chữ gợi ý nhanh (đồng bộ với /characters) ────────────────────────────
const PRESETS: { id: string; label: string; chars: string }[] = [
  { id: "heart", label: "❤️ Tình yêu", chars: "爱心情念惜暖" },
  { id: "fate", label: "🌙 Duyên phận", chars: "缘梦望盼归" },
  { id: "pain", label: "💧 Nỗi đau", chars: "泪别痛散孤哭" },
  { id: "peace", label: "🍃 Bình yên", chars: "静思寂真悟" },
  { id: "strength", label: "🔥 Sức mạnh", chars: "忍勇笑懂陪美福" },
  { id: "hsk1", label: "📘 HSK1 cơ bản", chars: "我你好是不人大小多" },
];

// Pinyin tra nhanh cho các chữ trong preset (để hiện gợi ý đọc).
const PINYIN: Record<string, string> = {
  爱: "ài", 心: "xīn", 情: "qíng", 念: "niàn", 惜: "xī", 暖: "nuǎn",
  缘: "yuán", 梦: "mèng", 望: "wàng", 盼: "pàn", 归: "guī",
  泪: "lèi", 别: "bié", 痛: "tòng", 散: "sàn", 孤: "gū", 哭: "kū",
  静: "jìng", 思: "sī", 寂: "jì", 真: "zhēn", 悟: "wù",
  忍: "rěn", 勇: "yǒng", 笑: "xiào", 懂: "dǒng", 陪: "péi", 美: "měi", 福: "fú",
  我: "wǒ", 你: "nǐ", 好: "hǎo", 是: "shì", 不: "bù", 人: "rén",
  大: "dà", 小: "xiǎo", 多: "duō",
};

const GUIDE_OPTIONS = [0, 2, 3, 4] as const;

export default function LuyenVietPage() {
  const [input, setInput] = useState("爱心情念惜暖");
  const [showPinyin, setShowPinyin] = useState(true);
  const [guideCount, setGuideCount] = useState<number>(3); // số ô mẫu mờ để đồ
  const [cols, setCols] = useState(10); // tổng số ô mỗi hàng
  const [previewChar, setPreviewChar] = useState<string | null>(null);

  // Tách thành danh sách chữ Hán hợp lệ (bỏ khoảng trắng / ký tự latin / dấu).
  const chars = useMemo(() => {
    return Array.from(input).filter((c) => /[㐀-鿿]/.test(c));
  }, [input]);

  // Danh sách chữ duy nhất để xem thứ tự nét (tránh trùng).
  const uniqueChars = useMemo(() => Array.from(new Set(chars)), [chars]);

  return (
    <div className="min-h-screen pb-28 px-4 pt-6 max-w-5xl mx-auto">
      {/* ─── Thanh điều khiển (ẩn khi in) ─── */}
      <div className="no-print">
        <Link
          href="/characters"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-white mb-4"
        >
          <ArrowLeft size={16} /> Bộ sưu tập chữ Hán
        </Link>

        <h1 className="text-2xl font-bold mb-1">Luyện viết chữ Hán</h1>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Tạo bảng 田字格 để in hoặc lưu PDF. Nhập chữ bạn muốn luyện, hoặc chọn nhanh một bộ bên dưới.
        </p>
        <Link
          href="/luyen-viet/online"
          className="inline-flex items-center gap-1.5 text-sm text-mm-red hover:underline mb-6"
        >
          <PenLine size={15} /> Hoặc luyện viết trực tiếp trên màn hình →
        </Link>

        {/* Preset */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setInput(p.chars)}
              className="px-3 py-1.5 rounded-full text-xs bg-surface border border-[rgba(255,255,255,0.08)] hover:border-mm-red hover:text-white text-[var(--text-muted)] transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Ô nhập */}
        <div className="relative mb-5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Nhập chữ Hán cần luyện, ví dụ: 爱 心 情…" aria-label="Nhập chữ Hán cần luyện, ví dụ: 爱 心 情"
            className="w-full bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl px-4 py-3 text-2xl leading-relaxed outline-none focus:border-mm-red transition-colors resize-none"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          />
          {input && (
            <button
              onClick={() => setInput("")}
              className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-white"
              aria-label="Xóa"
            >
              <Eraser size={18} />
            </button>
          )}
        </div>

        {/* Tùy chọn */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showPinyin}
              onChange={(e) => setShowPinyin(e.target.checked)}
              className="accent-mm-red w-4 h-4"
            />
            Hiện pinyin
          </label>

          <div className="text-sm">
            <span className="block text-[var(--text-muted)] mb-1.5">Ô mẫu mờ (đồ theo)</span>
            <div className="flex gap-1.5">
              {GUIDE_OPTIONS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGuideCount(g)}
                  className={cn(
                    "w-9 h-8 rounded-lg text-xs border transition-colors",
                    guideCount === g
                      ? "bg-mm-red border-mm-red text-white"
                      : "bg-surface border-[rgba(255,255,255,0.08)] text-[var(--text-muted)]"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm">
            <span className="block text-[var(--text-muted)] mb-1.5">Ô / hàng: {cols}</span>
            <input
              type="range"
              min={6}
              max={14}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="w-full accent-mm-red"
            />
          </div>
        </div>

        <button
          onClick={() => window.print()}
          disabled={chars.length === 0}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none mb-2"
        >
          <Printer size={18} /> In / Lưu PDF
        </button>
        {chars.length === 0 && (
          <p className="text-xs text-mm-red mb-2">Hãy nhập ít nhất một chữ Hán.</p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-6">
          <Sparkles size={13} className="text-mm-gold" />
          Mẹo: trong hộp thoại in, chọn “Lưu dưới dạng PDF” để tải file về máy.
        </div>

        {/* ─── Xem thứ tự nét (interactive, không in) ─── */}
        {uniqueChars.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-surface border border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-1.5 text-sm font-medium mb-3">
              <PenLine size={15} className="text-mm-red" />
              Xem thứ tự nét (bấm vào chữ)
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {uniqueChars.map((c) => (
                <button
                  key={c}
                  onClick={() => setPreviewChar((prev) => (prev === c ? null : c))}
                  className={cn(
                    "w-11 h-11 rounded-xl text-2xl border transition-colors",
                    previewChar === c
                      ? "bg-mm-red border-mm-red text-white"
                      : "bg-[var(--bg)] border-[rgba(255,255,255,0.08)] hover:border-mm-red"
                  )}
                  style={{ fontFamily: "'Noto Serif SC', serif" }}
                >
                  {c}
                </button>
              ))}
            </div>
            {previewChar && (
              <div className="flex justify-center pt-1">
                <HanziWriterDisplay key={previewChar} hanzi={previewChar} size={150} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Bảng luyện viết (vùng in) ─── */}
      <div className="print-sheet">
        <div className="print-only print-header">
          <span className="brand">MandoMood · Luyện viết chữ Hán</span>
          <span className="muted">Tên: ____________________  Ngày: __________</span>
        </div>

        <div className="space-y-3">
          {chars.map((char, rowIdx) => (
            <WorksheetRow
              key={`${char}-${rowIdx}`}
              char={char}
              pinyin={showPinyin ? PINYIN[char] : undefined}
              cols={cols}
              guideCount={guideCount}
            />
          ))}
        </div>
      </div>

      <WorksheetStyles />
    </div>
  );
}

// ─── Một hàng: nhãn pinyin + dãy ô 田字格 ─────────────────────────────────────
function WorksheetRow({
  char,
  pinyin,
  cols,
  guideCount,
}: {
  char: string;
  pinyin?: string;
  cols: number;
  guideCount: number;
}) {
  return (
    <div className="ws-row">
      {pinyin && <div className="ws-pinyin">{pinyin}</div>}
      <div className="ws-cells">
        {Array.from({ length: cols }).map((_, i) => {
          const isModel = i === 0; // ô mẫu đậm
          const isGuide = i > 0 && i <= guideCount; // ô mờ để đồ
          return (
            <div key={i} className="ws-cell">
              {(isModel || isGuide) && (
                <span
                  className={cn("ws-char", isGuide && "ws-char-guide")}
                  style={{ fontFamily: "'Noto Serif SC', serif" }}
                >
                  {char}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Style cho ô 田字格 + chế độ in ───────────────────────────────────────────
function WorksheetStyles() {
  return (
    <style jsx global>{`
      .print-only {
        display: none;
      }
      .ws-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ws-pinyin {
        width: 56px;
        flex: none;
        font-size: 13px;
        color: var(--text-muted);
        text-align: right;
      }
      .ws-cells {
        display: flex;
        gap: 0;
      }
      .ws-cell {
        position: relative;
        width: 48px;
        height: 48px;
        flex: none;
        border: 1px solid rgba(232, 99, 74, 0.55);
        margin-left: -1px;
        display: flex;
        align-items: center;
        justify-content: center;
        /* đường chữ thập 田字格 (gạch đứt) */
        background-image: linear-gradient(
            to right,
            transparent calc(50% - 0.5px),
            rgba(232, 99, 74, 0.32) calc(50% - 0.5px),
            rgba(232, 99, 74, 0.32) calc(50% + 0.5px),
            transparent calc(50% + 0.5px)
          ),
          linear-gradient(
            to bottom,
            transparent calc(50% - 0.5px),
            rgba(232, 99, 74, 0.32) calc(50% - 0.5px),
            rgba(232, 99, 74, 0.32) calc(50% + 0.5px),
            transparent calc(50% + 0.5px)
          );
      }
      .ws-char {
        font-size: 34px;
        line-height: 1;
        color: var(--text, #f5f5f5);
      }
      .ws-char-guide {
        color: rgba(138, 128, 120, 0.45);
      }

      /* ─── CHẾ ĐỘ IN ─── */
      @media print {
        @page {
          size: A4 portrait;
          margin: 14mm;
        }
        body {
          background: #fff !important;
        }
        .no-print,
        nav,
        header,
        footer {
          display: none !important;
        }
        .print-only {
          display: flex !important;
        }
        .print-header {
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 14px;
          padding-bottom: 6px;
          border-bottom: 1px solid #ccc;
        }
        .print-header .brand {
          font-weight: 700;
          color: #111;
          font-size: 14px;
        }
        .print-header .muted {
          color: #555;
          font-size: 12px;
        }
        .print-sheet {
          color: #111;
        }
        .ws-pinyin {
          color: #444 !important;
        }
        .ws-cell {
          border-color: #c0392b !important;
          background-image: linear-gradient(
              to right,
              transparent calc(50% - 0.5px),
              rgba(192, 57, 43, 0.4) calc(50% - 0.5px),
              rgba(192, 57, 43, 0.4) calc(50% + 0.5px),
              transparent calc(50% + 0.5px)
            ),
            linear-gradient(
              to bottom,
              transparent calc(50% - 0.5px),
              rgba(192, 57, 43, 0.4) calc(50% - 0.5px),
              rgba(192, 57, 43, 0.4) calc(50% + 0.5px),
              transparent calc(50% + 0.5px)
            );
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .ws-char {
          color: #111 !important;
        }
        .ws-char-guide {
          color: #bbb !important;
        }
      }
    `}</style>
  );
}
