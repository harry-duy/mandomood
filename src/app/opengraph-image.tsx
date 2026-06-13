/**
 * Ảnh Open Graph ĐỘNG cho trang chủ (và fallback cho route con chưa có ảnh riêng).
 * Dùng next/og (Satori) — render runtime, không cần file PNG tĩnh.
 * Chỉ dùng chữ Latin/Hán cơ bản + brand colors để tránh lỗi thiếu glyph dấu tiếng Việt
 * (font mặc định của Satori không phủ đủ dấu tiếng Việt).
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MandoMood — Learn Chinese through emotion & story";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%)",
          color: "#F5F0EB",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 160,
            height: 160,
            borderRadius: 80,
            border: "6px solid #E8634A",
            marginBottom: 36,
            fontSize: 96,
            fontWeight: 700,
            color: "#E8A838",
          }}
        >
          M
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700 }}>
          <span>mando</span>
          <span style={{ color: "#E8634A" }}>mood</span>
        </div>
        <div style={{ fontSize: 34, color: "#8A8078", marginTop: 18 }}>
          Learn Chinese through emotion &amp; story
        </div>
      </div>
    ),
    { ...size }
  );
}
