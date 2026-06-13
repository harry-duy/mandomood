"use client";

/**
 * QuickAddCard — "Học từ/câu mới + nhắc nhở ngắt quãng"
 *
 * Cho phép người học thêm NHANH một từ đơn hoặc một câu/cụm mới vào bộ thẻ ôn
 * tập (SRS). Thẻ được lập lịch ôn theo thuật toán SM-2; khi đến hạn, hệ thống
 * sẽ gửi thông báo nhắc qua Web Push (cron /api/push/due-reminder).
 *
 * Nếu người dùng chưa bật thông báo, component sẽ mời bật ngay sau khi thêm.
 */

import { useState } from "react";
import { Plus, Bell, BellRing, Check, Loader2, X } from "lucide-react";
import { usePushNotification } from "@/hooks/usePushNotification";
import { invalidateDueCount } from "@/hooks/useDueCount";

type Mode = "word" | "sentence";

export default function QuickAddCard({ onAdded }: { onAdded?: () => void }) {
  const { supported, subscribed, subscribe } = usePushNotification();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("word");
  const [hanzi, setHanzi] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [meaning, setMeaning] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setHanzi(""); setPinyin(""); setMeaning(""); setError(""); setDone(false);
  };

  const handleSave = async () => {
    setError("");
    if (!hanzi.trim() || !meaning.trim() || (mode === "word" && !pinyin.trim())) {
      setError("Vui lòng nhập đủ chữ Hán, nghĩa" + (mode === "word" ? " và pinyin." : "."));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hanzi: hanzi.trim(),
          pinyin: pinyin.trim(),
          meaning: meaning.trim(),
          card_type: mode,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Không lưu được");
      }
      setDone(true);
      invalidateDueCount();
      onAdded?.();
      // Mời bật nhắc nhở nếu chưa bật
      if (supported && !subscribed) {
        await subscribe();
      }
      setTimeout(() => { reset(); setOpen(false); }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-mm-red/50 py-3 text-sm font-medium text-mm-red hover:bg-mm-red/10 transition"
      >
        <Plus size={16} /> Học từ / câu mới + nhắc nhở
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          {subscribed ? <BellRing size={15} className="text-mm-red" /> : <Bell size={15} />}
          Thêm vào bộ nhắc ôn tập
        </h3>
        <button onClick={() => { reset(); setOpen(false); }} aria-label="Đóng" className="text-[var(--text-muted)] hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* Chọn loại */}
      <div className="flex gap-2">
        {(["word", "sentence"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={
              "flex-1 rounded-lg py-1.5 text-xs font-medium transition " +
              (mode === m ? "bg-mm-red text-white" : "bg-[var(--surface-2)] text-[var(--text-muted)]")
            }
          >
            {m === "word" ? "Từ đơn" : "Câu / cụm từ"}
          </button>
        ))}
      </div>

      <input
        value={hanzi}
        onChange={(e) => setHanzi(e.target.value)}
        aria-label="Chữ Hán"
        placeholder={mode === "word" ? "Chữ Hán, vd: 爱" : "Câu tiếng Trung, vd: 我爱你"}
        className="w-full rounded-lg bg-[var(--surface-2)] px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-mm-red"
      />
      {mode === "word" && (
        <input
          value={pinyin}
          onChange={(e) => setPinyin(e.target.value)}
          aria-label="Pinyin"
          placeholder="Pinyin, vd: ài"
          className="w-full rounded-lg bg-[var(--surface-2)] px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-mm-red"
        />
      )}
      <input
        value={meaning}
        onChange={(e) => setMeaning(e.target.value)}
        aria-label="Nghĩa tiếng Việt"
        placeholder="Nghĩa tiếng Việt"
        className="w-full rounded-lg bg-[var(--surface-2)] px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-mm-red"
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
      {!subscribed && supported && (
        <p className="text-[11px] text-[var(--text-muted)]">
          Sau khi thêm, MandoMood sẽ xin bật thông báo để nhắc bạn ôn đúng lúc (nhắc nhở ngắt quãng).
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || done}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-mm-red py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : done ? <Check size={15} /> : <Plus size={15} />}
        {done ? "Đã thêm! Sẽ nhắc bạn ôn đúng hạn" : "Thêm & bật nhắc nhở"}
      </button>
    </div>
  );
}
