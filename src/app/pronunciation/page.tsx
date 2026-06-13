/**
 * /pronunciation — Trang luyện phát âm
 * Danh sách câu theo level, dùng PronunciationPractice component
 */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, ChevronLeft, ChevronRight, Trophy, Star } from "lucide-react";
import PronunciationPractice from "@/components/ui/PronunciationPractice";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";

interface PracticeItem {
  id: string;
  chinese_text: string;
  pinyin: string;
  translation: string;
  level: string;
  category: string;
}

const PRACTICE_ITEMS: PracticeItem[] = [
  // Cơ bản
  { id: "1", chinese_text: "你好", pinyin: "Nǐ hǎo", translation: "Xin chào", level: "hsk1", category: "Chào hỏi" },
  { id: "2", chinese_text: "谢谢你", pinyin: "Xièxiè nǐ", translation: "Cảm ơn bạn", level: "hsk1", category: "Chào hỏi" },
  { id: "3", chinese_text: "对不起", pinyin: "Duìbuqǐ", translation: "Xin lỗi", level: "hsk1", category: "Chào hỏi" },
  { id: "4", chinese_text: "我爱你", pinyin: "Wǒ ài nǐ", translation: "Tôi yêu bạn", level: "hsk1", category: "Cảm xúc" },
  { id: "5", chinese_text: "没关系", pinyin: "Méi guānxi", translation: "Không sao", level: "hsk1", category: "Chào hỏi" },
  // HSK2
  { id: "6", chinese_text: "你吃饭了吗", pinyin: "Nǐ chī fàn le ma", translation: "Bạn ăn cơm chưa?", level: "hsk2", category: "Đời sống" },
  { id: "7", chinese_text: "我很高兴认识你", pinyin: "Wǒ hěn gāoxìng rènshi nǐ", translation: "Tôi rất vui được gặp bạn", level: "hsk2", category: "Chào hỏi" },
  { id: "8", chinese_text: "你从哪里来", pinyin: "Nǐ cóng nǎlǐ lái", translation: "Bạn đến từ đâu?", level: "hsk2", category: "Hỏi thăm" },
  // HSK3 — cảm xúc
  { id: "9", chinese_text: "我很想你", pinyin: "Wǒ hěn xiǎng nǐ", translation: "Tôi rất nhớ bạn", level: "hsk3", category: "Cảm xúc" },
  { id: "10", chinese_text: "你笑起来很好看", pinyin: "Nǐ xiào qǐlái hěn hǎokàn", translation: "Bạn trông rất đẹp khi cười", level: "hsk3", category: "Cảm xúc" },
  { id: "11", chinese_text: "今天天气怎么样", pinyin: "Jīntiān tiānqì zěnmeyàng", translation: "Hôm nay thời tiết thế nào?", level: "hsk3", category: "Đời sống" },
  // HSK4 — câu hay, thành ngữ
  { id: "12", chinese_text: "有缘千里来相会", pinyin: "Yǒu yuán qiānlǐ lái xiāng huì", translation: "Có duyên nghìn dặm cũng gặp nhau", level: "hsk4", category: "Thành ngữ" },
  { id: "13", chinese_text: "一切都会好起来的", pinyin: "Yīqiè dōu huì hǎo qǐlái de", translation: "Mọi thứ sẽ trở nên tốt hơn", level: "hsk4", category: "Cảm xúc" },
  { id: "14", chinese_text: "慢慢来，不要着急", pinyin: "Màn man lái, bùyào zhāojí", translation: "Từ từ thôi, đừng vội", level: "hsk4", category: "Đời sống" },
  { id: "16", chinese_text: "塞翁失马，焉知非福", pinyin: "Sài wēng shī mǎ, yān zhī fēi fú", translation: "Người già mất ngựa, biết đâu không phải phúc", level: "hsk4", category: "Thành ngữ" },
  { id: "17", chinese_text: "再难的路，走着走着就习惯了", pinyin: "Zài nán de lù, zǒuzhe zǒuzhe jiù xíguàn le", translation: "Con đường dù khó, đi mãi rồi cũng quen", level: "hsk4", category: "Cảm xúc" },
  { id: "18", chinese_text: "不积跬步，无以至千里", pinyin: "Bù jī kuǐbù, wúyǐ zhì qiānlǐ", translation: "Không tích từng bước nhỏ, không thể đi nghìn dặm", level: "hsk4", category: "Thành ngữ" },
  // HSK5 — thơ và câu văn chương
  { id: "15", chinese_text: "人生若只如初见", pinyin: "Rénshēng ruò zhǐ rú chūjiàn", translation: "Giá như cuộc đời mãi đẹp như lần đầu gặp gỡ", level: "hsk5", category: "Thơ văn" },
  { id: "19", chinese_text: "你若安好，便是晴天", pinyin: "Nǐ ruò ān hǎo, biàn shì qíngtiān", translation: "Nếu bạn bình an, đó chính là trời quang", level: "hsk5", category: "Thơ văn" },
  { id: "20", chinese_text: "忍一时风平浪静，退一步海阔天空", pinyin: "Rěn yī shí fēng píng làng jìng, tuì yī bù hǎi kuò tiān kōng", translation: "Nhẫn một lúc gió yên sóng lặng, lùi một bước biển rộng trời cao", level: "hsk5", category: "Thành ngữ" },
  { id: "21", chinese_text: "心有灵犀一点通", pinyin: "Xīn yǒu língxī yī diǎn tōng", translation: "Hai tâm hồn kết nối, chạm là hiểu nhau ngay", level: "hsk5", category: "Thơ văn" },
  { id: "22", chinese_text: "落霞与孤鹜齐飞，秋水共长天一色", pinyin: "Luò xiá yǔ gū wù qí fēi, qiūshuǐ gòng cháng tiān yī sè", translation: "Ráng chiều cùng cánh cò cô đơn bay, nước thu hòa trời một màu", level: "hsk5", category: "Thơ văn" },
  // HSK6 — thơ cổ điển nâng cao
  { id: "23", chinese_text: "曾经沧海难为水，除却巫山不是云", pinyin: "Céngjīng cānghǎi nán wéi shuǐ, chúquè Wūshān bù shì yún", translation: "Từng thấy biển cả khó coi là nước, ngoài núi Vu ra chẳng gọi là mây", level: "hsk6", category: "Thơ văn" },
  { id: "24", chinese_text: "长风破浪会有时，直挂云帆济沧海", pinyin: "Cháng fēng pò làng huì yǒu shí, zhí guà yún fān jì cānghǎi", translation: "Gió lớn phá sóng rồi sẽ có lúc, thẳng căng buồm mây vượt biển xanh", level: "hsk6", category: "Thơ văn" },
  { id: "25", chinese_text: "海内存知己，天涯若比邻", pinyin: "Hǎi nèi cún zhī jǐ, tiānyá ruò bǐ lín", translation: "Trong bốn bể còn tri kỷ, dù chân trời cũng như láng giềng", level: "hsk6", category: "Thơ văn" },
  { id: "26", chinese_text: "君子之交淡如水，小人之交甘若醴", pinyin: "Jūnzǐ zhī jiāo dàn rú shuǐ, xiǎorén zhī jiāo gān ruò lǐ", translation: "Giao thiệp quân tử nhạt như nước, giao thiệp tiểu nhân ngọt như mật", level: "hsk6", category: "Triết học" },
  { id: "27", chinese_text: "知之为知之，不知为不知，是知也", pinyin: "Zhī zhī wéi zhī zhī, bù zhī wéi bù zhī, shì zhī yě", translation: "Biết là biết, không biết là không biết, đó mới là trí tuệ thật sự", level: "hsk6", category: "Triết học" },
  { id: "28", chinese_text: "上善若水，水善利万物而不争", pinyin: "Shàngshàn ruò shuǐ, shuǐ shàn lì wànwù ér bù zhēng", translation: "Điều thiện cao nhất như nước, nước khéo lợi vạn vật mà không tranh", level: "hsk6", category: "Triết học" },
];

const LEVELS = ["Tất cả", "hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6"];
const LEVEL_LABELS: Record<string, string> = {
  "Tất cả": "Tất cả", hsk1: "HSK 1", hsk2: "HSK 2", hsk3: "HSK 3", hsk4: "HSK 4", hsk5: "HSK 5", hsk6: "HSK 6"
};

export default function PronunciationPage() {
  const { awardXP } = useProgress();
  const [selectedLevel, setSelectedLevel] = useState("Tất cả");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [showSummary, setShowSummary] = useState(false);

  // Award XP khi hoàn thành session
  useEffect(() => {
    if (!showSummary || totalScored === 0) return;
    const xp = Math.round(avgScore / 10) * totalScored * 3; // 0–30 XP mỗi câu
    awardXP(xp, "Luyện phát âm");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSummary]);

  const filtered = selectedLevel === "Tất cả"
    ? PRACTICE_ITEMS
    : PRACTICE_ITEMS.filter(i => i.level === selectedLevel);

  const current = filtered[currentIdx] ?? filtered[0];
  const totalScored = Object.keys(scores).length;
  const avgScore = totalScored > 0
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / totalScored)
    : 0;

  const handleScore = (score: number) => {
    setScores(prev => ({ ...prev, [current.id]: score }));
  };

  const handlePrev = () => setCurrentIdx(i => Math.max(0, i - 1));
  const handleNext = () => {
    if (currentIdx < filtered.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setShowSummary(true);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <Mic size={18} className="text-mm-red" />
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Luyện phát âm</p>
        </div>
        <h1 className="font-playfair text-2xl font-bold">Nói tiếng Trung 🎤</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Nhấn mic, đọc to, nhận điểm tức thì</p>
      </motion.div>

      {/* Stats bar */}
      {totalScored > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-3 mb-5"
        >
          <div className="flex-1 bg-surface rounded-2xl p-3 text-center border border-[rgba(255,255,255,0.06)]">
            <p className="text-2xl font-bold text-mm-red">{avgScore}</p>
            <p className="text-xs text-[var(--text-muted)]">Điểm TB</p>
          </div>
          <div className="flex-1 bg-surface rounded-2xl p-3 text-center border border-[rgba(255,255,255,0.06)]">
            <p className="text-2xl font-bold text-mm-gold">{totalScored}</p>
            <p className="text-xs text-[var(--text-muted)]">Đã luyện</p>
          </div>
          <div className="flex-1 bg-surface rounded-2xl p-3 text-center border border-[rgba(255,255,255,0.06)]">
            <p className="text-2xl font-bold">{filtered.length}</p>
            <p className="text-xs text-[var(--text-muted)]">Tổng câu</p>
          </div>
        </motion.div>
      )}

      {/* Level filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {LEVELS.map(lvl => (
          <button
            key={lvl}
            onClick={() => { setSelectedLevel(lvl); setCurrentIdx(0); }}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              selectedLevel === lvl
                ? "bg-mm-red text-white"
                : "bg-surface2 text-[var(--text-muted)] hover:text-white"
            )}
          >
            {LEVEL_LABELS[lvl]}
          </button>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[var(--text-muted)]">
          {currentIdx + 1} / {filtered.length}
        </span>
        <div className="flex gap-1">
          {filtered.slice(0, Math.min(filtered.length, 15)).map((item, i) => (
            <div
              key={item.id}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === currentIdx ? "w-4 bg-mm-red" : scores[item.id] ? "w-1.5 bg-mm-gold" : "w-1.5 bg-surface2"
              )}
            />
          ))}
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-surface2 text-[var(--text-muted)]">
          {current?.category}
        </span>
      </div>

      {/* Practice component */}
      <AnimatePresence mode="wait">
        {current && !showSummary && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <PronunciationPractice
              targetText={current.chinese_text}
              targetPinyin={current.pinyin}
              translation={current.translation}
              onScore={handleScore}
            />
          </motion.div>
        )}

        {showSummary && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-3xl p-6 text-center border border-[rgba(255,255,255,0.08)]"
          >
            <Trophy size={48} className="text-mm-gold mx-auto mb-3" />
            <h2 className="font-playfair text-2xl font-bold mb-2">Tổng kết 🎉</h2>
            <p className="text-[var(--text-muted)] mb-4">
              Đã luyện {totalScored}/{filtered.length} câu
            </p>
            <div className="text-5xl font-bold text-mm-red mb-2">{avgScore}</div>
            <p className="text-sm text-[var(--text-muted)] mb-6">điểm trung bình</p>
            <div className="flex gap-1 justify-center mb-6">
              {[1,2,3,4,5].map(s => (
                <Star
                  key={s}
                  size={20}
                  className={avgScore >= s * 20 ? "text-mm-gold fill-mm-gold" : "text-surface2"}
                />
              ))}
            </div>
            <button
              onClick={() => { setShowSummary(false); setCurrentIdx(0); setScores({}); }}
              className="w-full py-3 rounded-2xl bg-mm-red text-white font-semibold"
            >
              Luyện lại từ đầu
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      {!showSummary && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-[rgba(255,255,255,0.08)] text-sm disabled:opacity-30 transition-all active:scale-95"
          >
            <ChevronLeft size={16} /> Trước
          </button>
          <button
            onClick={handleNext} aria-label="Câu tiếp theo"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-mm-red text-white text-sm font-semibold transition-all active:scale-95"
          >
            {currentIdx === filtered.length - 1 ? "Xem kết quả" : "Tiếp theo"} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </main>
  );
}
