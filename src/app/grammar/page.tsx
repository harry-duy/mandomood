"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playTTS } from "@/hooks/useTTS";
import { Search, Volume2, ChevronDown, BookOpen, CheckCircle2, XCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";

interface GrammarPoint {
  id: string;
  pattern: string;
  name: string;
  level: string;
  category: string;
  explanation: string;
  structure: string;
  examples: { chinese: string; pinyin: string; vietnamese: string }[];
  tip?: string;
}

// ── Quiz data — fill-in-the-blank for each grammar point ──────────────────────
interface GrammarQuiz {
  question: string;   // sentence with ___ for the blank
  answer: string;     // correct option
  options: string[];  // 4 choices (includes correct)
  hint: string;       // short explanation after answer
}

const GRAMMAR_QUIZZES: Record<string, GrammarQuiz> = {
  "shi-de": {
    question: "我___ 坐飞机来 ___。(nhấn mạnh phương tiện)",
    answer: "是 / 的",
    options: ["是 / 的", "在 / 了", "被 / 过", "把 / 着"],
    hint: "是...的 kẹp thông tin nhấn mạnh (phương tiện = 坐飞机) ở giữa.",
  },
  "ba": {
    question: "请___ 门关上。 (đóng cửa lại)",
    answer: "把",
    options: ["把", "被", "让", "给"],
    hint: "把 đưa tân ngữ (门) lên trước động từ (关上).",
  },
  "bei": {
    question: "我的手机___ 偷了。 (bị lấy trộm)",
    answer: "被",
    options: ["被", "把", "让", "叫"],
    hint: "被 = bị. Câu bị động: chủ ngữ + 被 + [ai] + động từ.",
  },
  "guo": {
    question: "你吃___ 北京烤鸭吗？ (đã từng ăn chưa?)",
    answer: "过",
    options: ["过", "了", "着", "好"],
    hint: "过 sau động từ = đã từng trải nghiệm. Khác 了 (hoàn thành gần đây).",
  },
  "zhe": {
    question: "她笑___ 说。 (vừa cười vừa nói)",
    answer: "着",
    options: ["着", "了", "过", "得"],
    hint: "着 sau động từ = hành động tiếp diễn / trạng thái đang duy trì.",
  },
  "le": {
    question: "下雨___！ (trời mưa rồi — thay đổi tình huống)",
    answer: "了",
    options: ["了", "着", "过", "的"],
    hint: "了 cuối câu = thay đổi tình huống mới. 下雨了 = bắt đầu mưa rồi.",
  },
  "bi": {
    question: "今天___ 昨天冷多了。 (hôm nay lạnh hơn)",
    answer: "比",
    options: ["比", "更", "最", "很"],
    hint: "比 = so sánh hơn. A 比 B + tính từ. Không dùng 很 sau 比.",
  },
  "yao-jiu": {
    question: "___ 成功，就要努力。 (muốn thành công thì phải...)",
    answer: "要",
    options: ["要", "如果", "虽然", "因为"],
    hint: "要...就... = muốn/nếu... thì... Cấu trúc điều kiện mong muốn.",
  },
  "suiran-danshi": {
    question: "___ 很累，但是很开心。 (mặc dù mệt nhưng vui)",
    answer: "虽然",
    options: ["虽然", "因为", "如果", "要"],
    hint: "虽然...但是... = mặc dù...nhưng... (nhượng bộ).",
  },
  "yinwei-suoyi": {
    question: "___ 下雨，所以我没出去。 (vì mưa nên không ra ngoài)",
    answer: "因为",
    options: ["因为", "虽然", "如果", "要是"],
    hint: "因为...所以... = vì...cho nên... (nhân quả).",
  },
  "de-complement": {
    question: "她唱___ 很好听。 (hát hay lắm)",
    answer: "得",
    options: ["得", "的", "地", "了"],
    hint: "得 nối động từ với bổ ngữ mức độ: 唱 + 得 + 很好听.",
  },
  "lian-dou": {
    question: "___ 小孩都会做这道题。 (ngay cả trẻ con cũng làm được)",
    answer: "连",
    options: ["连", "就", "也", "都"],
    hint: "连...都/也... = ngay cả...cũng... Nhấn mạnh cực đoan.",
  },
};

const GRAMMAR: GrammarPoint[] = [
  {
    id: "shi-de", pattern: "是...的", name: "Nhấn mạnh thời gian/nơi chốn/cách thức",
    level: "HSK 2", category: "Cấu trúc cơ bản",
    explanation: "Dùng để nhấn mạnh thời gian, địa điểm hoặc cách thức của một hành động đã xảy ra. Hành động đã hoàn thành.",
    structure: "Subject + 是 + [thông tin nhấn mạnh] + Verb + 的",
    examples: [
      { chinese: "我是昨天来的。", pinyin: "Wǒ shì zuótiān lái de.", vietnamese: "Tôi đến là vào hôm qua." },
      { chinese: "她是坐飞机来的。", pinyin: "Tā shì zuò fēijī lái de.", vietnamese: "Cô ấy đến là bằng máy bay." },
      { chinese: "这件衣服是在北京买的。", pinyin: "Zhè jiàn yīfu shì zài Běijīng mǎi de.", vietnamese: "Bộ quần áo này mua là ở Bắc Kinh." },
    ],
    tip: "Không dùng 是...的 cho tương lai hoặc trạng thái hiện tại.",
  },
  {
    id: "ba", pattern: "把", name: "Cấu trúc 把 — xử lý tân ngữ",
    level: "HSK 3", category: "Cấu trúc đặc biệt",
    explanation: "把 đưa tân ngữ lên trước động từ, nhấn mạnh hành động tác động lên tân ngữ, thường kèm kết quả.",
    structure: "Subject + 把 + Object + Verb + Complement",
    examples: [
      { chinese: "请把门关上。", pinyin: "Qǐng bǎ mén guān shàng.", vietnamese: "Vui lòng đóng cửa lại." },
      { chinese: "她把作业做完了。", pinyin: "Tā bǎ zuòyè zuò wán le.", vietnamese: "Cô ấy đã làm xong bài tập." },
      { chinese: "我把手机忘在家里了。", pinyin: "Wǒ bǎ shǒujī wàng zài jiālǐ le.", vietnamese: "Tôi quên điện thoại ở nhà rồi." },
    ],
    tip: "Động từ sau 把 không thể đứng một mình — phải có kết quả, hướng, hay 了.",
  },
  {
    id: "bei", pattern: "被", name: "Câu bị động — bị/được làm gì",
    level: "HSK 4", category: "Cấu trúc đặc biệt",
    explanation: "Diễn đạt câu bị động — chủ ngữ bị/được tác động bởi ai đó. Thường dùng cho tình huống bất lợi.",
    structure: "Subject + 被 + [Agent] + Verb + Complement",
    examples: [
      { chinese: "我的钱包被偷了。", pinyin: "Wǒ de qiánbāo bèi tōu le.", vietnamese: "Ví tiền của tôi bị mất cắp rồi." },
      { chinese: "作业被老师批评了。", pinyin: "Zuòyè bèi lǎoshī pīpíng le.", vietnamese: "Bài tập bị thầy giáo phê bình rồi." },
      { chinese: "这个消息被大家知道了。", pinyin: "Zhège xiāoxi bèi dàjiā zhīdào le.", vietnamese: "Tin tức này đã được mọi người biết đến." },
    ],
    tip: "Trong tiếng Trung, 被 thường mang nghĩa tiêu cực hơn tích cực.",
  },
  {
    id: "guo", pattern: "过", name: "Trải nghiệm trong quá khứ",
    level: "HSK 2", category: "Thể từ",
    explanation: "过 sau động từ chỉ rằng hành động đã từng xảy ra ít nhất một lần trong quá khứ — 'đã từng'.",
    structure: "Subject + Verb + 过 + Object",
    examples: [
      { chinese: "我去过北京。", pinyin: "Wǒ qù guò Běijīng.", vietnamese: "Tôi đã từng đến Bắc Kinh." },
      { chinese: "你吃过北京烤鸭吗？", pinyin: "Nǐ chī guò Běijīng kǎoyā ma?", vietnamese: "Bạn đã từng ăn vịt quay Bắc Kinh chưa?" },
      { chinese: "我从来没看过这部电影。", pinyin: "Wǒ cónglái méi kàn guò zhè bù diànyǐng.", vietnamese: "Tôi chưa bao giờ xem bộ phim này." },
    ],
    tip: "Phủ định dùng 没 (chứ không phải 不): 没去过 = chưa từng đến.",
  },
  {
    id: "zhe", pattern: "着", name: "Hành động đang tiếp diễn / trạng thái",
    level: "HSK 3", category: "Thể từ",
    explanation: "着 sau động từ chỉ hành động đang tiếp diễn hoặc trạng thái đang duy trì.",
    structure: "Verb + 着 (+ Object)",
    examples: [
      { chinese: "她笑着说。", pinyin: "Tā xiào zhe shuō.", vietnamese: "Cô ấy vừa cười vừa nói." },
      { chinese: "窗户开着。", pinyin: "Chuānghù kāi zhe.", vietnamese: "Cửa sổ đang mở." },
      { chinese: "他戴着耳机听音乐。", pinyin: "Tā dài zhe ěrjī tīng yīnyuè.", vietnamese: "Anh ấy đang đeo tai nghe nghe nhạc." },
    ],
    tip: "着 ≠ 在 + V. 在听 = đang nghe (thời điểm cụ thể). 听着 = vẫn đang nghe (trạng thái liên tục).",
  },
  {
    id: "le", pattern: "了", name: "Hoàn thành / thay đổi trạng thái",
    level: "HSK 1", category: "Thể từ",
    explanation: "了 có 2 dùng: (1) sau động từ = hành động hoàn thành; (2) cuối câu = thay đổi tình huống/nhận thức.",
    structure: "(1) Verb + 了 | (2) Sentence + 了",
    examples: [
      { chinese: "我吃了。", pinyin: "Wǒ chī le.", vietnamese: "Tôi ăn rồi." },
      { chinese: "下雨了！", pinyin: "Xià yǔ le!", vietnamese: "Trời mưa rồi!" },
      { chinese: "他长大了。", pinyin: "Tā zhǎng dà le.", vietnamese: "Anh ấy đã lớn rồi." },
    ],
    tip: "了 cuối câu = 'đã xảy ra thay đổi'. 下雨了 ≠ 'mưa xong' mà = 'bắt đầu mưa rồi'.",
  },
  {
    id: "bi", pattern: "比", name: "So sánh hơn",
    level: "HSK 2", category: "So sánh",
    explanation: "比 dùng để so sánh hai đối tượng, tương đương 'hơn' trong tiếng Việt.",
    structure: "A + 比 + B + Adjective (+ nhiều/một点)",
    examples: [
      { chinese: "他比我高。", pinyin: "Tā bǐ wǒ gāo.", vietnamese: "Anh ấy cao hơn tôi." },
      { chinese: "今天比昨天冷多了。", pinyin: "Jīntiān bǐ zuótiān lěng duō le.", vietnamese: "Hôm nay lạnh hơn hôm qua nhiều." },
      { chinese: "苹果比香蕉贵一点。", pinyin: "Píngguǒ bǐ xiāngjiāo guì yīdiǎn.", vietnamese: "Táo đắt hơn chuối một chút." },
    ],
    tip: "Không dùng '很' sau 比: ✗ 他比我很高 → ✓ 他比我高 / 他比我高得多.",
  },
  {
    id: "yao-jiu", pattern: "要...就...", name: "Điều kiện — nếu muốn thì phải",
    level: "HSK 3", category: "Câu điều kiện",
    explanation: "Cấu trúc điều kiện: 'nếu/muốn [điều kiện] thì phải [kết quả]'.",
    structure: "要 + Condition, 就 + Result",
    examples: [
      { chinese: "要成功，就要努力。", pinyin: "Yào chénggōng, jiù yào nǔlì.", vietnamese: "Muốn thành công thì phải nỗ lực." },
      { chinese: "要学好汉语，就要多练习。", pinyin: "Yào xué hǎo Hànyǔ, jiù yào duō liànxí.", vietnamese: "Muốn học tốt tiếng Trung thì phải luyện tập nhiều." },
      { chinese: "要去，就早点出发。", pinyin: "Yào qù, jiù zǎodiǎn chūfā.", vietnamese: "Nếu đi thì hãy xuất phát sớm." },
    ],
  },
  {
    id: "suiran-danshi", pattern: "虽然...但是...", name: "Mặc dù... nhưng...",
    level: "HSK 3", category: "Câu phức",
    explanation: "Cấu trúc nhượng bộ: thừa nhận một điều nhưng kết quả ngược lại.",
    structure: "虽然 + Clause 1 + 但是/可是 + Clause 2",
    examples: [
      { chinese: "虽然很累，但是很开心。", pinyin: "Suīrán hěn lèi, dànshì hěn kāixīn.", vietnamese: "Mặc dù rất mệt nhưng rất vui." },
      { chinese: "虽然他很忙，但是他还是来了。", pinyin: "Suīrán tā hěn máng, dànshì tā háishì lái le.", vietnamese: "Mặc dù anh ấy rất bận nhưng anh ấy vẫn đến." },
      { chinese: "虽然价格贵，但是质量好。", pinyin: "Suīrán jiàgé guì, dànshì zhìliàng hǎo.", vietnamese: "Mặc dù giá đắt nhưng chất lượng tốt." },
    ],
    tip: "Hai mệnh đề có thể cùng chủ ngữ hoặc khác chủ ngữ.",
  },
  {
    id: "yinwei-suoyi", pattern: "因为...所以...", name: "Vì... cho nên...",
    level: "HSK 2", category: "Câu phức",
    explanation: "Cấu trúc nhân quả: trình bày nguyên nhân và kết quả.",
    structure: "因为 + Reason + 所以 + Result",
    examples: [
      { chinese: "因为下雨，所以我没出去。", pinyin: "Yīnwèi xià yǔ, suǒyǐ wǒ méi chūqù.", vietnamese: "Vì trời mưa nên tôi không đi ra ngoài." },
      { chinese: "因为他努力，所以他成功了。", pinyin: "Yīnwèi tā nǔlì, suǒyǐ tā chénggōng le.", vietnamese: "Vì anh ấy nỗ lực nên anh ấy thành công." },
      { chinese: "因为我喜欢汉语，所以我每天学习。", pinyin: "Yīnwèi wǒ xǐhuān Hànyǔ, suǒyǐ wǒ měitiān xuéxí.", vietnamese: "Vì tôi thích tiếng Trung nên tôi học mỗi ngày." },
    ],
  },
  {
    id: "de-complement", pattern: "得 (complement)", name: "Bổ ngữ chỉ mức độ",
    level: "HSK 2", category: "Bổ ngữ",
    explanation: "得 sau động từ hoặc tính từ để thêm bổ ngữ chỉ mức độ, kết quả, hay trạng thái.",
    structure: "Verb/Adj + 得 + Complement",
    examples: [
      { chinese: "她唱得很好听。", pinyin: "Tā chàng de hěn hǎotīng.", vietnamese: "Cô ấy hát hay lắm." },
      { chinese: "他跑得很快。", pinyin: "Tā pǎo de hěn kuài.", vietnamese: "Anh ấy chạy rất nhanh." },
      { chinese: "你说得对！", pinyin: "Nǐ shuō de duì!", vietnamese: "Bạn nói đúng rồi!" },
    ],
    tip: "Nếu có tân ngữ: phải lặp lại động từ: 她唱歌唱得很好听 hoặc bỏ tân ngữ.",
  },
  {
    id: "lian-dou", pattern: "连...都/也...", name: "Nhấn mạnh cực đoan — ngay cả",
    level: "HSK 4", category: "Nhấn mạnh",
    explanation: "Nhấn mạnh rằng ngay cả điều hiển nhiên / cực đoan nhất cũng đúng.",
    structure: "连 + [extreme case] + 都/也 + Verb",
    examples: [
      { chinese: "他连中文名字都不知道。", pinyin: "Tā lián zhōngwén míngzì dōu bù zhīdào.", vietnamese: "Anh ấy ngay cả tên tiếng Trung cũng không biết." },
      { chinese: "我累得连话都说不出来。", pinyin: "Wǒ lèi de lián huà dōu shuō bù chūlái.", vietnamese: "Tôi mệt đến mức ngay cả nói chuyện cũng không được." },
      { chinese: "连小孩都会做这道题。", pinyin: "Lián xiǎohái dōu huì zuò zhè dào tí.", vietnamese: "Ngay cả trẻ con cũng làm được bài toán này." },
    ],
  },
];

const CATEGORIES = ["Tất cả", "Cấu trúc cơ bản", "Cấu trúc đặc biệt", "Thể từ", "So sánh", "Câu điều kiện", "Câu phức", "Bổ ngữ", "Nhấn mạnh"];
const LEVELS = ["Tất cả", "HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5"];

export default function GrammarPage() {
  const { awardXP } = useProgress();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [level, setLevel] = useState("Tất cả");
  const [openId, setOpenId] = useState<string | null>(null);
  // quiz state: { [grammarId]: chosen option | null }
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | null>>({});
  const [showQuiz, setShowQuiz] = useState<Record<string, boolean>>({});

  const filtered = GRAMMAR.filter(g => {
    const matchSearch = !search ||
      g.pattern.includes(search) ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.explanation.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Tất cả" || g.category === category;
    const matchLvl = level === "Tất cả" || g.level === level;
    return matchSearch && matchCat && matchLvl;
  });

  return (
    <main className="min-h-screen pb-28 bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold">Ngữ Pháp</h1>
              <p className="text-xs text-[var(--text-muted)]">{GRAMMAR.length} điểm ngữ pháp quan trọng nhất</p>
            </div>
            <BookOpen size={20} className="text-mm-red/60" />
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm cấu trúc... (VD: 把, bị động, so sánh)" aria-label="Tìm cấu trúc... (VD: 把, bị động, so sánh)"
              className="w-full pl-8 pr-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[rgba(255,255,255,0.06)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-mm-red/40"
            />
          </div>
          {/* Level filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={cn("shrink-0 text-xs px-3 py-1 rounded-full border transition-all",
                  level === l ? "border-mm-red text-mm-red bg-mm-red/10" : "border-[rgba(255,255,255,0.1)] text-[var(--text-muted)]")}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5 space-y-3">
        {/* Category chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={cn("shrink-0 text-[10px] px-2.5 py-1 rounded-full border transition-all",
                category === c ? "border-mm-gold text-mm-gold bg-mm-gold/10" : "border-[rgba(255,255,255,0.08)] text-[var(--text-muted)]")}>
              {c}
            </button>
          ))}
        </div>

        {/* Result count */}
        <p className="text-xs text-[var(--text-muted)]">{filtered.length} cấu trúc</p>

        {/* Grammar cards */}
        <AnimatePresence>
          {filtered.map((g, i) => {
            const isOpen = openId === g.id;
            return (
              <motion.div key={g.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.05)]"
              >
                <button
                  className="w-full flex items-center gap-3 px-4 py-4 text-left"
                  onClick={() => setOpenId(isOpen ? null : g.id)}
                >
                  {/* Pattern */}
                  <div className="w-16 shrink-0 text-center">
                    <span className="text-lg font-bold text-mm-red">{g.pattern}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{g.name}</div>
                    <div className="flex gap-1.5 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-mm-red/10 text-mm-red/80">{g.level}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[var(--text-muted)]">{g.category}</span>
                    </div>
                  </div>
                  <ChevronDown size={14} className={cn("text-[var(--text-muted)] transition-transform shrink-0", isOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 space-y-4 border-t border-[rgba(255,255,255,0.05)]">
                        {/* Explanation */}
                        <p className="text-sm text-white/80 mt-4 leading-relaxed">{g.explanation}</p>

                        {/* Structure */}
                        <div className="bg-[rgba(255,255,255,0.04)] rounded-xl px-4 py-3">
                          <p className="text-[10px] text-[var(--text-muted)] mb-1">Cấu trúc:</p>
                          <p className="text-sm font-mono text-mm-gold">{g.structure}</p>
                        </div>

                        {/* Examples */}
                        <div className="space-y-3">
                          <p className="text-xs text-[var(--text-muted)]">Ví dụ:</p>
                          {g.examples.map((ex, ei) => (
                            <div key={ei} className="flex gap-3 items-start">
                              <span className="text-[10px] text-mm-red/60 mt-1 shrink-0">{ei + 1}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-medium">{ex.chinese}</span>
                                  <button onClick={() => playTTS(ex.chinese)}
                                    className="p-1 rounded-full hover:bg-[rgba(255,255,255,0.08)]">
                                    <Volume2 size={12} className="text-mm-red/60" />
                                  </button>
                                </div>
                                <p className="text-xs text-mm-red/70">{ex.pinyin}</p>
                                <p className="text-xs text-[var(--text-muted)]">{ex.vietnamese}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tip */}
                        {g.tip && (
                          <div className="bg-mm-gold/8 border border-mm-gold/20 rounded-xl px-4 py-3">
                            <p className="text-xs text-mm-gold/90">💡 {g.tip}</p>
                          </div>
                        )}

                        {/* Mini Quiz */}
                        {GRAMMAR_QUIZZES[g.id] && (() => {
                          const quiz = GRAMMAR_QUIZZES[g.id];
                          const chosen = quizAnswers[g.id];
                          const isCorrect = chosen === quiz.answer;
                          const quizVisible = showQuiz[g.id];

                          return (
                            <div className="border-t border-[rgba(255,255,255,0.05)] pt-4">
                              {!quizVisible ? (
                                <button
                                  onClick={() => setShowQuiz(s => ({ ...s, [g.id]: true }))}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-sm text-[var(--text-muted)] hover:text-white hover:border-mm-red/30 transition-all"
                                >
                                  <Zap size={13} className="text-mm-red/60" />
                                  Luyện nhanh — kiểm tra hiểu bài
                                </button>
                              ) : (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Điền vào chỗ trống</p>
                                    <button
                                      onClick={() => {
                                        setShowQuiz(s => ({ ...s, [g.id]: false }));
                                        setQuizAnswers(a => { const n = { ...a }; delete n[g.id]; return n; });
                                      }}
                                      className="text-[10px] text-[var(--text-muted)] hover:text-white transition-colors px-2 py-1 rounded"
                                    >
                                      ✕ Đóng
                                    </button>
                                  </div>
                                  <p className="text-sm font-medium leading-relaxed">{quiz.question}</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {quiz.options.map(opt => {
                                      const picked = chosen === opt;
                                      const correct = opt === quiz.answer;
                                      return (
                                        <button
                                          key={opt}
                                          disabled={!!chosen}
                                          onClick={() => { setQuizAnswers(a => ({ ...a, [g.id]: opt })); if (opt === quiz.answer) awardXP(10, "Grammar quiz"); }}
                                          className={cn(
                                            "px-3 py-2.5 rounded-xl text-sm font-medium border transition-all",
                                            !chosen
                                              ? "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] hover:border-mm-red/50 hover:bg-mm-red/8"
                                              : picked && correct
                                                ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                                                : picked && !correct
                                                  ? "border-[#E8504A]/60 bg-[#E8504A]/15 text-[#E8504A]"
                                                  : correct
                                                    ? "border-emerald-500/40 bg-emerald-500/8 text-emerald-400"
                                                    : "border-[rgba(255,255,255,0.06)] opacity-40"
                                          )}
                                        >
                                          {opt}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {chosen && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 4 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className={cn(
                                        "flex items-start gap-2 p-3 rounded-xl text-xs",
                                        isCorrect
                                          ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
                                          : "bg-[#E8504A]/10 border border-[#E8504A]/25 text-[#E8504A]"
                                      )}
                                    >
                                      {isCorrect
                                        ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                                        : <XCircle size={14} className="shrink-0 mt-0.5" />
                                      }
                                      <span>{isCorrect ? "Chính xác! " : `Đáp án đúng: ${quiz.answer}. `}{quiz.hint}</span>
                                    </motion.div>
                                  )}
                                  {chosen && (
                                    <button
                                      onClick={() => {
                                        setQuizAnswers(a => { const n = { ...a }; delete n[g.id]; return n; });
                                      }}
                                      className="text-[10px] text-[var(--text-muted)] hover:text-white transition-colors"
                                    >
                                      Thử lại →
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📖</p>
            <p className="text-sm text-[var(--text-muted)]">Không tìm thấy cấu trúc nào</p>
          </div>
        )}
      </div>
    </main>
  );
}
