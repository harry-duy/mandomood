"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, RotateCcw, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PERSONAS = [
  { key: "caring_friend", emoji: "🌸", name: "小暖", desc: "Ấm áp & kiên nhẫn" },
  { key: "cold_girl",     emoji: "❄️", name: "冰冰", desc: "Lạnh lùng & hiệu quả" },
  { key: "funny_bff",     emoji: "😂", name: "哈哈", desc: "Hài hước & vui vẻ"  },
  { key: "ceo_mentor",    emoji: "💼", name: "总总", desc: "Chuyên nghiệp"       },
  { key: "idol_style",    emoji: "⭐", name: "星星", desc: "C-pop vibe"          },
  { key: "anime_sensei",  emoji: "📚", name: "先生", desc: "Thầy giáo anime"    },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AITutorPage() {
  const { chatMessages, addChatMessage, clearChat, selectedPersona, setPersona } = useAppStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPersonas, setShowPersonas] = useState(chatMessages.length === 0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentPersona = PERSONAS.find((p) => p.key === selectedPersona) ?? PERSONAS[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    addChatMessage(userMsg);
    setInput("");
    setLoading(true);
    setShowPersonas(false);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          persona: selectedPersona,
          userLevel: "beginner",
        }),
      });

      if (!res.ok) throw new Error("API error");

      const { reply } = await res.json();
      addChatMessage({ role: "assistant", content: reply });
    } catch {
      addChatMessage({
        role: "assistant",
        content: "Xin lỗi, mình gặp sự cố kỹ thuật. Thử lại nhé! 🙏",
      });
      toast.error("Lỗi kết nối AI. Kiểm tra OPENAI_API_KEY trong .env.local");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100svh-8rem)] max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentPersona.emoji}</span>
          <div>
            <p className="font-chinese font-bold text-mm-gold leading-none">{currentPersona.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{currentPersona.desc}</p>
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
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <span className="text-5xl mb-4">{currentPersona.emoji}</span>
            <p className="font-chinese text-xl text-mm-gold mb-2">{currentPersona.name}</p>
            <p className="text-sm text-[var(--text-muted)] max-w-xs">
              Xin chào! Mình sẵn sàng dạy tiếng Trung cho bạn.<br />
              Hỏi bất kỳ điều gì nhé! 😊
            </p>
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

      {/* Input */}
      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.06)] flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Nhắn gì đó với gia sư..."
          className="input flex-1 text-sm"
          disabled={loading}
        />
        <button
          onClick={handleSend}
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
