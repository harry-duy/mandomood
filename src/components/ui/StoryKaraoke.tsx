"use client";

/**
 * StoryKaraoke — đọc toàn truyện và highlight từng CÂU theo lời đọc.
 *
 * Dùng Web Speech API (offline, miễn phí, không tốn token ElevenLabs) để phát
 * tuần tự từng câu; câu đang đọc được làm nổi bật → học qua nghe + nhìn.
 *
 * Usage:
 *   <StoryKaraoke text={story.chinese_text} pinyin={story.pinyin} showPinyin />
 */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { splitSentences } from "@/lib/text";

function pickZhVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.startsWith("zh") && v.localService) ??
    voices.find((v) => v.lang.startsWith("zh"))
  );
}

export interface KaraokeSegment {
  text: string;
  pinyin?: string;
}

interface Props {
  /** Văn bản nguyên khối — sẽ tự tách câu theo dấu câu. */
  text?: string;
  pinyin?: string;
  /** Hoặc truyền sẵn các đoạn (vd: từng từ ở trang Đọc hiểu). Ưu tiên hơn `text`. */
  segments?: KaraokeSegment[];
  showPinyin?: boolean;
  /** Tốc độ đọc (0.5–1.2). Mặc định 0.8 cho người học. */
  rate?: number;
  className?: string;
}

export function StoryKaraoke({ text = "", pinyin, segments, showPinyin = false, rate = 0.8, className }: Props) {
  const sentences = useMemo(
    () => (segments ? segments.map((s) => s.text) : splitSentences(text)),
    [segments, text]
  );
  const pinyinLines = useMemo(
    () =>
      segments
        ? segments.map((s) => s.pinyin ?? "")
        : pinyin
          ? splitSentences(pinyin)
          : [],
    [segments, pinyin]
  );
  const segKey = useMemo(() => sentences.join("|"), [sentences]);

  const [active, setActive] = useState(-1); // câu đang đọc
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const indexRef = useRef(0);
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Dọn dẹp khi unmount hoặc đổi truyện
  const reset = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    indexRef.current = 0;
    setActive(-1);
    setPlaying(false);
    setPaused(false);
  }, [supported]);

  useEffect(() => {
    reset();
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segKey]);

  const speakFrom = useCallback(
    (start: number) => {
      if (!supported) return;
      window.speechSynthesis.cancel();

      const voice = pickZhVoice();
      const queueNext = (i: number) => {
        if (i >= sentences.length) {
          setPlaying(false);
          setPaused(false);
          setActive(-1);
          indexRef.current = 0;
          return;
        }
        indexRef.current = i;
        setActive(i);
        const u = new SpeechSynthesisUtterance(sentences[i]);
        u.lang = "zh-CN";
        u.rate = rate;
        u.pitch = 1;
        if (voice) u.voice = voice;
        u.onend = () => {
          // Chỉ tiếp tục nếu không bị dừng giữa chừng
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) return;
          queueNext(i + 1);
        };
        u.onerror = () => {
          setPlaying(false);
          setPaused(false);
        };
        window.speechSynthesis.speak(u);
      };

      setPlaying(true);
      setPaused(false);
      queueNext(start);
    },
    [sentences, rate, supported]
  );

  const handlePlayPause = useCallback(() => {
    if (!supported) return;
    if (!playing) {
      // Voices có thể chưa nạp (Chrome) → kích hoạt rồi phát
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          speakFrom(indexRef.current);
        };
        // an toàn nếu sự kiện không bắn
        setTimeout(() => speakFrom(indexRef.current), 250);
        return;
      }
      speakFrom(indexRef.current);
    } else if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }, [playing, paused, speakFrom, supported]);

  if (!supported) {
    return (
      <p className={cn("text-xs text-[var(--text-muted)]", className)}>
        Trình duyệt không hỗ trợ đọc tự động. Hãy dùng nút 🔊 để nghe từng câu.
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePlayPause}
          aria-label={playing && !paused ? "Tạm dừng" : "Phát"}
          className="flex items-center gap-1.5 text-xs bg-mm-red text-white px-3 py-2 rounded-full transition-colors hover:opacity-90"
        >
          {playing && !paused ? <Pause size={13} /> : <Play size={13} />}
          {playing ? (paused ? "Tiếp tục" : "Tạm dừng") : "Karaoke"}
        </button>
        {playing && (
          <button
            onClick={reset}
            aria-label="Dừng"
            className="flex items-center gap-1.5 text-xs bg-surface2 text-[var(--text-muted)] hover:text-white px-3 py-2 rounded-full transition-colors"
          >
            <Square size={12} /> Dừng
          </button>
        )}
        <span className="ml-auto flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
          <Volume2 size={11} /> đọc &amp; sáng chữ
        </span>
      </div>

      {/* Sentences/words with highlight */}
      {segments ? (
        // Bố cục inline cho cấp độ TỪ (trang Đọc hiểu): các từ nằm liền nhau, sáng từ đang đọc.
        <div className="flex flex-wrap gap-x-1 gap-y-2">
          {sentences.map((s, i) => (
            <button
              key={i}
              onClick={() => speakFrom(i)}
              aria-label={`Đọc: ${s}`}
              className={cn(
                "flex flex-col items-center px-1.5 py-1 rounded-lg transition-all duration-300",
                active === i ? "bg-mm-red/20 ring-1 ring-mm-red/40" : "hover:bg-white/5"
              )}
            >
              {showPinyin && pinyinLines[i] && (
                <span className="text-[10px] text-mm-gold/60 leading-none mb-0.5">
                  {pinyinLines[i]}
                </span>
              )}
              <span
                lang="zh-CN"
                className={cn(
                  "font-chinese text-lg leading-tight transition-colors",
                  active === i ? "text-mm-gold" : "text-[#F5F0EB]"
                )}
              >
                {s}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sentences.map((s, i) => (
            <div
              key={i}
              onClick={() => speakFrom(i)}
              className={cn(
                "rounded-xl px-3 py-2 cursor-pointer transition-all duration-300",
                active === i
                  ? "bg-mm-red/15 ring-1 ring-mm-red/40"
                  : "hover:bg-white/5"
              )}
            >
              <p
                lang="zh-CN"
                className={cn(
                  "font-chinese text-lg leading-relaxed tracking-wide transition-colors",
                  active === i ? "text-mm-gold" : "text-[#F5F0EB]"
                )}
              >
                {s}
              </p>
              {showPinyin && pinyinLines[i] && (
                <p className="text-[11px] text-mm-gold/55 tracking-wider mt-0.5">
                  {pinyinLines[i]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StoryKaraoke;
