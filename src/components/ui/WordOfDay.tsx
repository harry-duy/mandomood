"use client";

/**
 * WordOfDay — "Chữ nổi bật hôm nay"
 * Deterministic theo ngày, inspired by nhaikanji.com approach
 */

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { playTTS } from "@/hooks/useTTS";
import { Volume2, ChevronRight } from "lucide-react";

const FEATURED_CHARS = [
  { hanzi: "爱", pinyin: "ài", meaning: "Tình yêu", tone: 4, hook: "Chữ có 心 (trái tim) ở trung tâm" },
  { hanzi: "心", pinyin: "xīn", meaning: "Trái tim · tâm", tone: 1, hook: "Bộ thủ của 100+ từ cảm xúc tiếng Trung" },
  { hanzi: "缘", pinyin: "yuán", meaning: "Duyên phận", tone: 2, hook: "Sợi chỉ đỏ vô hình kết nối người có duyên" },
  { hanzi: "静", pinyin: "jìng", meaning: "Bình yên · tĩnh lặng", tone: 4, hook: "Tâm trạng khi mọi thứ đều đúng chỗ" },
  { hanzi: "梦", pinyin: "mèng", meaning: "Giấc mơ", tone: 4, hook: "Ước mơ và giấc ngủ dùng cùng 1 chữ" },
  { hanzi: "情", pinyin: "qíng", meaning: "Tình cảm · cảm xúc", tone: 2, hook: "Nền tảng của mọi mối quan hệ" },
  { hanzi: "思", pinyin: "sī", meaning: "Nỗi nhớ · suy nghĩ", tone: 1, hook: "Quê hương (田) trong tim (心) — nỗi nhớ" },
  { hanzi: "忍", pinyin: "rěn", meaning: "Nhẫn nại · chịu đựng", tone: 3, hook: "Dao (刃) đặt trên tim — nhẫn nhịn đau" },
  { hanzi: "勇", pinyin: "yǒng", meaning: "Can đảm · dũng cảm", tone: 3, hook: "Sức mạnh được kênh đúng hướng" },
  { hanzi: "福", pinyin: "fú", meaning: "Phúc lộc · hạnh phúc", tone: 2, hook: "Chữ dán ngược cửa ngày Tết" },
  { hanzi: "泪", pinyin: "lèi", meaning: "Nước mắt", tone: 4, hook: "Nước (氵) từ mắt (目) — thơ nhất tiếng Trung" },
  { hanzi: "笑", pinyin: "xiào", meaning: "Cười · nụ cười", tone: 4, hook: "Tre (竹) nghiêng mình = hình người đang cười" },
  { hanzi: "念", pinyin: "niàn", meaning: "Nhớ nhung · nghĩ đến", tone: 4, hook: "Bây giờ (今) trong tim (心) — nỗi nhớ hiện tại" },
  { hanzi: "悟", pinyin: "wù", meaning: "Giác ngộ · chợt hiểu", tone: 4, hook: "Khoảnh khắc mọi thứ bỗng có nghĩa" },
  { hanzi: "惜", pinyin: "xī", meaning: "Tiếc thương · trân trọng", tone: 1, hook: "Trái tim (忄) nhìn về quá khứ — tiếc mãi" },
  { hanzi: "暖", pinyin: "nuǎn", meaning: "Ấm áp", tone: 3, hook: "暖男 — người đàn ông lý tưởng của Gen Z TQ" },
  { hanzi: "望", pinyin: "wàng", meaning: "Trông mong · hi vọng", tone: 4, hook: "Đứng nhìn xa — mong chờ từ xa" },
  { hanzi: "别", pinyin: "bié", meaning: "Chia tay · đừng", tone: 2, hook: "Dao (刀) cắt đôi — hai người mỗi người một đường" },
  { hanzi: "痛", pinyin: "tòng", meaning: "Đau · đau lòng", tone: 4, hook: "心痛 — đau lòng có từ riêng trong tiếng Trung" },
  { hanzi: "归", pinyin: "guī", meaning: "Trở về · về nhà", tone: 1, hook: "落叶归根 — lá rụng về cội" },
  { hanzi: "孤", pinyin: "gū", meaning: "Cô đơn · một mình", tone: 1, hook: "Đứa trẻ (子) đơn độc như trái bí trên đồng" },
  { hanzi: "哭", pinyin: "kū", meaning: "Khóc", tone: 1, hook: "Miệng (口) phát ra tiếng như chó (犬) sủa" },
  { hanzi: "寂", pinyin: "jì", meaning: "Cô tịch · vắng lặng", tone: 4, hook: "Loại cô đơn yên tĩnh của 3 giờ sáng" },
  { hanzi: "真", pinyin: "zhēn", meaning: "Chân thật · thật", tone: 1, hook: "我是认真的 — tôi nghiêm túc đó" },
  { hanzi: "陪", pinyin: "péi", meaning: "Đồng hành · ở bên", tone: 2, hook: "陪你左右 — ở bên trái phải bạn" },
  { hanzi: "美", pinyin: "měi", meaning: "Vẻ đẹp · đẹp", tone: 3, hook: "内心美 — đẹp từ bên trong mới là 美" },
  { hanzi: "散", pinyin: "sàn", meaning: "Tan biến · rời đi", tone: 4, hook: "散了 — hai chữ kết thúc một câu chuyện yêu" },
  { hanzi: "盼", pinyin: "pàn", meaning: "Mong chờ · trông đợi", tone: 4, hook: "Đôi mắt (目) dõi theo từng hướng khi chờ" },
];

const TONE_COLOR: Record<number, string> = {
  1: "#7AB8D4", 2: "#8FAF8F", 3: "#D4AF37", 4: "#E8504A",
};

function dateSeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export default function WordOfDay() {
  const router = useRouter();
  const idx = dateSeed() % FEATURED_CHARS.length;
  const char = FEATURED_CHARS[idx];
  const color = TONE_COLOR[char.tone] ?? "#D4AF37";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      onClick={() => router.push(`/character/${encodeURIComponent(char.hanzi)}`)}
      className="card cursor-pointer hover:border-[rgba(255,255,255,0.12)] transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
          ✨ Chữ nổi bật hôm nay
        </p>
        <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-white transition-colors" />
      </div>

      <div className="flex items-center gap-5">
        {/* Big hanzi */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 text-5xl font-chinese font-bold"
          style={{ background: `${color}12`, color, border: `1.5px solid ${color}30` }}
        >
          {char.hanzi}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold" style={{ color }}>{char.pinyin}</span>
            <button
              onClick={(e) => { e.stopPropagation(); void playTTS(char.hanzi); }}
              className="p-1 rounded-full hover:bg-[rgba(255,255,255,0.08)] transition-colors"
            >
              <Volume2 size={13} className="text-[var(--text-muted)]" />
            </button>
          </div>
          <p className="text-sm text-[#F5F0EB] font-semibold mb-1">{char.meaning}</p>
          <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">{char.hook}</p>
        </div>
      </div>
    </motion.div>
  );
}
