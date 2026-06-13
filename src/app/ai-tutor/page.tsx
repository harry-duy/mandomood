"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, RotateCcw, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import QuotaBadge from "@/components/ui/QuotaBadge";
import { useProgress } from "@/hooks/useProgress";

const PERSONAS = [
  { key: "caring_friend", emoji: "🌸", name: "小暖", desc: "Ấm áp & kiên nhẫn" },
  { key: "cold_girl",     emoji: "❄️", name: "冰冰", desc: "Lạnh lùng & hiệu quả" },
  { key: "funny_bff",     emoji: "😂", name: "哈哈", desc: "Hài hước & vui vẻ"  },
  { key: "ceo_mentor",    emoji: "💼", name: "总总", desc: "Chuyên nghiệp"       },
  { key: "idol_style",    emoji: "⭐", name: "星星", desc: "C-pop vibe"          },
  { key: "anime_sensei",  emoji: "📚", name: "先生", desc: "Thầy giáo anime"    },
];


const SUGGESTED_PROMPTS: Record<string, string[]> = {
  caring_friend: [
    "Dạy mình cách nói 'Tôi nhớ bạn' bằng tiếng Trung 💌",
    "Câu nào hay nói khi muốn an ủi ai đó?",
    "Giải thích chữ 缘分 cho mình với nhé",
    "Mình muốn học 5 câu hỏi thăm cơ bản",
  ],
  cold_girl: [
    "Cách nói 'đừng lãng phí thời gian' tiếng Trung",
    "Dạy mình HSK2 grammar hiệu quả nhất",
    "5 từ quan trọng nhất cần biết",
    "Sửa lỗi câu này cho tôi: 我很想去那里",
  ],
  funny_bff: [
    "Dạy mình một câu meme tiếng Trung đi 😂",
    "Cách nói 'trời ơi' tiếng Trung có mấy kiểu?",
    "Những từ slang Gen Z Trung Quốc dùng",
    "Dạy mình chửi nhẹ nhàng bằng tiếng Trung 🙈",
  ],
  ceo_mentor: [
    "Cách nói chuyện business tiếng Trung cơ bản",
    "Cụm từ hay dùng trong email/meeting",
    "Phân tích cấu trúc câu: 不管如何，我们要坚持",
    "Roadmap học tiếng Trung cho người bận rộn",
  ],
  idol_style: [
    "Dạy mình hát câu tiếng Trung trong bài nhạc C-pop",
    "Nghĩa của 心动 là gì và dùng thế nào?",
    "Câu nào nghe cute nhất trong tiếng Trung?",
    "Dạy mình compliment bằng tiếng Trung 🌸",
  ],
  anime_sensei: [
    "Giải thích 把 sentence structure cho mình",
    "Sự khác nhau giữa 的, 得, 地 là gì?",
    "Cách học thanh điệu hiệu quả",
    "Luyện đọc câu: 人之初，性本善",
  ],
};

const QUICK_REPLIES = ["Ví dụ thêm đi!", "Nói chậm hơn được không?", "Dạy mình câu khác", "Tại sao lại vậy?", "Pinyin của câu này là gì?"];

// ── Tình huống roleplay (kiểu OpenQuiz) ──────────────────────────────────────
const SCENARIOS = [
  { key: "Gọi món ở quán ăn Trung Quốc", emoji: "🍜", label: "Gọi món" },
  { key: "Hỏi đường khi du lịch Trung Quốc", emoji: "🗺️", label: "Hỏi đường" },
  { key: "Mua sắm và mặc cả ở chợ", emoji: "🛍️", label: "Mua sắm" },
  { key: "Check-in khách sạn", emoji: "🏨", label: "Khách sạn" },
  { key: "Phỏng vấn xin việc bằng tiếng Trung", emoji: "💼", label: "Phỏng vấn" },
  { key: "Làm quen bạn mới người Trung Quốc", emoji: "👋", label: "Làm quen" },
  { key: "Gọi taxi / đi tàu điện ngầm", emoji: "🚕", label: "Đi lại" },
  { key: "Đi khám bệnh, mô tả triệu chứng", emoji: "🏥", label: "Khám bệnh" },
];
interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AITutorPage() {
  const { awardXP } = useProgress();
  const { chatMessages, addChatMessage, clearChat, selectedPersona, setPersona } = useAppStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPersonas, setShowPersonas] = useState(chatMessages.length === 0);
  const [scenario, setScenario] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentPersona = PERSONAS.find((p) => p.key === selectedPersona) ?? PERSONAS[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async (text: string, activeScenario: string | null) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    addChatMessage(userMsg);
    setInput("");
    setLoading(true);
    setShowPersonas(false);

    // Doc lich su MOI NHAT tu store (tranh stale closure sau clearChat khi vao roleplay)
    const history = useAppStore.getState().chatMessages;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          persona: selectedPersona,
          userLevel: "beginner",
          scenario: activeScenario ?? undefined,
        }),
      });

      if (!res.ok) {
        let msg = "API error";
        try {
          const b = await res.json();
          if (b?.error) msg = b.error as string;
        } catch { /* body không phải JSON */ }
        const httpErr = new Error(msg) as Error & { status?: number };
        httpErr.status = res.status;
        throw httpErr;
      }

      const { reply } = await res.json();
      addChatMessage({ role: "assistant", content: reply });
      awardXP(5, "AI chat");
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 402) {
        trackEvent("upgrade_required_hit");
        const msg = err instanceof Error ? err.message : "Bạn đã hết lượt chat miễn phí hôm nay.";
        addChatMessage({ role: "assistant", content: msg });
        toast.error(msg, {
          duration: 6000,
          action: { label: "Nâng cấp 👑", onClick: () => { window.location.href = "/pricing"; } },
        });
      } else {
        addChatMessage({
          role: "assistant",
          content: "Xin lỗi, mình gặp sự cố kỹ thuật. Thử lại nhé! 🙏",
        });
        toast.error("Lỗi kết nối AI. Kiểm tra OPENAI_API_KEY trong .env.local");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => sendMessage(input, scenario);

  /** Bắt đầu roleplay: xoá chat cũ, set tình huống, AI mở màn. */
  const startScenario = (s: { key: string; emoji: string; label: string }) => {
    clearChat();
    setScenario(s.key);
    setShowPersonas(false);
    void sendMessage(`Bắt đầu tình huống: ${s.key} ${s.emoji}`, s.key);
  };

  const exitScenario = () => {
    setScenario(null);
    clearChat();
    toast("Đã thoát tình huống. Quay lại chat tự do 💬");
  };

  return (
    <div className="flex flex-col h-[calc(100svh-8rem)] max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl">{currentPersona.emoji}</span>
          <div className="min-w-0">
            <p className="font-chinese font-bold text-mm-gold leading-none">{currentPersona.name}</p>
            {scenario ? (
              <button
                onClick={exitScenario}
                className="text-xs text-mm-red truncate max-w-[180px] block"
                title="Bấm để thoát tình huống"
              >
                🎬 {scenario} ✕
              </button>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">{currentPersona.desc}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowPersonas(!showPersonas)}
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-white bg-surface2 px-3 py-1.5 rounded-full transition-colors"
          >
            Đổi gia sư <ChevronDown size={12} className={cn("transition-transform", showPersonas && "rotate-180")} />
          </button>
          <button
            onClick={() => { clearChat(); setShowPersonas(true); }}
            className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors"
            title="Xóa hội thoại"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Persona picker */}
      {showPersonas && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-[rgba(255,255,255,0.06)] bg-surface"
        >
          <div className="flex gap-2 p-3 overflow-x-auto scrollbar-none">
            {PERSONAS.map((p) => (
              <button
                key={p.key}
                onClick={() => { setPersona(p.key); setShowPersonas(false); }}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-center transition-all",
                  selectedPersona === p.key
                    ? "bg-mm-red/20 border border-mm-red/40"
                    : "bg-surface2 hover:bg-surface border border-transparent"
                )}
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="font-chinese text-xs text-mm-gold">{p.name}</span>
                <span className="text-[9px] text-[var(--text-muted)] leading-tight">{p.desc}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {chatMessages.length === 0 && !showPersonas && (
          <div className="flex flex-col gap-4 py-4">
            <div className="text-center">
              <span className="text-5xl block mb-3">{currentPersona.emoji}</span>
              <p className="font-chinese text-lg text-mm-gold mb-1">{currentPersona.name}</p>
              <p className="text-xs text-[var(--text-muted)]">Xin chào! Hỏi bất kỳ điều gì về tiếng Trung 😊</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">🎬 Luyện theo tình huống</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => startScenario(s)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-surface2 hover:bg-mm-red/15 border border-[rgba(255,255,255,0.06)] text-sm transition-all active:scale-[0.97] text-left"
                  >
                    <span className="text-lg shrink-0">{s.emoji}</span>
                    <span className="leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">💡 Hoặc hỏi tự do</p>
              <div className="space-y-2">
                {(SUGGESTED_PROMPTS[selectedPersona] ?? SUGGESTED_PROMPTS.caring_friend).map((prompt, i) => (
                  <button key={i} onClick={() => setInput(prompt)}
                    className="w-full text-left px-4 py-3 rounded-2xl bg-surface2 hover:bg-surface border border-[rgba(255,255,255,0.06)] text-sm text-[var(--text-secondary)] transition-all active:scale-[0.98]">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <span className="text-xl mr-2 mt-1 flex-shrink-0">{currentPersona.emoji}</span>
            )}
            <div
              className={cn(
                "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-mm-red text-white rounded-br-sm"
                  : "bg-surface2 text-[#F5F0EB] rounded-bl-sm"
              )}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentPersona.emoji}</span>
            <div className="bg-surface2 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick reply chips */}
      {chatMessages.length > 0 && !loading && (
        <div className="px-4 pb-1 flex gap-2 overflow-x-auto scrollbar-none border-t border-[rgba(255,255,255,0.06)] pt-2">
          {QUICK_REPLIES.map((r) => (
            <button key={r} onClick={() => setInput(r)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-surface2 text-xs text-[var(--text-muted)] hover:text-white hover:bg-mm-red/20 transition-all whitespace-nowrap border border-[rgba(255,255,255,0.06)]">
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Lượt chat miễn phí còn lại hôm nay / trạng thái Premium */}
      <div className="px-4 pt-2">
        <QuotaBadge feature="chat" />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.06)] flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Nhắn gì đó với gia sư..." aria-label="Nhắn gì đó với gia sư"
          className="input flex-1 text-sm"
          disabled={loading}
        />
        <button
          onClick={handleSend} aria-label="Gửi tin nhắn"
          disabled={!input.trim() || loading}
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center transition-all",
            input.trim() && !loading
              ? "bg-mm-red text-white hover:bg-[#d43f39]"
              : "bg-surface2 text-[var(--text-muted)]"
          )}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
