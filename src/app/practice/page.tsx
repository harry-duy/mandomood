"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { playTTS } from "@/hooks/useTTS";
import { Volume2, CheckCircle, XCircle, RefreshCw, ChevronRight, Trophy, Shuffle } from "lucide-react";
import { cn, readJSON, writeJSON } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";

interface Sentence {
  id: string;
  words: string[];        // correct order
  pinyin: string[];       // per-word pinyin
  translation: string;
  grammar: string;        // grammar point used
  level: string;
  hint?: string;
}

const SENTENCES: Sentence[] = [
  {
    id: "s1", level: "HSK 1",
    words: ["我", "喜欢", "学习", "汉语"],
    pinyin: ["wǒ", "xǐhuān", "xuéxí", "Hànyǔ"],
    translation: "Tôi thích học tiếng Trung.",
    grammar: "Subject + 喜欢 + Verb + Object",
    hint: "Chủ ngữ → động từ → tân ngữ",
  },
  {
    id: "s2", level: "HSK 1",
    words: ["你好", "我", "叫", "小明"],
    pinyin: ["nǐ hǎo", "wǒ", "jiào", "Xiǎomíng"],
    translation: "Xin chào, tôi tên là Tiểu Minh.",
    grammar: "Greeting + 我叫 + Name",
    hint: "Chào hỏi → tự giới thiệu",
  },
  {
    id: "s3", level: "HSK 2",
    words: ["今天", "天气", "很", "好"],
    pinyin: ["jīntiān", "tiānqì", "hěn", "hǎo"],
    translation: "Hôm nay thời tiết rất đẹp.",
    grammar: "Time + Subject + 很 + Adj",
    hint: "Thời gian đứng đầu câu",
  },
  {
    id: "s4", level: "HSK 2",
    words: ["她", "比", "我", "高", "多了"],
    pinyin: ["tā", "bǐ", "wǒ", "gāo", "duō le"],
    translation: "Cô ấy cao hơn tôi nhiều.",
    grammar: "A + 比 + B + Adj + 多了",
    hint: "Cấu trúc so sánh 比",
  },
  {
    id: "s5", level: "HSK 2",
    words: ["我", "去过", "北京", "两次"],
    pinyin: ["wǒ", "qù guò", "Běijīng", "liǎng cì"],
    translation: "Tôi đã từng đến Bắc Kinh hai lần.",
    grammar: "Subject + Verb + 过 + Object + 次数",
    hint: "过 = đã từng trải nghiệm",
  },
  {
    id: "s6", level: "HSK 3",
    words: ["虽然", "很累", "但是", "我", "还是", "来了"],
    pinyin: ["suīrán", "hěn lèi", "dànshì", "wǒ", "háishì", "lái le"],
    translation: "Mặc dù rất mệt nhưng tôi vẫn đến.",
    grammar: "虽然...但是...还是",
    hint: "Nhượng bộ: mặc dù... nhưng vẫn...",
  },
  {
    id: "s7", level: "HSK 3",
    words: ["请", "把", "门", "关上"],
    pinyin: ["qǐng", "bǎ", "mén", "guān shàng"],
    translation: "Vui lòng đóng cửa lại.",
    grammar: "请 + 把 + Object + Verb + Complement",
    hint: "把 đưa tân ngữ lên trước động từ",
  },
  {
    id: "s8", level: "HSK 3",
    words: ["因为", "下雨", "所以", "我", "没", "出去"],
    pinyin: ["yīnwèi", "xià yǔ", "suǒyǐ", "wǒ", "méi", "chūqù"],
    translation: "Vì trời mưa nên tôi không ra ngoài.",
    grammar: "因为...所以...",
    hint: "Nguyên nhân → kết quả",
  },
  {
    id: "s9", level: "HSK 4",
    words: ["他", "把", "作业", "做完了"],
    pinyin: ["tā", "bǎ", "zuòyè", "zuò wán le"],
    translation: "Anh ấy đã làm xong bài tập.",
    grammar: "Subject + 把 + Object + Verb + Result",
    hint: "把 + kết quả hoàn thành",
  },
  {
    id: "s10", level: "HSK 4",
    words: ["连", "小孩", "都", "会做", "这道题"],
    pinyin: ["lián", "xiǎohái", "dōu", "huì zuò", "zhè dào tí"],
    translation: "Ngay cả trẻ con cũng làm được bài này.",
    grammar: "连 + extreme + 都 + Verb",
    hint: "连...都 = nhấn mạnh cực đoan",
  },
  {
    id: "s11", level: "HSK 2",
    words: ["我", "的", "钱包", "被", "偷了"],
    pinyin: ["wǒ", "de", "qiánbāo", "bèi", "tōu le"],
    translation: "Ví tiền của tôi bị mất cắp rồi.",
    grammar: "Subject + 被 + Verb + 了",
    hint: "被 = bị (câu bị động tiêu cực)",
  },
  {
    id: "s12", level: "HSK 3",
    words: ["她", "唱歌", "唱得", "很好听"],
    pinyin: ["tā", "chànggē", "chàng de", "hěn hǎotīng"],
    translation: "Cô ấy hát rất hay.",
    grammar: "Subject + Verb + 得 + Complement",
    hint: "得 sau động từ = mức độ",
  },
  {
    id: "s13", level: "HSK 3",
    words: ["这本书", "越看", "越有意思"],
    pinyin: ["zhè běn shū", "yuè kàn", "yuè yǒu yìsi"],
    translation: "Cuốn sách này càng đọc càng thú vị.",
    grammar: "越 + Verb + 越 + Adj",
    hint: "越...越 = càng... càng...",
  },
  {
    id: "s14", level: "HSK 4",
    words: ["只有", "努力", "才能", "成功"],
    pinyin: ["zhǐyǒu", "nǔlì", "cáinéng", "chénggōng"],
    translation: "Chỉ có nỗ lực mới có thể thành công.",
    grammar: "只有...才...",
    hint: "Điều kiện duy nhất: chỉ khi A thì mới B",
  },
  {
    id: "s15", level: "HSK 4",
    words: ["我", "宁可", "一个人", "也不", "将就"],
    pinyin: ["wǒ", "nìngkě", "yīgèrén", "yě bù", "jiāngjiu"],
    translation: "Tôi thà ở một mình còn hơn sống qua loa.",
    grammar: "宁可...也不...",
    hint: "Thà A còn hơn B — chọn cái ít tệ hơn",
  },
  {
    id: "s16", level: "HSK 3",
    words: ["我", "已经", "等了", "你", "半个小时", "了"],
    pinyin: ["wǒ", "yǐjīng", "děng le", "nǐ", "bàn gè xiǎoshí", "le"],
    translation: "Tôi đã đợi em nửa tiếng rồi.",
    grammar: "已经 + Verb + 了 + Duration + 了",
    hint: "Diễn tả thời gian đã kéo dài đến hiện tại",
  },
  {
    id: "s17", level: "HSK 4",
    words: ["不管", "多难", "我", "都", "不会放弃"],
    pinyin: ["bùguǎn", "duō nán", "wǒ", "dōu", "bù huì fàngqì"],
    translation: "Dù khó đến đâu tôi cũng không bỏ cuộc.",
    grammar: "不管 + Condition + 都...",
    hint: "Bất kể điều kiện gì, kết quả vẫn thế",
  },
  {
    id: "s18", level: "HSK 5",
    words: ["这件事", "对我", "来说", "并不容易"],
    pinyin: ["zhè jiàn shì", "duì wǒ", "lái shuō", "bìng bù róngyì"],
    translation: "Chuyện này đối với tôi mà nói thật ra không dễ.",
    grammar: "对...来说 + 并不 + Adj",
    hint: "对A来说 = đối với A mà nói / 并不 = thật ra không",
  },
  {
    id: "s19", level: "HSK 2",
    words: ["你", "能不能", "帮我", "一个忙"],
    pinyin: ["nǐ", "néng bu néng", "bāng wǒ", "yī gè máng"],
    translation: "Bạn có thể giúp tôi một việc không?",
    grammar: "能不能 + Verb (lịch sự hỏi có thể không)",
    hint: "能不能 = có thể không (nhã hơn 能吗?)",
  },
  {
    id: "s20", level: "HSK 4",
    words: ["时间", "越来越", "不够用"],
    pinyin: ["shíjiān", "yuè lái yuè", "bú gòu yòng"],
    translation: "Thời gian ngày càng không đủ dùng.",
    grammar: "越来越 + Adj/Verb",
    hint: "越来越 = ngày càng (mức độ tăng dần)",
  },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type GameState = "playing" | "correct" | "wrong" | "finished";

export default function PracticePage() {
  const { awardXP } = useProgress();
  const [qIndex, setQIndex] = useState(0);
  const [deck] = useState(() => shuffle(SENTENCES));
  const [tiles, setTiles] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);

  const current = deck[qIndex];

  // Reset on question change
  useEffect(() => {
    if (!current) return;
    setTiles(shuffle(current.words));
    setAnswer([]);
    setGameState("playing");
    setShowHint(false);
    setShowPinyin(false);
  }, [qIndex, current]);

  // Award XP và lưu best score khi hoàn thành
  useEffect(() => {
    if (gameState !== "finished") return;
    const pct = Math.round((score / deck.length) * 100);
    const prev = readJSON<number>("mm_practice_best", 0);
    if (pct > prev) writeJSON("mm_practice_best", pct);
    awardXP(score * 10, "Ghep cau");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const addWord = useCallback((word: string, idx: number) => {
    if (gameState !== "playing") return;
    setAnswer(a => [...a, word]);
    setTiles(t => t.filter((_, i) => i !== idx));
  }, [gameState]);

  const removeWord = useCallback((idx: number) => {
    if (gameState !== "playing") return;
    const word = answer[idx];
    setAnswer(a => a.filter((_, i) => i !== idx));
    setTiles(t => [...t, word]);
  }, [gameState, answer]);

  const checkAnswer = useCallback(() => {
    const correct = answer.join("") === current.words.join("");
    setGameState(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    playTTS(current.words.join(""));
  }, [answer, current]);

  const next = useCallback(() => {
    if (qIndex + 1 >= deck.length) {
      setGameState("finished");
    } else {
      setQIndex(i => i + 1);
    }
  }, [qIndex, deck.length]);

  const restart = useCallback(() => {
    setQIndex(0);
    setScore(0);
    setGameState("playing");
  }, []);

  if (gameState === "finished") {
    const pct = Math.round((score / deck.length) * 100);
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
          <div className="text-6xl">{pct >= 80 ? "🏆" : pct >= 50 ? "👏" : "💪"}</div>
          <Trophy size={32} className="mx-auto text-mm-gold" />
          <div>
            <p className="text-4xl font-bold">{score}/{deck.length}</p>
            <p className="text-lg text-mm-gold font-semibold">{pct}% chính xác</p>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            {pct >= 80 ? "Xuất sắc! Bạn ghép câu rất tốt!" : pct >= 50 ? "Khá! Luyện thêm một chút nữa." : "Cần luyện thêm — nhưng đừng bỏ cuộc!"}
          </p>
          <button onClick={restart}
            className="flex items-center gap-2 px-8 py-3 bg-mm-red text-white rounded-2xl font-semibold hover:bg-mm-red/90 transition-colors">
            <RefreshCw size={16} /> Thử lại
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28 bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold">Ghép câu</h1>
            <p className="text-xs text-[var(--text-muted)]">Sắp xếp các từ thành câu đúng</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)]">{qIndex + 1}/{deck.length}</span>
            <span className="text-xs font-bold text-mm-gold">⭐ {score}</span>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5 space-y-5">

        {/* Progress bar */}
        <div className="h-1.5 bg-[var(--bg-card)] rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${((qIndex) / deck.length) * 100}%` }}
            className="h-full bg-mm-red rounded-full"
          />
        </div>

        {/* Level + Grammar badge */}
        <AnimatePresence mode="wait">
          <motion.div key={current.id}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-mm-red/10 text-mm-red/80">{current.level}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-[rgba(255,255,255,0.06)] text-[var(--text-muted)] font-mono">{current.grammar}</span>
            </div>

            {/* Translation (the question) */}
            <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[rgba(255,255,255,0.06)]">
              <p className="text-xs text-[var(--text-muted)] mb-2">Dịch câu này sang tiếng Trung:</p>
              <p className="text-base font-semibold leading-relaxed">{current.translation}</p>
              {showHint && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-xs text-mm-gold mt-2">💡 {current.hint}</motion.p>
              )}
            </div>

            {/* Answer area */}
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2">Câu của bạn:</p>
              <div className={cn(
                "min-h-14 p-3 rounded-2xl border-2 flex flex-wrap gap-2 transition-all",
                gameState === "correct" ? "border-green-500 bg-green-500/10" :
                gameState === "wrong" ? "border-red-500 bg-red-500/10" :
                "border-[rgba(255,255,255,0.1)] bg-[var(--bg-card)]"
              )}>
                <AnimatePresence>
                  {answer.map((word, i) => (
                    <motion.button
                      key={`${word}-${i}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      onClick={() => removeWord(i)}
                      disabled={gameState !== "playing"}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-sm font-medium transition-all",
                        gameState === "playing" ? "bg-mm-red/20 text-white border border-mm-red/30 hover:bg-mm-red/30" :
                        gameState === "correct" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
                        "bg-red-500/20 text-red-300 border border-red-500/30"
                      )}
                    >
                      <div>
                        {showPinyin && (
                          <div className="text-[9px] text-mm-red/70 leading-none mb-0.5">
                            {current.pinyin[current.words.indexOf(word)]}
                          </div>
                        )}
                        {word}
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
                {answer.length === 0 && (
                  <span className="text-xs text-[rgba(255,255,255,0.2)] self-center ml-1">Nhấn từ bên dưới để thêm vào đây...</span>
                )}
              </div>
            </div>

            {/* Word bank */}
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2">Ngân hàng từ:</p>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {tiles.map((word, i) => (
                    <motion.button
                      key={`tile-${word}-${i}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      onClick={() => addWord(word, i)}
                      disabled={gameState !== "playing"}
                      className="px-3 py-2 bg-[var(--bg-card)] border border-[rgba(255,255,255,0.1)] rounded-xl text-sm font-medium hover:border-mm-red/40 hover:bg-mm-red/10 transition-all disabled:opacity-40"
                    >
                      {word}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Result feedback */}
            <AnimatePresence>
              {(gameState === "correct" || gameState === "wrong") && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("rounded-2xl p-4 flex items-start gap-3",
                    gameState === "correct" ? "bg-green-500/15 border border-green-500/30" : "bg-red-500/15 border border-red-500/30"
                  )}>
                  {gameState === "correct"
                    ? <CheckCircle size={18} className="text-green-400 mt-0.5 shrink-0" />
                    : <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />}
                  <div className="flex-1">
                    <p className={cn("text-sm font-semibold", gameState === "correct" ? "text-green-300" : "text-red-300")}>
                      {gameState === "correct" ? "Chính xác! 🎉" : "Chưa đúng"}
                    </p>
                    {gameState === "wrong" && (
                      <p className="text-sm text-white/80 mt-1">
                        Đáp án đúng: <span className="font-bold">{current.words.join("")}</span>
                      </p>
                    )}
                  </div>
                  <button onClick={() => playTTS(current.words.join(""))}
                    className="p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.1)] shrink-0">
                    <Volume2 size={14} className="text-[var(--text-muted)]" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex gap-2">
              {gameState === "playing" ? (
                <>
                  <button onClick={() => setShowHint(h => !h)}
                    className={cn("px-4 py-2.5 rounded-2xl text-xs border transition-all",
                      showHint ? "border-mm-gold text-mm-gold bg-mm-gold/10" : "border-[rgba(255,255,255,0.1)] text-[var(--text-muted)]")}>
                    💡 Gợi ý
                  </button>
                  <button onClick={() => setShowPinyin(p => !p)}
                    className={cn("px-4 py-2.5 rounded-2xl text-xs border transition-all",
                      showPinyin ? "border-mm-red text-mm-red bg-mm-red/10" : "border-[rgba(255,255,255,0.1)] text-[var(--text-muted)]")}>
                    拼音
                  </button>
                  <button
                    onClick={() => { setTiles(shuffle(current.words)); setAnswer([]); }}
                    className="px-3 py-2.5 rounded-2xl border border-[rgba(255,255,255,0.1)] text-[var(--text-muted)] hover:text-white transition-colors">
                    <Shuffle size={14} />
                  </button>
                  <button
                    onClick={checkAnswer}
                    disabled={answer.length !== current.words.length}
                    className="flex-1 py-2.5 bg-mm-red text-white rounded-2xl text-sm font-semibold disabled:opacity-30 hover:bg-mm-red/90 transition-colors"
                  >
                    Kiểm tra
                  </button>
                </>
              ) : (
                <button onClick={next} aria-label="Câu tiếp theo"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-mm-red text-white rounded-2xl font-semibold hover:bg-mm-red/90 transition-colors">
                  {qIndex + 1 >= deck.length ? "Xem kết quả" : "Câu tiếp"} <ChevronRight size={16} />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
