"use client";

/**
 * ShareCard — tao anh dep tu quote de share mang xa hoi
 * Dung Canvas API de render thanh PNG 1080x1080
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, X, Instagram, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Quote {
  _id: string;
  chinese_text: string;
  pinyin: string;
  translation: string;
  mood: string;
  author?: string;
  cultural_note?: string;
}

interface ShareCardProps {
  quote: Quote;
}

const CARD_THEMES: Record<string, {
  bg: string;
  stops: [string, string, string];
  text: string;
  accent: string;
  emoji: string;
  label: string;
}> = {
  romantic:   { bg: "linear-gradient(135deg,#1a0a0a 0%,#2d1010 50%,#1a0808 100%)", stops: ["#1a0a0a","#2d1010","#1a0808"], text: "#FFF0EC", accent: "#E8634A", emoji: "love", label: "Lang man" },
  motivation: { bg: "linear-gradient(135deg,#0d0d00 0%,#1a1500 50%,#0d0900 100%)", stops: ["#0d0d00","#1a1500","#0d0900"], text: "#FFFCE8", accent: "#E8A838", emoji: "power", label: "Dong luc" },
  healing:    { bg: "linear-gradient(135deg,#030d04 0%,#091a0a 50%,#030d04 100%)", stops: ["#030d04","#091a0a","#030d04"], text: "#ECFFF0", accent: "#8FAF8F", emoji: "heal",  label: "Chua lanh" },
  aesthetic:  { bg: "linear-gradient(135deg,#030a1a 0%,#06102d 50%,#030a1a 100%)", stops: ["#030a1a","#06102d","#030a1a"], text: "#EEF0FF", accent: "#8A9DC9", emoji: "moon",  label: "Aesthetic" },
  sad:        { bg: "linear-gradient(135deg,#050a10 0%,#0a1520 50%,#050a10 100%)", stops: ["#050a10","#0a1520","#050a10"], text: "#EEF3FF", accent: "#6B7FA8", emoji: "rain",  label: "Buon dep" },
  funny:      { bg: "linear-gradient(135deg,#0d0800 0%,#1a1000 50%,#0d0800 100%)", stops: ["#0d0800","#1a1000","#0d0800"], text: "#FFFAE8", accent: "#E8A838", emoji: "fun",   label: "Vui ve" },
};

const MOOD_EMOJI: Record<string, string> = {
  romantic: "\u{1F495}", motivation: "⚡", healing: "\u{1F338}",
  aesthetic: "\u{1F319}", sad: "\u{1F327}️", funny: "\u{1F604}",
};

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  let current = "";
  for (const ch of text.split("")) {
    const test = current + ch;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = ch;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function wrapWords(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const test = cur ? cur + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export default function ShareCard({ quote }: ShareCardProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const theme = CARD_THEMES[quote.mood] ?? CARD_THEMES.aesthetic;
  const moodEmoji = MOOD_EMOJI[quote.mood] ?? "\u{1F319}";

  const handleCopyText = async () => {
    const text = `${quote.chinese_text}\n${quote.pinyin}\n"${quote.translation}"\n\n-- MandoMood`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const SIZE = 1080;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) { handleCopyText(); return; }

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
      grad.addColorStop(0, theme.stops[0]);
      grad.addColorStop(0.5, theme.stops[1]);
      grad.addColorStop(1, theme.stops[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SIZE, SIZE);

      const { text: textColor, accent } = theme;
      const PAD = 90;

      // Top brand
      ctx.textAlign = "left";
      ctx.font = "bold 44px sans-serif";
      ctx.fillStyle = accent;
      ctx.fillText("MandoMood", PAD, 110);
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(PAD, 128);
      ctx.lineTo(PAD + 260, 128);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Chinese text
      ctx.textAlign = "center";
      const hanziSize = quote.chinese_text.length <= 10 ? 96 : 72;
      ctx.font = `bold ${hanziSize}px serif`;
      ctx.fillStyle = textColor;
      const hanziLines = wrapCanvasText(ctx, quote.chinese_text, SIZE - PAD * 2);
      const hanziLH = hanziSize + 24;
      const hanziBlockH = hanziLines.length * hanziLH;
      const hanziStartY = SIZE / 2 - hanziBlockH / 2 - 80;
      hanziLines.forEach((line, i) => {
        ctx.fillText(line, SIZE / 2, hanziStartY + i * hanziLH);
      });

      // Pinyin
      ctx.font = "32px sans-serif";
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.5;
      const pinyinY = hanziStartY + hanziBlockH + 40;
      ctx.fillText(quote.pinyin, SIZE / 2, pinyinY);
      ctx.globalAlpha = 1;

      // Divider
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 2;
      const divY = pinyinY + 52;
      ctx.beginPath();
      ctx.moveTo(SIZE / 2 - 70, divY);
      ctx.lineTo(SIZE / 2 + 70, divY);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Translation
      ctx.font = "italic 36px serif";
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.78;
      const transLines = wrapWords(ctx, `"${quote.translation}"`, SIZE - PAD * 2.5);
      transLines.forEach((tl, i) => {
        ctx.fillText(tl, SIZE / 2, divY + 60 + i * 52);
      });
      ctx.globalAlpha = 1;

      // Bottom branding
      ctx.textAlign = "center";
      ctx.font = "30px sans-serif";
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.3;
      ctx.fillText("mandomood.com", SIZE / 2, SIZE - 80);
      ctx.globalAlpha = 1;

      // Download
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `mandomood-${quote._id}.png`;
      a.click();
    } catch {
      handleCopyText();
    }
  };

  const handleNativeShare = async () => {
    const text = `${quote.chinese_text}\n${quote.pinyin}\n"${quote.translation}"\n\nHoc tieng Trung cung MandoMood`;
    if (navigator.share) {
      try {
        await navigator.share({ text, title: "MandoMood" });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] text-[#8A8078] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all text-xs"
      >
        <Share2 size={13} />
        Share
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D0D] rounded-t-3xl border-t border-[rgba(255,255,255,0.08)] px-4 pb-10 pt-5 max-w-lg mx-auto"
            >
              <div className="w-10 h-1 bg-[#242424] rounded-full mx-auto mb-5" />

              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-5 w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#8A8078] hover:text-white"
              >
                <X size={15} />
              </button>

              <p className="text-sm font-semibold text-center mb-4">Chia se cau nay</p>

              <div
                className="w-full aspect-square rounded-2xl overflow-hidden relative mb-5"
                style={{ background: theme.bg }}
              >
                <div className="absolute inset-0 opacity-[0.12] bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PScwIDAgMjAwIDIwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZmlsdGVyIGlkPSduJz48ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC44NScgbnVtT2N0YXZlcz0nNCcgc3RpdGNoVGlsZXM9J3N0aXRjaCcvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbHRlcj0ndXJsKCNuKScgb3BhY2l0eT0nMC4wOCcvPjwvc3ZnPg==')]" />

                <div className="relative z-10 flex flex-col h-full px-8 py-8 justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{moodEmoji}</span>
                    <span
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: theme.accent }}
                    >
                      MandoMood
                    </span>
                  </div>

                  <div className="text-center">
                    <p
                      className="font-noto leading-relaxed mb-3"
                      style={{ color: theme.text, fontSize: "clamp(18px,5vw,28px)" }}
                    >
                      {quote.chinese_text}
                    </p>
                    <p className="text-xs mb-4 opacity-60" style={{ color: theme.text }}>
                      {quote.pinyin}
                    </p>
                    <div
                      className="w-12 h-px mx-auto mb-4 opacity-30"
                      style={{ background: theme.accent }}
                    />
                    <p
                      className="text-sm leading-relaxed italic opacity-80"
                      style={{ color: theme.text }}
                    >
                      &ldquo;{quote.translation}&rdquo;
                    </p>
                    {quote.author && (
                      <p className="text-xs mt-2 opacity-50" style={{ color: theme.text }}>
                        &mdash; {quote.author}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm">&#x1F43C;</span>
                    <span className="text-xs opacity-40" style={{ color: theme.text }}>
                      mandomood.com
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleNativeShare}
                  className={cn(
                    "flex flex-col items-center gap-2 py-3.5 rounded-2xl",
                    "bg-[#E8634A] text-white hover:bg-[#d4532a] active:scale-95 transition-all"
                  )}
                >
                  <Share2 size={18} />
                  <span className="text-xs font-medium">Chia se</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex flex-col items-center gap-2 py-3.5 rounded-2xl bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] text-[#F5F0EB] hover:border-[rgba(255,255,255,0.2)] active:scale-95 transition-all"
                >
                  <Download size={18} />
                  <span className="text-xs font-medium">Tai anh</span>
                </button>

                <button
                  onClick={handleCopyText}
                  className="flex flex-col items-center gap-2 py-3.5 rounded-2xl bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] text-[#F5F0EB] hover:border-[rgba(255,255,255,0.2)] active:scale-95 transition-all"
                >
                  {copied ? (
                    <Check size={18} className="text-green-400" />
                  ) : (
                    <Copy size={18} />
                  )}
                  <span className="text-xs font-medium">
                    {copied ? "Da copy!" : "Copy text"}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-4">
                <Instagram size={12} className="text-[#8A8078]" />
                <span className="text-[10px] text-[#8A8078]">
                  Tai anh va dang Instagram/TikTok voi hashtag #MandoMood
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
