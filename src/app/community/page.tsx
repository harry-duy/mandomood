"use client";

/**
 * /community — Community Feed
 * User-generated quotes & stories
 * Sort: New | Hot | Following
 * Post form (auth-gated), Like, Share
 */

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Heart, Share2, Plus, X, ChevronDown,
  Sparkles, Flame, Clock, CheckCircle, Volume2
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MOOD_COLORS, MOOD_EMOJI, MOOD_LABEL, LEVEL_LABEL } from "@/lib/utils";
import { useTTS } from "@/hooks/useTTS";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Post {
  _id: string;
  author_name: string;
  author_image: string | null;
  type: "quote" | "story" | "question";
  chinese_text: string;
  pinyin?: string;
  translation: string;
  mood?: string;
  level?: string;
  like_count: number;
  likes: string[];
  is_verified: boolean;
  created_at: string;
}

// ─── Demo posts (fallback) ────────────────────────────────────────────────────
const DEMO_POSTS: Post[] = [
  {
    _id: "d1", author_name: "Hana 花花", author_image: null, type: "quote",
    chinese_text: "再难的路，走着走着就习惯了。",
    pinyin: "Zài nán de lù, zǒuzhe zǒuzhe jiù xíguàn le.",
    translation: "Con đường dù khó đến đâu, đi mãi rồi cũng quen.",
    mood: "motivation", level: "hsk3", like_count: 148, likes: [], is_verified: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "d2", author_name: "Trà My 🌸", author_image: null, type: "quote",
    chinese_text: "有时候，沉默是最好的回答。",
    pinyin: "Yǒushíhòu, chénmò shì zuì hǎo de huídá.",
    translation: "Đôi khi, im lặng là câu trả lời tốt nhất.",
    mood: "aesthetic", level: "hsk3", like_count: 92, likes: [], is_verified: true,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: "d3", author_name: "Kevin Hoàng", author_image: null, type: "story",
    chinese_text: "那天下雨，她站在咖啡馆门口，低头看手机。我鼓起勇气走过去说：\"借我一把伞，好吗？\"",
    pinyin: "Nà tiān xià yǔ, tā zhàn zài kāfēiguǎn ménkǒu...",
    translation: "Hôm đó trời mưa, cô ấy đứng trước cửa quán cà phê, cúi đầu nhìn điện thoại. Tôi lấy hết can đảm bước tới hỏi: \"Cho tôi mượn một chiếc ô được không?\"",
    mood: "romantic", level: "hsk4", like_count: 67, likes: [], is_verified: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: "d4", author_name: "Ngọc Ánh", author_image: null, type: "question",
    chinese_text: "\"缘分\" 和 \"命运\" 有什么区别？",
    pinyin: "\"Yuánfèn\" hé \"mìngyùn\" yǒu shénme qūbié?",
    translation: "\"Duyên phận\" và \"số mệnh\" khác nhau như thế nào?",
    mood: "aesthetic", level: "hsk5", like_count: 34, likes: [], is_verified: false,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const MOODS = ["all", "romantic", "healing", "motivation", "sad", "friendship", "aesthetic", "funny"];
const LEVELS = ["beginner", "hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6"];
const TYPE_LABEL = { quote: "Câu nói", story: "Câu chuyện", question: "Câu hỏi" };

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function AuthorAvatar({ name, image, size = 36 }: { name: string; image: string | null; size?: number }) {
  if (image) return (
    <Image src={image} alt={name} width={size} height={size}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }} />
  );
  const colors = ["#E8504A","#D4AF37","#8FAF8F","#9B8BBF","#7AB8D4","#C9878A"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, myEmail, onLike }: {
  post: Post;
  myEmail?: string;
  onLike: (id: string) => void;
}) {
  const { speak } = useTTS();
  const [showPinyin, setShowPinyin] = useState(false);
  const liked = myEmail ? post.likes.includes(myEmail) : false;
  const moodColor = MOOD_COLORS[post.mood ?? "aesthetic"] ?? "#9B8BBF";

  const handleShare = async () => {
    const text = `${post.chinese_text}\n${post.translation}\n— MandoMood`;
    if (navigator.share) {
      await navigator.share({ text }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(text).catch(() => null);
      toast("Đã copy vào clipboard! 📋");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border border-white/8"
      style={{ background: "var(--mm-surface, #1C1C1E)" }}
    >
      {/* Mood accent bar */}
      <div className="h-1 w-full" style={{ background: moodColor }} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <AuthorAvatar name={post.author_name} image={post.author_image} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold truncate" style={{ color: "var(--mm-text)" }}>
                {post.author_name}
              </span>
              {post.is_verified && (
                <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] opacity-50" style={{ color: "var(--mm-text)" }}>
              <span>{timeAgo(post.created_at)}</span>
              {post.mood && <><span>·</span><span>{MOOD_EMOJI[post.mood]} {MOOD_LABEL[post.mood]}</span></>}
              {post.level && <><span>·</span><span>{LEVEL_LABEL[post.level]}</span></>}
            </div>
          </div>
          {/* Type badge */}
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 opacity-60"
            style={{ color: "var(--mm-text)" }}>
            {TYPE_LABEL[post.type]}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <p className="text-lg font-semibold leading-snug"
            style={{ color: "var(--mm-text)", fontFamily: "var(--font-display)" }}>
            {post.chinese_text}
          </p>
          <AnimatePresence>
            {showPinyin && post.pinyin && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm"
                style={{ color: moodColor }}
              >
                {post.pinyin}
              </motion.p>
            )}
          </AnimatePresence>
          <p className="text-sm opacity-70 leading-relaxed" style={{ color: "var(--mm-text)" }}>
            {post.translation}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 pt-1">
          {/* Like */}
          <button
            onClick={() => onLike(post._id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              liked
                ? "bg-red-500/15 text-red-400"
                : "bg-white/5 hover:bg-white/10 opacity-60"
            )}
            style={{ color: liked ? undefined : "var(--mm-text)" }}
          >
            <Heart className={cn("w-3.5 h-3.5", liked && "fill-current")} />
            {post.like_count}
          </button>

          {/* Pinyin toggle */}
          <button
            onClick={() => setShowPinyin(p => !p)}
            className="px-3 py-1.5 rounded-full text-xs bg-white/5 hover:bg-white/10 transition-all opacity-60"
            style={{ color: "var(--mm-text)" }}
          >
            {showPinyin ? "Ẩn pinyin" : "Pinyin"}
          </button>

          {/* TTS */}
          <button
            onClick={() => void speak(post.chinese_text)}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-all opacity-60"
            style={{ color: "var(--mm-text)" }}
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          {/* Share */}
          <button
            onClick={() => void handleShare()}
            className="ml-auto p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-all opacity-60"
            style={{ color: "var(--mm-text)" }}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Post Form ────────────────────────────────────────────────────────────────
function PostForm({ onPosted }: { onPosted: (post: Post) => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    chinese_text: "", pinyin: "", translation: "",
    mood: "aesthetic", level: "hsk2", type: "quote" as "quote" | "story" | "question",
  });

  const handlePost = async () => {
    if (!session?.user) { router.push("/login"); return; }
    if (!form.chinese_text.trim() || !form.translation.trim()) {
      toast("Vui lòng điền tiếng Trung và nghĩa ✍️"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { post?: Post; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Lỗi");
      onPosted(data.post!);
      setForm({ chinese_text: "", pinyin: "", translation: "", mood: "aesthetic", level: "hsk2", type: "quote" });
      setOpen(false);
      toast("Đã đăng! 🎉");
    } catch (e) {
      toast((e as Error).message ?? "Lỗi đăng bài");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => session?.user ? setOpen(true) : router.push("/login")}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white transition-transform hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg, #E8504A, #D4AF37)" }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full rounded-t-3xl p-6 space-y-4"
              style={{ background: "var(--mm-surface, #1C1C1E)" }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: "var(--mm-text)" }}>
                  Chia sẻ với cộng đồng ✨
                </h3>
                <button onClick={() => setOpen(false)} className="opacity-50 hover:opacity-100">
                  <X className="w-5 h-5" style={{ color: "var(--mm-text)" }} />
                </button>
              </div>

              {/* Type selector */}
              <div className="flex gap-2">
                {(["quote","story","question"] as const).map(t => (
                  <button key={t}
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={cn(
                      "flex-1 py-1.5 rounded-full text-xs font-semibold transition-all",
                      form.type === t
                        ? "bg-[var(--mm-red)] text-white"
                        : "bg-white/5 opacity-60"
                    )}
                    style={{ color: form.type === t ? undefined : "var(--mm-text)" }}
                  >
                    {TYPE_LABEL[t]}
                  </button>
                ))}
              </div>

              {/* Chinese text */}
              <div>
                <label className="text-xs opacity-50 mb-1 block" style={{ color: "var(--mm-text)" }}>
                  Tiếng Trung *
                </label>
                <textarea
                  className="w-full rounded-xl p-3 text-base resize-none outline-none border border-white/10 focus:border-[var(--mm-red)] transition-colors bg-white/5"
                  style={{ color: "var(--mm-text)" }}
                  rows={2}
                  placeholder="再难的路，走着走着就习惯了。"
                  value={form.chinese_text}
                  onChange={e => setForm(f => ({ ...f, chinese_text: e.target.value }))}
                />
              </div>

              {/* Pinyin */}
              <div>
                <label className="text-xs opacity-50 mb-1 block" style={{ color: "var(--mm-text)" }}>
                  Pinyin (tùy chọn)
                </label>
                <input
                  className="w-full rounded-xl p-3 text-sm outline-none border border-white/10 focus:border-[var(--mm-red)] transition-colors bg-white/5"
                  style={{ color: "var(--mm-text)" }}
                  placeholder="Zài nán de lù..."
                  value={form.pinyin}
                  onChange={e => setForm(f => ({ ...f, pinyin: e.target.value }))}
                />
              </div>

              {/* Translation */}
              <div>
                <label className="text-xs opacity-50 mb-1 block" style={{ color: "var(--mm-text)" }}>
                  Nghĩa tiếng Việt *
                </label>
                <textarea
                  className="w-full rounded-xl p-3 text-sm resize-none outline-none border border-white/10 focus:border-[var(--mm-red)] transition-colors bg-white/5"
                  style={{ color: "var(--mm-text)" }}
                  rows={2}
                  placeholder="Con đường dù khó đến đâu, đi mãi rồi cũng quen."
                  value={form.translation}
                  onChange={e => setForm(f => ({ ...f, translation: e.target.value }))}
                />
              </div>

              {/* Mood + Level row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs opacity-50 mb-1 block" style={{ color: "var(--mm-text)" }}>Mood</label>
                  <div className="relative">
                    <select
                      className="w-full rounded-xl p-2.5 text-sm outline-none border border-white/10 bg-white/5 appearance-none pr-8"
                      style={{ color: "var(--mm-text)" }}
                      value={form.mood}
                      onChange={e => setForm(f => ({ ...f, mood: e.target.value }))}
                    >
                      {MOODS.filter(m => m !== "all").map(m => (
                        <option key={m} value={m}>{MOOD_EMOJI[m]} {MOOD_LABEL[m]}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" style={{ color: "var(--mm-text)" }} />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs opacity-50 mb-1 block" style={{ color: "var(--mm-text)" }}>Level</label>
                  <div className="relative">
                    <select
                      className="w-full rounded-xl p-2.5 text-sm outline-none border border-white/10 bg-white/5 appearance-none pr-8"
                      style={{ color: "var(--mm-text)" }}
                      value={form.level}
                      onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                    >
                      {LEVELS.map(l => (
                        <option key={l} value={l}>{LEVEL_LABEL[l]}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" style={{ color: "var(--mm-text)" }} />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={() => void handlePost()}
                disabled={loading}
                className={cn(
                  "w-full py-3.5 rounded-2xl font-bold text-white transition-all",
                  loading ? "opacity-60" : "hover:brightness-110 active:scale-98"
                )}
                style={{ background: "linear-gradient(135deg, #E8504A, #D4AF37)" }}
              >
                {loading ? "Đang đăng..." : "Chia sẻ ngay 🚀"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"new" | "hot">("new");
  const [moodFilter, setMoodFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, mood: moodFilter });
      const res = await fetch(`/api/community/posts?${params}`);
      const data = await res.json() as { posts?: Post[] };
      if (data.posts && data.posts.length > 0) {
        setPosts(data.posts);
      } else {
        setPosts(DEMO_POSTS);
      }
    } catch {
      setPosts(DEMO_POSTS);
    } finally {
      setLoading(false);
    }
  }, [sort, moodFilter]);

  useEffect(() => { void load(); }, [load]);

  const handleLike = async (id: string) => {
    if (!session?.user) { toast("Đăng nhập để thích bài 💫"); return; }
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p._id !== id) return p;
      const email = session.user!.email!;
      const liked = p.likes.includes(email);
      return {
        ...p,
        likes: liked ? p.likes.filter(e => e !== email) : [...p.likes, email],
        like_count: liked ? p.like_count - 1 : p.like_count + 1,
      };
    }));
    try {
      await fetch("/api/community/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id }),
      });
    } catch { void load(); } // revert on fail
  };

  return (
    <main className="min-h-screen pb-28" style={{ background: "var(--mm-bg)" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl border-b border-white/8 px-4 py-4"
        style={{ background: "var(--mm-bg)" }}>
        <div className="max-w-lg mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--mm-red)]" />
            <h1 className="text-xl font-bold" style={{ color: "var(--mm-text)" }}>Cộng đồng</h1>
            <div className="ml-auto flex gap-1 bg-white/5 rounded-full p-1">
              {(["new","hot"] as const).map(s => (
                <button key={s}
                  onClick={() => setSort(s)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all",
                    sort === s ? "bg-[var(--mm-red)] text-white" : "opacity-50"
                  )}
                  style={{ color: sort === s ? undefined : "var(--mm-text)" }}
                >
                  {s === "new" ? <Clock className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                  {s === "new" ? "Mới nhất" : "Hot"}
                </button>
              ))}
            </div>
          </div>

          {/* Mood filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {MOODS.map(m => (
              <button key={m}
                onClick={() => setMoodFilter(m)}
                className={cn(
                  "flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all",
                  moodFilter === m
                    ? "text-white"
                    : "bg-white/5 opacity-60 hover:opacity-100"
                )}
                style={moodFilter === m
                  ? { background: m === "all" ? "var(--mm-red)" : MOOD_COLORS[m] }
                  : { color: "var(--mm-text)" }}
              >
                {m === "all" ? "✨ Tất cả" : `${MOOD_EMOJI[m]} ${MOOD_LABEL[m]}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Welcome banner cho guest */}
        {!session?.user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--mm-red)]/30 bg-[var(--mm-red)]/8">
            <Sparkles className="w-5 h-5 text-[var(--mm-red)] flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--mm-text)" }}>
                Tham gia cộng đồng học tiếng Trung!
              </p>
              <p className="text-xs opacity-60 mt-0.5" style={{ color: "var(--mm-text)" }}>
                Đăng nhập để thích, chia sẻ và đăng bài của bạn
              </p>
            </div>
          </motion.div>
        )}

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                myEmail={session?.user?.email ?? undefined}
                onLike={(id) => void handleLike(id)}
              />
            ))}
          </AnimatePresence>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16 space-y-2">
            <p className="text-4xl">🌸</p>
            <p className="font-semibold" style={{ color: "var(--mm-text)" }}>Chưa có bài nào</p>
            <p className="text-sm opacity-50" style={{ color: "var(--mm-text)" }}>
              Hãy là người đầu tiên chia sẻ!
            </p>
          </div>
        )}
      </div>

      {/* FAB + Form */}
      <PostForm onPosted={(post) => setPosts(prev => [post, ...prev])} />
    </main>
  );
}
