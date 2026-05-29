"use client";

/**
 * /smart-lesson — Upload anh/file, AI phan tich tao bai tap
 * + Cham diem chi tiet tung cau tra loi
 */

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, ImageIcon, FileText, Sparkles, CheckCircle2,
  XCircle, AlertCircle, ChevronDown, ChevronUp,
  RotateCcw, BookOpen, Clipboard, Loader2, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VocabItem, Exercise, AnalyzedContent, GradeResult } from "@/lib/openai";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadStep = "idle" | "uploading" | "analyzing" | "done" | "error";

interface AnswerState {
  value: string;
  grading: boolean;
  result: GradeResult | null;
  submitted: boolean;
}

const EXERCISE_LABELS: Record<string, string> = {
  fill_blank: "Dien vao cho trong",
  translate_to_viet: "Dich sang tieng Viet",
  translate_to_chinese: "Dich sang tieng Trung",
  multiple_choice: "Chon dap an dung",
  pinyin: "Viet Pinyin",
};

const LEVEL_COLOR: Record<string, string> = {
  beginner: "#8A8078",
  hsk1: "#7AB8D4",
  hsk2: "#8FAF8F",
  hsk3: "#D4AF37",
  hsk4: "#E8504A",
  hsk5: "#C9878A",
};

const POS_COLOR: Record<string, string> = {
  "dong tu": "#7AB8D4",
  "danh tu": "#8FAF8F",
  "tinh tu": "#D4AF37",
  "pho tu": "#C9878A",
  "ket tu": "#E8A838",
};

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? "#8FAF8F" : score >= 70 ? "#D4AF37" : score >= 50 ? "#E8A838" : "#E8504A";
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#1A1A1A" strokeWidth="3" />
        <circle
          cx="24" cy="24" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

// ─── Vocab Card ───────────────────────────────────────────────────────────────
function VocabCard({ item }: { item: VocabItem }) {
  const [open, setOpen] = useState(false);
  const posKey = item.part_of_speech.toLowerCase().replace(/\s+/g, " ");
  const accentColor = POS_COLOR[posKey] ?? "#8A9DC9";
  return (
    <motion.div
      layout
      className="rounded-2xl p-4 cursor-pointer"
      style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)" }}
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-noto" style={{ color: "#F5F0EB" }}>{item.hanzi}</span>
          <div>
            <p className="text-xs text-[#8A8078]">{item.pinyin}</p>
            <p className="text-sm font-medium text-[#F5F0EB]">{item.meaning}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{ color: accentColor, background: `${accentColor}18` }}
          >
            {item.part_of_speech}
          </span>
          {open ? <ChevronUp size={14} className="text-[#5A5450]" /> : <ChevronDown size={14} className="text-[#5A5450]" />}
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-sm font-noto text-[#F5F0EB] mb-1">{item.example}</p>
              <p className="text-xs text-[#5A5450] italic">{item.example_translation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Exercise Card ─────────────────────────────────────────────────────────────
function ExerciseCard({
  ex,
  index,
  answer,
  onAnswerChange,
  onSubmit,
}: {
  ex: Exercise;
  index: number;
  answer: AnswerState;
  onAnswerChange: (val: string) => void;
  onSubmit: () => void;
}) {
  const isMultiChoice = ex.type === "multiple_choice";
  const submitted = answer.submitted;
  const result = answer.result;

  const scoreColor = result
    ? result.score >= 90 ? "#8FAF8F" : result.score >= 70 ? "#D4AF37" : "#E8504A"
    : "#8A9DC9";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl p-5"
      style={{
        background: submitted && result
          ? result.correct ? "rgba(143,175,143,0.05)" : "rgba(232,80,74,0.04)"
          : "#141414",
        border: submitted && result
          ? `1px solid ${result.correct ? "rgba(143,175,143,0.25)" : "rgba(232,80,74,0.2)"}`
          : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ color: "#8A9DC9", background: "rgba(138,157,201,0.12)" }}
        >
          {EXERCISE_LABELS[ex.type] ?? ex.type}
        </span>
        <span className="text-[10px] text-[#3A3A3A] ml-auto">Bai {index + 1}</span>
      </div>

      {/* Question */}
      <p className="text-sm text-[#F5F0EB] leading-relaxed mb-3 font-noto">{ex.question}</p>

      {ex.hint && !submitted && (
        <p className="text-[11px] text-[#5A5450] mb-3 italic">Goi y: {ex.hint}</p>
      )}

      {/* Input */}
      {!submitted ? (
        isMultiChoice && ex.options ? (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {ex.options.map((opt) => (
              <button
                key={opt}
                onClick={() => onAnswerChange(opt)}
                className={cn(
                  "py-2 px-3 rounded-xl text-sm text-left transition-all",
                  answer.value === opt
                    ? "bg-[#8A9DC9] text-[#0A0A0A] font-semibold"
                    : "bg-[#1A1A1A] text-[#8A8078] hover:bg-[#242424] hover:text-white"
                )}
                style={{ border: answer.value === opt ? "none" : "1px solid rgba(255,255,255,0.06)" }}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <input
            value={answer.value}
            onChange={(e) => onAnswerChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && answer.value.trim() && onSubmit()}
            placeholder="Nhap cau tra loi..."
            className="w-full bg-[#0A0A0A] rounded-xl px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-[#3A3A3A] outline-none mb-3"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            disabled={answer.grading}
          />
        )
      ) : null}

      {/* Submit button or result */}
      {!submitted ? (
        <button
          onClick={onSubmit}
          disabled={!answer.value.trim() || answer.grading}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all",
            answer.value.trim() && !answer.grading
              ? "bg-[#8A9DC9] text-[#0A0A0A] hover:bg-[#9aadd9]"
              : "bg-[#1A1A1A] text-[#3A3A3A] cursor-not-allowed"
          )}
        >
          {answer.grading ? (
            <><Loader2 size={12} className="animate-spin" /> Dang cham...</>
          ) : (
            <><CheckCircle2 size={12} /> Nop bai</>
          )}
        </button>
      ) : result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Score row */}
          <div className="flex items-center gap-3">
            <ScoreRing score={result.score} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: scoreColor }}>
                {result.correct ? "Chinh xac!" : result.score >= 70 ? "Gan dung roi!" : "Can on lai!"}
              </p>
              <p className="text-xs text-[#8A8078] mt-0.5">{result.feedback}</p>
            </div>
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="rounded-xl p-3 space-y-2" style={{ background: "rgba(232,80,74,0.06)", border: "1px solid rgba(232,80,74,0.12)" }}>
              <p className="text-[10px] text-[#E8504A] font-semibold uppercase tracking-wider">Loi can sua:</p>
              {result.errors.map((err, i) => (
                <div key={i} className="text-xs">
                  <span className="text-[#F5F0EB]">{err.explanation}</span>
                  {err.correct && (
                    <span className="ml-2 text-[#8FAF8F] font-semibold">Dung: {err.correct}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Suggestion */}
          {result.suggestion && (
            <p className="text-[11px] text-[#5A5450] italic">{result.suggestion}</p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative rounded-3xl p-8 text-center cursor-pointer transition-all",
        dragging
          ? "border-[#8A9DC9] bg-[rgba(138,157,201,0.06)]"
          : "border-[rgba(255,255,255,0.08)] bg-[#141414] hover:border-[rgba(255,255,255,0.15)] hover:bg-[#1A1A1A]"
      )}
      style={{ border: `2px dashed ${dragging ? "#8A9DC9" : "rgba(255,255,255,0.08)"}` }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,.txt,text/plain"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(138,157,201,0.12)" }}>
          <Upload size={28} className="text-[#8A9DC9]" />
        </div>
        <div>
          <p className="text-base font-semibold text-[#F5F0EB] mb-1">
            Keo tha anh hoac file vao day
          </p>
          <p className="text-sm text-[#5A5450]">hoac bam de chon file</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {[
            { icon: ImageIcon, label: "JPG / PNG / WEBP" },
            { icon: FileText, label: "TXT" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-xs text-[#5A5450] px-3 py-1.5 rounded-full"
              style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Icon size={12} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Paste Text Zone ──────────────────────────────────────────────────────────
function PasteZone({ onText }: { onText: (t: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="space-y-3">
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Dan van ban tieng Trung vao day..."
        rows={5}
        className="w-full bg-[#141414] rounded-2xl px-4 py-3 text-sm text-[#F5F0EB] placeholder-[#3A3A3A] outline-none resize-none font-noto"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      />
      <button
        onClick={() => val.trim() && onText(val)}
        disabled={!val.trim()}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all",
          val.trim()
            ? "bg-[#8A9DC9] text-[#0A0A0A] hover:bg-[#9aadd9]"
            : "bg-[#1A1A1A] text-[#3A3A3A] cursor-not-allowed"
        )}
      >
        <Sparkles size={14} />
        Phan tich
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SmartLessonPage() {
  const [step, setStep] = useState<UploadStep>("idle");
  const [tab, setTab] = useState<"upload" | "paste">("upload");
  const [data, setData] = useState<AnalyzedContent | null>(null);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [activeSection, setActiveSection] = useState<"vocab" | "exercises">("vocab");

  const handleFile = async (file: File) => {
    setStep("uploading");
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      setStep("analyzing");
      const res = await fetch("/api/ai/analyze-upload", { method: "POST", body: formData });
      const json = await res.json() as AnalyzedContent & { error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Loi phan tich");
      setData(json);
      initAnswers(json.exercises ?? []);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Loi khong ro");
      setStep("error");
    }
  };

  const handleText = async (text: string) => {
    setStep("analyzing");
    setError("");
    try {
      const res = await fetch("/api/ai/analyze-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json() as AnalyzedContent & { error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Loi phan tich");
      setData(json);
      initAnswers(json.exercises ?? []);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Loi khong ro");
      setStep("error");
    }
  };

  const initAnswers = (exercises: Exercise[]) => {
    const init: Record<string, AnswerState> = {};
    exercises.forEach((ex) => {
      init[ex.id] = { value: "", grading: false, result: null, submitted: false };
    });
    setAnswers(init);
  };

  const handleAnswerChange = (exId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [exId]: { ...prev[exId], value: val } }));
  };

  const handleSubmitAnswer = async (ex: Exercise) => {
    const ans = answers[ex.id];
    if (!ans || !ans.value.trim()) return;
    setAnswers((prev) => ({ ...prev, [ex.id]: { ...prev[ex.id], grading: true } }));
    try {
      const res = await fetch("/api/ai/grade-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionType: ex.type,
          question: ex.question,
          correctAnswer: ex.answer,
          userAnswer: ans.value,
          context: ex.context,
        }),
      });
      const json = await res.json() as GradeResult & { error?: string };
      if (!res.ok || json.error) throw new Error(json.error);
      setAnswers((prev) => ({
        ...prev,
        [ex.id]: { ...prev[ex.id], grading: false, result: json, submitted: true },
      }));
    } catch {
      setAnswers((prev) => ({
        ...prev,
        [ex.id]: { ...prev[ex.id], grading: false, submitted: true, result: {
          score: 0, correct: false, errors: [], feedback: "Loi cham diem, thu lai sau", suggestion: "",
        }},
      }));
    }
  };

  const totalScore = () => {
    const submitted = Object.values(answers).filter((a) => a.submitted && a.result);
    if (submitted.length === 0) return null;
    const avg = submitted.reduce((acc, a) => acc + (a.result?.score ?? 0), 0) / submitted.length;
    return Math.round(avg);
  };

  const levelColor = data ? LEVEL_COLOR[data.level] ?? "#8A9DC9" : "#8A9DC9";

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto pb-24">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-[#8A9DC9]" />
          <h1 className="text-xl font-bold">Smart Lesson</h1>
        </div>
        <p className="text-sm text-[#5A5450]">
          Tai anh sach giao khoa, ghi chu, hoac dan van ban - AI se tao bai tap cho ban
        </p>
      </motion.div>

      {/* Upload / Done */}
      <AnimatePresence mode="wait">

        {/* ── IDLE / ERROR ── */}
        {(step === "idle" || step === "error") && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {/* Tab switcher */}
            <div
              className="flex rounded-2xl p-1 mb-4"
              style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {(["upload", "paste"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                    tab === t ? "bg-[#1A1A1A] text-white" : "text-[#5A5450] hover:text-[#8A8078]"
                  )}
                >
                  {t === "upload" ? <><ImageIcon size={14} /> Anh / File</> : <><Clipboard size={14} /> Dan van ban</>}
                </button>
              ))}
            </div>

            {tab === "upload" ? (
              <UploadZone onFile={handleFile} />
            ) : (
              <PasteZone onText={handleText} />
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex items-center gap-2 text-sm text-[#E8504A] px-4 py-3 rounded-2xl"
                style={{ background: "rgba(232,80,74,0.06)", border: "1px solid rgba(232,80,74,0.2)" }}
              >
                <XCircle size={14} />
                {error}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── LOADING ── */}
        {(step === "uploading" || step === "analyzing") && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(138,157,201,0.12)" }}>
              <Loader2 size={28} className="text-[#8A9DC9] animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#F5F0EB]">
                {step === "uploading" ? "Dang tai len..." : "AI dang phan tich..."}
              </p>
              <p className="text-xs text-[#5A5450] mt-1">
                {step === "analyzing" ? "GPT-4o dang doc va tao bai tap cho ban" : "Chuan bi file..."}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── DONE ── */}
        {step === "done" && data && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Summary card */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#141414", border: `1px solid ${levelColor}30` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={14} style={{ color: levelColor }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ color: levelColor, background: `${levelColor}15` }}
                >
                  {data.level.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-[#F5F0EB] leading-relaxed mb-3">{data.summary}</p>
              {data.cultural_notes && (
                <p className="text-xs text-[#5A5450] italic">{data.cultural_notes}</p>
              )}
              {/* Overall score if any submitted */}
              {totalScore() !== null && (
                <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <ScoreRing score={totalScore()!} />
                  <p className="text-sm text-[#8A8078]">Diem trung binh bai nop</p>
                </div>
              )}
            </div>

            {/* Section tabs */}
            <div
              className="flex rounded-2xl p-1"
              style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {([
                { key: "vocab", label: `Tu vung (${data.vocabulary?.length ?? 0})` },
                { key: "exercises", label: `Bai tap (${data.exercises?.length ?? 0})` },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all",
                    activeSection === key ? "bg-[#1A1A1A] text-white" : "text-[#5A5450] hover:text-[#8A8078]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Vocab section */}
            {activeSection === "vocab" && (
              <motion.div
                key="vocab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                {(data.vocabulary ?? []).map((item) => (
                  <VocabCard key={item.hanzi} item={item} />
                ))}
                <button
                  onClick={() => setActiveSection("exercises")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-[#8A9DC9] hover:bg-[#141414] transition-colors mt-2"
                  style={{ border: "1px solid rgba(138,157,201,0.2)" }}
                >
                  Sang bai tap <ArrowRight size={14} />
                </button>
              </motion.div>
            )}

            {/* Exercises section */}
            {activeSection === "exercises" && (
              <motion.div
                key="exercises"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {(data.exercises ?? []).map((ex, i) => (
                  <ExerciseCard
                    key={ex.id}
                    ex={ex}
                    index={i}
                    answer={answers[ex.id] ?? { value: "", grading: false, result: null, submitted: false }}
                    onAnswerChange={(v) => handleAnswerChange(ex.id, v)}
                    onSubmit={() => handleSubmitAnswer(ex)}
                  />
                ))}
              </motion.div>
            )}

            {/* Reset */}
            <button
              onClick={() => { setStep("idle"); setData(null); setAnswers({}); setError(""); }}
              className="flex items-center gap-2 text-xs text-[#5A5450] hover:text-[#8A8078] transition-colors mx-auto mt-2"
            >
              <RotateCcw size={11} /> Phan tich tai lieu khac
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How it works (idle only) */}
      {step === "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-2xl p-4"
          style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={13} className="text-[#5A5450]" />
            <p className="text-[10px] text-[#5A5450] uppercase tracking-widest font-semibold">Cach hoat dong</p>
          </div>
          <div className="space-y-2">
            {[
              { step: "1", text: "Tai anh chup trang sach, ghi chu, hoac bai bao tieng Trung" },
              { step: "2", text: "GPT-4o Vision phan tich va trich xuat toan bo noi dung" },
              { step: "3", text: "AI tu dong tao 5-8 bai tap da dang: dien khuyet, dich, trac nghiem, pinyin" },
              { step: "4", text: "Nop bai - AI cham diem chi tiet tung loi nho nhat ke ca thanh dieu" },
            ].map(({ step: s, text }) => (
              <div key={s} className="flex items-start gap-2.5">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                  style={{ background: "rgba(138,157,201,0.15)", color: "#8A9DC9" }}
                >
                  {s}
                </span>
                <p className="text-xs text-[#5A5450] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
