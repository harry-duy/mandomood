"use client";

import { useEffect, useState } from "react";
import { useTTS } from "@/hooks/useTTS";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Volume2, Eye, EyeOff,
  BookOpen, Lightbulb, Globe, CheckCircle2
} from "lucide-react";
import { VocabList } from "@/components/ui/VocabCard";
import MiniQuiz from "@/components/ui/MiniQuiz";
import XPToast, { useXPToast } from "@/components/ui/XPToast";
import { LessonDetailSkeleton } from "@/components/ui/LoadingSkeleton";
import { useAppStore } from "@/store/useAppStore";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import { MOOD_COLORS, MOOD_EMOJI, MOOD_LABEL, LEVEL_LABEL } from "@/lib/utils";
import { toast } from "sonner";

interface VocabItem {
  hanzi: string;
  pinyin: string;
  meaning: string;
  example?: string;
}

interface Lesson {
  _id: string;
  title: string;
  content_type: string;
  level: string;
  mood: string;
  chinese_text: string;
  pinyin: string;
  translation: string;
  vocabulary: VocabItem[];
  grammar_notes?: string;
  cultural_note?: string;
  audio_url?: string;
}

// Demo data — sẽ thay bằng API fetch sau
const DEMO_LESSONS: Record<string, Lesson> = {
  l1: {
    _id: "l1",
    title: "Cuộc gọi lúc nửa đêm",
    content_type: "story",
    mood: "romantic",
    level: "hsk2",
    chinese_text: "你睡了吗？\n我只是想听听你的声音。\n今天过得怎么样？\n还不错，就是有点想你。",
    pinyin: "Nǐ shuì le ma?\nWǒ zhǐshì xiǎng tīng tīng nǐ de shēngyīn.\nJīntiān guò de zěnmeyàng?\nHái bùcuò, jiùshì yǒudiǎn xiǎng nǐ.",
    translation:
      "Em ngủ chưa?\nAnh chỉ muốn nghe giọng em thôi.\nHôm nay của em thế nào?\nKhá ổn, chỉ là nhớ anh một chút.",
    vocabulary: [
      { hanzi: "睡", pinyin: "shuì", meaning: "ngủ", example: "你睡了吗？" },
      { hanzi: "声音", pinyin: "shēngyīn", meaning: "giọng nói, âm thanh", example: "好听的声音" },
      { hanzi: "过", pinyin: "guò", meaning: "trải qua, sống qua", example: "过得怎么样？" },
      { hanzi: "想", pinyin: "xiǎng", meaning: "nhớ, muốn, nghĩ", example: "我想你了" },
    ],
    grammar_notes:
      "• 怎么样 (zěnmeyàng) — hỏi về tình trạng/cảm nghĩ. Dùng sau động từ 过 để hỏi về trải nghiệm.\n• 就是 (jiùshì) — \"chỉ là, nhưng mà\". Dùng để thêm một điều nhỏ vào câu trước.\n• 有点 (yǒudiǎn) — \"một chút, hơi\". Dùng trước tính từ/động từ.",
    cultural_note:
      "Người Trung Quốc thường thể hiện tình cảm qua hành động và câu nói gián tiếp hơn là nói thẳng \"Anh yêu em\" (我爱你). Câu \"就是有点想你\" (chỉ là nhớ anh/em một chút) là cách nói rất đặc trưng — nhẹ nhàng nhưng chứa đựng rất nhiều cảm xúc.",
  },
  l2: {
    _id: "l2",
    title: "Buổi sáng quán cà phê",
    content_type: "dialogue",
    mood: "aesthetic",
    level: "hsk1",
    chinese_text: "来一杯咖啡，谢谢。\n好的，要加糖吗？\n不用，谢谢。多少钱？\n二十块。给你。\n谢谢，祝你有个好天气！",
    pinyin:
      "Lái yī bēi kāfēi, xièxiè.\nHǎo de, yào jiā táng ma?\nBùyòng, xièxiè. Duōshao qián?\nÈrshí kuài. Gěi nǐ.\nXièxiè, zhù nǐ yǒu gè hǎo tiānqì!",
    translation:
      "Cho một ly cà phê, cảm ơn.\nVâng, cho thêm đường không ạ?\nKhông cần, cảm ơn. Bao nhiêu tiền?\n20 tệ. Đây ạ.\nCảm ơn, chúc bạn có một ngày đẹp trời!",
    vocabulary: [
      { hanzi: "咖啡", pinyin: "kāfēi", meaning: "cà phê", example: "来一杯咖啡" },
      { hanzi: "糖", pinyin: "táng", meaning: "đường, kẹo", example: "加糖" },
      { hanzi: "多少", pinyin: "duōshao", meaning: "bao nhiêu", example: "多少钱？" },
      { hanzi: "块", pinyin: "kuài", meaning: "tệ (đơn vị tiền)", example: "二十块" },
      { hanzi: "祝", pinyin: "zhù", meaning: "chúc", example: "祝你生日快乐" },
    ],
    grammar_notes:
      "• 要...吗 — hỏi có/không về việc muốn gì đó. Ví dụ: 要加糖吗？\n• 不用 (bùyòng) — \"không cần\", lịch sự hơn 不要.\n• 给你 (gěi nǐ) — \"đây/cho bạn\", dùng khi đưa đồ vật cho ai.",
    cultural_note:
      "Văn hóa cà phê đang bùng nổ ở Trung Quốc. Luckin Coffee (瑞幸咖啡) đã vượt Starbucks ở Trung Quốc. Khi mua đồ, người Trung Quốc thường không nói 'please' giống tiếng Anh — chỉ cần thêm 谢谢 là đã rất lịch sự.",
  },
  l3: {
    _id: "l3",
    title: "Người không nên yêu",
    content_type: "story",
    mood: "sad",
    level: "hsk3",
    chinese_text: "有些人，相遇是缘分，离开是注定。\n我们在最好的时光里相遇，\n却在最坏的时机里离开。\n这就是人生。",
    pinyin:
      "Yǒu xiē rén, xiāngyù shì yuánfèn, líkāi shì zhùdìng.\nWǒmen zài zuìhǎo de shíguāng lǐ xiāngyù,\nquè zài zuìhuài de shíjī lǐ líkāi.\nZhè jiùshì rénshēng.",
    translation:
      "Có những người, gặp nhau là duyên, chia tay là số phận.\nChúng ta gặp nhau vào thời điểm đẹp nhất,\nnhưng lại chia tay vào lúc tệ nhất.\nĐó chính là cuộc đời.",
    vocabulary: [
      { hanzi: "缘分", pinyin: "yuánfèn", meaning: "duyên phận, số phận gặp gỡ", example: "这是我们的缘分" },
      { hanzi: "注定", pinyin: "zhùdìng", meaning: "định sẵn, số phận", example: "这是注定的" },
      { hanzi: "时光", pinyin: "shíguāng", meaning: "thời gian, khoảnh khắc", example: "美好的时光" },
      { hanzi: "却", pinyin: "què", meaning: "nhưng, tuy nhiên (đối lập)", example: "想去却不能去" },
    ],
    grammar_notes:
      "• 有些 (yǒu xiē) — \"có những\", dùng để nói về một phần của nhóm.\n• 却 (què) — dùng để diễn đạt sự tương phản, giống \"nhưng\" nhưng mạnh hơn, thể hiện sự ngạc nhiên.\n• 这就是 (zhè jiùshì) — \"đây chính là\", nhấn mạnh kết luận.",
    cultural_note:
      "缘分 (yuánfèn) là một trong những khái niệm đặc trưng nhất của văn hóa Trung Hoa — mối duyên tiền định giữa người với người. Không có từ nào trong tiếng Anh hoặc tiếng Việt dịch được hoàn toàn ý nghĩa này.",
  },
};

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showPinyin, togglePinyin } = useAppStore();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [activeSection, setActiveSection] = useState<"text" | "vocab" | "notes">("text");
  const { xp, show: showXP, awardXP: showXPAnimation } = useXPToast();
  // Server-side XP + streak sync (nếu đã login)
  const { awardXP: syncXP } = useProgress();

  const lessonId = params.id as string;

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        // Thử fetch từ API trước
        const res = await fetch(`/api/lessons/${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          setLesson(data);
        } else {
          // Dùng demo data
          setLesson(DEMO_LESSONS[lessonId] ?? DEMO_LESSONS.l1);
        }
      } catch {
        setLesson(DEMO_LESSONS[lessonId] ?? DEMO_LESSONS.l1);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const { speak } = useTTS();
  const playAudio = () => {
    if (!lesson) return;
    void speak(lesson.chinese_text.replace(/\n/g, "。"));
  };

  const handleComplete = async () => {
    if (completed) return;
    setCompleted(true);
    // Local animation
    showXPAnimation(20);
    // Server sync (cộng XP vào DB, tính streak, level up nếu có)
    await syncXP(20, "complete_lesson");
    toast("🎉 Bài học hoàn thành! +20 XP", { duration: 2000 });
  };

  const handleQuizComplete = async (score: number, _total: number) => {
    const bonus = score * 10;
    if (bonus > 0) {
      showXPAnimation(bonus);
      await syncXP(bonus, "complete_quiz");
    }
  };

  if (loading) return <LessonDetailSkeleton />;
  if (!lesson) return null;

  const moodColor = MOOD_COLORS[lesson.mood] ?? "#8A8078";
  const sentences = lesson.chinese_text.split("\n").filter(Boolean);
  const pinyinLines = lesson.pinyin.split("\n").filter(Boolean);
  const translationLines = lesson.translation.split("\n").filter(Boolean);

  return (
    <div className="min-h-screen max-w-lg mx-auto">
      <XPToast xp={xp} show={showXP} />

      {/* Hero header */}
      <div
        className="relative px-4 pt-5 pb-8 mb-0"
        style={{
          background: `linear-gradient(to bottom, ${moodColor}15 0%, transparent 100%)`,
        }}
      >
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="badge text-[10px]"
            style={{ background: `${moodColor}20`, color: moodColor }}
          >
            {MOOD_EMOJI[lesson.mood]} {MOOD_LABEL[lesson.mood]}
          </span>
          <span className="badge bg-white/5 text-[var(--text-muted)] text-[10px]">
            {LEVEL_LABEL[lesson.level]}
          </span>
          <span className="badge bg-white/5 text-[var(--text-muted)] text-[10px]">
            {lesson.content_type === "story" ? "📖 Câu chuyện" : "💬 Hội thoại"}
          </span>
        </div>

        <h1 className="font-playfair text-2xl font-bold mb-4">{lesson.title}</h1>

        {/* Pinyin toggle + audio */}
        <div className="flex items-center gap-2">
          <button
            onClick={playAudio}
            className="flex items-center gap-1.5 text-xs bg-surface2 text-[var(--text-muted)] hover:text-white px-3 py-2 rounded-full transition-colors"
          >
            <Volume2 size={13} /> Nghe toàn bài
          </button>
          <button
            onClick={togglePinyin}
            className="flex items-center gap-1.5 text-xs bg-surface2 text-[var(--text-muted)] hover:text-white px-3 py-2 rounded-full transition-colors"
          >
            {showPinyin ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPinyin ? "Ẩn pinyin" : "Hiện pinyin"}
          </button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 px-4 mb-6 bg-surface2 mx-4 p-1 rounded-2xl">
        {(["text", "vocab", "notes"] as const).map((tab) => {
          const labels = { text: "📖 Nội dung", vocab: "📚 Từ vựng", notes: "💡 Ghi chú" };
          return (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                activeSection === tab
                  ? "bg-surface text-[#F5F0EB] shadow"
                  : "text-[var(--text-muted)] hover:text-white"
              )}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      <div className="px-4 pb-8 space-y-6">
        {/* TEXT SECTION */}
        {activeSection === "text" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {sentences.map((sentence, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group"
              >
                <div
                  className={cn(
                    "p-4 rounded-2xl border transition-all duration-200 cursor-pointer",
                    "bg-surface border-[rgba(255,255,255,0.06)]",
                    "hover:border-[rgba(232,80,74,0.2)]"
                  )}
                  onClick={() => {
                    void speak(sentence);
                  }}
                >
                  {/* Chinese sentence */}
                  <p className="font-chinese text-xl font-bold leading-relaxed tracking-wider text-[#F5F0EB] mb-1">
                    {sentence}
                  </p>

                  {/* Pinyin */}
                  <div
                    className={cn(
                      "transition-all duration-300 overflow-hidden",
                      showPinyin ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <p className="text-xs text-mm-gold/60 tracking-wider mb-1">
                      {pinyinLines[i] ?? ""}
                    </p>
                  </div>

                  {/* Translation */}
                  <p className="text-sm text-[var(--text-muted)] font-light italic">
                    {translationLines[i] ?? ""}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Complete button */}
            <motion.button
              onClick={handleComplete}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "w-full py-4 rounded-2xl font-semibold text-sm transition-all duration-300",
                "flex items-center justify-center gap-2",
                completed
                  ? "bg-[rgba(143,175,143,0.2)] text-[#8FAF8F] border border-[#8FAF8F]/30"
                  : "btn-primary"
              )}
            >
              {completed ? (
                <><CheckCircle2 size={16} /> Đã hoàn thành · +20 XP</>
              ) : (
                <>Hoàn thành bài học · +20 XP ✨</>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* VOCAB SECTION */}
        {activeSection === "vocab" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <VocabList vocabulary={lesson.vocabulary} />

            {lesson.vocabulary.length >= 2 && (
              <MiniQuiz
                vocabulary={lesson.vocabulary}
                onComplete={handleQuizComplete}
              />
            )}
          </motion.div>
        )}

        {/* NOTES SECTION */}
        {activeSection === "notes" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {lesson.grammar_notes && (
              <div className="card space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={15} className="text-mm-gold" />
                  <p className="text-xs text-mm-gold uppercase tracking-widest font-semibold">
                    Ngữ pháp
                  </p>
                </div>
                {lesson.grammar_notes.split("\n").filter(Boolean).map((line, i) => (
                  <p key={i} className="text-sm text-[#F5F0EB] leading-relaxed font-light">
                    {line}
                  </p>
                ))}
              </div>
            )}

            {lesson.cultural_note && (
              <div className="card space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={15} className="text-mm-rose" />
                  <p className="text-xs text-mm-rose uppercase tracking-widest font-semibold">
                    Văn hóa & Cảm xúc
                  </p>
                </div>
                <p className="text-sm text-[#F5F0EB] leading-relaxed font-light">
                  {lesson.cultural_note}
                </p>
              </div>
            )}

            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={15} className="text-mm-sage" />
                <p className="text-xs text-mm-sage uppercase tracking-widest font-semibold">
                  Mẹo nhớ
                </p>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed font-light">
                Đọc to câu tiếng Trung 3 lần, sau đó thử nói mà không nhìn phiên âm. Não sẽ ghi nhớ qua âm thanh tốt hơn nhiều so với chỉ nhìn.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
