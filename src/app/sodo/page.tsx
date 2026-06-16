/**
 * /sodo — Sơ đồ chữ Hán (Character Mind Map)
 * Visual map nhóm chữ theo bộ thủ, thấy mối liên hệ trực quan
 * Cảm hứng từ nhaikanji.com "Sơ đồ" feature
 */
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Volume2, ArrowRight, X } from "lucide-react";
import { playTTS } from "@/hooks/useTTS";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useProgress } from "@/hooks/useProgress";

interface CharNode {
  hanzi: string;
  pinyin: string;
  meaning: string;
  hsk: number;
  note?: string;
}

interface RadicalFamily {
  radical: string;
  radical_pinyin: string;
  radical_meaning: string;
  radical_note: string;
  color: string;  // tailwind gradient class
  border: string;
  children: CharNode[];
}

const RADICAL_FAMILIES: RadicalFamily[] = [
  {
    radical: "心 / 忄",
    radical_pinyin: "xīn",
    radical_meaning: "Tim, tâm hồn",
    radical_note: "Bộ 心 xuất hiện trong hầu hết chữ liên quan đến cảm xúc. Khi viết bên trái = 忄 (3 nét).",
    color: "from-red-500/25 to-pink-500/10",
    border: "border-red-500/30",
    children: [
      { hanzi: "爱", pinyin: "ài", meaning: "Yêu thương", hsk: 1, note: "Phồn thể 愛 có 心 ở giữa — yêu thật phải có tâm" },
      { hanzi: "情", pinyin: "qíng", meaning: "Tình cảm", hsk: 2 },
      { hanzi: "思", pinyin: "sī", meaning: "Nhớ nhung, suy nghĩ", hsk: 3, note: "田(não) + 心(tim) = nhớ cần cả lý trí lẫn con tim" },
      { hanzi: "忘", pinyin: "wàng", meaning: "Quên", hsk: 3, note: "亡(mất) + 心 = để tim quên đi" },
      { hanzi: "想", pinyin: "xiǎng", meaning: "Muốn, nhớ, nghĩ", hsk: 1 },
      { hanzi: "感", pinyin: "gǎn", meaning: "Cảm nhận", hsk: 3 },
      { hanzi: "恨", pinyin: "hèn", meaning: "Oán hận", hsk: 5 },
      { hanzi: "恋", pinyin: "liàn", meaning: "Yêu, quyến luyến", hsk: 5, note: "Tình yêu luyến ái — sâu hơn 爱" },
      { hanzi: "慢", pinyin: "màn", meaning: "Chậm", hsk: 2 },
      { hanzi: "惜", pinyin: "xī", meaning: "Tiếc, trân trọng", hsk: 5 },
    ],
  },
  {
    radical: "氵 / 水",
    radical_pinyin: "shuǐ",
    radical_meaning: "Nước",
    radical_note: "氵 (3 chấm nước) là bộ thủ phổ biến nhất. Chữ có 氵 thường liên quan đến nước, chất lỏng, hoặc đặc tính của nước.",
    color: "from-blue-500/25 to-sky-500/10",
    border: "border-blue-500/30",
    children: [
      { hanzi: "泪", pinyin: "lèi", meaning: "Nước mắt", hsk: 4, note: "目(mắt) + 氵 = nước từ mắt" },
      { hanzi: "海", pinyin: "hǎi", meaning: "Biển", hsk: 1 },
      { hanzi: "河", pinyin: "hé", meaning: "Sông", hsk: 2 },
      { hanzi: "泡", pinyin: "pào", meaning: "Bong bóng, ngâm", hsk: 4 },
      { hanzi: "流", pinyin: "liú", meaning: "Chảy, dòng", hsk: 3 },
      { hanzi: "深", pinyin: "shēn", meaning: "Sâu", hsk: 3, note: "Nghĩa bóng: tình cảm sâu sắc" },
      { hanzi: "温", pinyin: "wēn", meaning: "Ấm", hsk: 3 },
      { hanzi: "清", pinyin: "qīng", meaning: "Trong sạch", hsk: 3 },
      { hanzi: "湿", pinyin: "shī", meaning: "Ướt", hsk: 4 },
    ],
  },
  {
    radical: "日",
    radical_pinyin: "rì",
    radical_meaning: "Mặt trời, ngày",
    radical_note: "Bộ 日 liên quan đến mặt trời, ánh sáng, và thời gian. Nhiều chữ chỉ trạng thái ánh sáng, thời điểm trong ngày.",
    color: "from-amber-500/25 to-yellow-500/10",
    border: "border-amber-500/30",
    children: [
      { hanzi: "明", pinyin: "míng", meaning: "Sáng, rõ ràng", hsk: 2, note: "日(mặt trời) + 月(mặt trăng) = rực sáng" },
      { hanzi: "晴", pinyin: "qíng", meaning: "Trời quang", hsk: 3 },
      { hanzi: "暖", pinyin: "nuǎn", meaning: "Ấm áp", hsk: 3, note: "Mặt trời + dần dần = ấm từ từ" },
      { hanzi: "暗", pinyin: "àn", meaning: "Tối, tăm", hsk: 4 },
      { hanzi: "时", pinyin: "shí", meaning: "Thời gian, giờ", hsk: 1 },
      { hanzi: "早", pinyin: "zǎo", meaning: "Sáng sớm", hsk: 1 },
      { hanzi: "晚", pinyin: "wǎn", meaning: "Tối, muộn", hsk: 1 },
      { hanzi: "春", pinyin: "chūn", meaning: "Mùa xuân", hsk: 3 },
      { hanzi: "昨", pinyin: "zuó", meaning: "Hôm qua", hsk: 2 },
    ],
  },
  {
    radical: "口",
    radical_pinyin: "kǒu",
    radical_meaning: "Miệng",
    radical_note: "Bộ 口 xuất hiện trong chữ liên quan đến miệng, nói, ăn uống, âm thanh. Đây là một trong những bộ thủ phổ biến nhất.",
    color: "from-emerald-500/25 to-teal-500/10",
    border: "border-emerald-500/30",
    children: [
      { hanzi: "吃", pinyin: "chī", meaning: "Ăn", hsk: 1 },
      { hanzi: "喝", pinyin: "hē", meaning: "Uống", hsk: 1 },
      { hanzi: "说", pinyin: "shuō", meaning: "Nói", hsk: 1 },
      { hanzi: "唱", pinyin: "chàng", meaning: "Hát", hsk: 2 },
      { hanzi: "叫", pinyin: "jiào", meaning: "Gọi, kêu", hsk: 1 },
      { hanzi: "问", pinyin: "wèn", meaning: "Hỏi", hsk: 1 },
      { hanzi: "哭", pinyin: "kū", meaning: "Khóc", hsk: 3 },
      { hanzi: "笑", pinyin: "xiào", meaning: "Cười", hsk: 2 },
      { hanzi: "喜", pinyin: "xǐ", meaning: "Vui, thích", hsk: 1 },
    ],
  },
  {
    radical: "人 / 亻",
    radical_pinyin: "rén",
    radical_meaning: "Con người",
    radical_note: "亻(người đứng bên trái) là một trong những bộ thủ quan trọng nhất — liên quan đến con người, hành động, tính cách.",
    color: "from-purple-500/25 to-violet-500/10",
    border: "border-purple-500/30",
    children: [
      { hanzi: "你", pinyin: "nǐ", meaning: "Bạn", hsk: 1 },
      { hanzi: "他", pinyin: "tā", meaning: "Anh ấy", hsk: 1 },
      { hanzi: "们", pinyin: "men", meaning: "Số nhiều (hậu tố)", hsk: 1 },
      { hanzi: "做", pinyin: "zuò", meaning: "Làm", hsk: 1 },
      { hanzi: "住", pinyin: "zhù", meaning: "Sống, ở", hsk: 1 },
      { hanzi: "休", pinyin: "xiū", meaning: "Nghỉ ngơi", hsk: 2, note: "人(người) + 木(cây) = người tựa cây nghỉ" },
      { hanzi: "伴", pinyin: "bàn", meaning: "Bạn đồng hành", hsk: 4 },
      { hanzi: "陪", pinyin: "péi", meaning: "Ở bên, đồng hành", hsk: 3 },
      { hanzi: "信", pinyin: "xìn", meaning: "Tin tưởng, thư", hsk: 3, note: "人 + 言 = người nói = đáng tin" },
    ],
  },
  {
    radical: "言 / 讠",
    radical_pinyin: "yán",
    radical_meaning: "Lời nói, ngôn ngữ",
    radical_note: "讠(bộ ngôn bên trái) liên quan đến ngôn ngữ, lời nói, giao tiếp. 言 là dạng đứng, 讠 là dạng bên trái.",
    color: "from-orange-500/25 to-red-500/10",
    border: "border-orange-500/30",
    children: [
      { hanzi: "说", pinyin: "shuō", meaning: "Nói", hsk: 1 },
      { hanzi: "话", pinyin: "huà", meaning: "Lời nói", hsk: 1 },
      { hanzi: "语", pinyin: "yǔ", meaning: "Ngôn ngữ", hsk: 1 },
      { hanzi: "请", pinyin: "qǐng", meaning: "Mời, xin", hsk: 1 },
      { hanzi: "谢", pinyin: "xiè", meaning: "Cảm ơn", hsk: 1 },
      { hanzi: "认", pinyin: "rèn", meaning: "Nhận ra, thừa nhận", hsk: 2 },
      { hanzi: "读", pinyin: "dú", meaning: "Đọc", hsk: 2 },
      { hanzi: "诗", pinyin: "shī", meaning: "Thơ", hsk: 4, note: "言 + 寺 = lời như tiếng chuông chùa" },
      { hanzi: "误", pinyin: "wù", meaning: "Nhầm lẫn", hsk: 4 },
    ],
  },
  {
    radical: "纟 / 糸",
    radical_pinyin: "sī",
    radical_meaning: "Tơ lụa, sợi chỉ",
    radical_note: "Bộ 纟 liên quan đến vải vóc, sợi chỉ, mối liên kết. Nhiều chữ mang nghĩa trừu tượng về 'sự kết nối'.",
    color: "from-pink-500/25 to-rose-500/10",
    border: "border-pink-500/30",
    children: [
      { hanzi: "缘", pinyin: "yuán", meaning: "Duyên phận", hsk: 4, note: "Duyên như sợi tơ vô hình nối hai người" },
      { hanzi: "红", pinyin: "hóng", meaning: "Đỏ", hsk: 1, note: "Màu đỏ = màu của lụa quý" },
      { hanzi: "结", pinyin: "jié", meaning: "Kết, buộc", hsk: 3 },
      { hanzi: "经", pinyin: "jīng", meaning: "Kinh, trải qua", hsk: 2 },
      { hanzi: "绿", pinyin: "lǜ", meaning: "Xanh lá", hsk: 2 },
      { hanzi: "终", pinyin: "zhōng", meaning: "Kết thúc, cuối cùng", hsk: 3 },
      { hanzi: "续", pinyin: "xù", meaning: "Tiếp tục", hsk: 4 },
      { hanzi: "纯", pinyin: "chún", meaning: "Thuần túy, trong sạch", hsk: 4 },
    ],
  },
];

interface SelectedChar {
  char: CharNode;
  family: RadicalFamily;
}

export default function SodoPage() {
  const { awardXP } = useProgress();
  const awardedSet = useRef(new Set<string>());
  const [selectedFamily, setSelectedFamily] = useState<RadicalFamily | null>(null);
  const [selectedChar, setSelectedChar] = useState<SelectedChar | null>(null);
  const router = useRouter();

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Network size={18} className="text-mm-red" />
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Sơ đồ chữ Hán</p>
        </div>
        <h1 className="font-playfair text-2xl font-bold">Gia phả chữ Hán 🗺️</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Mỗi bộ thủ là một &apos;gia đình&apos; chữ — học 1 bộ, hiểu hàng chục chữ
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-surface rounded-2xl p-3 text-center border border-[rgba(255,255,255,0.06)]">
          <p className="text-xl font-bold text-mm-red">{RADICAL_FAMILIES.length}</p>
          <p className="text-xs text-[var(--text-muted)]">Bộ thủ</p>
        </div>
        <div className="bg-surface rounded-2xl p-3 text-center border border-[rgba(255,255,255,0.06)]">
          <p className="text-xl font-bold text-mm-gold">{RADICAL_FAMILIES.reduce((a, f) => a + f.children.length, 0)}</p>
          <p className="text-xs text-[var(--text-muted)]">Chữ Hán</p>
        </div>
        <div className="bg-surface rounded-2xl p-3 text-center border border-[rgba(255,255,255,0.06)]">
          <p className="text-xl font-bold text-emerald-400">HSK1-5</p>
          <p className="text-xs text-[var(--text-muted)]">Cấp độ</p>
        </div>
      </div>

      {/* Radical families grid */}
      <div className="space-y-3">
        {RADICAL_FAMILIES.map((family, fi) => {
          const isOpen = selectedFamily?.radical === family.radical;
          return (
            <motion.div
              key={family.radical}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: fi * 0.06 }}
              className={cn("rounded-3xl border overflow-hidden", family.border)}
            >
              {/* Family header */}
              <button
                onClick={() => setSelectedFamily(isOpen ? null : family)}
                className={cn("w-full flex items-center gap-4 p-4 text-left bg-gradient-to-r transition-all", family.color)}
              >
                {/* Radical big */}
                <div className="w-14 h-14 rounded-2xl bg-black/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-noto text-2xl leading-none">{family.radical}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold">{family.radical_meaning}</span>
                    <span className="text-xs text-[var(--text-muted)]">· {family.radical_pinyin}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{family.children.length} chữ trong gia đình này</p>
                  {/* Mini preview */}
                  <div className="flex gap-1 mt-1.5">
                    {family.children.slice(0, 6).map(c => (
                      <span key={c.hanzi} className="font-noto text-sm opacity-70">{c.hanzi}</span>
                    ))}
                    {family.children.length > 6 && <span className="text-xs text-[var(--text-muted)]">+{family.children.length - 6}</span>}
                  </div>
                </div>
                <span className={cn("text-[var(--text-muted)] transition-transform duration-300 text-lg", isOpen && "rotate-90")}>›</span>
              </button>

              {/* Expanded: radical note + children */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-[rgba(255,255,255,0.06)]"
                  >
                    <div className="p-4 space-y-4 bg-surface">
                      {/* Radical note */}
                      <div className="bg-surface2 rounded-2xl p-3">
                        <p className="text-xs text-[var(--text-muted)] mb-1">📖 Về bộ thủ này</p>
                        <p className="text-sm leading-relaxed">{family.radical_note}</p>
                      </div>

                      {/* Children grid — visual map */}
                      <div>
                        <p className="text-xs text-[var(--text-muted)] mb-3 uppercase tracking-wider">Gia đình chữ Hán</p>
                        <div className="grid grid-cols-3 gap-2">
                          {family.children.map((char) => (
                            <button
                              key={char.hanzi}
                              onClick={() => {
                                setSelectedChar({ char, family });
                                if (!awardedSet.current.has(char.hanzi)) {
                                  awardedSet.current.add(char.hanzi);
                                  awardXP(2, "sodo_explore");
                                }
                              }}
                              className={cn(
                                "flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all active:scale-95",
                                "bg-surface2 border-[rgba(255,255,255,0.06)] hover:border-mm-red/30"
                              )}
                            >
                              <span className="font-noto text-2xl">{char.hanzi}</span>
                              <span className="text-xs text-mm-gold">{char.pinyin}</span>
                              <span className="text-xs text-[var(--text-muted)] text-center leading-tight line-clamp-1">{char.meaning}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-surface text-[var(--text-muted)]">HSK{char.hsk}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Character detail modal */}
      <AnimatePresence>
        {selectedChar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end px-4 pb-6"
            onClick={() => setSelectedChar(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg mx-auto bg-surface rounded-3xl border border-[rgba(255,255,255,0.1)] p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="font-noto text-5xl">{selectedChar.char.hanzi}</span>
                  <div>
                    <p className="text-xl font-semibold text-mm-gold">{selectedChar.char.pinyin}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{selectedChar.char.meaning}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface2 text-[var(--text-muted)]">HSK{selectedChar.char.hsk}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedChar(null)} className="p-2 rounded-full bg-surface2">
                  <X size={16} />
                </button>
              </div>

              {/* Radical connection */}
              <div className={cn("rounded-2xl p-3 mb-4 bg-gradient-to-r border", selectedChar.family.color, selectedChar.family.border)}>
                <p className="text-xs text-[var(--text-muted)] mb-1">Thuộc bộ thủ</p>
                <div className="flex items-center gap-2">
                  <span className="font-noto text-2xl">{selectedChar.family.radical}</span>
                  <ArrowRight size={14} className="text-[var(--text-muted)]" />
                  <span className="text-sm font-medium">{selectedChar.family.radical_meaning}</span>
                </div>
              </div>

              {selectedChar.char.note && (
                <div className="bg-mm-gold/10 border border-mm-gold/20 rounded-2xl p-3 mb-4">
                  <p className="text-xs text-mm-gold mb-1">✨ Câu chuyện nhớ chữ</p>
                  <p className="text-sm">{selectedChar.char.note}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => playTTS(selectedChar.char.hanzi)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface2 text-sm"
                >
                  <Volume2 size={15} /> Nghe phát âm
                </button>
                <button
                  onClick={() => { setSelectedChar(null); router.push(`/character/${selectedChar.char.hanzi}`); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-mm-red text-white text-sm font-semibold"
                >
                  Học sâu hơn →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
