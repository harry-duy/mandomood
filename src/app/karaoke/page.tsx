"use client";

/**
 * /karaoke — Karaoke luyện nghe & nói tiếng Trung
 * Cảm hứng từ Shadowing của nhaikanji.com.
 *
 * 3 chế độ:
 *  🎧 Nghe     — TTS đọc auto từng câu, highlight câu đang đọc, học viên theo dõi
 *  🎤 Shadowing — TTS đọc → tự dừng → học viên nhái theo (gap technique)
 *  📝 Chính tả  — ẩn chữ, TTS đọc, học viên gõ lại → chấm điểm từng câu
 *
 * Tính năng:
 *  - Speed: 0.7× / 1× / 1.2×
 *  - Ẩn/hiện pinyin, ẩn/hiện dịch
 *  - Lặp 1 câu
 *  - XP + điểm chính tả cuối phiên
 *  - Phím tắt: Space (play/pause), ← → (prev/next)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, Repeat1,
  Eye, EyeOff, CheckCircle, XCircle, Trophy, RotateCcw,
  Headphones, Mic, PenLine, ChevronDown, ChevronRight, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeSentenceHanzi } from "@/lib/text";
import { useProgress } from "@/hooks/useProgress";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Mode = "listen" | "shadow" | "dictation";
type Speed = 0.7 | 1 | 1.2;
type Phase = "playing" | "gap" | "paused" | "waiting_input" | "done";

interface Segment {
  chinese: string;
  pinyin: string;
  translation: string;
}

interface Track {
  id: string;
  title: string;
  titleVi: string;
  level: string;
  mood: string;
  moodColor: string;
  segments: Segment[];
}

// ─── Nội dung ──────────────────────────────────────────────────────────────────

const TRACKS: Track[] = [
  {
    id: "t1", title: "思念的重量", titleVi: "Sức nặng của nỗi nhớ",
    level: "HSK 3", mood: "Lãng mạn", moodColor: "#E8504A",
    segments: [
      { chinese: "有些人，走了就不再回来了。", pinyin: "Yǒu xiē rén, zǒu le jiù bù zài huí lái le.", translation: "Có những người, một khi đã đi thì không bao giờ quay lại nữa." },
      { chinese: "但是他们留下的痕迹，却永远住在心里。", pinyin: "Dànshì tāmen liú xià de hénjì, què yǒngyuǎn zhù zài xīn lǐ.", translation: "Nhưng những dấu vết họ để lại thì mãi mãi sống trong tim." },
      { chinese: "思念是一种很轻的东西，", pinyin: "Sīniàn shì yī zhǒng hěn qīng de dōngxi,", translation: "Nỗi nhớ là một thứ rất nhẹ," },
      { chinese: "轻到你忘了它在那里，", pinyin: "Qīng dào nǐ wàng le tā zài nàlǐ,", translation: "nhẹ đến mức bạn quên mất nó ở đó," },
      { chinese: "却又重到让你喘不过气。", pinyin: "Què yòu zhòng dào ràng nǐ chuǎn bùguò qì.", translation: "nhưng lại nặng đến mức khiến bạn không thở được." },
    ],
  },
  {
    id: "t2", title: "慢慢来", titleVi: "Cứ từ từ thôi",
    level: "HSK 2", mood: "Chữa lành", moodColor: "#8FAF8F",
    segments: [
      { chinese: "不要着急，好的事情都是慢慢来的。", pinyin: "Bùyào zhāojí, hǎo de shìqing dōu shì màn man lái de.", translation: "Đừng vội, những điều tốt đẹp đều đến từ từ." },
      { chinese: "就像春天的花，", pinyin: "Jiù xiàng chūntiān de huā,", translation: "Cũng giống như hoa mùa xuân," },
      { chinese: "你急不来，它自然会开。", pinyin: "Nǐ jí bù lái, tā zìrán huì kāi.", translation: "bạn không thể thúc ép, nó tự nhiên sẽ nở." },
      { chinese: "生活也是这样的。", pinyin: "Shēnghuó yě shì zhèyàng de.", translation: "Cuộc sống cũng vậy." },
      { chinese: "你只需要做好今天的事情就好了。", pinyin: "Nǐ zhǐ xūyào zuòhǎo jīntiān de shìqing jiù hǎo le.", translation: "Bạn chỉ cần làm tốt việc của ngày hôm nay là đủ rồi." },
    ],
  },
  {
    id: "t3", title: "月亮代表我的心", titleVi: "Vầng trăng nói hộ lòng tôi",
    level: "HSK 3", mood: "Lãng mạn", moodColor: "#C9878A",
    segments: [
      { chinese: "你问我爱你有多深，", pinyin: "Nǐ wèn wǒ ài nǐ yǒu duō shēn,", translation: "Em hỏi anh yêu em sâu đến mức nào," },
      { chinese: "我爱你有几分。", pinyin: "Wǒ ài nǐ yǒu jǐ fēn.", translation: "anh yêu em được bao nhiêu phần." },
      { chinese: "我的情也真，我的爱也真，", pinyin: "Wǒ de qíng yě zhēn, wǒ de ài yě zhēn,", translation: "Tình anh cũng thật, tình yêu anh cũng thật," },
      { chinese: "月亮代表我的心。", pinyin: "Yuèliàng dàibiǎo wǒ de xīn.", translation: "Vầng trăng nói hộ lòng anh." },
    ],
  },
  {
    id: "t4", title: "工作与梦想", titleVi: "Công việc và ước mơ",
    level: "HSK 4", mood: "Động lực", moodColor: "#E8A838",
    segments: [
      { chinese: "很多人问我，工作和梦想有什么区别。", pinyin: "Hěn duō rén wèn wǒ, gōngzuò hé mèngxiǎng yǒu shénme qūbié.", translation: "Nhiều người hỏi tôi, công việc và ước mơ khác nhau như thế nào." },
      { chinese: "我说，工作是你必须做的，", pinyin: "Wǒ shuō, gōngzuò shì nǐ bìxū zuò de,", translation: "Tôi nói, công việc là thứ bạn phải làm," },
      { chinese: "梦想是你愿意为它付出一切的。", pinyin: "Mèngxiǎng shì nǐ yuànyì wèi tā fùchū yīqiè de.", translation: "còn ước mơ là thứ bạn sẵn lòng hi sinh tất cả vì nó." },
      { chinese: "当你找到愿意为之付出的事情，", pinyin: "Dāng nǐ zhǎodào yuànyì wèi zhī fùchū de shìqing,", translation: "Khi bạn tìm được điều mình sẵn lòng hi sinh vì nó," },
      { chinese: "那就是你的使命。", pinyin: "Nà jiùshì nǐ de shǐmìng.", translation: "đó chính là sứ mệnh của bạn." },
      { chinese: "不要放弃，继续走下去。", pinyin: "Bùyào fàngqì, jìxù zǒu xiàqù.", translation: "Đừng từ bỏ, hãy tiếp tục bước đi." },
    ],
  },
  {
    id: "t5", title: "下雨的下午", titleVi: "Buổi chiều mưa",
    level: "HSK 2", mood: "Aesthetic", moodColor: "#7A8E9F",
    segments: [
      { chinese: "下雨了。", pinyin: "Xià yǔ le.", translation: "Trời mưa rồi." },
      { chinese: "我坐在窗边，看着雨水打在玻璃上。", pinyin: "Wǒ zuò zài chuāng biān, kànzhe yǔshuǐ dǎ zài bōlí shàng.", translation: "Tôi ngồi bên cửa sổ, nhìn những hạt mưa đập vào kính." },
      { chinese: "每一滴雨都像一个小故事。", pinyin: "Měi yī dī yǔ dōu xiàng yī gè xiǎo gùshi.", translation: "Mỗi giọt mưa đều như một câu chuyện nhỏ." },
      { chinese: "有的快，有的慢，", pinyin: "Yǒu de kuài, yǒu de màn,", translation: "Có giọt nhanh, có giọt chậm," },
      { chinese: "但最终都流向同一个地方。", pinyin: "Dàn zuìzhōng dōu liú xiàng tóngyī gè dìfang.", translation: "nhưng cuối cùng đều chảy về cùng một nơi." },
    ],
  },
  {
    id: "t6", title: "告别", titleVi: "Lời tạm biệt",
    level: "HSK 4", mood: "Buồn đẹp", moodColor: "#6B7FA8",
    segments: [
      { chinese: "有些告别是悄悄发生的。", pinyin: "Yǒu xiē gàobié shì qiāoqiāo fāshēng de.", translation: "Có những lời tạm biệt xảy ra thật lặng lẽ." },
      { chinese: "没有仪式，没有眼泪，", pinyin: "Méiyǒu yíshì, méiyǒu yǎnlèi,", translation: "Không có nghi lễ, không có nước mắt," },
      { chinese: "只是有一天你突然发现，", pinyin: "Zhǐshì yǒu yī tiān nǐ tūrán fāxiàn,", translation: "chỉ là một ngày nào đó bạn bỗng nhận ra," },
      { chinese: "那个人已经从你的生活里消失了。", pinyin: "Nà gè rén yǐjīng cóng nǐ de shēnghuó lǐ xiāoshī le.", translation: "người đó đã biến mất khỏi cuộc sống của bạn rồi." },
      { chinese: "而你，甚至不知道是从什么时候开始的。", pinyin: "Ér nǐ, shènzhì bù zhīdào shì cóng shénme shíhòu kāishǐ de.", translation: "Còn bạn, thậm chí không biết điều đó bắt đầu từ bao giờ." },
    ],
  },
];

// ─── TTS helper (Web Speech, ưu tiên giọng zh) ────────────────────────────────

function getZhVoice(rate: number): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const utt = new SpeechSynthesisUtterance();
  utt.lang = "zh-CN";
  utt.rate = rate;
  const voices = window.speechSynthesis.getVoices();
  const zh = voices.find((v) => v.lang.startsWith("zh") && v.localService)
    ?? voices.find((v) => v.lang.startsWith("zh"));
  if (zh) utt.voice = zh;
  return utt;
}

async function waitForVoices(): Promise<void> {
  if (!window.speechSynthesis) return;
  if (window.speechSynthesis.getVoices().length > 0) return;
  await new Promise<void>((res) => {
    window.speechSynthesis.onvoiceschanged = () => res();
    setTimeout(res, 500);
  });
}

// ─── Component ─────────────────────────────────────────────────────────────────

const MODE_CONFIG: Record<Mode, { icon: React.ElementType; label: string; desc: string; color: string }> = {
  listen:    { icon: Headphones, label: "Nghe",      desc: "Tự động đọc từng câu, theo dõi",      color: "#7AB8D4" },
  shadow:    { icon: Mic,        label: "Shadowing",  desc: "Nghe câu → dừng → bạn nhái theo",     color: "#E8504A" },
  dictation: { icon: PenLine,    label: "Chính tả",   desc: "Nghe rồi gõ lại — kiểm tra tai nghe", color: "#D4AF37" },
};

export default function KaraokePage() {
  const { awardXP } = useProgress();

  // ── State UI ──
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [mode, setMode] = useState<Mode>("listen");
  const [speed, setSpeed] = useState<Speed>(1);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTrans, setShowTrans]   = useState(true);
  const [loopOne, setLoopOne]       = useState(false);

  // ── State phiên ──
  const [phase, setPhase]       = useState<Phase>("paused");
  const [idx, setIdx]           = useState(0);
  const [gapCount, setGapCount] = useState(0);      // đếm giây gap còn lại
  const [inputVal, setInputVal] = useState("");
  const [dictResult, setDictResult] = useState<("correct" | "wrong" | null)[]>([]);
  const [sessionDone, setSessionDone] = useState(false);

  const inputRef  = useRef<HTMLInputElement>(null);
  const gapTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const synthRef  = useRef<SpeechSynthesis | null>(null);

  const track = selectedTrack;
  const seg   = track?.segments[idx];
  const total = track?.segments.length ?? 0;

  // ── Cleanup on unmount / track change ──
  const stopAll = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (gapTimer.current) { clearInterval(gapTimer.current); gapTimer.current = null; }
    setPhase("paused");
    setGapCount(0);
  }, []);

  useEffect(() => () => stopAll(), [stopAll]);
  useEffect(() => {
    if (selectedTrack) { stopAll(); setIdx(0); setDictResult([]); setSessionDone(false); setInputVal(""); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrack, mode]);

  // ── Phát 1 câu ──
  const speakSegment = useCallback(async (segment: Segment) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    await waitForVoices();
    return new Promise<void>((resolve) => {
      const utt = getZhVoice(speed);
      if (!utt) { resolve(); return; }
      utt.text = segment.chinese;
      utt.onend  = () => resolve();
      utt.onerror = () => resolve();
      window.speechSynthesis.speak(utt);
    });
  }, [speed]);

  // ── Logic auto-advance (Listen / Shadow) ──
  const advanceOrDone = useCallback((currentIdx: number) => {
    if (!track) return;
    const next = currentIdx + 1;
    if (next >= track.segments.length) {
      setPhase("done");
      setSessionDone(true);
      awardXP(20);
      toast.success("Hoàn thành! +20 XP");
    } else {
      setIdx(next);
    }
  }, [track, awardXP]);

  // ── Chạy 1 cycle cho câu hiện tại ──
  const runCycle = useCallback(async (currentIdx: number) => {
    if (!track) return;
    const segment = track.segments[currentIdx];
    if (!segment) return;

    if (mode === "listen") {
      setPhase("playing");
      await speakSegment(segment);
      if (loopOne) { runCycle(currentIdx); return; }
      advanceOrDone(currentIdx);
    } else if (mode === "shadow") {
      // 1. phát câu
      setPhase("playing");
      await speakSegment(segment);
      // 2. gap — đếm ngược 3s để nhái
      const GAP = 3;
      setPhase("gap");
      setGapCount(GAP);
      let remaining = GAP;
      gapTimer.current = setInterval(() => {
        remaining -= 1;
        setGapCount(remaining);
        if (remaining <= 0) {
          if (gapTimer.current) { clearInterval(gapTimer.current); gapTimer.current = null; }
          if (loopOne) { runCycle(currentIdx); return; }
          advanceOrDone(currentIdx);
        }
      }, 1000);
    } else if (mode === "dictation") {
      setPhase("playing");
      await speakSegment(segment);
      setPhase("waiting_input");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, speed, loopOne, track, speakSegment, advanceOrDone]);

  // ── Replay hiện tại ──
  const replay = useCallback(() => {
    stopAll();
    setTimeout(() => runCycle(idx), 100);
  }, [stopAll, runCycle, idx]);

  // ── Play / Pause ──
  const togglePlay = useCallback(() => {
    if (phase === "paused") {
      runCycle(idx);
    } else {
      stopAll();
    }
  }, [phase, idx, runCycle, stopAll]);

  // ── Prev / Next ──
  const prev = useCallback(() => {
    stopAll();
    setInputVal("");
    setIdx((i) => Math.max(0, i - 1));
  }, [stopAll]);

  const next = useCallback(() => {
    stopAll();
    setInputVal("");
    if (!track) return;
    if (idx + 1 >= track.segments.length) { setSessionDone(true); setPhase("done"); awardXP(20); }
    else setIdx((i) => i + 1);
  }, [stopAll, track, idx, awardXP]);

  // ── Chấm điểm chính tả ──
  const submitDictation = useCallback(() => {
    if (!seg) return;
    const norm = normalizeSentenceHanzi(inputVal);
    const correct = normalizeSentenceHanzi(seg.chinese);
    const ok = norm === correct;
    setDictResult((prev) => {
      const next = [...prev];
      next[idx] = ok ? "correct" : "wrong";
      return next;
    });
    if (ok) { toast.success("Chính xác! ✓"); awardXP(5); }
    else     { toast.error("Chưa đúng — nghe lại nhé"); }
    setInputVal("");
    setPhase("paused");
    // tự động chuyển câu sau 1.2s
    setTimeout(() => {
      if (idx + 1 >= (track?.segments.length ?? 0)) { setSessionDone(true); setPhase("done"); awardXP(10); }
      else { setIdx((i) => i + 1); setPhase("paused"); }
    }, 1200);
  }, [seg, inputVal, idx, track, awardXP]);

  // ── Keyboard ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      if (e.code === "ArrowLeft") prev();
      if (e.code === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay, prev, next]);

  // ── Điểm chính tả ──
  const dictScore = useMemo(() => {
    const done = dictResult.filter(Boolean).length;
    const correct = dictResult.filter((r) => r === "correct").length;
    return { done, correct, total };
  }, [dictResult, total]);

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER — màn hình chọn bài
  // ════════════════════════════════════════════════════════════════════════════
  if (!selectedTrack) {
    return (
      <main className="min-h-screen px-4 py-6 max-w-2xl mx-auto pb-24 pt-20">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Karaoke</p>
          <h1 className="font-playfair text-2xl font-bold">Luyện nghe & nói 🎤</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Chọn bài, chọn chế độ — nghe, nhái theo, hoặc chép chính tả.
          </p>
        </motion.div>

        {/* Chọn chế độ */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all",
                  mode === key
                    ? "border-[#E8504A]/60 bg-[#E8504A]/10"
                    : "border-[rgba(255,255,255,0.08)] bg-[#161616] hover:border-[rgba(255,255,255,0.18)]"
                )}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}
                >
                  <Icon size={18} style={{ color: mode === key ? cfg.color : "#8A8078" }} />
                </div>
                <p className="text-xs font-semibold">{cfg.label}</p>
                <p className="text-[10px] text-[var(--text-muted)] leading-tight">{cfg.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Danh sách bài */}
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">Chọn bài</p>
        <div className="space-y-3">
          {TRACKS.map((track, i) => (
            <motion.button
              key={track.id}
              onClick={() => setSelectedTrack(track)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 4 }}
              className="w-full text-left flex items-center gap-4 p-4 bg-[#161616] border border-[rgba(255,255,255,0.08)] rounded-2xl hover:border-[rgba(255,255,255,0.2)] transition-all group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl font-playfair font-bold"
                style={{ backgroundColor: `${track.moodColor}18`, color: track.moodColor, border: `1px solid ${track.moodColor}30` }}
              >
                {track.segments.length}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{track.title}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{track.titleVi}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#242424] text-[#8A8078]">{track.level}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${track.moodColor}18`, color: track.moodColor }}>{track.mood}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#5A5050] group-hover:text-white transition-colors shrink-0" />
            </motion.button>
          ))}
        </div>
      </main>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER — màn hình luyện tập
  // ════════════════════════════════════════════════════════════════════════════

  const modeConfig = MODE_CONFIG[mode];
  const ModeIcon = modeConfig.icon;

  return (
    <main className="min-h-screen px-4 pb-24 pt-20 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => { stopAll(); setSelectedTrack(null); setSessionDone(false); setDictResult([]); setIdx(0); }}
          className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center text-[#8A8078] hover:text-white transition-colors"
          aria-label="Quay lại"
        >
          <SkipBack size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--text-muted)] truncate">{track.title} · {track.level}</p>
          <div className="flex items-center gap-2">
            <ModeIcon size={13} style={{ color: modeConfig.color }} />
            <span className="text-xs font-semibold" style={{ color: modeConfig.color }}>{modeConfig.label}</span>
          </div>
        </div>
        {/* Controls: pinyin / dịch / speed / loop */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowPinyin((v) => !v)}
            className={cn("px-2 py-1 text-[10px] rounded-lg border transition-colors",
              showPinyin ? "bg-[#242424] text-white border-[rgba(255,255,255,0.15)]" : "text-[#5A5050] border-[rgba(255,255,255,0.06)]")}>
            拼
          </button>
          <button onClick={() => setShowTrans((v) => !v)}
            className={cn("px-2 py-1 text-[10px] rounded-lg border transition-colors",
              showTrans ? "bg-[#242424] text-white border-[rgba(255,255,255,0.15)]" : "text-[#5A5050] border-[rgba(255,255,255,0.06)]")}>
            VI
          </button>
          <button onClick={() => setSpeed((s) => s === 0.7 ? 1 : s === 1 ? 1.2 : 0.7)}
            className="px-2 py-1 text-[10px] rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#1A1A1A] text-white min-w-[34px] text-center">
            {speed}×
          </button>
          <button onClick={() => setLoopOne((v) => !v)}
            className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
              loopOne ? "bg-[#E8504A]/20 text-[#E8504A]" : "text-[#5A5050]")}>
            <Repeat1 size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#1C1C1E] rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#E8504A] to-[#D4AF37] rounded-full transition-all duration-500"
          style={{ width: `${total > 0 ? ((idx + 1) / total) * 100 : 0}%` }}
        />
      </div>

      {/* Kết quả session */}
      <AnimatePresence>
        {sessionDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mb-5 p-5 bg-gradient-to-br from-[#E8504A]/15 to-[#D4AF37]/10 border border-[#E8504A]/30 rounded-2xl text-center"
          >
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-playfair text-xl font-bold mb-1">Xuất sắc!</p>
            {mode === "dictation" && (
              <p className="text-sm text-[var(--text-muted)]">
                Chính tả: {dictScore.correct}/{dictScore.total} đúng
              </p>
            )}
            <p className="text-sm text-[#D4AF37] mt-1">+20 XP đã cộng</p>
            <button
              onClick={() => { stopAll(); setIdx(0); setDictResult([]); setSessionDone(false); setPhase("paused"); setInputVal(""); }}
              className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 bg-[#E8504A] text-white rounded-xl text-sm font-medium"
            >
              <RotateCcw size={14} /> Làm lại
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript — danh sách câu */}
      <div className="space-y-2 mb-6">
        {track.segments.map((seg, i) => {
          const isActive = i === idx;
          const result = dictResult[i];
          return (
            <motion.button
              key={i}
              onClick={() => { if (!sessionDone) { stopAll(); setIdx(i); setInputVal(""); } }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "w-full text-left p-4 rounded-2xl border transition-all",
                isActive
                  ? "bg-[#1C1C1E] border-[#E8504A]/50 shadow-[0_0_16px_rgba(232,80,74,0.12)]"
                  : "bg-[#161616] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.14)]"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Số thứ tự / trạng thái */}
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                  result === "correct" ? "bg-emerald-500/20 text-emerald-400" :
                  result === "wrong"   ? "bg-[#E8504A]/20 text-[#E8504A]" :
                  isActive             ? "bg-[#E8504A] text-white" :
                                         "bg-[#242424] text-[#5A5050]"
                )}>
                  {result === "correct" ? "✓" : result === "wrong" ? "✗" : i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Chữ Hán — ẩn nếu dictation + active + chưa submit */}
                  <p className={cn(
                    "text-base font-medium leading-relaxed lang-zh",
                    isActive ? "text-[#F5F0EB]" : "text-[#8A8078]"
                  )} lang="zh-CN">
                    {mode === "dictation" && isActive && phase !== "paused" && !result
                      ? "？？？？？？"
                      : seg.chinese}
                  </p>

                  {/* Pinyin */}
                  {showPinyin && (
                    <p className={cn("text-xs mt-0.5", isActive ? "text-[#8FAF8F]" : "text-[#3A3A3A]")}>
                      {seg.pinyin}
                    </p>
                  )}

                  {/* Dịch */}
                  {showTrans && (
                    <p className={cn("text-xs mt-0.5 italic", isActive ? "text-[#C9878A]" : "text-[#3A3A3A]")}>
                      {seg.translation}
                    </p>
                  )}
                </div>

                {/* Volume icon cho câu active */}
                {isActive && (phase === "playing") && (
                  <Volume2 size={14} className="text-[#E8504A] shrink-0 mt-1 animate-pulse" />
                )}
                {isActive && (phase === "gap") && gapCount > 0 && (
                  <span className="text-sm font-bold text-[#D4AF37] shrink-0 mt-0.5 w-5 text-center">
                    {gapCount}
                  </span>
                )}
              </div>

              {/* Input chính tả */}
              {mode === "dictation" && isActive && phase === "waiting_input" && (
                <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    ref={inputRef}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") submitDictation(); }}
                    placeholder="Gõ câu tiếng Trung bạn vừa nghe..."
                    lang="zh-CN"
                    className="flex-1 bg-[#0D0D0D] border border-[rgba(255,255,255,0.15)] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#E8504A]/60 placeholder:text-[#3A3A3A]"
                    autoFocus
                  />
                  <button
                    onClick={submitDictation}
                    className="px-3 py-2 bg-[#E8504A] text-white text-xs font-medium rounded-xl whitespace-nowrap"
                  >
                    Nộp
                  </button>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Player controls */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <div className="flex items-center gap-3 bg-[#1A1A1A] border border-[rgba(255,255,255,0.1)] rounded-2xl px-5 py-3 shadow-2xl pointer-events-auto">
          {/* Prev */}
          <button onClick={prev} disabled={idx === 0}
            className="w-9 h-9 rounded-full bg-[#242424] flex items-center justify-center text-[#8A8078] hover:text-white disabled:opacity-30 transition-colors">
            <SkipBack size={16} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={mode === "dictation" ? replay : togglePlay}
            className="w-12 h-12 rounded-full bg-[#E8504A] hover:bg-[#d43f39] flex items-center justify-center text-white shadow-lg transition-colors"
            aria-label={phase === "playing" || phase === "gap" ? "Tạm dừng" : "Phát"}
          >
            {phase === "playing" || phase === "gap"
              ? <Pause size={20} fill="white" />
              : <Play  size={20} fill="white" className="ml-0.5" />
            }
          </button>

          {/* Next */}
          <button onClick={next} disabled={idx >= total - 1}
            className="w-9 h-9 rounded-full bg-[#242424] flex items-center justify-center text-[#8A8078] hover:text-white disabled:opacity-30 transition-colors">
            <SkipForward size={16} />
          </button>

          {/* Replay câu này */}
          <button onClick={replay}
            className="w-9 h-9 rounded-full bg-[#242424] flex items-center justify-center text-[#8A8078] hover:text-[#E8504A] transition-colors"
            title="Nghe lại câu này (R)">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Phím tắt hint */}
      <p className="text-center text-[10px] text-[#3A3A3A] mt-2 pb-2">
        Space · ← → để điều hướng
      </p>
    </main>
  );
}
