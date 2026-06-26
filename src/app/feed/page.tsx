"use client";

/**
 * /feed — Trang Feed bai hoc
 * Hien thi danh sach Lesson Cards voi filter mood + level
 * Load tu /api/lessons, co skeleton + infinite scroll
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { playTTS } from "@/hooks/useTTS";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Sparkles, RefreshCw, Filter, ChevronDown,
  Clock, Zap, Star, Volume2, Heart
} from "lucide-react";
import MoodFilter from "@/components/ui/MoodFilter";
import { FeedSkeleton } from "@/components/ui/LoadingSkeleton";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { shuffle } from "@/lib/shuffle";
import { MOOD_COLORS, MOOD_EMOJI, LEVEL_LABEL } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Lesson {
  _id: string;
  title: string;
  content_type: "story" | "dialogue" | "poem" | "quote";
  level: string;
  mood: string;
  chinese_text: string;
  pinyin: string;
  translation: string;
  vocabulary?: { hanzi: string; pinyin: string; meaning: string }[];
  view_count?: number;
  estimated_minutes?: number;
}

// ─── Demo data (fallback khi chua co DB) ──────────────────────────────────────
const DEMO_LESSONS: Lesson[] = [
  {
    _id: "l1", title: "Cuoc goi luc nua dem", content_type: "story",
    mood: "romantic", level: "hsk2",
    chinese_text: "你睡了吗？\n我只是想听听你的声音。",
    pinyin: "Nǐ shuì le ma?\nWǒ zhǐshì xiǎng tīng tīng nǐ de shēngyīn.",
    translation: "Em ngủ chưa?\nAnh chỉ muốn nghe giọng em thôi.",
    vocabulary: [{ hanzi: "睡", pinyin: "shuì", meaning: "ngủ" }, { hanzi: "声音", pinyin: "shēngyīn", meaning: "giọng nói" }],
    view_count: 234, estimated_minutes: 3,
  },
  {
    _id: "l2", title: "Buoi sang quan ca phe", content_type: "dialogue",
    mood: "aesthetic", level: "hsk1",
    chinese_text: "来一杯咖啡，谢谢。\n多少钱？二十块。",
    pinyin: "Lái yī bēi kāfēi, xièxie.\nDuōshao qián? Èrshí kuài.",
    translation: "Cho một ly cà phê, cảm ơn.\nBao nhiêu tiền? 20 tệ.",
    vocabulary: [{ hanzi: "咖啡", pinyin: "kāfēi", meaning: "cà phê" }, { hanzi: "多少", pinyin: "duōshao", meaning: "bao nhiêu" }],
    view_count: 189, estimated_minutes: 2,
  },
  {
    _id: "l3", title: "Thu nho gui nguoi cu", content_type: "story",
    mood: "sad", level: "hsk3",
    chinese_text: "有些话我多想对你说。\n可惜，时间已经过去了。",
    pinyin: "Yǒu xiē huà wǒ duō xiǎng duì nǐ shuō.\nKěxī, shíjiān yǐjīng guòqu le.",
    translation: "Có những lời tôi rất muốn nói với bạn.\nTiếc thay, thời gian đã qua rồi.",
    vocabulary: [{ hanzi: "可惜", pinyin: "kěxī", meaning: "tiếc thay" }, { hanzi: "过去", pinyin: "guòqu", meaning: "đã qua" }],
    view_count: 312, estimated_minutes: 4,
  },
  {
    _id: "l4", title: "Ngay mai se tot hon", content_type: "quote",
    mood: "motivation", level: "hsk2",
    chinese_text: "不积跬步，无以至千里。\n一步一步，慢慢来。",
    pinyin: "Bù jī kuǐ bù, wúyǐ zhì qiān lǐ.\nYī bù yī bù, màn màn lái.",
    translation: "Không tích lũy từng bước nhỏ, không đi được ngàn dặm.\nTừng bước một, dần dần sẽ đến.",
    vocabulary: [{ hanzi: "跬步", pinyin: "kuǐbù", meaning: "bước đi" }, { hanzi: "千里", pinyin: "qiānlǐ", meaning: "ngàn dặm" }],
    view_count: 445, estimated_minutes: 2,
  },
  {
    _id: "l5", title: "Cuoc tro chuyen voi ba", content_type: "dialogue",
    mood: "healing", level: "hsk1",
    chinese_text: "妈，今天你还好吗？\n好着呢，你呢？\n我也很好。想你了。",
    pinyin: "Mā, jīntiān nǐ hǎo ma?\nHǎo zhe ne, nǐ ne?\nWǒ yě hěn hǎo. Xiǎng nǐ le.",
    translation: "Mẹ ơi, hôm nay mẹ có khỏe không?\nKhỏe rồi, con thì sao?\nCon cũng rất khỏe. Nhớ mẹ lắm.",
    vocabulary: [{ hanzi: "好", pinyin: "hǎo", meaning: "tốt, khỏe" }, { hanzi: "想", pinyin: "xiǎng", meaning: "nhớ, nghĩ" }],
    view_count: 567, estimated_minutes: 2,
  },
  {
    _id: "l6", title: "Dem nhin sao troi", content_type: "poem",
    mood: "aesthetic", level: "hsk3",
    chinese_text: "我希望，在我看不到天空的地方，\n你正在看着同一片星空。",
    pinyin: "Wǒ xīwàng, zài wǒ kàn bu dào tiānkōng de dìfāng,\nnǐ zhèngzài kànzhe tóngyī piàn xīngkōng.",
    translation: "Tôi hy vọng, ở nơi tôi không thấy bầu trời,\nbạn đang nhìn cùng một bầu sao.",
    vocabulary: [{ hanzi: "天空", pinyin: "tiānkōng", meaning: "bầu trời" }, { hanzi: "星空", pinyin: "xīngkōng", meaning: "bầu sao" }],
    view_count: 398, estimated_minutes: 3,
  },
  {
    _id: "l7", title: "Hom nay uong tra", content_type: "dialogue",
    mood: "funny", level: "hsk1",
    chinese_text: "你喜欢喝什么？\n我喜欢啤酒、咖啡、奶茶——如果有得话。",
    pinyin: "Nǐ xǐhuān hē shénme?\nWǒ xǐhuān píjiǔ, kāfēi, nǎichá — rúguǒ yǒu de huà.",
    translation: "Bạn thích uống gì?\nTôi thích bia, cà phê, trà sữa — nếu có.",
    vocabulary: [{ hanzi: "喜欢", pinyin: "xǐhuān", meaning: "thích" }, { hanzi: "如果", pinyin: "rúguǒ", meaning: "nếu" }],
    view_count: 201, estimated_minutes: 2,
  },
  {
    _id: "l8", title: "Tinh ban thuc su", content_type: "story",
    mood: "healing", level: "hsk2",
    chinese_text: "真正的朋友，不用天天联系。\n但每次相见，都跟昨天一样。",
    pinyin: "Zhēnzhèng de péngyǒu, bùyòng tiāntiān liánxì.\nDàn měi cì xiāngjiàn, dōu gēn zuótiān yīyàng.",
    translation: "Bạn bè thực sự, không cần liên lạc hàng ngày.\nNhưng mỗi lần gặp nhau, vẫn như ngày hôm qua.",
    vocabulary: [{ hanzi: "朋友", pinyin: "péngyǒu", meaning: "bạn bè" }, { hanzi: "相见", pinyin: "xiāngjiàn", meaning: "gặp nhau" }],
    view_count: 320, estimated_minutes: 3,
  },
  {
    _id: "l9", title: "Tuoi thanh xuan", content_type: "poem",
    mood: "motivation", level: "hsk3",
    chinese_text: "青春是我们最大的资本。\n别浪费它在抱怨和后悔里。",
    pinyin: "Qīngchūn shì wǒmen zuì dà de zīběn.\nBié làngfèi tā zài bàoyuàn hé hòuhuǐ lǐ.",
    translation: "Tuổi thanh xuân là tài sản lớn nhất của chúng ta.\nĐừng lãng phí nó vào phàn nàn và hối tiếc.",
    vocabulary: [{ hanzi: "青春", pinyin: "qīngchūn", meaning: "tuổi thanh xuân" }, { hanzi: "浪费", pinyin: "làngfèi", meaning: "lãng phí" }],
    view_count: 478, estimated_minutes: 2,
  },
  {
    _id: "l10", title: "Mua xuan ve roi", content_type: "story",
    mood: "healing", level: "hsk1",
    chinese_text: "春天来了。\n花开了，鳥叫了。心情好了。",
    pinyin: "Chūntiān lái le.\nHuā kāi le, niǎo jiào le. Xīnqíng hǎo le.",
    translation: "Mùa xuân đến rồi.\nHoa nở, chim hót. Tâm trạng tốt hơn.",
    vocabulary: [{ hanzi: "春天", pinyin: "chūntiān", meaning: "mùa xuân" }, { hanzi: "心情", pinyin: "xīnqíng", meaning: "tâm trạng" }],
    view_count: 156, estimated_minutes: 1,
  },
  {
    _id: "l11", title: "Khoang lang de tri oc", content_type: "quote",
    mood: "aesthetic", level: "hsk4",
    chinese_text: "独处不是孤独，而是一种与自己相处的能力。",
    pinyin: "Dúchǔ bùshì gūdú, ér shì yī zhǒng yǔ zìjǐ xiāngchǔ de nénglì.",
    translation: "Ở một mình không phải cô đơn, mà là một khả năng cùng chính mình.",
    vocabulary: [{ hanzi: "独处", pinyin: "dúchǔ", meaning: "ở một mình" }, { hanzi: "孤独", pinyin: "gūdú", meaning: "cô đơn" }],
    view_count: 523, estimated_minutes: 2,
  },
  {
    _id: "l12", title: "Ngu ngon ve con duong", content_type: "poem",
    mood: "motivation", level: "hsk4",
    chinese_text: "路子是走出来的，\n不是等出来的。",
    pinyin: "Lùzi shì zǒu chūlái de,\nbùshì děng chūlái de.",
    translation: "Con đường là do đi mà có,\nkhông phải ngồi đợi mà có.",
    vocabulary: [{ hanzi: "路子", pinyin: "lùzi", meaning: "con đường" }, { hanzi: "等", pinyin: "děng", meaning: "chờ" }],
    view_count: 612, estimated_minutes: 1,
  },
];

// ─── Content type config ───────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  story:    { label: "Câu chuyện", icon: "📖", color: "#C9878A" },
  dialogue: { label: "Hội thoại", icon: "💬", color: "#7AB8D4" },
  poem:     { label: "Thơ ca",    icon: "🌸", color: "#9B8BBF" },
  quote:    { label: "Câu hay",   icon: "✨", color: "#D4AF37" },
};

// ─── Level badge ───────────────────────────────────────────────────────────────
const LEVEL_COLORS: Record<string, string> = {
  hsk1: "#7AB8D4", hsk2: "#8FAF8F", hsk3: "#D4AF37",
  hsk4: "#E8634A", hsk5: "#C9878A", hsk6: "#9B8BBF",
  beginner: "#8A8078",
};

// ─── Lesson Card ──────────────────────────────────────────────────────────────
function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  const router = useRouter();
  const moodColor = MOOD_COLORS[lesson.mood] ?? "#8A8078";
  const typeConf = TYPE_CONFIG[lesson.content_type] ?? TYPE_CONFIG.story;
  const levelColor = LEVEL_COLORS[lesson.level] ?? "#8A8078";

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    void playTTS(lesson.chinese_text.split("\n")[0]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      onClick={() => router.push(`/lesson/${lesson._id}`)}
      className="group relative bg-[#1A1A1A] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 cursor-pointer hover:border-[rgba(232,99,74,0.25)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {/* Mood glow accent */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ background: `radial-gradient(ellipse at top left, ${moodColor}0A 0%, transparent 60%)` }}
      />

      {/* Top row: type + level badges */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: `${moodColor}20`, color: moodColor }}
          >
            {MOOD_EMOJI[lesson.mood]} {lesson.mood}
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: `${typeConf.color}15`, color: typeConf.color }}
          >
            {typeConf.icon} {typeConf.label}
          </span>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${levelColor}20`, color: levelColor }}
        >
          {LEVEL_LABEL[lesson.level] ?? lesson.level}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[var(--text)] mb-2 text-base leading-snug group-hover:text-white transition-colors">
        {lesson.title}
      </h3>

      {/* Chinese preview */}
      <p
        className="font-noto text-xl leading-relaxed mb-1 line-clamp-1"
        style={{ color: moodColor }}
      >
        {lesson.chinese_text.split("\n")[0]}
      </p>
      <p className="text-xs text-[#8A8078] mb-3 line-clamp-1">
        {lesson.pinyin.split("\n")[0]}
      </p>
      <p className="text-sm text-[#8A8078] line-clamp-2 italic leading-relaxed">
        &ldquo;{lesson.translation.split("\n")[0]}&rdquo;
      </p>

      {/* Bottom row: vocab count + time + audio */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-3 text-[11px] text-[#5A5050]">
          {lesson.vocabulary && lesson.vocabulary.length > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen size={11} />
              {lesson.vocabulary.length} tu moi
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {lesson.estimated_minutes ?? 3} phut
          </span>
          {lesson.view_count && lesson.view_count > 0 && (
            <span className="flex items-center gap-1">
              <Star size={11} />
              {lesson.view_count}
            </span>
          )}
        </div>

        {/* Audio button */}
        <button
          onClick={handlePlay} aria-label="Phát âm thanh"
          className="w-7 h-7 rounded-full bg-[#242424] flex items-center justify-center text-[#5A5050] hover:text-[#E8634A] hover:bg-[#2A1A1A] transition-all"
        >
          <Volume2 size={12} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Featured banner (lesson noi bat) ─────────────────────────────────────────
function FeaturedBanner({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const moodColor = MOOD_COLORS[lesson.mood] ?? "#E8634A";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      onClick={() => router.push(`/lesson/${lesson._id}`)}
      className="relative rounded-2xl overflow-hidden cursor-pointer mb-6"
      style={{ background: `linear-gradient(135deg, #1A0A0A 0%, #241010 100%)` }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${moodColor}40 0%, transparent 70%)` }}
      />

      <div className="relative z-10 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-[#E8A838]" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#E8A838]">
            Noi bat hom nay
          </span>
        </div>

        <p
          className="font-noto text-3xl leading-relaxed mb-2"
          style={{ color: moodColor }}
        >
          {lesson.chinese_text.split("\n")[0]}
        </p>
        <p className="text-sm text-[#8A8078] mb-1">{lesson.pinyin.split("\n")[0]}</p>
        <p className="text-sm text-[#A09080] italic">
          &ldquo;{lesson.translation.split("\n")[0]}&rdquo;
        </p>

        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs text-[#E8634A] font-medium flex items-center gap-1">
            <Zap size={12} />
            Hoc ngay
          </span>
          <span className="text-xs text-[#5A5050]">
            +{(lesson.vocabulary?.length ?? 2) * 5} XP
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Feed Page ────────────────────────────────────────────────────────────
export default function FeedPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  // Cá nhân hoá feed: mặc định lọc theo cảm xúc yêu thích ĐẦU TIÊN user chọn ở
  // onboarding (chỉ khi đã hoàn tất onboarding — user mới/chưa onboard vẫn thấy
  // "tất cả"). Trước đây favMoods là bước onboarding BẮT BUỘC nhưng KHÔNG dùng ở
  // đâu. Lazy initializer đọc store đã rehydrate → chỉ 1 lần fetch (không double).
  const [selectedMood, setSelectedMood] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const ob = useAppStore.getState().onboarding;
    return ob.completed && ob.favMoods && ob.favMoods.length > 0 ? ob.favMoods[0] : null;
  });
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const fetchSeqRef = useRef(0); // chống race: chỉ áp dụng response mới nhất

  const LEVELS = ["hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6"];
  const TYPES = ["story", "dialogue", "poem", "quote"];

  // Fetch lessons
  const fetchLessons = useCallback(async (reset = false) => {
    const seq = ++fetchSeqRef.current;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedMood) params.set("mood", selectedMood);
      if (selectedLevel) params.set("level", selectedLevel);
      if (selectedType) params.set("type", selectedType);
      params.set("page", reset ? "1" : String(page));
      params.set("limit", "6");

      const res = await fetch(`/api/lessons?${params}`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (seq !== fetchSeqRef.current) return; // có request mới hơn → bỏ kết quả cũ

      if (reset) {
        setLessons(data.lessons ?? []);
        setPage(2);
      } else {
        setLessons(prev => [...prev, ...(data.lessons ?? [])]);
        setPage(p => p + 1);
      }
      setHasMore((data.lessons ?? []).length >= 6);
    } catch {
      if (seq !== fetchSeqRef.current) return; // bỏ fallback nếu đã có request mới
      // Fallback to demo data
      const filtered = DEMO_LESSONS.filter(l => {
        if (selectedMood && l.mood !== selectedMood) return false;
        if (selectedLevel && l.level !== selectedLevel) return false;
        if (selectedType && l.content_type !== selectedType) return false;
        return true;
      });
      setLessons(shuffle(filtered)); // trộn ngẫu nhiên → mỗi lần vào thấy khác
      setHasMore(false);
    } finally {
      if (seq === fetchSeqRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMood, selectedLevel, selectedType]);

  // Re-fetch on filter change
  useEffect(() => {
    fetchLessons(true);
  }, [fetchLessons]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchLessons(false);
        }
      },
      { threshold: 0.1 }
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, loading, fetchLessons]);

  const featured = lessons[0] ?? DEMO_LESSONS[0];
  const rest = lessons.length > 0 ? lessons.slice(1) : DEMO_LESSONS.slice(1);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-28">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-[var(--text)] font-playfair">
              Bai hoc hom nay
            </h1>
            <p className="text-xs text-[#8A8078] mt-0.5">
              {lessons.length > 0
                ? `${lessons.length} bai dang cho ban`
                : `${DEMO_LESSONS.length} bai mau`}
            </p>
          </div>
          <button
            onClick={() => fetchLessons(true)}
            className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#8A8078] hover:text-white transition-colors"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Mood filter */}
        <MoodFilter selected={selectedMood} onChange={(m) => setSelectedMood(m)} />

        {/* Advanced filters toggle */}
        <div className="mt-3 mb-5">
          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-1.5 text-xs text-[#8A8078] hover:text-white transition-colors"
          >
            <Filter size={12} />
            Bộ lọc thêm
            <ChevronDown
              size={12}
              className={cn("transition-transform duration-200", showFilters && "rotate-180")}
            />
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  {/* Level */}
                  <div>
                    <p className="text-[10px] text-[#5A5050] uppercase tracking-wider mb-2">
                      Trình độ
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {LEVELS.map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setSelectedLevel(selectedLevel === lvl ? null : lvl)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                            selectedLevel === lvl
                              ? "bg-mm-gold text-black"
                              : "bg-[#1A1A1A] text-[#8A8078] hover:text-white border border-[rgba(255,255,255,0.06)]"
                          )}
                        >
                          {LEVEL_LABEL[lvl]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <p className="text-[10px] text-[#5A5050] uppercase tracking-wider mb-2">
                      Loại nội dung
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {TYPES.map(t => {
                        const conf = TYPE_CONFIG[t];
                        return (
                          <button
                            key={t}
                            onClick={() => setSelectedType(selectedType === t ? null : t)}
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                              selectedType === t
                                ? "bg-mm-red text-white"
                                : "bg-[#1A1A1A] text-[#8A8078] hover:text-white border border-[rgba(255,255,255,0.06)]"
                            )}
                          >
                            {conf.icon} {conf.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        {loading && lessons.length === 0 ? (
          <FeedSkeleton />
        ) : (
          <>
            {/* Featured */}
            {featured && <FeaturedBanner lesson={featured} />}

            {/* Grid */}
            <div className="grid grid-cols-1 gap-3">
              {rest.map((lesson, i) => (
                <LessonCard key={lesson._id} lesson={lesson} index={i} />
              ))}
            </div>

            {/* Empty state */}
            {!loading && lessons.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🐼</p>
                <p className="text-[var(--text)] font-medium mb-1">Chưa có bài học nào</p>
                <p className="text-sm text-[#8A8078]">Thử chọn mood khác nhé</p>
              </div>
            )}

            {/* Load more sentinel */}
            <div ref={loaderRef} className="h-8" />

            {/* Loading more spinner */}
            {loading && lessons.length > 0 && (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 rounded-full border-2 border-[#E8634A] border-t-transparent animate-spin" />
              </div>
            )}

            {/* End of list */}
            {!hasMore && rest.length > 0 && (
              <p className="text-center text-xs text-[#5A5050] py-4">
                Da xem het roi ~ Quay lai ngay mai nhe!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
