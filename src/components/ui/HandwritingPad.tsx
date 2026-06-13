"use client";

/**
 * HandwritingPad — Vẽ chữ Hán bằng tay → nhận dạng (license-safe).
 *
 * - Canvas vẽ bằng chuột/cảm ứng, ô 田字格 hướng dẫn.
 * - Tải dữ liệu nét (medians) của tập ứng viên từ hanzi-writer (MIT), 1 lần.
 * - Khi bấm "Nhận dạng": so khớp nét người vẽ với ứng viên (src/lib/handwriting).
 * - Hiện danh sách chữ gần đúng nhất, bấm để xem chi tiết.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Undo2, Eraser, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { playTTS } from "@/hooks/useTTS";
import {
  recognize,
  prepareReference,
  type Stroke,
  type Point,
  type RecognitionResult,
} from "@/lib/handwriting";
import { HANDWRITING_CHARSET, type CandidateInfo } from "@/lib/handwriting-candidates";

interface PreparedCandidate {
  char: string;
  refNorm: Stroke[];
}

const SIZE = 300;

export default function HandwritingPad() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef(false);
  const candidatesRef = useRef<PreparedCandidate[]>([]);
  const infoMap = useState<Map<string, CandidateInfo>>(() => {
    const m = new Map<string, CandidateInfo>();
    HANDWRITING_CHARSET.forEach((c) => m.set(c.char, c));
    return m;
  })[0];

  const [ready, setReady] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [results, setResults] = useState<RecognitionResult[]>([]);
  const [hasInk, setHasInk] = useState(false);

  // ── Vẽ ô 田字格 + các nét hiện có ──────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, SIZE, SIZE);
    // nền
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, SIZE, SIZE);
    // viền + chữ thập gạch đứt
    ctx.strokeStyle = "rgba(232,99,74,0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(SIZE / 2, 0); ctx.lineTo(SIZE / 2, SIZE);
    ctx.moveTo(0, SIZE / 2); ctx.lineTo(SIZE, SIZE / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // các nét người dùng
    ctx.strokeStyle = "#F5F0EB";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of strokesRef.current) {
      if (stroke.length < 1) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0][0], stroke[0][1]);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i][0], stroke[i][1]);
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // ── Tải dữ liệu nét ứng viên (1 lần) ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const HanziWriter = (await import("hanzi-writer")).default;
        const total = HANDWRITING_CHARSET.length;
        let done = 0;
        const prepared: PreparedCandidate[] = [];

        await Promise.all(
          HANDWRITING_CHARSET.map(async (c) => {
            try {
              const data = await HanziWriter.loadCharacterData(c.char);
              if (data && data.medians) {
                prepared.push({ char: c.char, refNorm: prepareReference(data.medians) });
              }
            } catch {
              /* bỏ qua chữ tải lỗi */
            } finally {
              done++;
              if (!cancelled) setLoadPct(Math.round((done / total) * 100));
            }
          })
        );

        if (cancelled) return;
        candidatesRef.current = prepared;
        if (prepared.length === 0) setLoadError(true);
        setReady(true);
      } catch (err) {
        console.warn("[HandwritingPad] load error:", err);
        if (!cancelled) {
          setLoadError(true);
          setReady(true);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Toạ độ con trỏ trong canvas ─────────────────────────────────────────────
  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * SIZE;
    return [x, y];
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    strokesRef.current.push([getPoint(e)]);
    setHasInk(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const cur = strokesRef.current[strokesRef.current.length - 1];
    cur.push(getPoint(e));
    redraw();
  };

  const onPointerUp = () => {
    drawingRef.current = false;
  };

  // ── Hành động ──
  const undo = () => {
    strokesRef.current.pop();
    setHasInk(strokesRef.current.length > 0);
    setResults([]);
    redraw();
  };

  const clear = () => {
    strokesRef.current = [];
    setHasInk(false);
    setResults([]);
    redraw();
  };

  const doRecognize = () => {
    if (strokesRef.current.length === 0 || candidatesRef.current.length === 0) return;
    const res = recognize(strokesRef.current, candidatesRef.current, 8);
    setResults(res);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas */}
      <div className="relative" style={{ width: SIZE, maxWidth: "100%" }}>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="rounded-2xl border-2 border-[rgba(255,255,255,0.1)] touch-none w-full aspect-square cursor-crosshair"
          style={{ touchAction: "none" }}
        />
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111]/90 rounded-2xl gap-2">
            <Loader2 className="animate-spin text-mm-red" size={24} />
            <span className="text-xs text-[var(--text-muted)]">Đang tải dữ liệu nét… {loadPct}%</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!hasInk}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm bg-surface border border-[rgba(255,255,255,0.08)] text-[var(--text-muted)] hover:text-white disabled:opacity-30 transition-colors"
        >
          <Undo2 size={15} /> Hoàn tác
        </button>
        <button
          onClick={clear}
          disabled={!hasInk}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm bg-surface border border-[rgba(255,255,255,0.08)] text-[var(--text-muted)] hover:text-white disabled:opacity-30 transition-colors"
        >
          <Eraser size={15} /> Xoá
        </button>
        <button
          onClick={doRecognize}
          disabled={!ready || !hasInk || loadError}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Search size={16} /> Nhận dạng
        </button>
      </div>

      {loadError && (
        <p className="text-xs text-mm-red text-center max-w-xs">
          Không tải được dữ liệu nét (cần internet). Hãy thử lại khi có kết nối.
        </p>
      )}

      {/* Kết quả */}
      {results.length > 0 && (
        <div className="w-full">
          <p className="text-xs text-[var(--text-muted)] mb-2">Chữ gần đúng nhất (bấm để xem chi tiết):</p>
          <div className="grid grid-cols-4 gap-2">
            {results.map((r) => {
              const info = infoMap.get(r.char);
              return (
                <div
                  key={r.char}
                  onClick={() => router.push(`/character/${encodeURIComponent(r.char)}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") router.push(`/character/${encodeURIComponent(r.char)}`);
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-surface border border-[rgba(255,255,255,0.08)] hover:border-mm-red transition-colors cursor-pointer"
                >
                  <span className="text-3xl leading-none" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                    {r.char}
                  </span>
                  {info?.pinyin && <span className="text-[10px] text-mm-gold">{info.pinyin}</span>}
                  {info?.meaning && (
                    <span className="text-[9px] text-[var(--text-muted)] text-center leading-tight line-clamp-2">
                      {info.meaning}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void playTTS(r.char);
                    }}
                    className="text-[9px] text-mm-red hover:underline"
                  >
                    nghe
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-3 text-center">
            Mẹo: viết đúng thứ tự nét và rõ ràng để nhận dạng chính xác hơn. Hiện hỗ trợ {HANDWRITING_CHARSET.length} chữ thông dụng.
          </p>
        </div>
      )}
    </div>
  );
}
