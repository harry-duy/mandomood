"use client";
/**
 * FeedbackWidget — floating button góc phải, gửi góp ý/bug/ý tưởng
 * Floating z-50, không che BottomNav (bottom-24)
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Star, Bug, Lightbulb, MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FeedbackType = "bug" | "idea" | "other";

const TYPE_OPTIONS: { key: FeedbackType; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "bug",   label: "Báo lỗi",   icon: <Bug className="w-4 h-4" />,         color: "#E8504A" },
  { key: "idea",  label: "Ý tưởng",   icon: <Lightbulb className="w-4 h-4" />,   color: "#D4AF37" },
  { key: "other", label: "Khác",       icon: <MoreHorizontal className="w-4 h-4" />, color: "#8FAF8F" },
];

export default function FeedbackWidget() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("idea");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) { toast("Vui lòng nhập nội dung 📝"); return; }
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          type,
          page: pathname,
          user_email: session?.user?.email ?? undefined,
          rating: rating || undefined,
        }),
      });
      if (!res.ok) throw new Error("fail");
      toast("Cảm ơn bạn đã góp ý! 💌");
      setMessage(""); setRating(0); setOpen(false);
    } catch {
      toast("Có lỗi xảy ra, thử lại nhé");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(135deg, #9B8BBF, #7AB8D4)" }}
        aria-label="Góp ý"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
                <X className="w-5 h-5 text-white" />
              </motion.div>
            : <motion.div key="msg" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
                <MessageCircle className="w-5 h-5 text-white" />
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed bottom-40 right-4 z-50 w-72 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            style={{ background: "var(--mm-surface, #1C1C1E)" }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-2">
              <p className="font-bold text-sm" style={{ color: "var(--mm-text)" }}>Góp ý cho MandoMood 💬</p>
              <p className="text-[10px] opacity-50 mt-0.5" style={{ color: "var(--mm-text)" }}>
                Trang: {pathname}
              </p>
            </div>

            <div className="px-4 pb-4 space-y-3">
              {/* Type selector */}
              <div className="flex gap-1.5">
                {TYPE_OPTIONS.map(opt => (
                  <button key={opt.key}
                    onClick={() => setType(opt.key)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-semibold transition-all",
                      type === opt.key ? "text-white" : "bg-white/5 opacity-50"
                    )}
                    style={type === opt.key ? { background: opt.color } : { color: "var(--mm-text)" }}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>

              {/* Message */}
              <textarea
                className="w-full rounded-xl p-2.5 text-xs resize-none outline-none border border-white/10 focus:border-[#9B8BBF] transition-colors bg-white/5"
                style={{ color: "var(--mm-text)" }}
                rows={3}
                placeholder="Mô tả lỗi, ý tưởng, hoặc bất cứ điều gì bạn muốn nói..." aria-label="Mô tả lỗi, ý tưởng, hoặc bất cứ điều gì bạn muốn nói"
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={2000}
              />

              {/* Star rating */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] opacity-50 mr-1" style={{ color: "var(--mm-text)" }}>Đánh giá:</span>
                {[1,2,3,4,5].map(s => (
                  <button key={s}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(r => r === s ? 0 : s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={cn("w-4 h-4", (hoverRating || rating) >= s ? "fill-yellow-400 text-yellow-400" : "text-white/20")} />
                  </button>
                ))}
                {rating > 0 && <span className="text-[10px] opacity-50 ml-1" style={{ color: "var(--mm-text)" }}>{rating}/5</span>}
              </div>

              {/* Send button */}
              <button
                onClick={() => void handleSend()}
                disabled={sending}
                className={cn(
                  "w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all",
                  sending ? "opacity-60" : "hover:brightness-110"
                )}
                style={{ background: "linear-gradient(135deg, #9B8BBF, #7AB8D4)" }}
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? "Đang gửi..." : "Gửi góp ý"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
