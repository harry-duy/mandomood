"use client";

/**
 * PronunciationPractice — Luyện phát âm với Web Speech API
 * - Nhận targetText (Hán tự) + targetPinyin
 * - User bấm mic → nói → nhận điểm 0-100
 * - Highlight từ đúng/sai theo màu
 */

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, RefreshCw, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { playTTS } from "@/hooks/useTTS";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  targetText: string;      // Hán tự: "你好吗"
  targetPinyin: string;    // Pinyin: "Nǐ hǎo ma"
  translation: string;     // "Bạn có khỏe không?"
  onScore?: (score: number) => void;
}

type RecordState = "idle" | "recording" | "processing" | "done" | "error" | "unsupported";

interface ScoreResult {
  score: number;           // 0-100
  recognized: string;      // Những gì browser nghe được
  feedback: string;        // Nhận xét
  details: WordResult[];   // Chi tiết từng ký tự/âm tiết
}

interface WordResult {
  char: string;
  status: "correct" | "close" | "wrong" | "unknown";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Tách pinyin thành mảng âm tiết (tách theo dấu cách, xuống dòng) */
function parsePinyinSyllables(pinyin: string): string[] {
  return pinyin
    .split(/[\s\n]+/)
    .map((s) => s.toLowerCase().replace(/[^a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, ""))
    .filter(Boolean);
}

/** Loại bỏ dấu tone khỏi pinyin để so sánh âm gốc */
function stripTones(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Tính điểm dựa trên so sánh recognized vs target */
function computeScore(recognized: string, targetText: string, targetPinyin: string): ScoreResult {
  const recNorm = recognized.toLowerCase().trim();
  const chars = Array.from(targetText);
  const pinyinSylls = parsePinyinSyllables(targetPinyin);

  // Web Speech API trả về Hán tự hoặc pinyin tuỳ ngôn ngữ
  // Thử match Hán tự trực tiếp trước
  const recChars = Array.from(recNorm);

  let matchedCount = 0;
  const details: WordResult[] = chars.map((char, i) => {
    // Bỏ qua dấu câu
    if (/[，。！？、\s]/.test(char)) return { char, status: "unknown" };

    // Kiểm tra Hán tự trong recognized
    if (recChars.includes(char)) {
      matchedCount++;
      return { char, status: "correct" };
    }

    // Kiểm tra pinyin tương ứng
    const pinSyll = pinyinSylls[i] ?? "";
    const recWords = recNorm.split(/\s+/);
    const anyPinMatch = recWords.some(
      (w) => stripTones(w) === stripTones(pinSyll)
    );
    if (anyPinMatch) {
      matchedCount++;
      return { char, status: "close" };
    }

    return { char, status: "wrong" };
  });

  const validChars = chars.filter((c) => !/[，。！？、\s]/.test(c)).length;
  const rawScore = validChars > 0 ? Math.round((matchedCount / validChars) * 100) : 0;

  // Bonus: nếu recognized chứa chuỗi Hán tự khá giống
  const similarity = levenshteinSimilarity(recNorm, targetText);
  const score = Math.min(100, Math.round((rawScore * 0.6 + similarity * 100 * 0.4)));

  let feedback = "";
  if (score >= 90) feedback = "Xuất sắc! Phát âm chuẩn rồi 🎉";
  else if (score >= 70) feedback = "Tốt lắm! Tiếp tục luyện nhé 👏";
  else if (score >= 50) feedback = "Khá ổn, cần luyện thêm một chút 💪";
  else if (score >= 30) feedback = "Cố gắng lên! Nghe lại và thử lại nhé 🎧";
  else feedback = "Hãy nghe mẫu trước rồi luyện lại nhé 🔄";

  return { score, recognized, feedback, details };
}

/** Levenshtein similarity 0–1 */
function levenshteinSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return 1 - dp[m][n] / Math.max(m, n);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PronunciationPractice({ targetText, targetPinyin, translation, onScore }: Props) {
  const [state, setState] = useState<RecordState>("idle");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(null);

  // Kiểm tra hỗ trợ Web Speech API
  const isSupported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setState("unsupported");
      return;
    }

    const SpeechRecognitionAPI =
      (window.webkitSpeechRecognition ?? window.SpeechRecognition) as typeof SpeechRecognition | undefined;

    if (!SpeechRecognitionAPI) {
      setState("error");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognitionRef.current = recognition;
    setState("recording");

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setState("processing");
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      const scored = computeScore(transcript, targetText, targetPinyin);
      setResult(scored);
      setState("done");
      setAttempts((a) => a + 1);
      onScore?.(scored.score);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech error:", event.error);
      if (event.error === "no-speech") {
        toast.error("Không nghe được giọng — thử lại nhé");
        setState("idle");
      } else if (event.error === "not-allowed") {
        toast.error("Cần cấp quyền microphone");
        setState("error");
      } else {
        setState("error");
      }
    };

    recognition.onend = () => {
      if (state === "recording") setState("idle");
    };

    recognition.start();
  }, [isSupported, targetText, targetPinyin, onScore, state]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setState("idle");
  }, []);

  const reset = useCallback(() => {
    recognitionRef.current?.stop();
    setResult(null);
    setState("idle");
  }, []);

  const playExample = useCallback(() => {
    playTTS(targetText);
  }, [targetText]);

  // ─── Score ring color ───────────────────────────────────────────────────────
  const scoreColor =
    !result ? "#555" :
    result.score >= 80 ? "#4ade80" :
    result.score >= 60 ? "#facc15" :
    result.score >= 40 ? "#fb923c" : "#f87171";

  if (!isSupported) {
    return (
      <div className="rounded-2xl bg-[#111111] border border-[rgba(255,255,255,0.08)] p-5 text-center">
        <AlertCircle className="mx-auto mb-2 text-yellow-400" size={28} />
        <p className="text-sm text-[var(--text-muted)]">
          Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói.<br />
          Thử trên Chrome hoặc Edge nhé.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#111111] border border-[rgba(255,255,255,0.08)] p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Luyện phát âm
        </h3>
        {attempts > 0 && (
          <span className="text-xs text-[var(--text-muted)]">{attempts} lần thử</span>
        )}
      </div>

      {/* Target text */}
      <div className="text-center space-y-1">
        <p className="text-2xl font-bold tracking-wide">{targetText}</p>
        <p className="text-sm text-[var(--text-muted)]">{targetPinyin}</p>
        <p className="text-xs text-[var(--text-muted)] italic">{translation}</p>
      </div>

      {/* Score ring */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-2"
          >
            {/* Ring */}
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <motion.circle
                  cx="48" cy="48" r="40"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - result.score / 100) }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold" style={{ color: scoreColor }}>
                  {result.score}
                </span>
              </div>
            </div>

            {/* Feedback */}
            <p className="text-sm text-center text-[var(--text-muted)]">{result.feedback}</p>

            {/* Word highlights */}
            <div className="flex flex-wrap gap-1 justify-center">
              {result.details.map((d, i) => (
                <span key={i} className={cn(
                  "text-lg px-1 rounded",
                  d.status === "correct" && "text-green-400",
                  d.status === "close"   && "text-yellow-400",
                  d.status === "wrong"   && "text-red-400",
                  d.status === "unknown" && "text-[var(--text-muted)]",
                )}>
                  {d.char}
                </span>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-3 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Đúng</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Gần đúng</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Sai</span>
            </div>

            {/* Recognized */}
            {result.recognized && (
              <p className="text-xs text-center text-[var(--text-muted)] bg-[#0D0D0D] rounded-xl px-3 py-1.5">
                Nghe được: <span className="text-white">&ldquo;{result.recognized}&rdquo;</span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {/* Play example */}
        <button
          onClick={playExample}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] text-sm text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <Volume2 size={14} />
          Nghe mẫu
        </button>

        {/* Record button */}
        {state === "recording" ? (
          <button
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-medium animate-pulse"
          >
            <MicOff size={16} />
            Dừng
          </button>
        ) : state === "processing" ? (
          <button disabled className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] text-sm text-[var(--text-muted)]">
            <div className="w-4 h-4 border-2 border-[var(--text-muted)] border-t-white rounded-full animate-spin" />
            Đang xử lý...
          </button>
        ) : (
          <button
            onClick={startRecording}
            className={cn(
              "flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
              "bg-[#E8504A]/20 border border-[#E8504A]/40 text-[#E8504A] hover:bg-[#E8504A]/30"
            )}
          >
            <Mic size={16} />
            {result ? "Thử lại" : "Bắt đầu nói"}
          </button>
        )}

        {/* Reset */}
        {result && (
          <button
            onClick={reset}
            className="p-2 rounded-xl bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      {/* Tip */}
      {state === "idle" && !result && (
        <p className="text-xs text-center text-[var(--text-muted)]">
          💡 Nhấn &ldquo;Nghe mẫu&rdquo; trước, rồi bấm mic để luyện phát âm
        </p>
      )}
      {state === "recording" && (
        <p className="text-xs text-center text-red-400 animate-pulse">
          🎙️ Đang ghi âm... Hãy đọc câu trên
        </p>
      )}
      {state === "error" && (
        <p className="text-xs text-center text-red-400">
          ⚠️ Lỗi microphone. Kiểm tra quyền truy cập trong trình duyệt.
        </p>
      )}
    </div>
  );
}
