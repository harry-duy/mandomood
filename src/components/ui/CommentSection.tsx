"use client";
/**
 * CommentSection — expand/collapse thread bình luận cho Community post
 * Load lazy (chỉ fetch khi mở), optimistic add
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Comment {
  _id: string;
  author_name: string;
  author_image?: string | null;
  content: string;
  created_at: string;
}

interface Props {
  postId: string;
  initialCount?: number;
}

function timeAgo(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "vừa xong";
  if (s < 3600) return `${Math.floor(s / 60)}p`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function CommentSection({ postId, initialCount = 0 }: Props) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [count, setCount] = useState(initialCount);

  const loadComments = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/community/comments?post_id=${postId}`);
      const data = await res.json() as { comments?: Comment[] };
      setComments(data.comments ?? []);
      setCount(data.comments?.length ?? initialCount);
      setLoaded(true);
    } catch {
      toast.error("Không tải được bình luận");
    } finally {
      setLoading(false);
    }
  }, [postId, loaded, initialCount]);

  const toggle = () => {
    if (!open) void loadComments();
    setOpen(o => !o);
  };

  const submit = async () => {
    if (!text.trim() || sending) return;
    if (!session?.user) { toast.error("Đăng nhập để bình luận"); return; }

    const optimistic: Comment = {
      _id: `opt-${Date.now()}`,
      author_name: session.user.name ?? "Bạn",
      author_image: session.user.image,
      content: text.trim(),
      created_at: new Date().toISOString(),
    };
    setComments(c => [...c, optimistic]);
    setCount(n => n + 1);
    setText("");
    setSending(true);

    try {
      const res = await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, content: optimistic.content }),
      });
      const data = await res.json() as { comment?: Comment };
      if (data.comment) {
        setComments(c => c.map(x => x._id === optimistic._id ? data.comment! : x));
      }
    } catch {
      toast.error("Không gửi được, thử lại");
      setComments(c => c.filter(x => x._id !== optimistic._id));
      setCount(n => n - 1);
      setText(optimistic.content);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-2">
      {/* Toggle button */}
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white transition-colors"
      >
        <MessageCircle size={13} />
        {count > 0 ? `${count} bình luận` : "Bình luận"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {/* Comment list */}
              {loading ? (
                <div className="flex justify-center py-3">
                  <Loader2 size={16} className="animate-spin text-[var(--text-muted)]" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] text-center py-2">
                  Chưa có bình luận. Hãy là người đầu tiên! 💬
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="flex gap-2">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#2A2A2A] overflow-hidden">
                      {c.author_image ? (
                        <Image src={c.author_image} alt={c.author_name} width={28} height={28} className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)]">
                          {c.author_name[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Bubble */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-[#1A1A1A] rounded-2xl rounded-tl-sm px-3 py-2">
                        <span className="text-[11px] font-semibold text-[#E8504A] mr-1.5">
                          {c.author_name}
                        </span>
                        <span className="text-xs text-[#F5F0EB] leading-relaxed">{c.content}</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5 ml-2">
                        {timeAgo(c.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Input */}
              {session?.user ? (
                <div className="flex gap-2 items-end">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#2A2A2A] overflow-hidden">
                    {session.user.image ? (
                      <Image src={session.user.image} alt="me" width={28} height={28} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#E8504A]">
                        {session.user.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex items-end gap-1.5 bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] rounded-2xl px-3 py-2">
                    <textarea
                      rows={1}
                      value={text}
                      onChange={e => {
                        setText(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`;
                      }}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void submit();
                        }
                      }}
                      placeholder="Viết bình luận..." aria-label="Viết bình luận"
                      className={cn(
                        "flex-1 bg-transparent text-xs text-[#F5F0EB] placeholder:text-[var(--text-muted)]",
                        "resize-none outline-none leading-relaxed"
                      )}
                    />
                    <button
                      onClick={() => void submit()}
                      disabled={!text.trim() || sending}
                      className={cn(
                        "flex-shrink-0 p-1 rounded-lg transition-colors",
                        text.trim() && !sending ? "text-[#E8504A]" : "text-[var(--text-muted)]"
                      )}
                    >
                      {sending
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Send size={14} />
                      }
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] text-center">
                  <a href="/login" className="text-[#E8504A] hover:underline">Đăng nhập</a> để bình luận
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
