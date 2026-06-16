"use client";

/**
 * SkillRadar — biểu đồ mạng nhện (pentagon) hiển thị 5 kỹ năng học tiếng Trung.
 *
 * Pure SVG, không phụ thuộc thư viện chart. Điểm 0–100 được chiếu lên bán kính.
 * Tên kỹ năng xếp theo chiều kim đồng hồ bắt đầu từ đỉnh:
 *   Từ vựng (trên) → Nghe → Nói → Viết → Đọc
 */

import { useMemo } from "react";
import type { SkillScores } from "@/lib/skillScores";
import { SKILL_LABELS } from "@/lib/skillScores";

interface Props {
  scores: SkillScores;
  size?: number; // px, default 220
  animated?: boolean;
}

const CX = 110;
const CY = 110;
const MAX_R = 80; // bán kính tối đa (score = 100)

/** Tính tọa độ (x, y) cho một điểm trên pentagon. */
function point(score: number, index: number, total: number): [number, number] {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = (score / 100) * MAX_R;
  return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
}

/** Tính tọa độ nhãn (đẩy ra ngoài max_r một chút). */
function labelPoint(index: number, total: number): [number, number] {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = MAX_R + 22;
  return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
}

/** Chuyển mảng điểm tọa độ sang chuỗi SVG polygon "x1,y1 x2,y2 ...". */
function toPolygon(pts: [number, number][]): string {
  return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

export default function SkillRadar({ scores, size = 220, animated = true }: Props) {
  const total = SKILL_LABELS.length; // 5

  // Điểm hình đa giác của user
  const userPts = useMemo(
    () => SKILL_LABELS.map((sk, i) => point(scores[sk.key], i, total)),
    [scores, total]
  );

  // Lưới nền: 4 vòng (25, 50, 75, 100)
  const gridLevels = [25, 50, 75, 100];
  const gridPolygons = gridLevels.map((lvl) =>
    toPolygon(SKILL_LABELS.map((_, i) => point(lvl, i, total)))
  );

  // Các trục từ tâm ra đỉnh
  const axes = SKILL_LABELS.map((_, i) => point(100, i, total));

  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      className="overflow-visible"
      aria-label="Biểu đồ kỹ năng 5 chiều"
    >
      {/* ── Lưới nền ── */}
      {gridPolygons.map((pts, gi) => (
        <polygon
          key={gi}
          points={pts}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={gi === 3 ? 1.2 : 0.8}
        />
      ))}

      {/* ── Trục ── */}
      {axes.map(([x, y], i) => (
        <line
          key={i}
          x1={CX} y1={CY}
          x2={x} y2={y}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={0.8}
        />
      ))}

      {/* ── Vùng điểm user ── */}
      <polygon
        points={toPolygon(userPts)}
        fill="rgba(232, 99, 74, 0.18)"
        stroke="#E8634A"
        strokeWidth={2}
        strokeLinejoin="round"
        style={
          animated
            ? { transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)" }
            : undefined
        }
      />

      {/* ── Chấm điểm tại mỗi đỉnh ── */}
      {userPts.map(([x, y], i) => {
        const score = scores[SKILL_LABELS[i].key];
        const color = SKILL_LABELS[i].color;
        return (
          <circle
            key={i}
            cx={x} cy={y} r={score > 0 ? 4 : 2.5}
            fill={score > 0 ? color : "rgba(255,255,255,0.2)"}
            stroke={score > 0 ? "rgba(0,0,0,0.5)" : "transparent"}
            strokeWidth={1}
          />
        );
      })}

      {/* ── Nhãn kỹ năng ── */}
      {SKILL_LABELS.map((sk, i) => {
        const [lx, ly] = labelPoint(i, total);
        const score = scores[sk.key];
        // Canh chỉnh ngang dựa vào vị trí
        const anchor =
          lx < CX - 10 ? "end" : lx > CX + 10 ? "start" : "middle";
        return (
          <g key={sk.key}>
            <text
              x={lx}
              y={ly - 5}
              textAnchor={anchor}
              fontSize={9.5}
              fontFamily="sans-serif"
              fill="rgba(255,255,255,0.55)"
            >
              {sk.emoji} {sk.label}
            </text>
            <text
              x={lx}
              y={ly + 7}
              textAnchor={anchor}
              fontSize={11}
              fontWeight="700"
              fontFamily="sans-serif"
              fill={score > 0 ? sk.color : "rgba(255,255,255,0.25)"}
            >
              {score > 0 ? `${score}` : "—"}
            </text>
          </g>
        );
      })}

      {/* ── Điểm tổng ở tâm ── */}
      <circle cx={CX} cy={CY} r={20} fill="rgba(0,0,0,0.35)" />
      <text
        x={CX} y={CY - 3}
        textAnchor="middle"
        fontSize={13}
        fontWeight="800"
        fontFamily="sans-serif"
        fill="#E8634A"
      >
        {Math.round(
          Object.values(scores).reduce((a, b) => a + b, 0) / SKILL_LABELS.length
        )}
      </text>
      <text
        x={CX} y={CY + 9}
        textAnchor="middle"
        fontSize={7.5}
        fontFamily="sans-serif"
        fill="rgba(255,255,255,0.45)"
      >
        tổng
      </text>
    </svg>
  );
}
