"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Sparkles, BookOpen, Users, Zap, Star } from "lucide-react";

const PILLARS = [
  {
    icon: <Heart size={20} className="text-mm-red" />,
    title: "Học qua cảm xúc",
    desc: "Não bộ ghi nhớ tốt nhất khi có cảm xúc đi kèm. Mỗi câu tiếng Trung trong MandoMood đều gắn với một cảm xúc thật — nhớ cảm xúc là nhớ câu.",
  },
  {
    icon: <BookOpen size={20} className="text-blue-400" />,
    title: "Câu chuyện, không bài tập",
    desc: "Không flashcard cứng nhắc, không fill-in-the-blank vô hồn. Mỗi bài học là một câu chuyện mini — một khoảnh khắc đời thực bằng tiếng Trung.",
  },
  {
    icon: <Sparkles size={20} className="text-mm-gold" />,
    title: "AI cá nhân hóa",
    desc: "AI hiểu mood của bạn hôm nay — đang buồn, đang hừng hực hay chỉ muốn aesthetic — và tạo nội dung phù hợp đúng lúc.",
  },
  {
    icon: <Users size={20} className="text-green-400" />,
    title: "Cộng đồng Gen Z",
    desc: "Học cùng người đồng hành, chia sẻ câu hay, thi xem ai giữ chuỗi lâu hơn. Học ngôn ngữ tốt nhất khi có cộng đồng.",
  },
];

const STATS = [
  { value: "28+", label: "Chữ Hán với câu chuyện cảm xúc" },
  { value: "12+", label: "Bài học theo mood" },
  { value: "6", label: "AI Tutor personas" },
  { value: "HSK 1-6", label: "Lộ trình học đầy đủ" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen pb-28 bg-[var(--bg-primary)]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-mm-red/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-lg mx-auto px-4 pt-12 pb-8 text-center relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-6xl mb-4"
          >
            🌸
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl font-bold mb-3"
          >
            MandoMood
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-muted)] text-base leading-relaxed"
          >
            Cách học tiếng Trung cảm xúc nhất thế giới.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-mm-red text-sm font-medium mt-2 italic"
          >
            &ldquo;The most emotional way to learn Chinese.&rdquo;
          </motion.p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-8">

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-5 bg-[var(--bg-card)] border border-[rgba(255,255,255,0.06)]"
        >
          <h2 className="font-display text-lg font-bold mb-3">Tại sao lại có MandoMood?</h2>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-3">
            Duolingo nhắc bạn học mỗi ngày nhưng bạn vẫn không nhớ. HelloChinese cho bài tập nhưng bạn vẫn không cảm. Vấn đề không phải là bạn lười — mà là cách học chưa chạm đến cảm xúc.
          </p>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-3">
            Nghiên cứu khoa học thần kinh cho thấy: <span className="text-[var(--text-primary)]">não bộ ghi nhớ những gì gắn với cảm xúc mạnh hơn gấp 10 lần</span> so với thông tin trung tính. Vậy tại sao không học ngôn ngữ qua câu chuyện, qua rung động, qua những khoảnh khắc đời thực?
          </p>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            MandoMood sinh ra từ câu hỏi đó. Mỗi câu tiếng Trung ở đây đều có hồn — có câu chuyện, có cảm xúc, có văn hóa đằng sau. Học xong bạn không chỉ nhớ từ, bạn nhớ cả cảm giác.
          </p>
        </motion.div>

        {/* 4 pillars */}
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Triết lý học tập</p>
          {PILLARS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              className="flex gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[rgba(255,255,255,0.06)]"
            >
              <div className="mt-0.5 shrink-0">{p.icon}</div>
              <div>
                <p className="font-semibold text-sm mb-1">{p.title}</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-3"
        >
          {STATS.map((s, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[rgba(255,255,255,0.06)] text-center">
              <p className="text-2xl font-bold text-mm-red">{s.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-snug">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Inspiration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl p-5 bg-gradient-to-br from-mm-red/10 to-purple-500/10 border border-mm-red/20"
        >
          <div className="flex items-start gap-3">
            <Star size={18} className="text-mm-gold mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold mb-1">Lấy cảm hứng từ</p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Nhaikanji.com — học kanji qua câu chuyện. Pinterest — học qua hình ảnh cảm xúc. TikTok — viral vì chạm vào cảm xúc thật. Duolingo — gamification giữ thói quen.
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                MandoMood kết hợp tất cả — nhưng cho tiếng Trung, cho Gen Z Việt Nam.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center space-y-3 pb-4"
        >
          <p className="text-[var(--text-muted)] text-sm">Sẵn sàng bắt đầu hành trình?</p>
          <Link href="/feed">
            <button className="w-full py-3.5 bg-mm-red text-white rounded-2xl font-semibold hover:bg-mm-red/90 transition-colors flex items-center justify-center gap-2">
              <Zap size={16} />
              Bắt đầu học ngay — miễn phí
            </button>
          </Link>
          <Link href="/characters">
            <button className="w-full py-3 bg-[var(--bg-card)] text-[var(--text-muted)] rounded-2xl text-sm border border-[rgba(255,255,255,0.06)] hover:text-white transition-colors">
              Khám phá bộ sưu tập chữ Hán →
            </button>
          </Link>
          <Link
            href="/mandomood-vs-duolingo"
            className="block text-center text-xs text-[var(--text-muted)] hover:text-mm-red transition-colors pt-1"
          >
            MandoMood khác Duolingo thế nào? →
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
